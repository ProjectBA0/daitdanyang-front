import React, { useState, useEffect } from "react";
import styles from "./Wishlist.module.css";
import axios from "axios";

/**
 * Wishlist Component
 * - Displays a list of wished items with search and sort functionality.
 * - Intended to be used within a layout (e.g., MyPage).
 */
export default function Wishlist() {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("latest"); // 'latest', 'name'
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // 1. Load Data on Mount
  useEffect(() => {
    const token = localStorage.getItem("token"); 
    
    if (token) {
      setIsLoggedIn(true);
      fetchServerWishlist(token);
    } else {
      setIsLoggedIn(false);
      loadLocalWishlist();
    }
  }, []);

  const fetchServerWishlist = async (token) => {
    try {
      // API 호출
      const response = await axios.get("/api/wishlist/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWishlistItems(response.data);
    } catch (error) {
      console.error("Failed to fetch wishlist:", error);
    }
  };

  const loadLocalWishlist = () => {
    const localData = localStorage.getItem("tempWishlist");
    if (localData) {
      try {
        setWishlistItems(JSON.parse(localData));
      } catch (e) {
        console.error("Error parsing local wishlist", e);
        setWishlistItems([]);
      }
    } else {
      // 임시 더미 데이터
      const dummy = Array.from({ length: 5 }, (_, i) => ({
        id: i + 1,
        title: `임시 찜 상품 ${i + 1}`,
        price: (i + 1) * 1000,
        imgUrl: "",
        wished_at: new Date().toISOString()
      }));
      setWishlistItems(dummy);
    }
  };

  // 2. Search & Sort Logic
  const getFilteredItems = () => {
    let items = [...wishlistItems];

    if (searchQuery) {
      items = items.filter((item) =>
        item.title && item.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (sortOrder === "name") {
      items.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
    } else if (sortOrder === "latest") {
      items.sort((a, b) => {
        const dateA = new Date(a.wished_at || 0);
        const dateB = new Date(b.wished_at || 0);
        return dateB - dateA;
      });
    }

    return items;
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const toggleSort = () => {
    setSortOrder((prev) => (prev === "latest" ? "name" : "latest"));
  };

  const filteredItems = getFilteredItems();

  return (
    <div className={styles.container}>
      <div className={styles.pageInner}>
        {/* 상단 여백 */}
        <div style={{ height: "60px" }} />

        <div className={styles.bodyRow}>
          {/* 나중에 사이드바가 들어갈 빈 공간 */}
          <aside className={styles.sidebarSpacer} />

          {/* 우측 찜 목록 본문 */}
          <main className={styles.mainContent}>
            <div className={styles.title}>
              {isLoggedIn ? "회원" : "비회원"}님의 찜 목록
            </div>

            <div className={styles.toolbar}>
              <input
                type="text"
                className={styles.searchInList}
                placeholder="찜목록 안에서 검색"
                value={searchQuery}
                onChange={handleSearchChange}
              />
              <button className={styles.sortBtn} onClick={toggleSort}>
                {sortOrder === "latest" ? "최신순" : "이름순"}
              </button>
            </div>

            <div className={styles.listArea}>
              {filteredItems.length > 0 ? (
                filteredItems.map((it) => (
                  <div key={it.id} className={styles.listItem}>
                    <span style={{ fontWeight: "bold", marginRight: "10px" }}>
                      [{it.category || "상품"}]
                    </span>
                    {it.title}
                    <span style={{ marginLeft: "auto", fontSize: "0.9rem", color: "#888" }}>
                      {it.price ? `${it.price.toLocaleString()}원` : ""}
                    </span>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: "center", padding: "20px", color: "#999" }}>
                  검색 결과가 없습니다.
                </div>
              )}
            </div>
          </main>
        </div>
        
        {/* 하단 여백 */}
        <div style={{ height: "70px" }} />
      </div>
    </div>
  );
}

// ==============================================================================
// [Gemini 작업 로그] - 2025.12.26
// 1. 컴포넌트화: WishlistPage.jsx에서 사이드바 제거 및 독립 컴포넌트로 분리.
// 2. 위치 변경: pages/WishlistPage.jsx -> components/Wishlist.jsx
// 3. 기능: 찜 목록 조회, 검색, 정렬 기능 유지.
// ==============================================================================
