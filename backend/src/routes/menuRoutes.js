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

router.post("/menuitems", async (req, res) => {
  const { menu_item_id, name, category, base_price, description, recipe_id, temperature } = req.body;
  try {
    const query = `
      INSERT INTO public.menuitems (menu_item_id, name, category, base_price, description, recipe_id, temperature)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `;
    await pool.query(query, [menu_item_id, name, category, base_price, description, recipe_id, temperature]);
    res.status(200).send("Item added successfully");
  } catch (err) {
    console.error("POST /api/menu/menuitems failed:", err);
    res.status(500).send("Database insert failed");
  }
});

export default router;