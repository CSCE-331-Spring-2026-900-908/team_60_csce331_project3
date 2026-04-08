import express from "express";
import pool from "../config/db.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT menu_item_id, name, category, base_price, description, temperature
      FROM public.menuitems
      WHERE LOWER(name) NOT LIKE '%test%'
        AND LOWER(description) NOT LIKE '%test%'
      ORDER BY category, name
    `);

    res.json(result.rows);
  } catch (err) {
    console.error("GET /api/menu failed:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
