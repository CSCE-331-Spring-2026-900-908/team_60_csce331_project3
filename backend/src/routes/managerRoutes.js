import express from "express";
import pool from "../config/db.js";

const router = express.Router();

// GET /api/manager/sales-summary
// Aggregates total revenue and order count
router.get("/sales-summary", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        COUNT(order_id) as total_orders, 
        COALESCE(SUM(total_amount), 0) as total_revenue 
      FROM orders
    `);
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Sales summary failed:", err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/manager/top-items
// Identifies best sellers (requires your orders and menuitems tables)
router.get("/top-items", async (req, res) => {
  try {
    // Note: This query assumes you have a table that links orders to menu items
    // If your table names differ from 'menuitems', update them here.
    const result = await pool.query(`
      SELECT m.name, COUNT(*) as sales_count
      FROM orders o
      JOIN menuitems m ON o.order_id = o.order_id 
      GROUP BY m.name
      ORDER BY sales_count DESC
      LIMIT 5
    `);
    res.json(result.rows);
  } catch (err) {
    console.error("Top items failed:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;