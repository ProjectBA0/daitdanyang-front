import client from "./client";

// 나의 문의내역 가져오기
export async function getMyQna() {
  const res = await client.get("/api/me/qna");
  return res.data;
}
