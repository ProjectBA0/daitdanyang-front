import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Pagination, Spinner, Alert } from "react-bootstrap";

import styles from "./Noticeboard.module.css";
import { fetchBoard } from "../api/boardApi";

const ITEMS_PER_PAGE = 10;

export default function Noticeboard() {
  const navigate = useNavigate();

  const [list, setList] = useState([]);
  const [page, setPage] = useState(1);

  const [totalPages, setTotalPages] = useState(1);
  const [startPage, setStartPage] = useState(1);
  const [endPage, setEndPage] = useState(1);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const token = localStorage.getItem("accessToken");
  const isLoggedIn = !!token;

  useEffect(() => {
    let alive = true;

    async function load() {
      setLoading(true);
      setError("");

      try {
        // ✅ category 필터 UI가 없으니 "전체"로 고정
        const data = await fetchBoard(page, ITEMS_PER_PAGE, "전체");
        if (!alive) return;

        const items = data?.items;
        setList(Array.isArray(items) ? items : []);

        const tp = Number(data?.total_pages) || 1;
        setTotalPages(tp);

        setStartPage(Number(data?.start_page) || 1);
        setEndPage(Number(data?.end_page) || tp);

        if (page > tp) setPage(1);
      } catch (err) {
        if (!alive) return;

        const status = err?.response?.status;

        // 리스트는 비회원도 되지만,
        // 토큰이 깨진 상태로 401 뜨면 로그인 갱신 유도
        if (status === 401) {
          alert("로그인이 만료되었습니다. 다시 로그인 해주세요.");
          localStorage.removeItem("accessToken");
          navigate("/login");
        } else {
          setError("게시판 데이터를 불러오는 중 오류가 발생했습니다.");
        }

        setList([]);
        setTotalPages(1);
        setStartPage(1);
        setEndPage(1);
      } finally {
        if (alive) setLoading(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, [navigate, page]);

  const handleRowClick = (item) => {
    if (!item?.can_open_detail) {
      if (!isLoggedIn) {
        alert("로그인이 필요합니다.");
        navigate("/login");
        return;
      }
      alert("해당 글을 볼 권한이 없습니다.");
      return;
    }
    navigate(`/Noticeboard/${item.id}`);
  };

  return (
    <div className={styles.page}>
      <div className={styles.noticeBoard}>
        <div className={styles.titleArea}>
          <h2 className={styles.title}>게시판</h2>

          {isLoggedIn && (
            <button className={styles.writeButton} onClick={() => navigate("/write")}>
              글쓰기
            </button>
          )}
        </div>

        {loading && (
          <div className="d-flex justify-content-center my-4">
            <Spinner animation="border" />
          </div>
        )}

        {!loading && error && (
          <Alert variant="danger" className="my-3">
            {error}
          </Alert>
        )}

        {!loading && !error && (
          <>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>문의유형</th>
                    <th>제목</th>
                    <th>작성자</th>
                    <th>작성일</th>
                    <th>조회수</th>
                  </tr>
                </thead>

                <tbody>
                  {list.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ textAlign: "center", padding: 16 }}>
                        데이터가 없습니다.
                      </td>
                    </tr>
                  ) : (
                    list.map((item) => (
                      <tr
                        key={item.id}
                        onClick={() => handleRowClick(item)}
                        style={{
                          cursor: "pointer",
                          opacity: item.can_open_detail ? 1 : 0.6,
                        }}
                        title={
                          item.can_open_detail
                            ? "클릭하여 상세보기"
                            : !isLoggedIn
                            ? "로그인 후 열람 가능합니다."
                            : "권한이 없습니다."
                        }
                      >
                        <td>{item.category}</td>
                        <td>{item.title}</td>
                        <td>{item.writer}</td>
                        <td>{item.date}</td>
                        <td>{item.view ?? 0}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {totalPages > 0 && (
              <div className="d-flex justify-content-center mt-5">
                <Pagination className={styles.category_pagination}>
                  <Pagination.First onClick={() => setPage(1)} disabled={page === 1} />
                  <Pagination.Prev
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  />

                  {Array.from(
                    { length: endPage - startPage + 1 },
                    (_, i) => startPage + i
                  ).map((n) => (
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
      </div>
    </div>
  );
}
