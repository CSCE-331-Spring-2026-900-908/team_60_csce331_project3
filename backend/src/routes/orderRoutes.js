import express from "express";
import pool from "../config/db.js";

const router = express.Router();

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
      FROM orders o
      LEFT JOIN orderitems oi ON o.order_id = oi.order_id
      LEFT JOIN menuitems mi ON oi.menu_item_id = mi.menu_item_id
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
        ordersMap[row.order_id].items.push({
          name: row.item_name,
          quantity: row.quantity
        });
      }
    });

    res.json(Object.values(ordersMap));
  } catch (err) {
    console.error("KITCHEN FETCH ERROR:", err.message);
    res.status(500).json({ error: "Failed to fetch kitchen orders" });
  }
});

router.post("/", async (req, res) => {
  const client = await pool.connect();
  try {
    const { total_amount, items } = req.body;
    
    await client.query('BEGIN');

    // 1. Insert into orders table
    const orderResult = await client.query(
      'INSERT INTO public.orders (customer_id, employee_id, "date", status, total_amount, "time", z_reported) VALUES (1, 1, CURRENT_DATE, \'pending\', $1, CURRENT_TIME, false) RETURNING order_id',
      [Number(total_amount)]
    );
    
    const newOrderId = orderResult.rows[0].order_id;

    // 2. The Fix: Find the highest order_item_id in the database so we can auto-increment it ourselves
    const maxIdResult = await client.query("SELECT COALESCE(MAX(order_item_id), 0) AS max_id FROM public.orderitems");
    let currentItemId = parseInt(maxIdResult.rows[0].max_id, 10);

    // 3. Insert into orderitems, manually passing the new order_item_id
    if (items && items.length > 0) {
      for (const item of items) {
        currentItemId++; // Add 1 for the new item
        await client.query(
          'INSERT INTO public.orderitems (order_item_id, order_id, menu_item_id, quantity, price) VALUES ($1, $2, $3, $4, $5)',
          [currentItemId, newOrderId, item.menu_item_id, item.quantity, item.price || 0]
        );
      }
    }

    await client.query('COMMIT');

    // 4. Return success to the Kiosk
    res.status(201).json({ 
      order_id: newOrderId,
      status: 'pending'
    });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error("ORDER PLACEMENT ERROR:", err.message);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

router.put("/:orderId", async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    await pool.query(
      "UPDATE public.orders SET status = $1 WHERE order_id = $2",
      [status, orderId]
    );

    res.json({ success: true });
  } catch (err) {
    console.error("UPDATE STATUS ERROR:", err.message);
    res.status(500).json({ error: "Failed to update order status" });
  }
});

export default router;