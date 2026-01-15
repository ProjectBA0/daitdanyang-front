import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Noticeboard.module.css";

const STORAGE_KEY = "notice_posts";
const ITEMS_PER_PAGE = 10;
const PAGE_RANGE = 5;

export default function Noticeboard() {
  const navigate = useNavigate();
  const [list, setList] = useState([]);
  const [page, setPage] = useState(1);

  // 🔥 조회 기간 상태
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    setList(data);
  }, []);

  /** 🔥 기간 필터 */
  const filteredList = list.filter((post) => {
    if (!startDate && !endDate) return true;
    const d = new Date(post.date);
    if (startDate && d < new Date(startDate)) return false;
    if (endDate && d > new Date(endDate)) return false;
    return true;
  });

  const totalPage = Math.ceil(filteredList.length / ITEMS_PER_PAGE);

  const startIndex = (page - 1) * ITEMS_PER_PAGE;
  const currentList = filteredList.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  const startPage =
    Math.floor((page - 1) / PAGE_RANGE) * PAGE_RANGE + 1;
  const endPage = Math.min(startPage + PAGE_RANGE - 1, totalPage);

  /** 🔥 기간 버튼 핸들러 */
  const setPeriod = (days) => {
    const today = new Date();
    const past = new Date();
    past.setDate(today.getDate() - days);

    setStartDate(past.toISOString().slice(0, 10));
    setEndDate(today.toISOString().slice(0, 10));
    setPage(1);
  };

  const pageBtnStyle = (active) => ({
    minWidth: "34px",
    height: "34px",
    margin: "0 4px",
    borderRadius: "50%",
    border: "1px solid #ccc",
    backgroundColor: active ? "#9bbce6" : "#fff",
    color: active ? "#fff" : "#333",
    cursor: "pointer",
    fontWeight: active ? "bold" : "normal",
  });

  const navBtnStyle = {
    minWidth: "34px",
    height: "34px",
    margin: "0 4px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    backgroundColor: "#f5f5f5",
    cursor: "pointer",
  };

  return (
    <div className={styles.page}>
      <div className={styles.noticeBoard}>

        {/* 🔥 조회 기간 */}
        <div className={styles.filterArea}>
          <strong>조회 기간 :</strong>
          <span onClick={() => setPeriod(0)}>오늘</span> /
          <span onClick={() => setPeriod(7)}>일주일</span> /
          <span onClick={() => setPeriod(30)}>한달</span> /
          <span onClick={() => setPeriod(90)}>3개월</span>
          &nbsp;
          <input
            type="date"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              setPage(1);
            }}
          />
          ~
          <input
            type="date"
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value);
              setPage(1);
            }}
          />
        </div>

        {/* 제목 + 글쓰기 */}
        <div className={styles.titleArea}>
          <h2 className={styles.title}>게시판</h2>
          <button
            className={styles.writeButton}
            onClick={() => navigate("/write")}
          >
            글쓰기
          </button>
        </div>

        {/* 테이블 */}
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>번호</th>
                <th>제목</th>
                <th>작성자</th>
                <th>작성일</th>
                <th>조회수</th>
              </tr>
            </thead>
            <tbody>
              {currentList.map((item, index) => (
                <tr
                  key={item.id}
                  onClick={() =>
                    navigate(`/Noticeboard/${item.id}`)
                  }
                  style={{ cursor: "pointer" }}
                >
                  <td>{startIndex + index + 1}</td>
                  <td>{item.title}</td>
                  <td>{item.writer}</td>
                  <td>{item.date}</td>
                  <td>{item.view}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ✅ 기존 페이지네이션 그대로 */}
        <div className={styles.pagination}>
          <button
            style={navBtnStyle}
            disabled={page === 1}
            onClick={() => setPage(1)}
          >
            «
          </button>

          <button
            style={navBtnStyle}
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            ‹
          </button>

          {Array.from(
            { length: endPage - startPage + 1 },
            (_, i) => startPage + i
          ).map((p) => (
            <button
              key={p}
              style={pageBtnStyle(page === p)}
              onClick={() => setPage(p)}
            >
              {p}
            </button>
          ))}

          <button
            style={navBtnStyle}
            disabled={page === totalPage}
            onClick={() => setPage(page + 1)}
          >
            ›
          </button>

          <button
            style={navBtnStyle}
            disabled={page === totalPage}
            onClick={() => setPage(totalPage)}
          >
            »
          </button>
        </div>

      </div>
    </div>
  );
}
