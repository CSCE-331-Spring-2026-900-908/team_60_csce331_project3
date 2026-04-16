import express from 'express';
import pool from "../config/db.js";

const router = express.Router();

// GET /api/reports/sales?startDay=2026-01-01&endDay=2026-03-31&startTime=08:00:00&endTime=22:00:00
router.get('/sales', async (req, res) => {
  try {
    const { startDay, endDay, startTime, endTime } = req.query;

    // --- Translated from Java: refreshSalesData() ---
    const sql = `
      SELECT mi.name, SUM(oi.quantity) as qty, SUM(oi.quantity * oi.price) as revenue 
      FROM orders o 
      JOIN orderitems oi ON o.order_id = oi.order_id 
      JOIN menuitems mi ON oi.menu_item_id = mi.menu_item_id 
      WHERE o.date BETWEEN $1 AND $2 
      AND o.time BETWEEN $3 AND $4 
      GROUP BY mi.name ORDER BY revenue DESC
    `;

    const result = await pool.query(sql, [startDay, endDay, startTime, endTime]);
    
    // Send the data back as JSON to the browser
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error fetching sales report.' });
  }
});
// --- X-REPORT: Hourly breakdown (No side effects) ---
router.get('/x-report', async (req, res) => {
    try {
        const sql = `
            SELECT EXTRACT(HOUR FROM time AT TIME ZONE 'UTC' AT TIME ZONE 'CDT') as hr, COUNT(*) as count, SUM(total_amount) as rev, 
            COUNT(CASE WHEN status = 'Void' THEN 1 END) as voids, 
            COUNT(CASE WHEN status = 'Discard' THEN 1 END) as discards 
            FROM orders WHERE date = CURRENT_DATE AND z_reported = FALSE 
            GROUP BY hr ORDER BY hr ASC`;
        const result = await pool.query(sql);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Failed to generate X-Report' });
    }
});

// --- Z-REPORT: Finalize day and reset (Side effects!) ---
router.post('/z-report', async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // 1. Check if Z-Report already run today
        const checkSql = "SELECT COUNT(*) FROM orders WHERE z_reported = TRUE AND date = CURRENT_DATE";
        const checkResult = await client.query(checkSql);
        if (parseInt(checkResult.rows[0].count) > 0) {
            return res.status(400).json({ error: "Z-Report already generated for today." });
        }

        // 2. Fetch final totals
        const fetchSql = `
            SELECT 
                COALESCE(SUM(total_amount), 0) as sales, 
                COUNT(CASE WHEN status = 'Void' THEN 1 END) as voids, 
                COUNT(CASE WHEN status = 'Discard' THEN 1 END) as discards 
            FROM orders WHERE z_reported = FALSE AND date = CURRENT_DATE`;
        const totals = await client.query(fetchSql);
        const reportData = totals.rows[0];

        // 3. Mark all current orders as reported
        const resetSql = "UPDATE orders SET z_reported = TRUE WHERE z_reported = FALSE AND date = CURRENT_DATE";
        await client.query(resetSql);

        await client.query('COMMIT');

        // Send a clean, flat object to the frontend
        res.json({ 
            sales: parseFloat(reportData.sales),
            voids: parseInt(reportData.voids),
            discards: parseInt(reportData.discards),
            tax: parseFloat(reportData.sales) * 0.0825,
            total: parseFloat(reportData.sales) * 1.0825,
            date: new Date().toLocaleDateString(),
            timestamp: new Date().toLocaleTimeString()
        });
    } catch (err) {
        await client.query('ROLLBACK');
        res.status(500).json({ error: 'Z-Report transaction failed' });
    } finally {
        client.release();
    }
});

router.get('/sales-summary', async (req, res) => {
  try {
    const sql = `SELECT COUNT(*) as total_orders, SUM(total_amount) as total_revenue FROM orders`;
    const result = await pool.query(sql);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch sales summary' });
  }
});

router.get('/usage', async (req, res) => {
  try {
    const { startDay, endDay, startTime, endTime } = req.query;
    const sql = `
      SELECT i.name, SUM(oi.quantity * r.quantity) as usage, i.unit
      FROM orders o
      JOIN orderitems oi ON o.order_id = oi.order_id
      JOIN recipes r ON oi.menu_item_id = r.menu_item_id
      JOIN inventory i ON r.inventory_id = i.inventory_id
      WHERE o.date BETWEEN $1 AND $2
      AND o.time BETWEEN $3 AND $4
      GROUP BY i.name, i.unit
      ORDER BY usage DESC
    `;
    const result = await pool.query(sql, [startDay, endDay, startTime, endTime]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching ingredient usage.' });
  }
});

export default router;