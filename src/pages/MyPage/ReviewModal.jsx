import { useEffect, useState } from "react";
import styles from "./ReviewModal.module.css";

export default function ReviewModal({
  open,
  item,
  onClose,
  onSubmit,
  mode = "create",          // "create" | "edit"
  initialReview = null      // edit일 때 { id, rating, content, img_url }
}) {
  const [removeImage, setRemoveImage] = useState(false);
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState("");

  // ✅ 1장 업로드 기준
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");

  useEffect(() => {
    if (!open) return;

    if (mode === "edit" && initialReview) {
      setRating(initialReview.rating ?? 5);
      setContent(initialReview.content ?? "");
      setPreview(initialReview.img_url || "");
      setFile(null);
      setRemoveImage(false);
    } else {
      setRating(5);
      setContent("");
      setPreview("");
      setFile(null);
      setRemoveImage(false);
    }
  }, [open, mode, initialReview]);

  if (!open) return null;

  const handlePickFile = (e) => {
    const f = e.target.files?.[0] || null;
    setFile(f);

    if (f) {
      setPreview(URL.createObjectURL(f));
      setRemoveImage(false); // ✅ 새 이미지 선택하면 삭제 체크 해제(교체로 간주)
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!rating || rating < 1 || rating > 5) {
      alert("별점을 선택해 주세요.");
      return;
    }

    if (!content.trim()) {
      alert("내용을 입력해 주세요.");
      return;
    }

    const fd = new FormData();
    fd.append("rating", String(rating));
    fd.append("content", content.trim());

    // ✅ 새 이미지 선택한 경우만 전송
    if (file) fd.append("image", file);

    // ✅ 수정에서 '이미지만 삭제' 요청
    if (removeImage) fd.append("removeImage", "1");

    const payload =
      mode === "edit"
        ? { reviewId: initialReview?.id, formData: fd }
        : { product_id: item?.product_id, formData: fd };

    await onSubmit(payload);
  };


  const handleBackdropClick = () => onClose();
  const stop = (e) => e.stopPropagation();

  return (
    <div className={styles.backdrop} onClick={handleBackdropClick}>
      <div className={styles.modal} onClick={stop}>
        <div className={styles.header}>
          <h3 className={styles.title}>
            {mode === "edit" ? "구매후기 수정" : "구매후기 작성"}
          </h3>
          <button className={styles.closeBtn} onClick={onClose} type="button">
            ✕
          </button>
        </div>

        <div className={styles.productBox}>
          <img
            className={styles.thumb}
            src={item?.imageUrl}
            alt={item?.productName}
          />
          <div>
            <div className={styles.productTitle}>{item?.productName}</div>
            <div className={styles.subText}>옵션: {item?.optionText}</div>
            <div className={styles.subText}>주문번호: {item?.orderId}</div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <label className={styles.label}>별점</label>
          <select
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
            className={styles.select}
          >
            <option value={5}>★★★★★ (5점)</option>
            <option value={4}>★★★★☆ (4점)</option>
            <option value={3}>★★★☆☆ (3점)</option>
            <option value={2}>★★☆☆☆ (2점)</option>
            <option value={1}>★☆☆☆☆ (1점)</option>
          </select>

          <label className={styles.label} style={{ marginTop: 12 }}>
            후기 내용
          </label>
          <textarea
            className={styles.textarea}
            rows={6}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="상품은 어땠나요? 솔직한 후기를 남겨주세요 :)"
          />

          {/* ✅ 사진 업로드 (1장 + 수정시 이미지 삭제) */}
          <div className={styles.uploadWrap}>
            <div className={styles.uploadTop}>
              <label className={styles.label} style={{ margin: 0 }}>
                사진 업로드
              </label>

              <label className={styles.uploadBtn}>
                + 사진 추가
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePickFile}
                  className={styles.fileInput}
                />
              </label>
            </div>

            {/* ✅ 프리뷰(기존 또는 새로 선택한 이미지) */}
            {preview && !removeImage && (
              <div className={styles.previewGrid}>
                <div className={styles.previewItem}>
                  <img src={preview} alt="preview" />
                  <button
                    type="button"
                    className={styles.removeBtn}
                    onClick={() => {
                      setFile(null);
                      if (mode === "edit" && initialReview?.img_url) {
                        setPreview(initialReview.img_url);
                      } else {
                        setPreview("");
                      }
                    }}
                    aria-label="remove"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}

            {/* ✅ 수정 모드에서만: 기존 이미지 삭제 */}
            {mode === "edit" && initialReview?.img_url && (
              <label className={styles.label} style={{ marginTop: 8 }}>
                <input
                  type="checkbox"
                  checked={removeImage}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setRemoveImage(checked);
                    if (checked) setFile(null); // 충돌 방지
                  }}
                />
                &nbsp;기존 이미지 삭제
              </label>
            )}
          </div>

          <div className={styles.actions}>
            <button type="button" className={styles.cancel} onClick={onClose}>
              취소
            </button>
            <button type="submit" className={styles.submit}>
              {mode === "edit" ? "수정하기" : "등록하기"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}