import express from "express";
import pool from "../config/db.js";

const router = express.Router();

/**
 * GET /api/orders
 * Fetches pending orders for the Kitchen view.
 */
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        o.order_id, 
        o.status, 
        o.total_amount,
        o."time" AS order_time,
        mi.name AS item_name,
        oi.quantity
      FROM public.orders o
      LEFT JOIN public.orderitems oi ON o.order_id = oi.order_id
      LEFT JOIN public.menuitems mi ON oi.menu_item_id = mi.menu_item_id
      WHERE o.status = 'pending'
      ORDER BY o.order_id ASC
    `);

    const ordersMap = {};
    result.rows.forEach(row => {
      if (!ordersMap[row.order_id]) {
        ordersMap[row.order_id] = {
          order_id: row.order_id,
          status: row.status,
          total_amount: row.total_amount,
          order_time: row.order_time,
          items: []
        };
      }
      if (row.item_name) {
        ordersMap[row.order_id].items.push({ name: row.item_name, quantity: row.quantity });
      }
    });

    res.json(Object.values(ordersMap));
  } catch (err) {
    console.error("KITCHEN FETCH ERROR:", err.message);
    res.status(500).json({ error: "Failed to fetch kitchen orders" });
  }
});

/**
 * POST /api/orders
 * Handles order placement, stamp increments, and reward redemptions.
 */
router.post("/", async (req, res) => {
  const client = await pool.connect();
  try {
    const { total_amount, items, customer_id, is_redemption } = req.body; 
    
    // Ensure customer_id is treated as a String for Google IDs
    const finalCustomerId = (customer_id && customer_id !== "undefined" && customer_id !== "null") 
      ? String(customer_id) 
      : "1";

    await client.query('BEGIN');

    // 1. Create the Order
    const orderResult = await client.query(
      `INSERT INTO public.orders (customer_id, employee_id, date, status, total_amount, time, z_reported) 
       VALUES ($1, 1, CURRENT_DATE, 'pending', $2, LOCALTIME, false) 
       RETURNING order_id`,
      [finalCustomerId, Number(total_amount)]
    );
    const newOrderId = orderResult.rows[0].order_id;

    // 2. Handle Order Items
    const maxIdResult = await client.query("SELECT COALESCE(MAX(order_item_id), 0) AS max_id FROM public.orderitems");
    let currentItemId = parseInt(maxIdResult.rows[0].max_id, 10);

    for (const item of items) {
      currentItemId++; 
      await client.query(
        'INSERT INTO public.orderitems (order_item_id, order_id, menu_item_id, quantity, price) VALUES ($1, $2, $3, $4, $5)',
        [currentItemId, newOrderId, item.menu_item_id, item.quantity || 1, item.price || 0]
      );
    }

    // 3. Aura Boba Stamp Logic
    if (finalCustomerId !== "1") {
      if (is_redemption) {
        // Reset stamps to 0 or subtract 10, ensuring they don't go below 0
        await client.query(
          `UPDATE public.customers SET stamps = GREATEST(stamps - 10, 0) WHERE customer_id = $1`, 
          [finalCustomerId]
        );
      } else {
        // Standard purchase: 1 stamp, with a 20% chance for a bonus
        let stampsEarned = Math.random() <= 0.20 ? 2 : 1;
        await client.query(
          `UPDATE public.customers SET stamps = stamps + $1 WHERE customer_id = $2`, 
          [stampsEarned, finalCustomerId]
        );
      }
    }

    await client.query('COMMIT');
    res.status(201).json({ order_id: newOrderId });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error("ORDER POST ERROR:", err.message);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    await pool.query(
      "UPDATE public.orders SET status = $1 WHERE order_id = $2", 
      [status, id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error("UPDATE ORDER ERROR:", err.message);
    res.status(500).json({ error: "Failed to update database" });
  }
});

export default router;