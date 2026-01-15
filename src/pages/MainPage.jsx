import React, { useEffect, useState } from "react";
import { Alert, Carousel, Container, Spinner } from "react-bootstrap";
import styles from "./Mainpage.module.css";
import { useNavigate } from "react-router-dom";
import { fetchMainReviews, fetchProducts } from "../api/productApi";
import { fetchNotice } from "../api/boardApi"; // ✅ 공지 API

function MainPage() {
  const navigate = useNavigate();

  // 펫 타입
  const [pet, setPet] = useState(null);

  // 백에서 받아올 아이템
  const [bestItems, setBestItems] = useState([]);
  const [recommend, setRecommend] = useState([]);

  // 리뷰
  const [reviews, setReviews] = useState([]);

  // 공지사항
  const [notices, setNotices] = useState([]);

  // 로딩 에러처리
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const getImageSrc = (item) => {
    const url = (item?.imgUrl ?? item?.img_url ?? "").trim();
    return url ? url : `${process.env.PUBLIC_URL}/images/no-image.png`;
  };


  useEffect(() => {
    let alive = true;

    async function load() {
      setLoading(true);
      setError("");

      try {
        const bestData = await fetchProducts({
          pet_type: pet ?? undefined,
          sort: "views_desc",
          limit: 8,
          page: 1,
        });

        const recommendData = await fetchProducts({
          pet_type: pet ?? undefined,
          sort: "review_count_desc",
          limit: 8,
          page: 1,
        });

        if (!alive) return;

        setBestItems(Array.isArray(bestData?.items) ? bestData.items : []);
        setRecommend(Array.isArray(recommendData?.items) ? recommendData.items : []);
      } catch (e) {
        if (!alive) return;
        setError("상품 목록을 불러오는 중 오류가 발생했습니다.");
        setBestItems([]);
        setRecommend([]);
      } finally {
        if (alive) setLoading(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, [pet]);

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchMainReviews();
        setReviews(Array.isArray(data?.reviews) ? data.reviews : []);
      } catch (e) {
        console.error("리뷰 불러오기 에러", e);
      }
    })();
  }, []);

  // ✅ 공지사항 로드 (백: /api/board/notices)
  useEffect(() => {
    let alive = true;

    async function loadNotices() {
      try {
        const data = await fetchNotice(); // { items: [...] }
        if (!alive) return;
        setNotices(Array.isArray(data?.items) ? data.items : []);
      } catch (err) {
        if (!alive) return;
        console.error("공지사항 로드 실패:", err);
        setNotices([]);
      }
    }

    loadNotices();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <Container className={styles.container}>
      {/* 에러 표시 */}
      {!loading && error && (
        <Alert variant="danger" className="my-3">
          {error}
        </Alert>
      )}

      {/* 정상 렌더 */}
      <div className={styles.main}>
        {/* 로딩 중 표시 */}
        {loading && (
          <div className="d-flex justify-content-center my-4">
            <Spinner animation="border" />
          </div>
        )}

        <div>
          {/* 상단 슬라이더 */}
          <section className={styles.slider}>
            <Carousel>
              <Carousel.Item interval={4000} onClick={() => navigate('/events/16')}>
                <img
                  className={styles.slider_img}
                  src={`${process.env.PUBLIC_URL}/images/banner/banner1.jpg`}
                  alt="banner1"
                  style={{ cursor: 'pointer' }}
                />
              </Carousel.Item>
              <Carousel.Item interval={4000} onClick={() => navigate('/events/17')}>
                <img
                  className={styles.slider_img}
                  src={`${process.env.PUBLIC_URL}/images/banner/banner2.jpg`}
                  alt="banner2"
                  style={{ cursor: 'pointer' }}
                />
              </Carousel.Item>
              <Carousel.Item interval={4000} onClick={() => navigate('/events/18')}>
                <img
                  className={styles.slider_img}
                  src={`${process.env.PUBLIC_URL}/images/banner/banner3.jpg`}
                  alt="banner3"
                  style={{ cursor: 'pointer' }}
                />
              </Carousel.Item>
              <Carousel.Item interval={4000} onClick={() => navigate('/events/12')}>
                <img
                  className={styles.slider_img}
                  src={`${process.env.PUBLIC_URL}/images/banner/banner4.jpg`}
                  alt="banner4"
                  style={{ cursor: 'pointer' }}
                />
              </Carousel.Item>
              <Carousel.Item interval={4000} onClick={() => navigate('/events/13')}>
                <img
                  className={styles.slider_img}
                  src={`${process.env.PUBLIC_URL}/images/banner/banner5.jpg`}
                  alt="banner5"
                  style={{ cursor: 'pointer' }}
                />
              </Carousel.Item>
              <Carousel.Item interval={4000} onClick={() => navigate('/events/14')}>
                <img
                  className={styles.slider_img}
                  src={`${process.env.PUBLIC_URL}/images/banner/banner6.jpg`}
                  alt="banner6"
                  style={{ cursor: 'pointer' }}
                />
              </Carousel.Item>
              <Carousel.Item interval={4000} onClick={() => navigate('/events/15')}>
                <img
                  className={styles.slider_img}
                  src={`${process.env.PUBLIC_URL}/images/banner/banner7.jpg`}
                  alt="banner7"
                  style={{ cursor: 'pointer' }}
                />
              </Carousel.Item>
            </Carousel>
          </section>

          <section className={styles.categorySection}>
            <button
              className={`${styles.categoryBox} ${styles.dog}`}
              onClick={() => setPet("dog")}
            >
              <img
                src={`${process.env.PUBLIC_URL}/images/banner/dog.png`}
                alt="강아지"
                className={styles.categoryImg}
              />
              <p className={styles.categoryText}>강아지</p>
            </button>

            <button
              className={`${styles.categoryBox} ${styles.cat}`}
              onClick={() => setPet("cat")}
            >
              <img
                src={`${process.env.PUBLIC_URL}/images/banner/cat.png`}
                alt="고양이"
                className={styles.categoryImg}
              />
              <p className={styles.categoryText}>고양이</p>
            </button>
          </section>

          <section className={styles.best}>
            <h3>BEST ITEMS</h3>
            <div className={styles.bestitems}>
              {bestItems.map((item) => (
                <div
                  key={item.id}
                  className={styles.productCard}
                  onClick={() => navigate(`/product/${item.id}`)}
                >
                  <img
                    className={styles.productImg}
                    src={getImageSrc(item)}
                    alt={item.title || "상품이미지"}
                    onError={(e) => {
                      e.currentTarget.src = `${process.env.PUBLIC_URL}/images/no-image.png`;
                    }}
                  />
                  <p className={styles.productTitle}>{item.title}</p>
                  <p className={styles.productPrice}>
                    {Number(item.price || 0).toLocaleString()}원
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className={styles.best}>
            <h3>RECOMMEND ITEMS</h3>
            <div className={styles.bestitems}>
              {recommend.map((item) => (
                <div
                  key={item.id}
                  className={styles.productCard}
                  onClick={() => navigate(`/product/${item.id}`)}
                >
                  <img
                    className={styles.productImg}
                    src={getImageSrc(item)}
                    alt={item.title || "상품이미지"}
                    onError={(e) => {
                      e.currentTarget.src = `${process.env.PUBLIC_URL}/images/no-image.png`;
                    }}
                  />
                  <p className={styles.productTitle}>{item.title}</p>
                  <p className={styles.productPrice}>
                    {Number(item.price || 0).toLocaleString()}원
                  </p>
                </div>
              ))}
            </div>
          </section>

          <div className={styles.revnot}>
            <div className={styles.review}>
              {reviews.map((r) => (
                <div key={r.id} className={styles.card}>
                  <div className={styles.thumb}>
                    <img src={getImageSrc(r)} alt="리뷰이미지" className={styles.revimg} />
                  </div>

                  <div className={styles.meta}>
                    <div className={styles.stars}>
                      {"⭐".repeat(r.rating)}
                      {"☆".repeat(5 - r.rating)}
                    </div>
                    <div className={styles.write}>
                      <p className={styles.title}>{r.writer || "작성자"}</p>
                      <p className={styles.date}>{r.date}</p>
                    </div>
                    <div className={styles.content}>{r.content}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.notice}>
              <h4 className={styles.noticeTitle}>공지사항</h4>
              <div className={styles.noticeList}>
                {notices.map((n) => (
                  <div key={n.id} className={styles.notItem}>
                    <span
                      className={styles.notTitle}
                      onClick={() => navigate(`/Noticeboard/${n.id}`)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") navigate(`/Noticeboard/${n.id}`);
                      }}
                    >
                      {n.title}
                    </span>
                    <span className={styles.notDate}>{n.date}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
}

export default MainPage;
