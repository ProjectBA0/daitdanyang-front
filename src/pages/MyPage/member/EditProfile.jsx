import { useEffect, useState } from "react";
import styles from "./EditProfile.module.css";
import {
  getMyProfile,
  updateMyProfile,
  changePassword,
} from "../../../api/memberApi";

export default function EditProfile() {
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    userId: "",
    name: "",
    phone: "",
    email: "",
    address: "",
  });

  const [pwForm, setPwForm] = useState({
    currentPw: "",
    newPw: "",
    newPw2: "",
  });

  // ✅ 1) 페이지 열릴 때 "내 정보" 불러와서 입력칸에 채우기
  useEffect(() => {
    const fetchMe = async () => {
      try {
        setLoading(true);
        const me = await getMyProfile();
        console.log({ me });

        // ✅ 백 GET /api/auth/me 응답 키 기준 매핑
        // (네 백은 "address"로 내려주고 있음)
        setForm({
          userId: me.user_id ?? "",
          name: me.nickname ?? "",
          phone: me.phone ?? "",
          email: me.email ?? "",
          address: me.address ?? "", // ✅ 여기 수정 (default_address -> address)
        });
      } catch (err) {
        alert("회원정보를 불러오지 못했어요.");
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMe();
  }, []);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onChangePw = (e) => {
    const { name, value } = e.target;
    setPwForm((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ 2) 기본정보 저장 (payload로 "싸서" PUT 보내기)
  const onSaveProfile = async (e) => {
    e.preventDefault();

    // 프론트 검증(최소)
    if (!form.email.trim()) return alert("이메일을 입력해 주세요.");

    try {
      // ✅ 여기서 payload를 만들어서 백으로 보냄
      // userId/name은 수정 대상이 아니니까 제외(=안 보냄)
      const payload = {
        phone: form.phone,
        email: form.email,
        address: form.address,
        // 이름까지 수정하게 할 거면 아래 한 줄 추가:
        // nickname: form.name,
      };

      await updateMyProfile(payload);
      alert("회원정보가 저장됐어요!");
    } catch (err) {
      alert("저장에 실패했어요.");
      console.log(err);
    }
  };

  // ✅ 3) 비밀번호 변경 저장 (프로필 저장과 분리)
  const onSavePassword = async (e) => {
    e.preventDefault();

    if (!pwForm.currentPw) return alert("현재 비밀번호를 입력해 주세요.");
    if (!pwForm.newPw) return alert("새 비밀번호를 입력해 주세요.");
    if (pwForm.newPw !== pwForm.newPw2) return alert("새 비밀번호가 서로 달라요.");

    try {
      await changePassword({
        currentPw: pwForm.currentPw,
        newPw: pwForm.newPw,
      });

      alert("비밀번호가 변경됐어요!");
      setPwForm({ currentPw: "", newPw: "", newPw2: "" });
    } catch (err) {
      alert("비밀번호 변경에 실패했어요.");
      console.log(err);
    }
  };

  if (loading) {
    return <div className={styles.wrap}>불러오는 중...</div>;
  }

  return (
    <div className={styles.wrap}>
      <h2 className={styles.title}>회원정보 변경</h2>

      {/* ✅ 기본정보/주소 저장 */}
      <form className={styles.form} onSubmit={onSaveProfile}>
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>기본 정보</h3>

          <div className={styles.row}>
            <label className={styles.label}>아이디</label>
            <input className={styles.input} value={form.userId} disabled />
          </div>

          <div className={styles.row}>
            <label className={styles.label}>이름</label>
            {/* 이름을 수정 가능하게 하려면 disabled 빼고 onChange 추가 */}
            <input className={styles.input} name="name" value={form.name} disabled />
          </div>

          <div className={styles.row}>
            <label className={styles.label}>휴대폰</label>
            <input
              className={styles.input}
              name="phone"
              value={form.phone}
              onChange={onChange}
            />
          </div>

          <div className={styles.row}>
            <label className={styles.label}>이메일</label>
            <input
              className={styles.input}
              name="email"
              value={form.email}
              onChange={onChange}
            />
          </div>
        </section>

        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>배송지</h3>

          <div className={styles.row}>
            <label className={styles.label}>주소</label>
            <input
              className={styles.input}
              name="address"
              value={form.address}
              onChange={onChange}
            />
          </div>

          <div className={styles.rowRight}>
            <button
              type="button"
              className={styles.subBtn}
              onClick={() => alert("주소검색은 나중에 카카오로 붙이면 돼요!")}
            >
              주소 검색
            </button>
          </div>
        </section>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.cancelBtn}
            onClick={() => window.history.back()}
          >
            취소
          </button>
          <button type="submit" className={styles.saveBtn}>
            저장하기
          </button>
        </div>
      </form>

      {/* ✅ 비밀번호 변경(별도 저장) */}
      <form className={styles.form} onSubmit={onSavePassword}>
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>비밀번호 변경</h3>

          <div className={styles.row}>
            <label className={styles.label}>현재 비밀번호</label>
            <input
              className={styles.input}
              type="password"
              name="currentPw"
              value={pwForm.currentPw}
              onChange={onChangePw}
            />
          </div>

          <div className={styles.row}>
            <label className={styles.label}>새 비밀번호</label>
            <input
              className={styles.input}
              type="password"
              name="newPw"
              value={pwForm.newPw}
              onChange={onChangePw}
            />
          </div>

          <div className={styles.row}>
            <label className={styles.label}>새 비밀번호 확인</label>
            <input
              className={styles.input}
              type="password"
              name="newPw2"
              value={pwForm.newPw2}
              onChange={onChangePw}
            />
          </div>

          <div className={styles.actions2}>
            <button type="submit" className={styles.saveBtn}>
              비밀번호 변경
            </button>
          </div>
        </section>
      </form>
    </div>
  );
}
