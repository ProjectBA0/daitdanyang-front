import React, { useEffect, useState } from "react";
import styles from "./Recent.module.css";
import { Col, Row } from "react-bootstrap";
import { fetchRecentProducts } from "../api/recentApi";
import { useNavigate } from "react-router-dom";
import { addCart } from "../api/cartApi";

const Recent = () => {
  const [items, setItems] = useState([]);
  const navigate = useNavigate();

  // 상품 가져오기
  useEffect(() => {
    (async () => {
      try {
        const data = await fetchRecentProducts();
        setItems(data);
      } catch (e) {
        console.error(e);
        setItems([]);
      }
    })();
  }, []);

  // 로그인 O = cart로 연결, 로그인 X = 로그인 페이지로 연결
  const handleCartClick = async (productId) => {
    try {
      await addCart(productId, 1);
      navigate("/cart");
    } catch (err) {
      if (err?.response?.status === 401) {
        navigate("/login", { state: { redirectTo: "/cart" } });
        return;
      }

      console.error(err);
      alert("장바구니 담기에 실패했습니다.");
    }
  };

  return (
    <div className={styles.recent}>
      <div className={styles.maintitle}>최근 본 상품</div>

      <div className={styles.wrap}>
        <Row className={`g-0 ${styles.row}`}>
          <Col xs={2} className={styles.title}>이미지</Col>
          <Col xs={7} className={styles.title}>상품명</Col>
          <Col xs={2} className={styles.title}>금액</Col>
          <Col xs={1} className={styles.title}>장바구니</Col>
        </Row>

        {items.map((i) => (
          <Row key={i.id} className={`g-0 ${styles.body}`}>
            <Col xs={2} className={styles.cell}>
              <div className={styles.thumb}>
                {i.img_url ? (
                  <img src={i.img_url} alt={i.title} />
                ) : (
                  <div className={styles.thumbPlaceholder} />
                )}
              </div>
            </Col>

            <Col xs={7} className={`${styles.cell} ${styles.name}`} onClick={() => navigate(`/product/$ {i.id}`) }>
              {i.title}       
            </Col>

            <Col xs={2} className={styles.cell}>
              {i.price.toLocaleString()}원
            </Col>

            <Col xs={1} className={styles.cell}>
              <button className={styles.cartBtn} onClick={() => handleCartClick(i.id)}>Click!</button>
            </Col>
          </Row>
        ))}
      </div>
    </div>
  );
};

export default Recent;
