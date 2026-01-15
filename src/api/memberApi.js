import client from "./client";

// ✅ 내 정보 가져오기 (GET /me)
export async function getMyProfile() {
  const res = await client.get("/api/auth/me");
  return res.data;
}

// ✅ 내 정보 수정하기 (PUT /me)
export async function updateMyProfile(payload) {
  // payload 예: { phone, email, address } 또는 { nickname, phone, email, address }
  const res = await client.put("/api/auth/me", payload);
  return res.data;
}

// ✅ 비밀번호 변경 (POST /me/password)
export async function changePassword(payload) {
  // payload 예: { currentPw, newPw }
  const res = await client.post("/api/auth/me/password", payload);
  return res.data;
}
