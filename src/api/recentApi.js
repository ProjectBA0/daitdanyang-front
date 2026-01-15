import client from "./client";

const KEY = "recent_products";

export function addRecent(productId) {
    // 기존에 저장된 최근 본 상품 가져오기
    const prev = JSON.parse(localStorage.getItem(KEY) || "[]");

    // localstorage에는 만료일이 X
    // 만료일 지정 (지금은 7일(밀리초로 환산))
    const filtered = prev.filter(
        (item) => Date.now() - item.time < 7 * 24 * 60 * 60 * 1000
    );
    // 새 상품 맨 앞 추가, filter로 중복 제거 
    // ... = 배열 안 요소들을 하나씩 꺼내서 현재 배열에 펼쳐 넣음 (...이 없으면 한 배열안에 들어가지 않고 배열 안에 배열이 들어감)
    const next = [{ id: productId, time: Date.now() }, ...filtered.filter(p => p.id !== productId)];
    localStorage.setItem(KEY, JSON.stringify(next.slice(0, 10)));
}

export async function fetchRecentProducts() {
    const id = JSON.parse(localStorage.getItem(KEY) || "[]");
    if (id.length === 0) return [];

    const ids = id.map(v => (typeof v === "number" ? v : v.id)).filter(Boolean);
    const res = await client.get("/api/product", {
        params: { ids: ids.join(",") },
    });
    const items = Array.isArray(res.data.items) ? res.data.items : [];
    // 최근 본 순서 유지
    const byId = new Map(items.map((p) => [p.id, p]));
    return ids.map((id) => byId.get(id)).filter(Boolean);
}
