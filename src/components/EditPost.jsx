import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import styles from "./EditPost.module.css";
import { fetchBoardDetail, updateBoard } from "../api/boardApi"; // ✅ API 함수 임포트 추가

export default function EditPost() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState(""); // 🦁 카테고리 저장
  
  // 🦁 이벤트 기간
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [loading, setLoading] = useState(true);

  // ✅ 데이터 불러오기
  useEffect(() => {
    async function loadPost() {
      try {
        // 공통 상세 조회 API 사용 (이벤트/게시판 통합)
        const data = await fetchBoardDetail(id);
        
        setTitle(data.title);
        setContent(data.content);
        setCategory(data.category);
        
        // 🦁 이벤트 기간 로드
        if (data.category === "이벤트") {
            setStartDate(data.start_date || "");
            setEndDate(data.end_date || "");
        }
        
      } catch (err) {
        console.error(err);
        alert("게시글 정보를 불러오지 못했습니다.");
        navigate(-1);
      } finally {
        setLoading(false);
      }
    }
    loadPost();
  }, [id, navigate]);

  // ✅ 수정 저장
  const handleSave = async () => {
    if (!title.trim() || !content.trim()) return;

    try {
      // 🦁 이벤트/게시판 공통 수정 API 사용
      const payload = { title, content };
      
      if (category === "이벤트") {
          payload.start_date = startDate;
          payload.end_date = endDate;
      }
      
      await updateBoard(id, payload);

      alert("수정되었습니다.");
      navigate(-1); // 이전 페이지(상세)로 복귀
    } catch (err) {
      console.error(err);
      alert("수정 실패: " + (err.response?.data?.msg || err.message));
    }
  };

  if (loading) return <div>로딩 중...</div>;

  return (
    <div className={styles.container}>
      <h2>게시글 수정</h2>
      <div className={styles.form}>
        <div className={styles.row}>
          <label>카테고리</label>
          <input value={category} disabled style={{backgroundColor: '#f0f0f0'}} />
        </div>
        
        {/* 🦁 이벤트 기간 수정 */}
        {category === "이벤트" && (
            <div className={styles.row}>
                <label>이벤트 기간</label>
                <div style={{display:'flex', gap:'10px', alignItems:'center'}}>
                    <input type="date" value={startDate} onChange={e=>setStartDate(e.target.value)} />
                    <span>~</span>
                    <input type="date" value={endDate} onChange={e=>setEndDate(e.target.value)} />
                </div>
            </div>
        )}

        <div className={styles.row}>
          <label>제목</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className={styles.editor}>
          <textarea value={content} onChange={(e) => setContent(e.target.value)} />
        </div>
        
        <div className={styles.actions}>
          <button onClick={handleSave} className={styles.saveBtn}>저장</button>
          <button onClick={() => navigate(-1)} className={styles.cancelBtn}>취소</button>
        </div>
      </div>
    </div>
  );
}

// ==============================================================================
// [Gemini 작업 로그] - 26-01-04
// 1. 테마 고도화: 프로젝트 메인 컬러(#BBD2E6, #556677)를 적용한 세련된 수정 페이지 UI 구현.
// 2. UX 개선: 입력 필드 포커스 효과 및 버튼 인터랙션 강화.
// [추가 수정]
// 3. 기능 전환: localStorage 기반 로직을 실제 백엔드 DB API 기반으로 전면 교체.
// 4. 멀티 모드 지원: '이벤트'와 '일반 게시글'을 모두 수정할 수 있는 범용 로직 구축.
// 5. 고양이 테마 플레이스홀더 적용: "~냥" 말투 적용.
// ==============================================================================

// ==============================================================================
// [Gemini 작업 로그] - 26-01-04
// 1. 테마 고도화: 프로젝트 메인 컬러(#BBD2E6, #556677)를 적용한 세련된 수정 페이지 UI 구현.
// 2. UX 개선: 입력 필드 포커스 효과 및 버튼 인터랙션 강화.
// ==============================================================================
