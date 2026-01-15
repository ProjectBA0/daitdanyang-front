import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Signup.module.css";
import { register, checkUserId } from "../api/authApi";

const emptyPet = {
  name: "",
  petType: "",
  gender: "",
  birthday: "",
  breed: "",
  weight: "", // "3.2" / "3.2kg" 모두 허용(백에서 파싱)
};

function Signup() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    userId: "",
    pw: "",
    pw2: "",
    nickname: "",
    email: "",
    defaultAddress: "",
    phone: "",

    petList: [], // 관심동물(복수)
    hasPet: false,
    pets: [], // 실제 등록(여러 마리)
  });

  const [errors, setErrors] = useState({});
  const [serverMsg, setServerMsg] = useState("");

  const [idCheck, setIdCheck] = useState({
    done: false,
    ok: false,
    msg: "",
  });

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ 관심동물 토글
  const toggleInterestPet = (value) => {
    setForm((prev) => {
      const has = prev.petList.includes(value);
      const nextPetList = has
        ? prev.petList.filter((x) => x !== value)
        : [...prev.petList, value];

      // (선택) 관심동물에서 제외된 타입을 이미 선택한 펫이 있으면 petType 초기화
      const nextPets = prev.pets.map((p) => {
        if (!p.petType) return p;
        if (nextPetList.length === 0) return p; // 관심 미선택이면 제한 없음
        return nextPetList.includes(p.petType) ? p : { ...p, petType: "" };
      });

      return { ...prev, petList: nextPetList, pets: nextPets };
    });
  };

  // ✅ 내 펫 등록 토글
  const toggleHasPet = () => {
    setForm((prev) => {
      const next = !prev.hasPet;
      return {
        ...prev,
        hasPet: next,
        pets: next ? [{ ...emptyPet }] : [],
      };
    });
  };

  // ✅ 펫 추가/삭제
  const addPet = () => {
    setForm((prev) => ({
      ...prev,
      pets: [...prev.pets, { ...emptyPet }],
    }));
  };

  const removePet = (idx) => {
    setForm((prev) => ({
      ...prev,
      pets: prev.pets.filter((_, i) => i !== idx),
    }));
  };

  // ✅ 펫 입력 변경(index 기반)
  const onPetChange = (idx, e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const nextPets = [...prev.pets];
      nextPets[idx] = { ...nextPets[idx], [name]: value };
      return { ...prev, pets: nextPets };
    });
  };

  // ✅ 아이디 중복확인
  const handleCheckId = async () => {
    setServerMsg("");
    if (!form.userId.trim()) {
      setIdCheck({ done: true, ok: false, msg: "아이디를 먼저 입력해주세요." });
      return;
    }

    try {
      const data = await checkUserId(form.userId.trim());
      setIdCheck({ done: true, ok: data.ok, msg: data.msg });
    } catch (err) {
      setIdCheck({
        done: true,
        ok: false,
        msg: err.response?.data?.msg || "중복확인 실패(서버 오류)",
      });
    }
  };

  // ✅ 프론트 최소 검증(정책/정합성 최종 검증은 백에서)
  const validate = () => {
    const e = {};
    if (!form.userId.trim()) e.userId = "아이디는 필수입니다.";
    if (!form.pw) e.pw = "비밀번호는 필수입니다.";
    if (!form.pw2) e.pw2 = "비밀번호 확인은 필수입니다.";
    if (form.pw && form.pw2 && form.pw !== form.pw2) e.pw2 = "비밀번호가 서로 다릅니다.";
    if (!form.nickname.trim()) e.nickname = "닉네임은 필수입니다.";
    if (!form.email.trim()) e.email = "이메일은 필수입니다.";

    if (form.hasPet) {
      form.pets.forEach((p, idx) => {
        if (!p.name.trim()) e[`petName_${idx}`] = `펫 ${idx + 1} 이름은 필수입니다.`;
        if (!p.petType) e[`petType_${idx}`] = `펫 ${idx + 1} 종류를 선택해주세요.`;
      });
    }
    return e;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setServerMsg("");

    const newErrors = validate();
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      alert(Object.values(newErrors)[0]);
      return;
    }

    const payload = {
      userId: form.userId.trim(),
      password: form.pw,
      nickname: form.nickname.trim(),
      email: form.email.trim(),
      defaultAddress: form.defaultAddress.trim() || null,
      phone: form.phone.trim() || null,

      petList: form.petList,

      // ✅ weight는 문자열 그대로 전달(예: "3.2kg" 가능)
      pets: form.hasPet
        ? form.pets.map((p) => ({
            name: p.name.trim(),
            petType: p.petType,
            gender: p.gender || null,
            birthday: p.birthday || null,
            breed: p.breed.trim() || null,
            weight: p.weight === "" ? null : p.weight,
          }))
        : [],
    };

    try {
      const res = await register(payload);
      alert(res?.msg || "회원가입 완료");
      navigate("/login");
    } catch (err) {
      if (err.response) {
        const status = err.response.status;
        const msg = err.response.data?.msg;

        if (status === 409) {
          alert(msg || "이미 사용 중인 정보입니다.");
          setServerMsg(msg || "이미 사용 중인 정보입니다.");
          return;
        }
        if (status === 400) {
          alert(msg || "입력값을 다시 확인해주세요.");
          setServerMsg(msg || "입력값을 다시 확인해주세요.");
          return;
        }

        alert("일시적인 서버 문제입니다. 잠시 후 다시 시도해주세요.");
        setServerMsg("일시적인 서버 문제입니다. 잠시 후 다시 시도해주세요.");
        return;
      }

      alert("네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요.");
      setServerMsg("네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요.");
    }
  };

  return (
    <div className={styles.signupWrap}>
      <div className={styles.signupCard}>
        <div className={styles.signupHeader}>
          <h2>회원가입</h2>
        </div>

        <form onSubmit={onSubmit}>
          {/* =========================
              기본 정보
          ========================= */}
          <div className={styles.section}>
            <div className={styles.sectionTitle}>기본 정보</div>

            {/* 아이디 */}
            <div className={styles.fieldRow}>
              <label>
                아이디 <span className={styles.required}>*</span>
              </label>

              <div className={styles.idArea}>
                <div className={styles.inlineRow}>
                  <input
                    name="userId"
                    value={form.userId}
                    onChange={(e) => {
                      onChange(e);
                      setIdCheck({ done: false, ok: false, msg: "" });
                    }}
                    placeholder="아이디"
                  />
                  <button type="button" className={styles.btnInline} onClick={handleCheckId}>
                    중복확인
                  </button>
                </div>

                {errors.userId && <p className={`${styles.helpText} ${styles.bad}`}>{errors.userId}</p>}

                {idCheck.done && (
                  <p className={`${styles.helpText} ${idCheck.ok ? styles.ok : styles.bad}`}>{idCheck.msg}</p>
                )}
              </div>
            </div>

            {/* 비밀번호 */}
            <div className={styles.fieldRow}>
              <label>
                비밀번호 <span className={styles.required}>*</span>
              </label>
              <div>
                <input type="password" name="pw" value={form.pw} onChange={onChange} placeholder="비밀번호" />
                {errors.pw && <p className={`${styles.helpText} ${styles.bad}`}>{errors.pw}</p>}
              </div>
            </div>

            {/* 비밀번호 확인 */}
            <div className={styles.fieldRow}>
              <label>
                비밀번호 확인 <span className={styles.required}>*</span>
              </label>
              <div>
                <input
                  type="password"
                  name="pw2"
                  value={form.pw2}
                  onChange={onChange}
                  placeholder="비밀번호 확인"
                />
                {errors.pw2 && <p className={`${styles.helpText} ${styles.bad}`}>{errors.pw2}</p>}
              </div>
            </div>

            {/* 닉네임 */}
            <div className={styles.fieldRow}>
              <label>
                닉네임 <span className={styles.required}>*</span>
              </label>
              <div>
                <input name="nickname" value={form.nickname} onChange={onChange} placeholder="닉네임" />
                {errors.nickname && <p className={`${styles.helpText} ${styles.bad}`}>{errors.nickname}</p>}
              </div>
            </div>

            {/* 이메일 */}
            <div className={styles.fieldRow}>
              <label>
                이메일 <span className={styles.required}>*</span>
              </label>
              <div>
                <input name="email" value={form.email} onChange={onChange} placeholder="example@email.com" />
                {errors.email && <p className={`${styles.helpText} ${styles.bad}`}>{errors.email}</p>}
              </div>
            </div>

            {/* 전화/주소(선택) */}
            <div className={styles.fieldRow}>
              <label>전화번호</label>
              <div>
                <input name="phone" value={form.phone} onChange={onChange} placeholder="01012345678" />
              </div>
            </div>

            <div className={styles.fieldRow}>
              <label>기본주소</label>
              <div>
                <input name="defaultAddress" value={form.defaultAddress} onChange={onChange} placeholder="주소" />
              </div>
            </div>
          </div>

          {/* =========================
              관심 정보
          ========================= */}
          <hr className={styles.divider} />

          <div className={styles.section}>
            <div className={styles.sectionTitle}>펫 정보</div>

            <div className={styles.sectionBox}>
              <div className={styles.fieldRow}>
                <label>펫(관심 있는 펫)</label>
                <div className={styles.checkRow}>
                  <label className={styles.checkItem}>
                    <input
                      type="checkbox"
                      checked={form.petList.includes("dog")}
                      onChange={() => toggleInterestPet("dog")}
                    />
                    강아지
                  </label>

                  <label className={styles.checkItem}>
                    <input
                      type="checkbox"
                      checked={form.petList.includes("cat")}
                      onChange={() => toggleInterestPet("cat")}
                    />
                    고양이
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* =========================
              내 펫 등록
          ========================= */}
          <hr className={styles.divider} />

          <div className={styles.section}>
            <div className={styles.sectionTitle}>내 펫 등록</div>

            <div className={styles.sectionBox}>
              <div className={styles.fieldRow}>
                <label>펫을 등록할까요?</label>
                <div className={styles.toggleRow}>
                  <label className={styles.checkItem}>
                    <input type="checkbox" checked={form.hasPet} onChange={toggleHasPet} />
                    등록할게요
                  </label>
                </div>
              </div>

              {form.hasPet && (
                <>
                  <div className={styles.petTopBar}>
                    <div className={styles.petHint}>펫 정보를 추가로 등록할 수 있어요</div>
                    <button
                      type="button"
                      className={`${styles.btnInline} ${styles.iconBtn}`}
                      onClick={addPet}
                      title="펫 추가"
                    >
                      ＋
                    </button>
                  </div>

                  {form.pets.map((pet, idx) => (
                    <div key={idx} className={styles.petCard}>
                      <div className={styles.petCardHeader}>
                        <strong>펫 {idx + 1}</strong>
                        {form.pets.length > 1 && (
                          <button
                            type="button"
                            className={`${styles.btnInline} ${styles.iconBtn}`}
                            onClick={() => removePet(idx)}
                            title="펫 삭제"
                          >
                            −
                          </button>
                        )}
                      </div>

                      <div className={styles.fieldRow}>
                        <label>
                          펫 이름 <span className={styles.required}>*</span>
                        </label>
                        <div>
                          <input
                            name="name"
                            value={pet.name}
                            onChange={(e) => onPetChange(idx, e)}
                            placeholder="예: 콩이"
                          />
                          {errors[`petName_${idx}`] && (
                            <p className={`${styles.helpText} ${styles.bad}`}>{errors[`petName_${idx}`]}</p>
                          )}
                        </div>
                      </div>

                      <div className={styles.fieldRow}>
                        <label>
                          펫 종류 <span className={styles.required}>*</span>
                        </label>
                        <div>
                          <select name="petType" value={pet.petType} onChange={(e) => onPetChange(idx, e)}>
                            <option value="">선택</option>

                            {form.petList.length === 0 && (
                              <>
                                <option value="dog">강아지</option>
                                <option value="cat">고양이</option>
                              </>
                            )}

                            {form.petList.includes("dog") && <option value="dog">강아지</option>}
                            {form.petList.includes("cat") && <option value="cat">고양이</option>}
                          </select>

                          {errors[`petType_${idx}`] && (
                            <p className={`${styles.helpText} ${styles.bad}`}>{errors[`petType_${idx}`]}</p>
                          )}
                        </div>
                      </div>

                      <div className={styles.fieldRow}>
                        <label>펫 성별</label>
                        <div>
                          <select name="gender" value={pet.gender} onChange={(e) => onPetChange(idx, e)}>
                            <option value="">선택</option>
                            <option value="M">수컷</option>
                            <option value="F">암컷</option>
                            <option value="N">중성 / 모름</option>
                          </select>
                        </div>
                      </div>

                      <div className={styles.fieldRow}>
                        <label>생년월일</label>
                        <div>
                          <input
                            type="date"
                            name="birthday"
                            value={pet.birthday}
                            onChange={(e) => onPetChange(idx, e)}
                          />
                        </div>
                      </div>

                      <div className={styles.fieldRow}>
                        <label>품종</label>
                        <div>
                          <input
                            name="breed"
                            value={pet.breed}
                            onChange={(e) => onPetChange(idx, e)}
                            placeholder="예: 말티즈, 샴"
                          />
                        </div>
                      </div>

                      <div className={styles.fieldRow}>
                        <label>몸무게</label>
                        <div>
                          <input
                            name="weight"
                            value={pet.weight}
                            onChange={(e) => onPetChange(idx, e)}
                            placeholder="예: 3.2 또는 3.2kg"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}

              {serverMsg && <p className={`${styles.helpText} ${styles.bad}`}>{serverMsg}</p>}
            </div>
          </div>

          <div className={styles.submitRow}>
            <button className={styles.btnSignup} type="submit">
              회원가입
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Signup;
