// ✅ src/api/orderApi.js
import client from "./client";

/**
 * 내 주문 목록 조회
 * GET /api/orders
 */
export async function getOrders() {
  const res = await client.get("/api/orders");
  return res.data; // [{ orderId, orderedAt, items: [...] }, ...]
}

/**
 * 주문 생성
 * POST /api/orders
 * body: { items: [{ product_id, qty }] }
 * return: { order_id }
 */
export async function createOrder(payload) {
  const res = await client.post("/api/orders", payload);
  return res.data;
}

/**
 * 주문 1건 상세 조회
 * GET /api/orders/:orderId
 */
export async function getOrder(orderId) {
  const res = await client.get(`/api/orders/${orderId}`);
  return res.data;
}

/**
 * (선택) 주문 취소
 * DELETE /api/orders/:orderId
 */
export async function deleteOrder(orderId) {
  const res = await client.delete(`/api/orders/${orderId}`);
  return res.data;
}

export async function cancelOrder(orderId) {
  const res = await client.delete(`/api/orders/${orderId}`);
  return res.data;
}
