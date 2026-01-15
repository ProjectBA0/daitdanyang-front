// src/api/authApi.js
import client from "./client";


export async function register(payload) {
  // payload 예: { userId, password, nickname, email }
  const res = await client.post("/api/auth/register", payload);
  return res.data;
}

export async function login(payload) {
  const res = await client.post("/api/auth/login", payload);
  console.log("LOGIN res.data =", res.data);

  const token = res.data?.accessToken;
  

  if (token) {console.log("TOKEN =", token);
    localStorage.setItem("accessToken", token);
    console.log("STORED =", localStorage.getItem("accessToken"));
  }
  return res.data;
}

export function logout() {
  localStorage.removeItem("accessToken");
}


// payload로 받아오는 방법 
//프론트 부분에서 client.post(주소,데이터) 형식으로 적어서 사용
// 주소를 현 api주소로 적으면 그 주소로 데이터가 들어오고 들어온 데이터가 payload부분에 들어옴


export async function checkUserId(userId) {
  const res = await client.get("/api/auth/check-id", {
    params: { userId },
  });
  return res.data; // { ok: true/false, msg: "..." }
}
//회원정보 검증 api

// 내 정보 가져오기
export async function fetchMe() {
  const res = await client.get("/api/auth/me");
  return res.data; // { user_id, nickname, email, phone, address }
}

/**
 * 회원탈퇴
 */
export const withdraw = ({ password, reason, reasonEtc }) => {
  return client.post("/api/auth/withdraw", {
    password,
    reason,
    reasonEtc,
  });
};