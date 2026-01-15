// ✅ React에서 useState(상태 저장), useMemo(값 캐싱) 가져오기
import { useMemo, useState } from "react";
import styles from "./FindAccount.module.css";

export default function FindAccount() {
  // ✅ mode: 지금 화면이 "아이디 찾기"인지 "비밀번호 찾기"인지 저장
  // - "id"  : 아이디 찾기 화면
  // - "pw"  : 비밀번호 찾기 화면
  const [mode, setMode] = useState("id");

  // ✅ 아이디 찾기에서 쓰는 입력값: 이름/별명
  const [name, setName] = useState("");

  // ✅ 비밀번호 찾기에서 쓰는 입력값: 아이디
  const [userId, setUserId] = useState("");

  // ✅ 공통 입력값: 이메일
  const [email, setEmail] = useState("");

  // ✅ 전화번호를 3칸으로 나눈 상태
  // 예: 010 - 1234 - 5678
  const [phone1, setPhone1] = useState("010"); // 앞자리(선택)
  const [phone2, setPhone2] = useState("");    // 가운데자리(입력)
  const [phone3, setPhone3] = useState("");    // 끝자리(입력)

  // ✅ 사용자에게 보여줄 메시지(성공/실패 안내)
  const [msg, setMsg] = useState("");

  // ✅ 비밀번호 재설정 2단계로 넘어갔는지 여부
  // false: 아직 본인 확인 단계
  // true : 본인 확인 성공 → 새 비밀번호 입력 단계
  const [pwStep, setPwStep] = useState(false);

  // ✅ 새 비밀번호 입력(2단계에서만 사용)
  const [newPw, setNewPw] = useState("");
  const [newPw2, setNewPw2] = useState("");

  // ✅ 임시 회원 데이터 (지금은 DB가 없으니 프론트에서 가짜로 저장)
  // useMemo를 쓰면 컴포넌트가 다시 렌더링되어도 같은 배열을 재사용(불필요한 재생성 방지)
  const mockUsers = useMemo(
    () => [
      {
        name: "이다미",
        email: "test@test.com",
        phone: "01012345678", // 하이픈 없는 숫자만
        userId: "dami12345",
      },
      {
        name: "홍길동",
        email: "gildong@test.com",
        phone: "01087654321",
        userId: "gildong777",
      },
    ],
    []
  );

  // ✅ phone1 + phone2 + phone3 를 합쳐서 "01012345678" 형태로 만든다
  // - mockUsers의 phone도 같은 형식(숫자만)이기 때문에 비교가 쉬움
  const phone = `${phone1}${phone2}${phone3}`;

  // ✅ 입력값에서 숫자만 남기기 (문자/공백/하이픈 제거)
  // - 사용자가 "12-34" 같이 입력해도 숫자만 남게 함
  const onlyNumber = (v) => v.replace(/\D/g, "");

  // ✅ 아이디를 마스킹(일부만 보여주기)
  // 예: dami12345 → da***45
  const maskId = (id) => {
    if (!id) return "";
    if (id.length <= 3) return id[0] + "**";
    return `${id.slice(0, 2)}***${id.slice(-2)}`;
  };

  // ✅ 입력값/상태를 초기화하는 함수
  // - 모드 전환할 때 값이 섞이면 UX가 나빠서 싹 초기화하는 게 좋음
  const resetAll = () => {
    setName("");
    setUserId("");
    setEmail("");
    setPhone1("010");
    setPhone2("");
    setPhone3("");
    setMsg("");
    setPwStep(false);
    setNewPw("");
    setNewPw2("");
  };

  // ✅ 라디오 버튼을 바꿀 때 호출되는 함수
  // - mode를 바꾸고(resetAll로) 화면 상태 초기화
  const handleChangeMode = (next) => {
    setMode(next);
    resetAll();
  };

  // ✅ 1단계(본인 확인) 폼 제출 처리
  const handleSubmit = (e) => {
    e.preventDefault(); // ✅ form 제출 시 새로고침 방지
    setMsg("");         // ✅ 이전 메시지 지우기

    // ✅ 공통 유효성 검사(빈칸/길이)
    if (!email.trim()) return setMsg("이메일을 입력해 주세요.");
    if (!phone2.trim() || !phone3.trim()) return setMsg("전화번호를 끝까지 입력해 주세요.");
    if (phone2.length < 3 || phone3.length < 4) return setMsg("전화번호 형식이 올바르지 않아요.");

    // ==========================
    // 🟢 아이디 찾기 로직
    // ==========================
    if (mode === "id") {
      // 아이디 찾기는 이름 필요
      if (!name.trim()) return setMsg("이름을 입력해 주세요.");

      // ✅ mockUsers 배열에서 조건에 맞는 회원 찾기
      const found = mockUsers.find(
        (u) =>
          u.name === name.trim() &&       // 이름 일치
          u.email === email.trim() &&     // 이메일 일치
          u.phone === phone               // 전화번호 일치
      );

      // ✅ 못 찾으면 실패 메시지
      if (!found) return setMsg("일치하는 회원 정보가 없어요.");

      // ✅ 찾으면 아이디를 마스킹해서 보여줌
      return setMsg(`가입된 아이디는 ${maskId(found.userId)} 입니다.`);
    }

    // ==========================
    // 🔴 비밀번호 찾기 로직
    // ==========================
    if (mode === "pw") {
      // 비밀번호 찾기는 아이디가 필요
      if (!userId.trim()) return setMsg("아이디를 입력해 주세요.");

      // ✅ mockUsers에서 (아이디 + 이메일 + 전화번호)로 회원 찾기
      const found = mockUsers.find(
        (u) =>
          u.userId === userId.trim() &&   // 아이디 일치
          u.email === email.trim() &&     // 이메일 일치
          u.phone === phone               // 전화번호 일치
      );

      // ✅ 못 찾으면 실패 메시지
      if (!found) return setMsg("일치하는 회원 정보가 없어요.");

      // ✅ 찾으면 “2단계(새 비밀번호 입력)”로 이동
      setPwStep(true);
      setMsg("본인 확인이 완료됐어요. 새 비밀번호를 설정해 주세요.");
    }
  };

  // ✅ 2단계(새 비밀번호 입력) 폼 제출 처리
  const handleResetPassword = (e) => {
    e.preventDefault(); // ✅ 새로고침 방지
    setMsg("");

    // ✅ 비밀번호 유효성 검사
    if (!newPw.trim() || !newPw2.trim()) return setMsg("새 비밀번호를 모두 입력해 주세요.");
    if (newPw !== newPw2) return setMsg("비밀번호가 서로 달라요.");
    if (newPw.length < 8) return setMsg("비밀번호는 8자 이상으로 해주세요.");

    // ✅ 지금은 임시 처리(프론트만이라 실제 DB 변경은 안 됨)
    // - 나중에 여기서 axios로 백엔드 API 호출해서 비밀번호 변경해야 함
    setMsg("비밀번호가 변경됐어요! (임시 메시지)");

    // ✅ 다시 1단계로 돌리고 입력값 초기화
    setPwStep(false);
    setNewPw("");
    setNewPw2("");
  };

  // ✅ 화면(UI) 반환
  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <h2 className={styles.title}>아이디/비밀번호 찾기</h2>

        {/* ✅ 라디오 선택(아이디 찾기 / 비밀번호 찾기) */}
        <div className={styles.tabs}>
          <label className={styles.tab}>
            <input
              type="radio"
              name="mode"
              checked={mode === "id"}
              onChange={() => handleChangeMode("id")}
            />
            <span>아이디 찾기</span>
          </label>

          <label className={styles.tab}>
            <input
              type="radio"
              name="mode"
              checked={mode === "pw"}
              onChange={() => handleChangeMode("pw")}
            />
            <span>비밀번호 찾기</span>
          </label>
        </div>

        {/* ✅ 1단계: 본인 확인 폼 (pwStep이 false일 때만 보임) */}
        {!pwStep && (
          <form onSubmit={handleSubmit} className={styles.form}>
            {/* ✅ mode가 id면 이름/별명 입력칸 보여줌 */}
            {mode === "id" && (
              <div className={styles.field}>
                <label className={styles.label}>이름</label>
                <input
                  className={styles.inputLine}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="이름"
                />
              </div>
            )}

            {/* ✅ mode가 pw면 아이디 입력칸 보여줌 */}
            {mode === "pw" && (
              <div className={styles.field}>
                <label className={styles.label}>아이디</label>
                <input
                  className={styles.inputLine}
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder="아이디"
                />
              </div>
            )}

            {/* ✅ 이메일 입력칸(공통) */}
            <div className={styles.field}>
              <label className={styles.label}>이메일</label>
              <input
                className={styles.inputLine}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com"
              />
            </div>

            {/* ✅ 휴대폰 번호 입력칸(공통) */}
            <div className={styles.field}>
              <label className={styles.label}>휴대폰 번호</label>
              <div className={styles.phoneRow}>
                {/* 앞자리 선택 */}
                <select
                  className={styles.selectLine}
                  value={phone1}
                  onChange={(e) => setPhone1(e.target.value)}
                >
                  <option value="010">010</option>
                  <option value="011">011</option>
                  <option value="016">016</option>
                  <option value="017">017</option>
                </select>

                {/* 가운데 자리(숫자만 + 최대 4자리) */}
                <input
                  className={styles.inputLine}
                  value={phone2}
                  onChange={(e) => setPhone2(onlyNumber(e.target.value).slice(0, 4))}
                />

                {/* 끝자리(숫자만 + 최대 4자리) */}
                <input
                  className={styles.inputLine}
                  value={phone3}
                  onChange={(e) => setPhone3(onlyNumber(e.target.value).slice(0, 4))}
                />
              </div>
            </div>

            {/* 제출 버튼 */}
            <button className={styles.btn} type="submit">
              확인
            </button>
          </form>
        )}

        {/* ✅ 2단계: 비밀번호 재설정 폼 (pwStep이 true이고 mode가 pw일 때만 보임) */}
        {pwStep && mode === "pw" && (
          <form onSubmit={handleResetPassword} className={styles.form}>
            <div className={styles.field}>
              <label className={styles.label}>새 비밀번호</label>
              <input
                type="password"
                className={styles.inputLine}
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
                placeholder="8자 이상"
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>새 비밀번호 확인</label>
              <input
                type="password"
                className={styles.inputLine}
                value={newPw2}
                onChange={(e) => setNewPw2(e.target.value)}
                placeholder="한 번 더 입력"
              />
            </div>

            <button className={styles.btn} type="submit">
              비밀번호 변경
            </button>

            {/* ✅ 이전으로: 2단계 취소하고 1단계로 돌아감 */}
            <button
              type="button"
              className={styles.subBtn}
              onClick={() => {
                setPwStep(false);
                setNewPw("");
                setNewPw2("");
                setMsg("");
              }}
            >
              이전으로
            </button>
          </form>
        )}

        {/* ✅ 메시지가 있을 때만 출력 */}
        {msg && <p className={styles.result}>{msg}</p>}
      </div>
    </div>
  );
}
