// src/api/boardApi.js
import client from "./client";

// ✅ 게시글 목록 조회
export async function fetchBoard(page = 1, perPage = 10, category = "전체") {
  const res = await client.get("/api/board/", {
    params: { page, per_page: perPage, category },
  });
  return res.data;
}

// ✅ 게시글 상세 조회
export async function fetchBoardDetail(id) {
  const res = await client.get(`/api/board/${id}`);
  return res.data;
}

// ✅ 게시글 삭제
export async function deleteBoard(id) {
  const res = await client.delete(`/api/board/${id}`);
  return res.data;
}

// ✅ 게시글 수정
export async function updateBoard(id, data) {
  const res = await client.put(`/api/board/${id}`, data);
  return res.data;
}

// ✅ 답변 등록 (관리자용)
export async function createAnswer(id, content) {
  const res = await client.post(`/api/board/${id}/answer`, { content });
  return res.data;
}

export async function fetchNotice(limit = 3) {
  // 백은 현재 limit(개수) 파라미터를 안 받고 내부에서 3개 고정이지만,
  // 나중에 백에서 limit 지원할 수도 있으니 옵션으로 열어둠.
  const res = await client.get("/api/board/notices", {
    params: { limit }, // 백에서 무시해도 문제 없음
  });
  return res.data;
}
