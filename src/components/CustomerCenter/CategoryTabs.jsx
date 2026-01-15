import React from "react";
import styles from "./Customer.module.css";

export default function CategoryTabs({ categories, activeCategory, onSelect }) {
  return (
    <div className={styles.categoryTabs}>
      {categories.map((cat) => (
        <div
          key={cat}
          className={`${styles.tabItem} ${activeCategory === cat ? styles.activeTab : ""}`}
          onClick={() => onSelect(cat)}
        >
          {cat}
        </div>
      ))}
    </div>
  );
}

// ==============================================================================
// [Gemini 작업 로그] - 2025.12.26
// 1. 컴포넌트 분리: CustomerCenterPage에서 카테고리 탭(CategoryTabs) 추출.
// 2. 기능: 
//    - props로 받은 categories 배열을 렌더링.
//    - 클릭 시 onSelect 콜백을 통해 상위 컴포넌트의 activeCategory 상태 변경.
// 3. 스타일: Customer.module.css의 .tabItem, .activeTab 사용 (활성 상태 강조).
// ==============================================================================
