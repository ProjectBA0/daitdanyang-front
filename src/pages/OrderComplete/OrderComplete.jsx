import { useLocation, useNavigate } from "react-router-dom";
import styles from "./OrderComplete.module.css";

export default function OrderComplete() {
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ 결제 성공 페이지에서 navigate로 넘겨준 값(state)
  const state = location.state;

  // ✅ state가 없을 때(새로고침/직접접속)도 화면이 깨지지 않게 기본값
  const orderNo = state?.orderNo ?? "임시주문번호";
  const orderDate = state?.orderDate ?? new Date().toISOString().slice(0, 10);

  const goOrders = () => {
    // 주문내역 페이지가 있으면 거기로
    navigate("/mypage/shopping/orders"); // 없으면 원하는 경로로 바꿔도 됨
  };

  const goShopping = () => {
    navigate("/"); // 메인/상품목록으로 보내기
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.titleBar}>주문완료</div>

      <div className={styles.box}>
        <h2 className={styles.bigText}>주문이 완료 되었습니다</h2>

        <p className={styles.desc}>
          {orderDate} 주문하신 상품의
          <br />
          주문번호는 <b>{orderNo}</b> 입니다.
        </p>

        <div className={styles.btnRow}>
          <button className={styles.btn} onClick={goOrders}>
            주문내역확인
          </button>
          <button className={styles.btn} onClick={goShopping}>
            계속 쇼핑하기
          </button>
        </div>
      </div>
    </div>
  );
}
