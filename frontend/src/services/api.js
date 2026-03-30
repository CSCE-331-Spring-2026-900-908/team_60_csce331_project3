const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

export async function fetchMenu() {
  const response = await fetch(`${API_BASE}/menu`);
  if (!response.ok) throw new Error("Failed to fetch menu");
  return response.json();
}

export async function fetchOrders() {
  const response = await fetch(`${API_BASE}/orders`);
  if (!response.ok) throw new Error("Failed to fetch orders");
  return response.json();
}

export async function fetchInventory() {
  const response = await fetch(`${API_BASE}/inventory`);
  if (!response.ok) throw new Error("Failed to fetch inventory");
  return response.json();
}

export async function fetchSalesSummary() {
  const response = await fetch(`${API_BASE}/manager/sales-summary`);
  if (!response.ok) throw new Error("Failed to fetch sales summary");
  return response.json();
}

export async function fetchTopItems() {
  const response = await fetch(`${API_BASE}/manager/top-items`);
  if (!response.ok) throw new Error("Failed to fetch top items");
  return response.json();
}

export async function placeOrder(orderData) {
  const response = await fetch(`${API_BASE}/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(orderData),
  });
  return response.json();
}

export async function updateOrderStatus(orderId, status) {
  const response = await fetch(`${API_BASE}/orders/${orderId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) throw new Error("Failed to update order status");
  return response.json();
}

export async function fetchProductUsage(startDate, endDate) {
  const response = await fetch(
    `${API_BASE}/manager/product-usage?startDate=${startDate}&endDate=${endDate}`
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to fetch usage data");
  }

  return response.json();
}