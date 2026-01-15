import React, { useMemo, useState } from "react";
import styles from "./OrderList.module.css"; // ✅ OrderList.module.css 경로만 맞추기

/**
 * 취소/반품 내역 페이지 (UI 더미버전)
 * - 주문목록과 동일한 틀
 * - 취소/반품 관련 상태만 보여주기
 */

const STATUS_OPTIONS = [
  { value: "ALL", label: "전체 취소/반품 상태" },
  { value: "CANCELLED", label: "취소완료" },
  { value: "RETURNED", label: "반품완료" },
];

const QUICK_RANGES = [
  { key: "7d", label: "1주일", days: 7 },
  { key: "1m", label: "1개월", days: 30 },
  { key: "3m", label: "3개월", days: 90 },
];

// ✅ 더미 주문 데이터 (나중에 API 응답으로 대체)
const DUMMY_ORDERS = [
  {
    orderId: "20260102-0001048",
    orderedAt: "2026-01-02",
    items: [
      {
        id: "item-1",
        imageUrl:
          "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=200&q=80", // 강아지 이미지
        name: "강아지 저자극 샴푸 300ml",
        optionText: "무향 / 300ml",
        qty: 1,
        price: 15900,
        status: "CANCELLED",
        courier: null,
        trackingNo: null,
        reviewWritten: false,
        deliveredAt: null,
      },
      {
        id: "item-2",
        imageUrl:
          "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=200&q=80", // 강아지 간식 느낌
        name: "훈련용 동결건조 닭가슴살 큐브",
        optionText: "100g",
        qty: 2,
        price: 8900,
        status: "CANCELLED",
        courier: null,
        trackingNo: null,
        reviewWritten: false,
        deliveredAt: null,
      },
    ],
  },
  {
    orderId: "20251220-0012345",
    orderedAt: "2025-12-20",
    items: [
      {
        id: "item-3",
        imageUrl:
          "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=200&q=80", // 고양이 이미지
        name: "고양이 벤토나이트 응고형 모래",
        optionText: "무향 / 6L",
        qty: 1,
        price: 13800,
        status: "RETURNED",
        courier: "CJ대한통운",
        trackingNo: "123456789012",
        reviewWritten: false,
        deliveredAt: "2025-12-24",
      },
      {
        id: "item-4",
        imageUrl:
          "https://images.unsplash.com/photo-1592194996308-7b43878e84a6?w=200&q=80", // 캣타워/장난감 느낌
        name: "고양이 낚시대 깃털 장난감 세트",
        optionText: "랜덤색상 / 3종",
        qty: 1,
        price: 9900,
        status: "RETURNED",
        courier: "CJ대한통운",
        trackingNo: "123456789012",
        reviewWritten: false,
        deliveredAt: "2025-12-24",
      },
    ],
  },
];


function formatMoney(n) {
  return n.toLocaleString("ko-KR") + "원";
}

// YYYY-MM-DD 문자열을 Date로 파싱 (간단 버전)
function toDate(s) {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function isWithinRange(dateStr, fromStr, toStr) {
  const date = toDate(dateStr);
  const from = toDate(fromStr);
  const to = toDate(toStr);
  const toEnd = new Date(to.getTime() + 24 * 60 * 60 * 1000 - 1);
  return date >= from && date <= toEnd;
}

export default function ReturnCancel() {
  const [status, setStatus] = useState("ALL");
  const [fromDate, setFromDate] = useState("2024-05-06");
  const [toDateStr, setToDateStr] = useState("2025-12-26");

  const filteredOrders = useMemo(() => {
    return DUMMY_ORDERS.map((order) => {
      // 기간 필터(주문일자 기준)
      const okRange = isWithinRange(order.orderedAt, fromDate, toDateStr);
      if (!okRange) return null;

      // ✅ 취소/반품 내역은 CANCELLED/RETURNED만 보여주기
      const onlyCancelReturn = order.items.filter(
        (it) => it.status === "CANCELLED" || it.status === "RETURNED"
      );

      // 상태 필터
      const items =
        status === "ALL"
          ? onlyCancelReturn
          : onlyCancelReturn.filter((it) => it.status === status);

      if (items.length === 0) return null;

      return { ...order, items };
    }).filter(Boolean);
  }, [status, fromDate, toDateStr]);

  const handleQuickRange = (days) => {
    const today = new Date();
    const to = today;
    const from = new Date(today.getTime() - days * 24 * 60 * 60 * 1000);

    const pad = (n) => String(n).padStart(2, "0");
    const fmt = (d) =>
      `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

    setFromDate(fmt(from));
    setToDateStr(fmt(to));
  };

  const openTracking = (courier, trackingNo) => {
    alert(`${courier}\n운송장: ${trackingNo}\n(여긴 나중에 링크로 연결)`);
  };

  return (
    <div className={styles.wrap}>
      <h2 className={styles.title}>취소/반품 내역</h2>

      {/* 상단 필터 */}
      <div className={styles.filterBar}>
        <select
          className={styles.select}
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <div className={styles.quickBtns}>
          {QUICK_RANGES.map((r) => (
            <button
              key={r.key}
              className={styles.quickBtn}
              type="button"
              onClick={() => handleQuickRange(r.days)}
            >
              {r.label}
            </button>
          ))}
        </div>

        <div className={styles.dateRange}>
          <input
            className={styles.dateInput}
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
          <span className={styles.tilde}>~</span>
          <input
            className={styles.dateInput}
            type="date"
            value={toDateStr}
            onChange={(e) => setToDateStr(e.target.value)}
          />
        </div>

        <button className={styles.searchBtn} type="button">
          조회
        </button>
      </div>

      {/* 안내 문구 */}
      <ul className={styles.notice}>
        <li>최근 취소/반품 내역만 조회됩니다.</li>
        <li>주문번호를 클릭하면 해당 주문의 상세내역을 확인할 수 있습니다.</li>
      </ul>

      {/* 리스트 */}
      <div className={styles.list}>
        <div className={styles.headerRow}>
          <div className={styles.colOrder}>주문일자 [주문번호]</div>
          <div className={styles.colImg}>이미지</div>
          <div className={styles.colInfo}>상품정보</div>
          <div className={styles.colQty}>수량</div>
          <div className={styles.colPrice}>상품구매금액</div>
          <div className={styles.colStatus}>처리상태</div>
          <div className={styles.colAction}>상세</div>
        </div>

        {filteredOrders.length === 0 ? (
          <div className={styles.empty}>조회된 취소/반품 내역이 없습니다.</div>
        ) : (
          filteredOrders.map((order) => (
            <div key={order.orderId} className={styles.orderGroup}>
              <div className={styles.orderMeta}>
                <div className={styles.orderDate}>{order.orderedAt}</div>
                <button
                  type="button"
                  className={styles.orderIdLink}
                  onClick={() => alert(`주문상세로 이동: ${order.orderId}`)}
                >
                  [{order.orderId}]
                </button>
              </div>

              <div className={styles.orderItems}>
                {order.items.map((it) => (
                  <div key={it.id} className={styles.itemRow}>
                    <div className={styles.colImg}>
                      <img
                        className={styles.thumb}
                        src={it.imageUrl}
                        alt={it.name}
                      />
                    </div>

                    <div className={styles.colInfo}>
                      <div className={styles.itemName}>{it.name}</div>
                      <div className={styles.itemOption}>
                        [옵션: {it.optionText}]
                      </div>
                    </div>

                    <div className={styles.colQty}>{it.qty}</div>
                    <div className={styles.colPrice}>{formatMoney(it.price)}</div>

                    <div className={styles.colStatus}>
                      <div className={styles.statusText}>
                        {statusLabel(it.status)}
                      </div>

                      {it.courier && it.trackingNo && (
                        <button
                          type="button"
                          className={styles.trackingLink}
                          onClick={() => openTracking(it.courier, it.trackingNo)}
                        >
                          {it.courier} [{it.trackingNo}]
                        </button>
                      )}
                    </div>

                    <div className={styles.colAction}>
                      <button
                        type="button"
                        className={styles.grayBtn}
                        onClick={() => alert("취소/반품 상세(나중에 연결)")}
                      >
                        상세보기
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function statusLabel(status) {
  switch (status) {
    case "CANCELLED":
      return "취소완료";
    case "RETURNED":
      return "반품완료";
    default:
      return status;
  }
}
