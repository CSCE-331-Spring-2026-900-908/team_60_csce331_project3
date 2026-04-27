// Check for the environment variable, ensuring we handle the /api suffix correctly
const VITE_URL = import.meta.env.VITE_API_URL;
const API_BASE = VITE_URL ? `${VITE_URL}/api` : "http://localhost:8080/api";
const API_URL = import.meta.env.VITE_API_URL || "https://auraboba-be.onrender.com/api";

/**
 * HELPER: Standard fetch config to ensure cookies (Google Auth) are sent.
 * Using credentials: "include" is what makes OAuth sessions work across domains.
 */
const fetchConfig = (options = {}) => ({
  ...options,
  credentials: "include", // CRITICAL for Google Auth to work on Render
  headers: {
    ...options.headers,
    "Content-Type": "application/json",
  },
});

export async function fetchMenu() {
  const response = await fetch(`${API_BASE}/menu`, fetchConfig());
  if (!response.ok) throw new Error("Failed to fetch menu");
  return response.json();
}

export async function fetchOrders() {
  const response = await fetch(`${API_BASE}/orders`, fetchConfig());
  if (!response.ok) throw new Error("Failed to fetch orders");
  return response.json();
}

export async function fetchInventory() {
  const response = await fetch(`${API_BASE}/inventory`, fetchConfig());
  if (!response.ok) throw new Error("Failed to fetch inventory");
  return response.json();
}

export async function fetchSalesSummary() {
  const response = await fetch(`${API_BASE}/manager/sales-summary`, fetchConfig());
  if (!response.ok) throw new Error("Failed to fetch sales summary");
  return response.json();
}

export async function fetchTopItems() {
  const response = await fetch(`${API_BASE}/manager/top-items`, fetchConfig());
  if (!response.ok) throw new Error("Failed to fetch top items");
  return response.json();
}

export const placeOrder = async (orderData) => {
  try {
    const response = await fetch(`${API_URL}/api/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderData),
    });

    // 1. Get the raw text first, in case the server crashes and doesn't send JSON
    const text = await response.text();
    let result;
    try {
      result = JSON.parse(text);
    } catch (e) {
      result = { error: text }; // Fallback if the server sent raw HTML/Text
    }

    if (!response.ok) {
      // 2. This will now show the REAL database error from the backend
      const errorMessage = result.error || result.message || text || "Unknown server error";
      console.error("SERVER ERROR RESPONSE:", errorMessage);
      throw new Error(errorMessage);
    }

    return result;
  } catch (err) {
    console.error("DEBUG ERROR:", err);
    // 3. This alert will now display the exact error message
    alert("DATABASE ERROR: " + err.message);
    throw err;
  }
};

export async function updateOrderStatus(orderId, status) {
  const response = await fetch(`${API_BASE}/orders/${orderId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status })
  });

  if (!response.ok) {
    // Log the error detail so we know exactly why it failed
    const errorData = await response.text(); 
    console.error("Server error:", errorData);
    throw new Error("Failed to update order status");
  }
  return response.json();
}

export async function fetchProductUsage(startDate, endDate) {
  const response = await fetch(
    `${API_BASE}/manager/product-usage?startDate=${startDate}&endDate=${endDate}`,
    fetchConfig()
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to fetch usage data");
  }

  return response.json();
}