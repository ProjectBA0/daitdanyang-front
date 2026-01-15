import client from "./client";

export async function fetchEvents() {
  const res = await client.get("/api/event");
  return res.data;
}

export async function fetchEventDetail(eventId) {
  const res = await client.get(`/api/event/${eventId}`);
  return res.data;
}

// ✅ 이벤트 등록
export async function createEvent(payload) {
  const res = await client.post("/api/event", payload);
  return res.data;
}

// ✅ 이벤트 수정
export async function updateEvent(eventId, payload) {
  const res = await client.put(`/api/event/${eventId}`, payload);
  return res.data;
}

// ✅ 이벤트 삭제
export async function deleteEvent(eventId) {
  const res = await client.delete(`/api/event/${eventId}`);
  return res.data;
}

// [Gemini 작업 로그] - 26-01-04
// 1. 이벤트 API 연동: fetchEvents, fetchEventDetail 구현.
// 2. 관리자 기능 추가: createEvent, updateEvent, deleteEvent 함수 추가.

