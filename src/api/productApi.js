import client from "./client";

export async function fetchProducts(params = {}) {
  const res = await client.get("/api/product", { params });
  return res.data;
}

export async function fetchProductDetail(productId) {
  const res = await client.get(`/api/product/${productId}`);
  return res.data;
}

export async function fetchMainReviews() {
  const res = await client.get("/api/reviews/main");
  const base = (client.defaults.baseURL || "").replace(/\/$/, "");

  res.data.reviews = (res.data.reviews || []).map((r) => ({
    ...r,
    imgUrl: r.img_url?.startsWith("http")
      ? r.img_url
      : `${base}${r.img_url || ""}`,
  }));
  return res.data;
}

export async function fetchReviews(productId, page, sort) {
  const res = await client.get(
    `/api/product/${productId}/reviews`,
    { params: { page, limit: 5, sort } }
  );
  return res.data;
}

export async function createReview(productId, formData) {
  const res = await client.post(
    `api/product/${productId}/reviews`, formData);
    return res.data;
}