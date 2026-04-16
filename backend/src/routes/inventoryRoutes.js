import express from "express";
import pool from "../config/db.js";

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT inventory_id, name, quantity, unit FROM inventory ORDER BY quantity ASC"
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;
    const result = await pool.query(
      "UPDATE inventory SET quantity = $1 WHERE inventory_id = $2 RETURNING *",
      [quantity, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;