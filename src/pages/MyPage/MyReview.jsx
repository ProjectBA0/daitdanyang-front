// src/pages/MyPage/MyReview.jsx
import React, { useEffect, useState } from "react";
import styles from "./MyQna.module.css"; // ✅ QnA랑 폼 똑같이 쓸 거면 그대로 재사용
import { getMyReviews } from "../../api/myReviewApi";

export default function MyReview() {
  // ✅ 리뷰 필터: 전체/5/4/3/2/1 (원하면 바꿔도 됨)
  const [filter, setFilter] = useState("전체");
  const [open, setOpen] = useState(null);

  const [myReviews, setMyReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyReviews = async () => {
      try {
        const rating =filter === "전체" ? undefined : Number(filter);
        const data = await getMyReviews({ rating });
        console.log("getMyReviews res:", data);
        setMyReviews(Array.isArray(data.items) ? data.items : []);
      } catch (err) {
        console.error("리뷰 불러오기 실패", err);
        setMyReviews([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMyReviews();
  }, [filter]);


  const list = myReviews;
  const selected = open ? myReviews.find((r) => r.id === open) : null;

  // 별 표시 유틸(간단)
  const renderStars = (rating) => {
    const n = Number(rating) || 0;
    return "⭐⭐⭐⭐⭐☆☆☆☆☆".slice(5 - n, 10 - n); // 0~5에 대응
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.head}>
        <h2 className={styles.title}>나의 상품후기</h2>

        <div className={styles.filters}>
          {["전체", "5", "4", "3", "2", "1"].map((f) => (
            <button
              key={f}
              className={`${styles.filterBtn} ${filter === f ? styles.active : ""}`}
              onClick={() => setFilter(f)}
            >
              {f === "전체" ? "전체" : `${f}점`}
            </button>
          ))}
        </div>
      </div>

      {/* 로딩 */}
      {loading && <div className={styles.empty}>불러오는 중...</div>}

      {/* 목록 */}
      <div className={styles.list}>
        {list.map((r) => (
          <button
            key={r.id}
            className={styles.row}
            onClick={() => setOpen(r.id)}
          >
            {/* ✅ QnA의 status 뱃지 대신 별점 뱃지 */}
            <span className={`${styles.badge} ${styles.done}`}>
              {renderStars(r.rating)}
            </span>

            <div className={styles.main}>
              <div className={styles.rowTop}>
                <span className={styles.product}>{r.productName}</span>
                <span className={styles.date}>{r.createdAt}</span>
              </div>

              <div className={styles.subject}>{r.content}</div>
              <div className={styles.meta}>별점: {r.rating} / 5</div>
            </div>
          </button>
        ))}

        {!loading && list.length === 0 && (
          <div className={styles.empty}>후기 내역이 없습니다.</div>
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
              <div>별점: {selected.rating} / 5 ({renderStars(selected.rating)})</div>
              <div>작성일: {selected.createdAt}</div>
            </div>

            <div className={styles.box}>
              <div className={styles.boxLabel}>후기내용</div>
              <div className={styles.boxBody}>{selected.content}</div>
            </div>

            {/* 이미지가 있으면 보여주고 싶다면(선택) */}
            {Array.isArray(selected.images) && selected.images.length > 0 && (
              <div className={styles.box}>
                <div className={styles.boxLabel}>첨부 이미지</div>
                <div className={styles.boxBody}>
                  {selected.images.map((src, idx) => (
                    <img
                      key={idx}
                      src={src}
                      alt={`review-${idx}`}
                      style={{ width: "120px", marginRight: "8px", borderRadius: "8px" }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
