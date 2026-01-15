// api/reviewApi.js
import client from "./client";

// 등록
export async function createReview(product_id, formData) {
  const res = await client.post(`/api/product/${product_id}/reviews`, formData);
  return res.data;
}

// 수정
export async function updateReview(review_id, formData) {
  const res = await client.put(`/api/reviews/${review_id}`, formData);
  return res.data;
}

// 삭제
export async function deleteReview(review_id) {
  const res = await client.delete(`/api/reviews/${review_id}`);
  return res.data;
}
