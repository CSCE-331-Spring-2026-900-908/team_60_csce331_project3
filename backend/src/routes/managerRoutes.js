import express from "express";
import pool from "../config/db.js";

const router = express.Router();

router.get("/top-items", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT mi.name, COUNT(oi.menu_item_id) as sales_count
      FROM orders o
      JOIN orderitems oi ON o.order_id = oi.order_id 
      JOIN menuitems mi ON oi.menu_item_id = mi.menu_item_id
      GROUP BY mi.name
      ORDER BY sales_count DESC
      LIMIT 5
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/employees", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM employees ORDER BY employee_id ASC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/product-usage', async (req, res) => {
    const { startDate, endDate } = req.query;
    try {
        const query = `
            SELECT 
                i.name AS inventory_item,
                SUM(oi.quantity * r.quantity) AS total_usage,
                i.unit
            FROM orders o
            JOIN orderitems oi ON o.order_id = oi.order_id
            JOIN recipes r ON oi.menu_item_id = r.menu_item_id
            JOIN inventory i ON r.inventory_id = i.inventory_id
            WHERE o.date BETWEEN $1 AND $2
            GROUP BY i.name, i.unit
            ORDER BY total_usage DESC;
        `;
        const result = await pool.query(query, [startDate, endDate]);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post("/employees", async (req, res) => {
  const { name, role } = req.body;
  try {
    // We fetch the max ID to increment it, or you can use SERIAL in Postgres
    const idResult = await pool.query("SELECT MAX(employee_id) FROM employees");
    const newId = (idResult.rows[0].max || 0) + 1;

    await pool.query(
      "INSERT INTO employees (employee_id, name, role) VALUES ($1, $2, $3)",
      [newId, name, role]
    );
    res.status(201).json({ success: true, message: "Employee hired!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error during hiring." });
  }
});

export default router;