// src/api/myReviewApi.js
import client from "./client";

export async function getMyReviews({page, limit, rating}) {
  const res = await client.get("/api/me/reviews", { params: { page, limit, rating }});
  return res.data;
}
