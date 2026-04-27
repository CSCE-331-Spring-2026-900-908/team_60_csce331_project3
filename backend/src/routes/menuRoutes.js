import express from "express";
import pool from "../config/db.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        mi.menu_item_id,
        mi.name,
        mi.category,
        mi.base_price,
        mi.description,
        mi.temperature,
        COALESCE(
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'size_name', mis.size_name,
              'price', mis.price
            )
            ORDER BY CASE mis.size_name
              WHEN 'small' THEN 1
              WHEN 'medium' THEN 2
              WHEN 'large' THEN 3
              ELSE 4
            END
          ) FILTER (WHERE mis.menu_item_size_id IS NOT NULL),
          '[]'::json
        ) AS sizes
      FROM public.menuitems mi
      LEFT JOIN public.menu_item_sizes mis
        ON mis.menu_item_id = mi.menu_item_id
      WHERE LOWER(name) NOT LIKE '%test%'
        AND LOWER(description) NOT LIKE '%test%'
      GROUP BY mi.menu_item_id, mi.name, mi.category, mi.base_price, mi.description, mi.temperature
      ORDER BY mi.category, mi.name
    `);
    res.json(result.rows);
  } catch (err) {
    console.error("GET /api/menu failed:", err);
    res.status(500).json({ error: err.message });
  }
});

router.post("/menuitems", async (req, res) => {
  const { menu_item_id, name, category, base_price, description, recipe_id, temperature, sizes } = req.body;
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const query = `
      INSERT INTO public.menuitems (menu_item_id, name, category, base_price, description, recipe_id, temperature)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `;
    await client.query(query, [menu_item_id, name, category, base_price, description, recipe_id, temperature]);

    const normalizedCategory = category?.toString().trim().toLowerCase();
    const sizeRows = normalizedCategory === "topping"
      ? []
      : (Array.isArray(sizes) && sizes.length > 0
          ? sizes
          : [
              { size_name: "small", price: Number(base_price) - 0.5 },
              { size_name: "medium", price: Number(base_price) },
              { size_name: "large", price: Number(base_price) + 0.5 }
            ]);

    for (const size of sizeRows) {
      await client.query(
        `
          INSERT INTO public.menu_item_sizes (menu_item_id, size_name, price)
          VALUES ($1, $2, $3)
        `,
        [menu_item_id, size.size_name, Number(size.price)]
      );
    }

    await client.query("COMMIT");
    res.status(200).send("Item added successfully");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("POST /api/menu/menuitems failed:", err);
    res.status(500).send("Database insert failed");
  } finally {
    client.release();
  }
});

export default router;
