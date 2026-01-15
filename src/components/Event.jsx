import React from "react";
import styles from "./Event.module.css";

const Event = () => {
  return (
    <div className={styles.page}>
      
      {/* ===== EVENT TITLE ===== */}
      <section className={styles.container}>
        <div className={styles.eventTitle}>
          진행중 / 종료 이벤트
        </div>
      </section>

      {/* ===== EVENT LIST ===== */}
      <section className={styles.container}>
        <div className={styles.eventGrid}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className={styles.eventCard} />
          ))}
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className={styles.footer}>
        <div className={`${styles.container} ${styles.footerInner}`}>
          <div>
            <strong>COMPANY INFO</strong><br /><br />
            상호명: 예시회사<br />
            대표자: 홍길동<br />
            사업자등록번호: 000-00-00000
          </div>

          <div>
            <strong>CUSTOMER</strong><br /><br />
            고객센터: 1234-5678<br />
            운영시간: 09:00~18:00
          </div>

          <div>
            <strong>MOBILE STORE</strong><br /><br />
            앱 다운로드<br />
            Android / iOS
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Event;
