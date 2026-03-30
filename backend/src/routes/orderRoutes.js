import express from "express";
import pool from "../config/db.js";

const router = express.Router();

// GET /api/orders
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        order_id, 
        total_amount, 
        status, 
        TO_CHAR(time, 'HH12:MI AM') as order_time, 
        date
      FROM public.orders
      ORDER BY order_id DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error("GET /api/orders failed:", err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/orders - Keeping teammate's exact logic
router.post("/", async (req, res) => {
  try {
    const { total_amount } = req.body;
    const result = await pool.query(
      'INSERT INTO public.orders (customer_id, employee_id, "date", status, total_amount, "time", z_reported) VALUES ($1, $2, CURRENT_DATE, $3, $4, CURRENT_TIME, $5) RETURNING *',
      [1, 1, "pending", Number(total_amount), false]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/orders/:orderId
router.put("/:orderId", async (req, res) => {
  try {
    await pool.query("UPDATE public.orders SET status = $1 WHERE order_id = $2", [req.body.status, req.params.orderId]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;