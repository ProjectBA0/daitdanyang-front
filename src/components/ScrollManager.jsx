import { useEffect } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

export default function ScrollManager() {
  const location = useLocation();
  const navigationType = useNavigationType();

  useEffect(() => {
    // PUSH: 새 페이지 이동 → 맨 위
    if (navigationType === "PUSH") {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    }
    // POP: 뒤로가기 → 브라우저가 스크롤 복원
  }, [location.pathname, navigationType]);

  return null;
}
