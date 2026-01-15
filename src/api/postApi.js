// src/api/postApi.js
import client from "./client";

// 게시글 상세 조회 (GET)
export async function readPost(id) {
  const res = await client.get(`/api/board/${id}`);
  return res.data;
}

// 게시글 수정 (PATCH)
export async function updatePost(id, payload) {
  const res = await client.patch(`/api/post/${id}`, payload);
  return res.data;
}

// 게시글 삭제 (DELETE)
export async function deletePost(id) {
  const res = await client.delete(`/api/post/${id}`);
  return res.data;
}

export async function createPost(formData) {
  const res = await client.post("/api/post", formData);
  return res.data;
}


