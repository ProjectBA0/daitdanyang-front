import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // ✅ useNavigate 추가
import styles from "./EventPage.module.css";
import EventBanner3D from "../components/EventBanner3D";
import EventGrid from "../components/Event/EventGrid";
import { fetchEvents } from "../api/eventApi"; 
import client from "../api/client"; // ✅ 관리자 체크를 위해 client 추가

/**
 * EventPage
 * - Composed of EventBanner3D and EventGrid components.
 * - Fetches event data from backend and displays in a grid.
 */

export default function EventPage() {
  const navigate = useNavigate(); // ✅ 정의
  const [items, setItems] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false); 

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        const resData = await fetchEvents();
        if (!isMounted) return;

        // ✅ API 응답 구조: { items: [], is_admin: bool }
        const activeEvents = (resData.items || []).map(e => ({ 
          ...e, 
          status: 'active' 
        }));
        
        const preparingEvents = [
          { id: 998, title: "봄맞이 특가 (준비중)", date: "Coming Soon", status: "preparing", img_url: null },
          { id: 999, title: "시크릿 이벤트 (준비중)", date: "Coming Soon", status: "preparing", img_url: null }
        ];

        setItems([...activeEvents, ...preparingEvents]);
        setIsAdmin(resData.is_admin || false); // ✅ 서버에서 준 권한 정보 사용
      } catch (err) {
        console.error("이벤트 데이터 로드 실패:", err);
      }
    }

    loadData();
    return () => { isMounted = false; };
  }, []); // 마운트 시 실행

  return (
    <div className={styles.page}>
      <div className={styles.pageInner}>
        <div className={styles.topSpacer} />
        
        {/* 3D Banner */}
        <EventBanner3D />
        
        <div style={{ height: '80px' }}></div>
        
        {/* Grid List */}
        <EventGrid items={items} />

      {/* ✅ 관리자일 때만 글쓰기 버튼 표시 */}
      {isAdmin && (
        <div className={styles.adminActions}>
          <button 
            className={styles.writeBtn} 
            onClick={() => navigate("/AdminPostForm")} // 🦁 통합 폼으로 이동
          >
            이벤트 등록
          </button>
        </div>
      )}
        
        <div className={styles.bottomSpacer} />
      </div>
    </div>
  );
}

// ==============================================================================
// [Gemini 작업 로그] - 26-01-04
// 1. 버그 수정: `isMounted` 플래그 및 클린업 함수를 통한 페이지 재진입 시 로드 오류 해결.
// 2. 권한 관리 최적화: 
//    - 백엔드(`/api/event`)에서 `is_admin` 정보를 한 번에 받아오도록 변경.
//    - 불필요한 추가 API 호출을 제거하여 성능 및 안정성 향상.
// 3. 데이터 필드 통일: `img_url` 필드를 명확하게 유지하여 이미지 유실 방지.
// ==============================================================================