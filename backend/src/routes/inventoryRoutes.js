import express from "express";
import pool from "../config/db.js";

const router = express.Router();

/**
 * GET /api/inventory
 * Fills the Admin table with all stock items.
 */
router.get("/", async (req, res) => {
  try {
    // NOTE: Make sure 'inventory' and 'ingredient_id' match your Project 2 table names!
    const result = await pool.query("SELECT * FROM inventory ORDER BY ingredient_id ASC");
    res.json(result.rows);
  } catch (err) {
    console.error("GET /api/inventory failed:", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * PUT /api/inventory/:id
 * Allows the Admin to update stock levels (Restock).
 */
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    const result = await pool.query(
      "UPDATE inventory SET quantity = $1 WHERE ingredient_id = $2 RETURNING *",
      [quantity, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Item not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("PUT /api/inventory failed:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;