import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./PostForm.module.css";


import { createPost } from "../api/postApi";

import { fetchMe } from "../api/authApi";

export default function PostForm() {
  const navigate = useNavigate();

  // 게시판 타입
  const [boardType, setBoardType] = useState("문의사항");

  const [title, setTitle] = useState("");

  const [content, setContent] = useState("");
  const [attachment, setAttachment] = useState(null);

  // 화면 표시용 (서버에 보내지 않음)
  const [writer, setWriter] = useState("");
  const [email, setEmail] = useState("");

  // ✅ 로그인 체크 + 내 정보 표시용
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      alert("로그인이 필요합니다.");
      navigate("/login");
      return;
    }

    (async () => {
      try {

        const me = await fetchMe(); // { nickname, email }
        setWriter(me?.nickname || "");
        setEmail(me?.email || "");
      } catch (err) {
        alert("로그인 정보 확인에 실패했습니다.");

        localStorage.removeItem("accessToken");
        navigate("/login");
      }
    })();
  }, [navigate]);


  // ✅ 게시글 등록
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      alert("제목과 내용을 입력해주세요.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("content", content);

      formData.append("boardType", boardType);

      // ❌ writer / email 안 보냄 (서버가 토큰 기준으로 결정)
      if (attachment) {
        formData.append("attachment", attachment);
      }

      await createPost(formData);

      alert("게시글이 등록되었습니다.");
      navigate("/Noticeboard");
    } catch (err) {
      alert("등록에 실패했습니다.");
      console.error(err);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.notice}>
        게시글 작성 페이지입니다.
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        {/* 게시판 타입 */}
        <div className={styles.row}>

          <label>게시판</label>
          <select
            value={boardType}
            onChange={(e) => setBoardType(e.target.value)}
          >

            <option value="문의사항">문의사항</option>
            <option value="건의사항">건의사항</option>
            <option value="기타">기타</option>
          </select>
        </div>

        {/* 제목 */}
        <div className={styles.row}>
          <label>제목</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>


        {/* 작성자 (표시용) */}
        <div className={styles.row}>
          <label>작성자</label>
          <input value={writer} disabled />
        </div>

        {/* 이메일 (표시용) */}
        <div className={styles.row}>
          <label>이메일</label>
          <input value={email} disabled />

        </div>

        {/* 내용 */}
        <div className={styles.editor}>
          <textarea value={content} onChange={(e) => setContent(e.target.value)} required />
        </div>

        {/* 파일 첨부 */}
        <div className={styles.row}>
          <label>파일 첨부</label>
          <input type="file" onChange={(e) => setAttachment(e.target.files?.[0] ?? null)} />
        </div>

        <div className={styles.actions}>
          <button type="submit">등록하기</button>
          <button type="button" onClick={() => navigate(-1)}>취소</button>
        </div>
      </form>
    </div>
  );
}
