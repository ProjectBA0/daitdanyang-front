// src/pages/MyQna.jsx
import React, { useEffect, useMemo, useState } from "react";
import styles from "./MyQna.module.css";
import { getMyQna } from "../../api/myQnaApi";


export default function MyQna() {
  const [filter, setFilter] = useState("전체"); // 전체/답변대기/답변완료
  const [open, setOpen] = useState(null); // 선택한 문의(id)
  const [myQna, setMyQna] = useState([]);     // ✅ 서버에서 받은 문의내역 저장
  const [loading, setLoading] = useState(true); // ✅ 로딩 표시용


  useEffect(() => {
    const fetchMyQna = async () => {
      try {
        const data = await getMyQna();
        setMyQna(data);
      } catch (err) {
        console.error("문의내역 불러오기 실패", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMyQna();
  }, []);

  const list = useMemo(() => {
    if (filter === "전체") return myQna;
    return myQna.filter((q) => q.status === filter);
  }, [filter, myQna]);

  const selected = open ? myQna.find((q) => q.id === open) : null;


  return (
    <div className={styles.wrap}>
      <div className={styles.head}>
        <h2 className={styles.title}>나의 문의내역</h2>

        <div className={styles.filters}>
          {["전체", "답변대기", "답변완료"].map((f) => (
            <button
              key={f}
              className={`${styles.filterBtn} ${
                filter === f ? styles.active : ""
              }`}
              onClick={() => setFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* 목록 */}
      {loading && <div className={styles.empty}>불러오는 중...</div>}

      <div className={styles.list}>
        {list.map((q) => (
          <button
            key={q.id}
            className={styles.row}
            onClick={() => setOpen(q.id)}
          >
            <span className={`${styles.badge} ${q.status === "답변완료" ? styles.done : styles.wait}`}>
              {q.status}
            </span>

            <div className={styles.main}>
              <div className={styles.rowTop}>
                <span className={styles.product}>{q.productName}</span>
                <span className={styles.date}>{q.createdAt}</span>
              </div>
              <div className={styles.subject}>{q.title}</div>
              <div className={styles.meta}>유형: {q.type}</div>
            </div>
          </button>
        ))}

        {list.length === 0 && (
          <div className={styles.empty}>문의내역이 없습니다.</div>
        )}
      </div>

      {/* 상세 모달 */}
      {selected && (
        <div className={styles.modalDim} onClick={() => setOpen(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHead}>
              <div className={styles.modalTitle}>{selected.title}</div>
              <button className={styles.close} onClick={() => setOpen(null)}>
                ✕
              </button>
            </div>

            <div className={styles.modalInfo}>
              <div>상품: {selected.productName}</div>
              <div>유형: {selected.type}</div>
              <div>작성일: {selected.createdAt}</div>
              <div>
                상태:{" "}
                <b className={selected.status === "답변완료" ? styles.doneText : styles.waitText}>
                  {selected.status}
                </b>
              </div>
            </div>

            <div className={styles.box}>
              <div className={styles.boxLabel}>문의내용</div>
              <div className={styles.boxBody}>{selected.content}</div>
            </div>

            <div className={styles.box}>
              <div className={styles.boxLabel}>답변</div>
              <div className={styles.boxBody}>
                {selected.answer ?? "아직 답변이 등록되지 않았습니다."}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
