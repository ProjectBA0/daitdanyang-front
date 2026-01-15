import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styles from "./NoticeDetail.module.css";

import client from "../api/client";
import { readPost, updatePost, deletePost } from "../api/postApi";

export default function NoticeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  const [answerContent, setAnswerContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadPost() {
      try {
        const data = await readPost(id);   // ✅ 여기!
        setPost(data.item ?? data);        // 백이 item으로 주면 item, 아니면 그대로
      } catch (err) {
        console.error("상세 조회 실패:", err);
        if (err.response?.status === 403) {
          alert("비공개 게시글입니다. 작성자만 확인할 수 있습니다.");
        } else if (err.response?.status === 401) {
          alert("로그인이 필요합니다.");
        } else {
          alert("게시글을 불러오는 중 오류가 발생했습니다.");
        }
        navigate("/support");
      } finally {
        setLoading(false);
      }
    }
    loadPost();
  }, [id, navigate]);

  // ✅ 삭제 핸들러
  const handleDelete = async () => {
    if (!window.confirm("정말로 삭제하시겠습니까?")) return;
    
    try {
      await deletePost(id);
      alert("삭제되었습니다.");
      navigate("/support"); // 목록으로 이동
    } catch (err) {
      alert("삭제 실패: " + (err.response?.data?.msg || err.message));
    }
  };

  // ✅ 답변 등록 핸들러 (Admin 전용)
  const handleAnswerSubmit = async () => {
    if (!answerContent.trim()) {
      alert("답변 내용을 입력해라냥!");
      return;
    }

    setIsSubmitting(true);
    try {
      await client.post(`/api/board/${id}/answer`, { content: answerContent });
      alert("답변이 등록되었다냥! ✨");
      setAnswerContent("");
      // 데이터 새로고침
      const data = await readPost(id);
      setPost(data.item ?? data);
    } catch (err) {
      alert("답변 등록 실패: " + (err.response?.data?.msg || err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className={styles.loading}>정보를 불러오는 중이다냥...</div>;
  if (!post) return null;

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* 📌 게시글 제목 */}
        <h2 className={styles.title}>{post.title}</h2>

        {/* 📌 게시글 정보 영역 */}
        <div className={styles.info}>
          <span><b>분류</b> {post.category}</span>
          <span><b>작성자</b> {post.writer}</span>
          <span><b>작성일</b> {post.date}</span>
        </div>

        {/* 📌 게시글 본문 박스 */}
        <div className={styles.contentBox}>
          {post.img_url && (
             <img 
               src={post.img_url} 
               alt="첨부 이미지" 
               style={{ maxWidth: '100%', borderRadius: '12px', marginBottom: '30px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} 
             />
          )}
          <div className={styles.content}>{post.content}</div>
        </div>

        {/* ✅ 답변 목록 영역 (있을 때만 노출) */}
        {post.answers && post.answers.length > 0 && (
          <div className={styles.answerSection} style={{ marginTop: '40px', borderTop: '2px solid #F4F8FB', paddingTop: '30px' }}>
            <h3 style={{ fontSize: '1.3rem', color: '#556677', marginBottom: '20px' }}>💬 답변 완료</h3>
            {post.answers.map((ans) => (
              <div key={ans.id} style={{ backgroundColor: '#F8FAFC', padding: '25px', borderRadius: '16px', border: '1px solid #E8EEF8', marginBottom: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '0.9rem', color: '#8fa0b0' }}>
                  <b>{ans.writer}</b>
                  <span>{ans.date}</span>
                </div>
                <div style={{ color: '#445566', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{ans.content}</div>
              </div>
            ))}
          </div>
        )}

        {/* ✅ 관리자 답변 작성 폼 (관리자일 때만 노출) */}
        {post.is_admin && ( // ✅ post.is_admin으로 명확하게 변경
          <div className={styles.adminAnswerForm} style={{ marginTop: '40px', backgroundColor: '#FCFDFE', padding: '30px', borderRadius: '20px', border: '2px dashed #D5E5F3' }}>
            <h3 style={{ fontSize: '1.1rem', color: '#556677', marginBottom: '15px' }}>✍️ 답변 작성 (관리자 전용)</h3>
            <textarea 
              style={{ width: '100%', minHeight: '120px', padding: '15px', borderRadius: '12px', border: '1px solid #E8EEF8', marginBottom: '15px', outline: 'none' }}
              placeholder="여기에 답변을 입력해라냥!"
              value={answerContent}
              onChange={(e) => setAnswerContent(e.target.value)}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button 
                onClick={handleAnswerSubmit}
                disabled={isSubmitting}
                className={styles.listBtn}
                style={{ height: '45px', padding: '0 30px' }}
              >
                {isSubmitting ? "등록 중..." : "답변 등록하기"}
              </button>
            </div>
          </div>
        )}

        {/* 📌 하단 버튼 영역 */}
        <div className={styles.buttons} style={{ marginTop: '50px' }}>
          {/* ✅ 본인 글이거나 관리자일 때 수정/삭제 버튼 표시 */}
          {(post.is_owner || post.is_admin) && (
            <>
              <button className={styles.editBtn} onClick={() => navigate(`/Noticeboard/edit/${post.id}`)}>
                수정하기
              </button>
              <button className={styles.deleteBtn} onClick={handleDelete}>
                삭제하기
              </button>
            </>
          )}

          {/* 목록으로 이동 (메인 액션) */}
          <button className={styles.listBtn} onClick={() => navigate(-1)}>
            목록으로
          </button> 
        </div>
      </div>
    </div>
  );
}

// ==============================================================================
// [Gemini 작업 로그] - 26-01-04
// 1. 데이터 소스 전환: localStorage -> 백엔드 API (`fetchBoardDetail`)로 변경.
// 2. 권한 제어: API 호출 실패(403 Forbidden) 시 알림창을 띄우고 목록으로 자동 이동.
// 3. UI 개선: 카테고리 표시 및 줄바꿈 처리(`pre-wrap`) 추가.
// 4. 삭제 기능 구현: `deleteBoard` API 연동.
// 5. 조건부 렌더링: `post.is_owner` 또는 `post.is_admin`일 때 수정/삭제 버튼 표시.
// 6. 테마 고도화: 프로젝트 메인 컬러(#BBD2E6, #556677)를 적용한 세련된 카드 레이아웃으로 개편.
// 7. 관리자 기능 강화: 모든 게시글에 대한 전역 권한(수정/삭제) 및 답변(Answer) 등록 기능 추가.
// 8. 답변 UI: 등록된 답변 목록 표시 및 관리자용 실시간 답변 작성 폼 구현.
// 9. 로직 수정: 관리자 계정 접속 시 게시판 목록에서 (나) 표시 제거 및 상세 페이지 답변 권한 로직 정교화.
// ==============================================================================

// ==============================================================================
// [Gemini 작업 로그] - 26-01-04
// 1. 데이터 소스 전환: localStorage -> 백엔드 API (`fetchBoardDetail`)로 변경.
// 2. 권한 제어: API 호출 실패(403 Forbidden) 시 알림창을 띄우고 목록으로 자동 이동.
// 3. UI 개선: 카테고리 표시 및 줄바꿈 처리(`pre-wrap`) 추가.
// 4. 삭제 기능 구현: `deleteBoard` API 연동.
// 5. 조건부 렌더링: `post.is_owner`가 true일 때만 수정/삭제 버튼 표시.
// 6. 테마 고도화: 프로젝트 메인 컬러(#BBD2E6, #556677)를 적용한 세련된 카드 레이아웃으로 개편.
// [추가 수정]
// 7. 관리자 기능 강화: 모든 게시글에 대한 전역 권한(수정/삭제) 및 답변(Answer) 등록 기능 추가.
// 8. 답변 UI: 등록된 답변 목록 표시 및 관리자용 실시간 답변 작성 폼 구현.
// ==============================================================================

// ==============================================================================
// [Gemini 작업 로그] - 26-01-04
// 1. 데이터 소스 전환: localStorage -> 백엔드 API (`fetchBoardDetail`)로 변경.
// 2. 권한 제어: API 호출 실패(403 Forbidden) 시 알림창을 띄우고 목록으로 자동 이동.
// 3. UI 개선: 카테고리 표시 및 줄바꿈 처리(`pre-wrap`) 추가.
// 4. 삭제 기능 구현: `deleteBoard` API 연동.
// 5. 조건부 렌더링: `post.is_owner`가 true일 때만 수정/삭제 버튼 표시.
// [추가 수정]
// 6. 테마 고도화: 프로젝트 메인 컬러(#BBD2E6, #556677)를 적용한 세련된 카드 레이아웃으로 개편.
// ==============================================================================

// ==============================================================================
// [Gemini 작업 로그] - 26-01-04
// 1. 데이터 소스 전환: localStorage -> 백엔드 API (`fetchBoardDetail`)로 변경.
// 2. 권한 제어: API 호출 실패(403 Forbidden) 시 알림창을 띄우고 목록으로 자동 이동.
// 3. UI 개선: 카테고리 표시 및 줄바꿈 처리(`pre-wrap`) 추가.
// [추가 수정]
// 4. 삭제 기능 구현: `deleteBoard` API 연동.
// 5. 조건부 렌더링: `post.is_owner`가 true일 때만 수정/삭제 버튼 표시.
// ==============================================================================

// ==============================================================================
// [Gemini 작업 로그] - 26-01-04
// 1. 데이터 소스 전환: localStorage -> 백엔드 API (`fetchBoardDetail`)로 변경.
// 2. 권한 제어: API 호출 실패(403 Forbidden) 시 알림창을 띄우고 목록으로 자동 이동.
// 3. UI 개선: 카테고리 표시 및 줄바꿈 처리(`pre-wrap`) 추가.
// ==============================================================================
