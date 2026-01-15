import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styles from "./Order.module.css";

import { getOrder, cancelOrder } from "../api/orderApi";

const Order = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();

  // ✅ 빠져있던 state 선언들
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);

  const handleCancel = async () => {
    const ok = window.confirm(`주문을 취소할까요? (주문번호: ${orderId})`);
    if (!ok) return;

    try {
      await cancelOrder(orderId);
      alert("주문이 취소되었습니다.");
      navigate("/mypage/shopping/orders"); // ✅ 취소 후 이동
    } catch (e) {
      alert(e?.response?.data?.error || e.message || "주문취소 실패");
    }
  };

  

  useEffect(() => {
    if (!orderId) return;

    let alive = true;

    (async () => {
      setLoading(true);
      setError("");

      try {
        const data = await getOrder(orderId);
        if (!alive) return;

        setOrder(data?.order ?? null);
        setItems(Array.isArray(data?.items) ? data.items : []);
      } catch (e) {
        if (!alive) return;
        setError(
          e?.response?.data?.error || e.message || "주문 정보를 불러오지 못했습니다."
        );
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [orderId]);

  const itemsTotal = useMemo(() => {
    return items.reduce((sum, it) => sum + Number(it.line_price ?? 0), 0);
  }, [items]);

  const shippingFee = itemsTotal >= 30000 ? 0 : 3000;
  const totalPrice = itemsTotal + shippingFee;

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.orderWrap}>로딩중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.page}>
        <div className={styles.orderWrap}>{error}</div>
      </div>
    );
  }


  if (!order) {
    return (
      <div className={styles.page}>
        <div className={styles.orderWrap}>주문이 없습니다.</div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.orderWrap}>
        <div className={styles.orderTitle}>주문 / 결제</div>

        {/* ================= 주문 정보 ================= */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>주문 정보</div>
          <div className={styles.sectionBody}>
            <div className={styles.formRow}>
              <div className={styles.label}>주문번호</div>
              <div>{order.order_id}</div>
            </div>
            <div className={styles.formRow}>
              <div className={styles.label}>주문일자</div>
              <div>{order.ordered_date}</div>
            </div>
          </div>
        </section>

        {/* ================= 배송지 ================= */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>배송지</div>
          <div className={styles.sectionBody}>
            <div className={styles.formRow}>
              <div className={styles.label}>주소</div>
              <div>{order.order_address}</div>
            </div>
            <div className={styles.formRow}>
              <div className={styles.label}>연락처</div>
              <div>{order.order_phone || "-"}</div>
            </div>
          </div>
        </section>

        {/* ================= 주문 상품 ================= */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>주문상품</div>
          <div className={styles.sectionBody}>
            {items.map((it) => (
              <div key={it.id} className={styles.productRow}>
                <div className={styles.productImage}>
                  {it.img_url ? (
                    <img
                      src={it.img_url}
                      alt={it.title || "상품 이미지"}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  ) : null}
                </div>

                <div className={styles.productInfo}>
                  {it.title}
                  <br />
                  수량: {it.qty}
                  <br />
                  {(it.line_price ?? 0).toLocaleString()}원
                </div>
              </div>
            ))}

            <div className={`${styles.priceRow} ${styles.productShipping}`}>
              <span>배송비</span>
              <span>{shippingFee.toLocaleString()}원</span>
            </div>
          </div>
        </section>

        {/* ================= 결제 정보 ================= */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>결제정보</div>
          <div className={styles.sectionBody}>
            <div className={styles.priceRow}>
              <span>상품금액</span>
              <span>{itemsTotal.toLocaleString()}원</span>
            </div>
            <div className={styles.priceRow}>
              <span>배송비</span>
              <span>{shippingFee.toLocaleString()}원</span>
            </div>
            <div className={styles.totalRow}>
              <span>최종 결제 금액</span>
              <span>{totalPrice.toLocaleString()}원</span>
            </div>
          </div>
        </section>

        <button type="button" className={styles.cancelBtn} onClick={handleCancel}>
          주문취소
        </button>

        <button
          className={styles.payButton}
          onClick={() => navigate("/mypage/shopping/orders")}
        >
          결제하기
        </button>
      </div>
    </div>
  );
};

export default Order;
