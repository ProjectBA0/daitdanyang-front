// front/src/pages/Category.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Row, Col, Container, Pagination, Spinner, Alert } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";

import styles from "./Category.module.css";
import { CATEGORY, CATEGORY_ORDER } from "../constants/category_name";
import { fetchProducts } from "../api/productApi";


// 페이지당 보여줄 개수(= 백에 요청할 limit)
const PER_PAGE = 12;

// 페이지 버튼을 몇 개 묶어서 보여줄지 (1~10, 11~20 이런 식)
const PAGE_GROUP = 10;

const Category = () => {
  // URL 파라미터 가져오기
  const { pet, sub } = useParams();
  const navigate = useNavigate();

  // 화면에 보여줄 실제 상품 목록(= 백에서 받아온 현재 페이지 items)
  const [items, setItems] = useState([]);

  // 현재 페이지 번호
  const [page, setPage] = useState(1);

  // 전체 상품 수 
  const [total, setTotal] = useState(0);

  // usestate 값은 기본으로 어떻게 정렬할지
  const [sort, setSort] = useState("id_desc");

  // 로딩/에러 처리
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // usememo 내가 입력한 값 현 코드에서는 pet의 값이 변할 때 마다 다시 실행
  const categories = useMemo(() => {
    return CATEGORY_ORDER?.[pet] ?? [];
  }, [pet]);

  // DB에서 필터링에 사용할 카테고리 값들을 “항상 배열 형태”로 만들어 주는 코드
  const categoryName = useMemo(() => {
    if (!sub) return [];
    const db = CATEGORY?.[sub]?.db;
    if (!db) return [];
    return Array.isArray(db) ? db : [db];
  }, [sub]);

  // totalPages(총 페이지 수)
  // Math.ceil: 상품을 내가 한페이지마다 나타내는 수로 나누어 필요한 페이지를 계산
  // 최소 1페이지는 보장(Math.max)
  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(total / PER_PAGE));
  }, [total]);

  // 카테고리 같은 페이지를 처음으로 돌아가야하는 상황을 위해 밑에있는 상황에 처하면 페이지를 1로 바꾼다라고 설정해둔 값
  useEffect(() => {
    setPage(1);
  }, [pet, sub, sort]);

  //백에서 보내준 정보를 띄워주는 역활
  useEffect(() => {
    let alive = true; // 언마운트/요청 꼬임 방지 (setState 경고 방지용)

    async function load() {
      setLoading(true);
      setError("");

      try {
        const data = await fetchProducts({
          pet_type: pet,                 // 백이 기대하는 key
          category: categoryName.length ? categoryName : undefined, //categoryName배열에 값이 있으면 category에 보내고 비어있으면 보내지 말아라
          page,                          // 현재 페이지
          limit: PER_PAGE,               // 페이지당 개수
          sort,                          // 정렬 키
        });

        if (!alive) return;

        // items 안전 처리
        setItems(Array.isArray(data.items) ? data.items : []);

        // total 안전 처리
        const newTotal = Number(data.total) || 0;
        setTotal(newTotal);

        // 만약 total이 줄어서 현재 page가 범위를 벗어나면 1로 리셋
        // 
        const pages = Math.max(1, Math.ceil(newTotal / PER_PAGE));
        if (page > pages) setPage(1);
      } catch (e) {
        if (!alive) return;
        setError("상품 목록을 불러오는 중 오류가 발생했습니다.");
        setItems([]);
        setTotal(0);
      } finally {
        if (alive) setLoading(false);
      }
    }

    // pet이 없으면 요청할 필요가 없음 (URL이 깨진 경우)
    if (!pet) return;

    load();
    return () => {
      alive = false;
    };
  }, [pet, categoryName, page, sort]);

  // start end 페이지를 계산
  const startPage = Math.floor((page - 1) / PAGE_GROUP) * PAGE_GROUP + 1;
  const endPage = Math.min(startPage + PAGE_GROUP - 1, totalPages);

  //이미지 띄울때 링크처리
  const getImageSrc = (item) => {
    const url = item?.imgUrl?.trim();
    return url ? url : `${process.env.PUBLIC_URL}/images/no-image.png`;
  };

  return (
    <div className={styles.category}>
      {/* 상단 서브카테고리 버튼 영역 (sub가 있는 경우에도 항상 보여주기 가능) */}
      {categories.length > 0 && (
        <div className={`d-flex justify-content-center align-items-center ${styles.sub}`}>
          {categories.map((code) => (
            <button
              key={code}
              // code는 URL sub로 들어감 (/dog/feed)
              onClick={() => navigate(`/category/${pet}/${code}`)}
              className={styles.sub_ctgr}
            >
              <img
                src={CATEGORY[code].img}
                alt={CATEGORY[code].label}
                className={styles.icon}
              />
              <p>{CATEGORY[code].label}</p>
            </button>
          ))}
        </div>
      )}

      {/* 백에서 정한 정렬방식 이용 */}
      <div className={styles.sortbtn}>
        <button className={sort === "price_asc" ? styles.active : styles.inactive} onClick={() => setSort("price_asc")}>낮은 가격 순</button>{" "}
        <button className={sort === "price_desc" ? styles.active : styles.inactive} onClick={() => setSort("price_desc")}>높은 가격 순</button>{" "}
        <button className={sort === "review_count_desc" ? styles.active : styles.inactive} onClick={() => setSort("review_count_desc")}>리뷰 많은순</button>{" "}
        <button className={sort === "views_desc" ? styles.active : styles.inactive} onClick={() => setSort("views_desc")}>조회순</button>{" "}
        {/* 기본이 상품 고유아이디 번호 순이여서 리뷰 많은 순 으로 대체 하였음 아직 리뷰가 없어서 변별력은없음  */}
      </div>

      <Container className={styles.container}>
        {/* 로딩 중 표시 */}
        {loading && (
          <div className="d-flex justify-content-center my-4">
            <Spinner animation="border" />
          </div>
        )}

        {/* 에러 표시 */}
        {!loading && error && (
          <Alert variant="danger" className="my-3">
            {error}
          </Alert>
        )}

        {/* 정상 렌더 */}
        {!loading && !error && (
          <>
            <Row className="row-cols-3 row-cols-lg-4 g-3">
              {items.map((item) => (
                <Col
                  className={styles.col}
                  key={item.id}
                  onClick={() => navigate(`/product/${item.id}`)}
                >
                  <img
                    src={getImageSrc(item)}
                    alt={item.title || "상품이미지"}
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.src = `${process.env.PUBLIC_URL}/images/no-image.png`;
                    }}
                  />
                  <h6 className={styles.title}>{item.title}</h6>

                  {/* toLocaleString: 12000 -> 12,000 */}
                  <p>{Number(item.price).toLocaleString()}원</p>
                </Col>
              ))}
            </Row>

            {/* 페이지네이션 (페이지가 2 이상일 때만 표시) */}
            {totalPages > 1 && (
              <div className="d-flex justify-content-center mt-5">
                <Pagination className={styles.category_pagination}>
                  <Pagination.First onClick={() => setPage(1)} disabled={page === 1} />
                  <Pagination.Prev
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  />

                  {/* startPage~endPage만큼만 번호 버튼 생성 */}
                  {Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map((n) => (
                    <Pagination.Item key={n} active={n === page} onClick={() => setPage(n)}>
                      {n}
                    </Pagination.Item>
                  ))}

                  <Pagination.Next
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  />
                  <Pagination.Last
                    onClick={() => setPage(totalPages)}
                    disabled={page === totalPages}
                  />
                </Pagination>
              </div>
            )}
          </>
        )}
      </Container>
    </div>
  );
};

export default Category;
