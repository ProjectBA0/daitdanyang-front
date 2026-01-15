// src/pages/MyPage/MyPageLayout.jsx
import { Outlet } from "react-router-dom";
import MyPagemenu from "./MyPagemenu";

export default function MyPageLayout() {
  return (
    <div
      style={{
        display: "flex",
        gap: "20px",
        width: "1200px",
        margin: "0 auto",
        padding: "20px 0",
      }}
    >
      {/* 왼쪽 메뉴 */}
      <div style={{ width: "220px", flexShrink: 0 }}>
        <MyPagemenu />
      </div>

      {/* 오른쪽 컨텐츠 */}
      <div
        style={{
          flex: 1,
          minWidth: 0,
          border: "1px solid #eee",
          padding: "20px",
          borderRadius: "8px",
          /* ✅ 스크롤 관련 속성 전부 제거 */
        }}
      >
        <Outlet />
      </div>
    </div>
  );
}
