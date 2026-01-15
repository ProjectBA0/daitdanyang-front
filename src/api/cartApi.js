// src/api/cartApi.js
import client from "./client";

// 장바구니 목록 조회, GET으로 가져오기
export async function fetchMyCart() {
  const res = await client.get("/api/cart");
  return res.data;
}

// 장바구니에 새 상품 추가, POST로 요청해 새 데이터 생성
// jwt토큰으로 서버가 이미 user_id는 알고 있기 때문에 안 보냄 (client.js에 적혀있음)
export async function addCart(productId, count = 1) {
  const res = await client.post("/api/cart", {
    product_id: productId,
    count,
  });
  return res.data;
}

// 새 데이터 생성과 기존 데이터 일부 수정은 다른 행위기도 하고
// 동시에 여러 요청이 들어왔을 때 꼬이는 걸 방지
// 장바구니 페이지에 수량 증가+, 감소-, 삭제x 버튼을 만들려면 따로 나누는 게 버그가 안 생기고 깔끔

// 장바구니 수량 수정, PATCH로 일부만 수정
export async function updateCart(cartId, count) {
  const res = await client.patch(`/api/cart/${cartId}`, { count });
  return res.data;
}

// 장바구니 상품 삭제
export async function removeCart(cartId) {
  const res = await client.delete(`/api/cart/${cartId}`);
  return res.data
}
