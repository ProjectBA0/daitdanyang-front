import React, { useEffect, useState, useMemo } from 'react'
import { Container, Spinner, Alert, Pagination } from 'react-bootstrap';
import { useNavigate, useParams } from "react-router-dom";

import styles from "./Product.module.css";
import { fetchProductDetail, fetchReviews } from "../api/productApi";
import { fetchMyCart, addCart, updateCart } from "../api/cartApi";
import { formatDate } from '../constants/date';
import { createOrder } from '../api/orderApi';
import { addRecent } from '../api/recentApi';


const Product = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // 현재 상품 데이터
    const [product, setProduct] = useState([]);

    // 로딩, 에러 처리
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [reverr, setReverr] = useState("");

    // 상품 수량
    const [qty, setQty] = useState(1);

    // 밑에 상세페이지 부분
    const [activeTab, setActiveTab] = useState("info");

    // 리뷰관련 (리뷰, 페이지, 정렬)
    const [reviews, setReviews] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [sort, setSort] = useState("id_desc");




    const getImageSrc = (item) => {
        // item?.imgUrl 옵셔널체이닝(?.) → item이 있으면 가져오고 없으면 에러내지말고 undefined를 돌려달라는 문법
        // (item?.imgUrl 과 item ? item.imgUrl : undefined 이 같은 뜻)
        // trim() = 공백제거
        const url = (item?.imgUrl ?? "").trim();
        return url ? url : `${process.env.PUBLIC_URL}/images/no-image.png`;
    };

    // url의 id가 바뀔 때마다 다시 실행
    useEffect(() => {
        // component가 살아있을 때만 setState 한다는 안전장치
        // ( 상품 불러오는 중에 사용자가 다른 페이지로 이동하려고 하면 사라진 컴포넌트에 setState 하지말라는 뜻 )
        let alive = true;

        async function load() {
            setLoading(true); // 새 요청 시작 → 로딩 true
            setError(""); // 이전 에러 제거

            // 서버에 요청
            try {
                const data = await fetchProductDetail(id);
                // 안전 처리 (없으면 기본값)
                setProduct({
                    id: data?.id ?? Number(id), // 서버가 id주면 그 값을, 안 주면 url에 id를 숫자로 써라
                    title: data?.title ?? "",
                    content: data?.content ?? "",
                    price: Number(data?.price) || 0,
                    imgUrl: (data?.imgUrl ?? "").trim(),
                    category: data?.category ?? "",
                    sub_category: data?.sub_category ?? "",
                    pet_type: data?.pet_type ?? "",
                    review_count: Number(data?.review_count) || 0,
                });
                if (!alive) return;
                // 실패했을 때
            } catch (e) {
                if (!alive) return;
                setError("상품 정보를 불러오는 중 오류가 발생했습니다.");
                setProduct(null);
                // 성공 실패 상관없이 로딩 종료
            } finally {
                if (alive) setLoading(false);
            }
        }

        // URL이 이상해서 id가 없으면 굳이 요청할 필요 없음, 있으면 load 실행
        if (!id) return;
        load();

        // page 이동 등으로 컴포넌트가 사라지면 이후 도착하는 응답 무시 
        return () => {
            alive = false;
        };
    }, [id]);



    // 가격
    const price = Number(product.price)
    // 수량
    const p_price = Number(product?.price ?? 0);
    const totalPrice = useMemo(() => p_price * qty, [p_price, qty]);

    // 배송비
    const shippingFee = totalPrice >= 30000 ? 0 : 3000;

    const minus = () => setQty((q) => Math.max(1, q - 1));
    const plus = () => setQty((q) => q + 1);

    // 로그인으로 이동 (장바구니, 구매 버튼 누를 때 로그인 안 했으면 이동할 수 있게)
    // redirectTo = 로그인 후 이동할 경로, state = {} 추가로 넘길 데이터
    const goLogin = (redirectTo, state = {}) => {
        const ok = window.confirm("로그인이 필요합니다.\n로그인 페이지로 이동하시겠습니까?");
        if (!ok) return;

        navigate("/login", {
            state: {
                redirectTo,
                ...state,
            },
            replace: true,
        });
    };
    // 로그인 안 돼서 뜨는 에런지 확인
    const is401 = (e) => e?.response?.status === 401;

    // 카트
    const cartitem = async () => {
        if (!product?.id) return;

        try {
            // 내 장바구니 불러오기
            const cart = await fetchMyCart();
            // 같은 상품이 있으면 count+1
            console.log(cart);
            const existitem = cart?.find((c) => c.product_id === product.id);

            if (existitem) {
                await updateCart(existitem.id, existitem.count + 1);
            } else {
                await addCart(product.id, 1);
            }
            const yes = window.confirm("장바구니로 이동하시겠습니까?");
            if (yes) {
                navigate("/cart");
            }
        } catch (e) {
            if (is401(e)) return goLogin("cart");
            alert(e?.response?.data?.error || e.message || "장바구니 담기에 실패했습니다.");
        }
    };

    // 구매 (지금 cart page는 db에 저장 X, cartStorage = 브라우저에 저장해둠)
    // 구매하기 (상품페이지 바로구매)
    const buyitem = async () => {
        if (!product?.id) return;

        try {
            // qty가 input에서 string으로 들어올 수 있으니 숫자 보정
            const safeQty = Math.max(1, Number(qty) || 1);

            // ✅ 주문 생성: items 배열로 보냄
            const data = await createOrder({
                items: [{ product_id: product.id, qty: safeQty }],
            });

            navigate(`/order/${data.order_id}`);

        } catch (e) {
            if (is401(e)) return goLogin("/order", { product_d: product.id, qty });
            alert(e?.response?.data?.error || e.message || "구매 처리 중 오류가 발생했습니다.");
        }
    };

    // 최근 본 상품
    useEffect(() => {
        if (product?.id) addRecent(product.id);
    }, [product?.id]);

    // 밑에 상세페이지 (탭처럼 보이지만 누르면 그 위치로 스크롤 이동시켜줌)
    // behavior: "smooth" 부드럽게 이동, start 섹션 맨 위가 화면 위쪽으로
    const scrollTo = (id) => {
        setActiveTab(id);
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    // 리뷰
    const PAGE_GROUP = 10;

    const startPage = Math.floor((page - 1) / PAGE_GROUP) * PAGE_GROUP + 1;
    const endPage = Math.min(startPage + PAGE_GROUP - 1, totalPages);

    useEffect(() => {
        if (!product?.id) return;

        (async () => {
            try {
                const data = await fetchReviews(product.id, page, sort);
                setReviews(data.items);
                setTotalPages(data.totalPages);
                setReverr(null);
            } catch (err) {
                const msg =
                    err.response?.data?.error ||
                    err.message ||
                    "리뷰 로딩 실패";
                setReverr(msg);
            }
        })();
    }, [product?.id, page, sort]);

    return (
        <Container className="my-4">
            {/* 로딩중일 때 */}
            {loading && (
                <div className="d-flex justify-content-center my-4">
                    <Spinner animation="border" />
                </div>
            )}

            {/* 에러 났을 때 */}
            {!loading && error && (
                <Alert variant="danger" className="my-3">
                    {error}
                </Alert>
            )}

            {/* 정상적으로 작동할 때 */}
            {!loading && !error && product && (
                <>
                    <div className={styles.content}>
                        <div className={styles.product}>
                            <img src={getImageSrc(product)} alt={product.title} />
                        </div>

                        <div className={styles.text}>
                            <h3>{product.title}</h3>
                            <hr />
                            <div className={styles.row}>
                                <span className={styles.label}>판매가</span>
                                <span className={styles.price}>
                                    {price.toLocaleString()}원
                                </span>
                            </div>
                            <div className={styles.row}>
                                <span className={styles.label}>국내·해외배송</span>
                                <span className={styles.value}>국내배송</span>
                            </div>
                            <div className={styles.row}>
                                <span className={styles.label}>배송 방법</span>
                                <span className={styles.value}>택배</span>
                            </div>
                            <div className={styles.row}>
                                <span className={styles.label}>배송비</span>
                                <span className={styles.value}>{shippingFee === 0 ? "무료" : `${shippingFee.toLocaleString()}원`}</span>
                            </div>

                            <div className={styles.row}>
                                <span className={styles.label}>수량</span>
                                <button className={styles.qty} onClick={minus} disabled={qty === 1}>
                                    <img src={`${process.env.PUBLIC_URL}/images/minus.png`} alt="minus" />
                                </button>
                                {/* 커서를 바깥으로 클릭했을 때 삼항연산자 실행 = 0이나 문자가 들어가면 1로 바꿔줌 */}
                                <input type="number" className={`${styles.num} ${styles.value}`} value={qty} min={1} onChange={(e) => setQty(Number(e.target.value))} onBlur={() => setQty((q) => Math.max(1, Number(q) || 1))}></input>
                                <button className={styles.qty} onClick={plus}>
                                    <img src={`${process.env.PUBLIC_URL}/images/plus.png`} alt="plus" />
                                </button>
                            </div>
                            <div className={styles.row}>
                                <span className={styles.label}>총 상품 금액</span>
                                <span className={styles.value}>{totalPrice.toLocaleString()}원</span>
                            </div>

                            <div className={styles.button}>
                                <button className={styles.cartBtn} onClick={cartitem}>
                                    장바구니
                                </button>
                                <button className={styles.buyBtn} onClick={buyitem}>
                                    구매하기
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className={styles.detailNav}>
                        <button className={activeTab === "info" ? styles.active : ""} onClick={() => scrollTo("info")}>
                            배송정보
                        </button>
                        <button className={activeTab === "exchange" ? styles.active : ""} onClick={() => scrollTo("exchange")}>
                            교환/반품
                        </button>
                        <button className={activeTab === "review" ? styles.active : ""} onClick={() => scrollTo("review")}>
                            상품후기 ({product?.review_count ?? 0})
                        </button>
                    </div>

                    <section id="info" className={styles.detailpage}>
                        <ul className={styles.infoList}>
                            <h4>배송정보</h4>
                            <br />
                            <li>3만원 이상 구매 시 무료배송됩니다. (부피, 무게 무관)</li>
                            <li>제주, 도서산간 지역은 3,000원 택배비 추가됩니다.</li>
                            <li>
                                다잇다냥 출고상품은 평일 오후 5시까지,
                                토요일은 낮 12시 결제건까지 당일 출고됩니다.
                            </li>
                            <li>택배사 사정에 따라 CJ대한통운, 롯데택배로 출고될 수 있습니다.</li>
                            <li>업체 배송의 경우 1~3일 추가 소요일 수 있습니다.</li>
                            <li>천재지변, 물량 급증 등으로 배송 지연이 발생할 수 있습니다.</li>
                        </ul>
                    </section>

                    <section id="exchange" className={styles.detailpage}>
                        <ul className={styles.infoList}>
                            <h4>교환/반품 안내</h4>
                            <br />
                            <li>단순변심에 의한 환불은 제품 수령후 7일이내에 신청 가능합니다. (왕복배송비 고객부담)</li>
                            <li>단순변심에 의한 반품시 배송박스 수량에 따라 반품 택배비가 추가됩니다.</li>
                            <li>포장개봉, 조립, 사용 등으로 인해 재판매가 불가능할 경우 반품이 불가능 할 수 있습니다.</li>
                            <li>제품 하자의 경우 물품 수령 후 30일이내 반품 가능합니다.</li>
                        </ul>
                    </section>


                    <section id="review" className={styles.detailpage}>
                        <div className={styles.revbtn}>
                            <h4>상품후기</h4>
                            <div>
                                <button className={`${styles.revsort} ${sort === "id_desc" ? styles.active : styles.inactive
                                    }`} onClick={() => { setSort("id_desc"); setPage(1); }}>최신순</button>
                                <button className={`${styles.revsort} ${sort === "rating_desc" ? styles.active : styles.inactive
                                    }`} onClick={() => { setSort("rating_desc"); setPage(1); }}>별점 높은순</button>
                                <button className={`${styles.revsort} ${sort === "rating_asc" ? styles.active : styles.inactive
                                    }`} onClick={() => { setSort("rating_asc"); setPage(1); }}>별점 낮은순</button>
                            </div>
                        </div>
                        {reverr && (
                            <Alert variant="danger" className="my-3">
                                {reverr}
                            </Alert>
                        )}

                        {!reverr && reviews.length === 0 && (
                            <div className="text-center text-muted my-3">
                                아직 등록된 리뷰가 없습니다.
                            </div>
                        )}

                        {reviews.map((r) => (
                            <div key={r.id}>
                                <div>{"⭐".repeat(r.rating)}</div>
                                <div className={styles.meta}>
                                    <span className={styles.writer}> {r.writer} </span> |
                                    <span className={styles.date}> {formatDate(r.create_date)} </span>
                                </div>
                                <div>{r.content}</div>
                                <hr />
                            </div>
                        ))}

                        {totalPages > 1 && (
                            <div className="d-flex justify-content-center mt-4">
                                <Pagination className={styles.review_pagination}>
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
                    </section>
                </>
            )}

        </Container>
    );
}
export default Product