import client from "./client";

// 메인 페이지 필요한 데이터 한 번에
export async function fetchHome(params = {}) {
    
  // 내가 버튼에다 onclick으로 값을 지정해주면 ex: button onClick={() 
  // =>    setPetType("dog")}
  //   params = {} 이 빈 공간에  params 예: { petType: "dog" }이렇게 들어감
  //   params에서 그 값을 받아서 백에서 값을 요청함 
  const res = await client.get("/api/home", { params });
  return res.data;
}