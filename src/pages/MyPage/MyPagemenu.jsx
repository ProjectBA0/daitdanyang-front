// src/pages/MyPage/MyPagemenu.jsx
import { NavLink } from "react-router-dom";

const linkStyle = ({ isActive }) => ({
  display: "block",
  padding: "8px 10px",
  borderRadius: "6px",
  textDecoration: "none",
  color: isActive ? "#111" : "#555",
  background: isActive ? "#f2f4f7" : "transparent",
});

export default function MyPagemenu() {
  return (
    <div>
      <h3 style={{ marginBottom: "14px" }}>마이페이지</h3>

      <div style={{ marginBottom: "16px" }}>
        <div style={{ fontWeight: 700, marginBottom: "8px" ,fontSize:"20px"}}>쇼핑정보</div>
        <NavLink to="shopping/orders" style={linkStyle}>주문목록</NavLink>
        <NavLink to="shopping/returns" style={linkStyle}>취소/반품내역</NavLink>
        <NavLink to="shopping/wishlist" style={linkStyle}>찜리스트</NavLink>
      </div>

      <div style={{ marginBottom: "16px" }}>
        <div style={{ fontWeight: 700, marginBottom: "8px" ,fontSize:"20px"}}>회원정보</div>
        <NavLink to="member/edit" style={linkStyle}>회원정보변경</NavLink>
        <NavLink to="member/withdraw" style={linkStyle}>회원탈퇴</NavLink>
      </div>

      <div style={{ marginBottom: "16px" }}>
        <div style={{ fontWeight: 700, marginBottom: "8px" ,fontSize:"20px"}}>활동</div>
        <NavLink to="qna" style={linkStyle}>나의 문의내역</NavLink>
        <NavLink to="review" style={linkStyle}>나의 상품후기</NavLink>
      </div>
    </div>
  );
}
