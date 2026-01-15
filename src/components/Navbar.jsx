import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./Navbar.module.css";

import { fetchMe } from "../api/authApi";

function Navbar() {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  // ✅ 렌더마다 localStorage 읽기 부담 없음(가벼움)
  // 필요하면 나중에 Context로 승격
  const token = useMemo(() => localStorage.getItem("accessToken"), []);

  // ✅ 토큰이 있는지 여부
  const isLoggedIn = !!localStorage.getItem("accessToken");

  useEffect(() => {
    // 토큰 없으면 admin false로 리셋
    const t = localStorage.getItem("accessToken");
    if (!t) {
      setIsAdmin(false);
      return;
    }

    let alive = true;

    (async () => {
      try {
        const me = await fetchMe();
        if (!alive) return;

        const role = String(me?.role || "").toUpperCase();
        const uid = String(me?.user_id || "");

        // ✅ role 기반 + (예전 데이터 대비) user_id === "admin"도 허용
        setIsAdmin(role === "ADMIN" || uid === "admin");
      } catch (err) {
        if (alive) setIsAdmin(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []); // ✅ mount 시 1회

  const goSearch = () => {
    const term = searchTerm.trim();
    if (!term) return;

    const params = new URLSearchParams();
    params.set("keyword", term);

    navigate(`/search?${params.toString()}`);
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    setIsAdmin(false);
    navigate("/login");
  };

  return (
    <header className={styles.headerWrap}>
      <div className={styles.navbar}>
        {/* ===== 상단 영역 ===== */}
        <div className={styles.topRow}>
          {/* 로고 */}
          <Link to="/" className={styles.logoBox} aria-label="홈으로">
            <img
              src="/images/daitdanyang-logo.png"
              alt="대잇다냥 로고"
              className={styles.logoImage}
            />
          </Link>

          {/* 검색 */}
          <div className={styles.searchBox}>
            <input
              type="text"
              placeholder="검색"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") goSearch();
              }}
              className={styles.searchInput}
              aria-label="상품 검색"
            />
            <button onClick={goSearch} className={styles.searchButton}>
              검색
            </button>
          </div>

          {/* 로그인 영역 */}
          <div className={styles.memberBox}>
            {isLoggedIn ? (
              <>
                <Link to="/mypage">마이페이지</Link>
                <Link to="/cart">장바구니</Link>

                {isAdmin && <Link to="/AdminPostForm">관리자</Link>}

                <button type="button" onClick={handleLogout}>
                  로그아웃
                </button>
              </>
            ) : (
              <>
                <Link to="/login">로그인</Link>
                <Link to="/signup">회원가입</Link>
              </>
            )}
          </div>
        </div>

        {/* ===== 하단 카테고리 ===== */}
        <nav className={styles.categoryRow} aria-label="카테고리 메뉴">
          <ul className={styles.navbarLinks}>
            <li>
              <Link to="/category/dog">강아지</Link>
            </li>
            <li>
              <Link to="/category/cat">고양이</Link>
            </li>

            <li className={styles.divider}></li>

            <li>
              <Link to="/events">EVENT</Link>
            </li>
            <li>
              <Link to="/view">최근 본 상품</Link>
            </li>
            <li>
              <Link to="/Noticeboard">게시판</Link>
            </li>
            <li>
              <Link to="/support">고객센터</Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
