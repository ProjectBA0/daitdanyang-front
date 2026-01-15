import React from "react";
import styles from "./Footer.module.css";

function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerInner}>
        {/* 1) 회사 정보 */}
        <div className={styles.left}>
          <div className={styles.company}>주식회사 다잇다냥</div>

          <div className={styles.infoRow}>
            <span className={styles.label}>주소 :</span>
            <span className={styles.value}>
              경기도 수원시 팔달구 권광로 146(인계동) 벽산그랜드코아 401호
            </span>
          </div>

          <div className={styles.infoRow}>
            <span className={styles.label}>대표이사 :</span>
            <span className={styles.value}>김장로</span>
          </div>

          <div className={styles.infoRow}>
            <span className={styles.label}>대표번호 :</span>
            <span className={styles.value}>031-321-7777</span>
          </div>

          <div className={styles.infoRow}>
            <span className={styles.label}>팩스 :</span>
            <span className={styles.value}>031-123-6666</span>
          </div>

          <div className={styles.infoRow}>
            <span className={styles.label}>통신판매업신고번호 :</span>
            <span className={styles.value}>제2011-수원팔달구-0114호</span>
          </div>

          <div className={styles.infoRow}>
            <span className={styles.label}>사업자등록번호 :</span>
            <span className={styles.value}>512-77-15482</span>
          </div>

          <div className={styles.copy}>
            Copyright © 주식회사 다잇다냥 All rights reserved.
          </div>
        </div>

        {/* 2) 근무시간 */}
        <div className={styles.center}>
          <div className={styles.centerTitle}>근무시간</div>
          <div className={styles.line}>평일 : 8:30 - 17:30</div>
          <div className={styles.line}>점심시간 : 12:30 - 13:30</div>
          <div className={styles.line}>토,일/공휴일은 휴무</div>
          <div className={styles.email}>E-mail : daitdanyang@gmail.com</div>
        </div>

        {/* 3) 대표전화 */}
        <div className={styles.right}>
          <div className={styles.phoneTitle}>
            <img src="/images/icon_tell.png" alt="전화" />
            대표전화
          </div>
          <div className={styles.phone}>031-321-7777</div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
