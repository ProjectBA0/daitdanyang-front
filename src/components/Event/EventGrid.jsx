import React from "react";
import { useNavigate } from "react-router-dom"; // ✅ 네비게이션 추가
import styles from "./EventGrid.module.css";
import { motion } from "framer-motion";

export default function EventGrid({ items }) {
  const navigate = useNavigate();

  // Animation Variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemAnim = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 50, damping: 20 } }
  };

  return (
    <section className={styles.gridSection}>
      <motion.div 
        className={styles.grid}
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
      >
        {items.map((item) => (
          <motion.div 
            key={item.id} 
            className={styles.card}
            variants={itemAnim}
            onClick={() => navigate(`/events/${item.id}`)} // 🦁 상세 페이지 이동
            style={{cursor: 'pointer'}}
          >
            {/* 🦁 이미지 렌더링 (꽉 차게) */}
            <div className={styles.imgWrapper} style={{width: '100%', height: '220px', overflow: 'hidden', borderRadius: '12px 12px 0 0', backgroundColor: '#f0f0f0'}}>
                {item.img_url ? (
                    <img 
                        src={`${process.env.PUBLIC_URL}${item.img_url}`} 
                        alt={item.title} 
                        style={{width: '100%', height: '100%', objectFit: 'cover', display: 'block'}}
                    />
                ) : (
                    <div style={{width: '100%', height: '100%', background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999'}}>
                        No Image
                    </div>
                )}
            </div>
            
            <div className={styles.cardContent} style={{padding: '15px'}}>
                <div className={styles.cardTitle} style={{fontWeight: 'bold', marginBottom: '8px'}}>{item.title}</div>
                <div className={styles.cardDate} style={{fontSize: '0.9rem', color: '#666'}}>{item.date}</div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
