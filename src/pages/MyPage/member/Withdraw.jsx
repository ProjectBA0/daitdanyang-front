// src/pages/Withdraw/Withdraw.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Withdraw.module.css";
// ✅ 나중에 API 붙일 때 여기만 연결하면 됨
import { withdraw } from "../../../api/authApi";


export default function Withdraw() {
  const navigate = useNavigate();

  // (선택) 탈퇴 사유
  const [reason, setReason] = useState("");
  const [reasonEtc, setReasonEtc] = useState("");

  // 비밀번호 확인(나중에 서버에서 검증)
  const [password, setPassword] = useState("");

  // 최종 확인 체크
  const [agree, setAgree] = useState(false);

  // 화면용 에러 메시지
  const [err, setErr] = useState("");

  const handleWithdraw = async () => {
    setErr("");

    // ✅ 프론트에서 최소한의 안전장치
    if (!agree) {
      setErr("안내 사항을 확인하고 체크해줘.");
      return;
    }
    if (!password.trim()) {
      setErr("비밀번호를 입력해주세요.");
      return;
    }

    // ✅ 지금은 DB 연결 전이라 '탈퇴 완료'처럼 동작만 해보기
    // 나중에 API 연결하면 아래 부분만 바꾸면 됨.
    try {
      await withdraw({
        password,
        reason,
        reasonEtc,
      });

      // ✅ 탈퇴 성공 → 토큰 제거
      localStorage.removeItem("accessToken");

      alert("회원탈퇴가 완료됐어.");
      navigate("/login");
    } catch (e) {
      const msg =
        e?.normalized?.message ||
        "탈퇴 처리 중 오류가 발생했어.";
      setErr(msg);
    }
  };

  return (
    <div className={styles.wrap}>
      <h2 className={styles.title}>회원탈퇴</h2>

      <div className={styles.card}>
        <div className={styles.noticeBox}>
          <h3 className={styles.subTitle}>탈퇴 전에 꼭 확인해주세요</h3>
          <ul className={styles.list}>
            <li>탈퇴 후 계정 정보는 복구할 수 없습니다.</li>
            <li>주문/환불 내역은 법령에 따라 일정 기간 보관될 수 있습니다.</li>
            <li>진행 중인 주문이 있으면 탈퇴가 제한될 수 있습니다. (나중에 서버에서 체크)</li>
          </ul>
        </div>

        <div className={styles.section}>
          <div className={styles.label}>탈퇴 사유 (선택)</div>

          <select
            className={styles.select}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          >
            <option value="">선택 안 함</option>
            <option value="too_expensive">가격이 비싸서</option>
            <option value="not_useful">이용할 일이 없어서</option>
            <option value="delivery">배송/서비스 불만</option>
            <option value="etc">기타</option>
          </select>

          {reason === "etc" && (
            <input
              className={styles.input}
              placeholder="기타 사유를 입력해줘 (선택)"
              value={reasonEtc}
              onChange={(e) => setReasonEtc(e.target.value)}
            />
          )}
        </div>

        <div className={styles.section}>
          <div className={styles.label}>비밀번호 확인</div>
          <input
            className={styles.input}
            type="password"
            placeholder="비밀번호를 입력해주세요"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className={styles.help}>
            ※ 실제 비밀번호 검증은 나중에 서버(API)에서 처리하게 될 거야.
          </div>
        </div>

        <div className={styles.section}>
          <label className={styles.checkRow}>
            <input
              type="checkbox"
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
            />
            <span>
              위 안내 사항을 모두 확인했고, 탈퇴에 동의해.
            </span>
          </label>

          {err && <div className={styles.err}>{err}</div>}
        </div>

        <div className={styles.btnRow}>
          <button
            className={styles.cancelBtn}
            type="button"
            onClick={() => navigate(-1)}
          >
            취소
          </button>

          <button
            className={styles.withdrawBtn}
            type="button"
            onClick={handleWithdraw}
          >
            회원탈퇴
          </button>
        </div>
      </div>
    </div>
  );
}
