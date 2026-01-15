// 날짜 이쁘게 정렬 (안하면 "2026-01-06T03:15:22.123456" 이런식으로 나옴)
export function formatDate(iso) {
  if (!iso) return "";

  const d = new Date(iso);

  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");

  return `${y}.${m}.${day}`;
}