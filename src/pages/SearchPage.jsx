import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom"; // 🦁 useSearchParams
import styles from "../components/Category.module.css"; // Reuse styles
import { fetchProducts } from "../api/productApi";

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const keyword = searchParams.get("keyword") || "";
  const petType = searchParams.get("pet_type") || "";

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Sort State
  const [sort, setSort] = useState("id_desc");

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        // 🦁 Call API with keyword mapped to 'search'
        const data = await fetchProducts({ 
            pet_type: petType, 
            search: keyword, // 🦁 Fix: keyword -> search
            sort,
            limit: 20 
        });
        setProducts(data.items || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [keyword, petType, sort]);

  return (
    <div className={styles.categoryContainer}>
      {/* 🦁 Header Style Match */}
      <h2 className={styles.categoryTitle}>
        검색 결과: "{keyword}"
        {petType && <span style={{fontSize:'0.6em', marginLeft:'10px', fontWeight:'normal', color:'#666'}}>({petType === 'dog' ? '강아지' : '고양이'})</span>}
      </h2>

      {/* 🦁 Toolbar Style Match */}
      <div className={styles.toolbar}>
        <div className={styles.count}>총 {products.length}개</div>
        <select 
            className={styles.sortSelect} 
            value={sort} 
            onChange={(e) => setSort(e.target.value)}
        >
          <option value="id_desc">신상품순</option>
          <option value="price_asc">낮은가격순</option>
          <option value="price_desc">높은가격순</option>
          <option value="views_desc">조회수순</option>
        </select>
      </div>

      {loading ? (
        <div style={{padding:'100px', textAlign:'center', color:'#999'}}>상품을 찾고 있다냥... 🦁</div>
      ) : (
        /* 🦁 Flex Grid Layout Force Apply */
        <div style={{width: '1200px', margin: '0 auto', display: 'flex', flexWrap: 'wrap'}}>
          {products.length > 0 ? (
            products.map((item) => (
              <div 
                key={item.id} 
                className={styles.col} // 25% width
                onClick={() => navigate(`/product/${item.id}`)}
                style={{cursor: 'pointer'}}
              >
                <div className={styles.imgWrapper}>
                  <img 
                    src={item.imgUrl || "https://via.placeholder.com/200?text=No+Image"} 
                    alt={item.title} 
                  />
                </div>
                <div className={styles.info}>
                  <div className={styles.title} style={{fontSize: '14px', fontWeight: '500'}}>{item.title}</div>
                  <p style={{fontSize: '16px', fontWeight: 'bold', marginTop: '10px'}}>
                    {item.price.toLocaleString()}원
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div style={{width:'100%', textAlign:'center', padding:'150px', fontSize:'1.2rem', color:'#888'}}>
              검색 결과가 없습니다냥. 😿
            </div>
          )}
        </div>
      )}
    </div>
  );
}