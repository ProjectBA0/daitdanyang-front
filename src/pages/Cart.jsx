import { useEffect, useMemo, useState } from "react";
import { fetchMyCart, updateCart, removeCart } from "../api/cartApi";
import { createOrder } from "../api/orderApi";
import { useNavigate } from "react-router-dom";

import styles from "./Cart.module.css";

export default function Cart() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  console.log("Cart component mounted");
  // 서버(cart item) -> 화면(item) 변환
  const mapServerToUI = (rows) =>
    (rows || []).map((c) => ({
      cartId: c.id,                 // ✅ cart row id (PATCH/DELETE에 필요)
      productId: c.product_id,      // ✅ 상품 id (POST에 필요)
      qty: c.count,                 // 서버 count -> 프론트 qty
      checked: true,

      // product 정보(서버가 product.to_dict() 주는 형태)
      name: c.product?.title ?? `상품 #${c.product_id}`,
      price: c.product?.price ?? 0,
      image: c.product?.imgUrl ?? "https://via.placeholder.com/90",
    }));

  const loadCart = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchMyCart();   // GET /api/cart
      setItems(mapServerToUI(data));
    } catch (err) {
      console.log("ERR RAW:", err);
      console.log("ERR STATUS:", err?.response?.status);
      console.log("ERR DATA:", err?.response?.data);

      const msg =
        err?.response?.data?.msg ||              // ✅ Flask-JWT-Extended
        err?.response?.data?.message ||          // (혹시 message로 주는 API)
        err?.message ||                          // ✅ axios 기본 메시지: Request failed...
        "장바구니 불러오기 실패";

      setError(msg);
      alert(msg);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ 초기 로딩: 서버에서 가져오기
  useEffect(() => {
    loadCart();
  }, []);

  // ✅ 수량 변경: 서버 PATCH 후 리패치
  const changeQty = async (cartId, nextQty) => {
    try {
      await updateCart(cartId, nextQty); // PATCH /api/cart/:cartId  {count}
      await loadCart();
    } catch (err) {
      alert(err?.response?.data?.message || "수량 변경 실패");
    }
  };

  // ✅ 삭제: 서버 DELETE 후 리패치
  const removeItem = async (cartId) => {
    try {
      await removeCart(cartId); // DELETE /api/cart/:cartId
      await loadCart();
    } catch (err) {
      alert(err?.response?.data?.message || "삭제 실패");
    }
  };

  // ✅ 체크 토글은 화면 상태만 (서버에 굳이 저장 X)
  const toggleCheck = (cartId) => {
    setItems((prev) =>
      prev.map((x) => (x.cartId === cartId ? { ...x, checked: !x.checked } : x))
    );
  };

  // 전체 선택
  const allChecked = useMemo(
    () => items.length > 0 && items.every((x) => x.checked),
    [items]
  );

  const toggleAll = () => {
    setItems((prev) => prev.map((x) => ({ ...x, checked: !allChecked })));
  };

  // 합계 계산
  const summary = useMemo(() => {
    const selected = items.filter((x) => x.checked);
    const itemTotal = selected.reduce((sum, x) => sum + x.price * x.qty, 0);
    const shipping = selected.length === 0 ? 0 : 3000;

    return {
      itemTotal,
      shipping,
      payTotal: itemTotal + shipping,
    };
  }, [items]);

  // 선택 삭제: 서버에선 여러 개 DELETE가 필요(일단 순차 처리)
  const removeSelected = async () => {
    const selected = items.filter((x) => x.checked);
    if (selected.length === 0) return;

    try {
      for (const x of selected) {
        await removeCart(x.cartId);
      }
      await loadCart();
    } catch (err) {
      alert(err?.response?.data?.message || "선택 삭제 실패");
    }
  };

  
  const buySelected = async () => {
    
    const selected = items.filter((x) => x.checked);
    if (selected.length === 0) return alert("구매할 상품을 선택해줘!");

    const orderItems = selected.map((x) => ({
      product_id: x.productId,
      qty: Math.max(1, Number(x.qty) || 1),
    }));

    try {
      const data = await createOrder({ items: orderItems });
      await Promise.all(selected.map((x) => removeCart(x.cartId)));
      navigate(`/order/${data.order_id}`);
    } catch (e) {
      alert("구매 처리 중 오류가 발생했습니다.");
    }
  };

  const buyAll = async () => {
    if (items.length === 0) return alert("장바구니가 비어있어!");

    const orderItems = items.map((x) => ({
      product_id: x.productId,
      qty: Math.max(1, Number(x.qty) || 1),
    }));

    try {
      const data = await createOrder({ items: orderItems });
      await Promise.all(items.map((x) => removeCart(x.cartId)));
      navigate(`/order/${data.order_id}`);
    } catch (e) {
      alert("구매 처리 중 오류가 발생했습니다.");
    }
  };



  return (
    <div className={styles.cartWrap}>
      <h2 className={styles.cartTitle}>CART</h2>



      {loading && <div className={styles.empty}>불러오는 중...</div>}
      {error && <div className="text-danger small mb-2">{error}</div>}

      <div className={styles.label}>일반상품</div>

      <div className={styles.cartHeader}>
        <div>
          <input type="checkbox" checked={allChecked} onChange={toggleAll} />
        </div>
        <div>이미지</div>
        <div>상품정보</div>
        <div>판매가</div>
        <div>수량</div>
        <div>배송구분</div>
        <div>합계</div>
      </div>

      {!loading && items.length === 0 ? (
        <div className={styles.empty}>장바구니가 비어있어요.</div>
      ) : (
        items.map((x) => (
          <div key={x.cartId} className={styles.cartRow}>
            <div>
              <input
                type="checkbox"
                checked={x.checked}
                onChange={() => toggleCheck(x.cartId)}
              />
            </div>

            <div>
              <img src={x.image} alt={x.name} className={styles.cartImg} />
            </div>

            <div>
              <div className={styles.cartName}>{x.name}</div>
              <button
                className={styles.deleteBtn}
                onClick={() => removeItem(x.cartId)}
              >
                삭제
              </button>
            </div>

            <div>{x.price.toLocaleString()}원</div>

            <div className={styles.qtyBox}>
              <button
                className={styles.qtyBtn}
                onClick={() => changeQty(x.cartId, Math.max(1, x.qty - 1))}
              >
                -
              </button>
              <div className={styles.qtyNum}>{x.qty}</div>
              <button
                className={styles.qtyBtn}
                onClick={() => changeQty(x.cartId, x.qty + 1)}
              >
                +
              </button>
            </div>

            <div>기본배송</div>
            <div className={styles.sum}>
              {(x.price * x.qty).toLocaleString()}원
            </div>
          </div>
        ))
      )}

      <div className={styles.cartSummary}>
        <div>총 상품금액: {summary.itemTotal.toLocaleString()}원</div>
        <div>총 배송비: {summary.shipping.toLocaleString()}원</div>
        <div>결제예정금액: {summary.payTotal.toLocaleString()}원</div>
      </div>

      <div className={styles.cartButtons}>
        <button className={styles.buyBtn} onClick={removeSelected}>
          선택삭제
        </button>
        <button className={styles.buyBtn} onClick={buySelected}>
          선택구매
        </button>
        <button className={styles.buyBtn} onClick={buyAll}>
          전체구매
        </button>
      </div>
    </div>
  );
}
