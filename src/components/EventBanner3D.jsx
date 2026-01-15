import React, { Suspense } from 'react';
import Spline from '@splinetool/react-spline';

export default function EventBanner3D() {
  
  // Spline 로드 완료 시 실행될 함수
  const onLoad = (spline) => {
    // 줌 레벨 조정 (1.5 -> 1.2)
    spline.setZoom(1.2);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '30px' }}>
      
      {/* 1. 3D 고양이 독립 컨테이너 */}
      <div style={{ 
        width: '800px', 
        height: '400px', // 높이 하향 (슬림한 배너 스타일)
        position: 'relative', 
        overflow: 'hidden', 
        
        /* Blue Theme Box Style (Custom Palette) */
        /* #E8EEF8(Light) -> #D5E5F3(Mid) -> #BBD2E6(Dark) 조합 */
        background: 'linear-gradient(135deg, #E8EEF8 0%, #D5E5F3 100%)',
        borderRadius: '40px',
        boxShadow: '0 20px 50px rgba(187, 210, 230, 0.5)', /* #BBD2E6 기반 그림자 */
        border: '2px solid rgba(255, 255, 255, 0.6)',
        
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center' // 다시 중앙 정렬로 되돌림 (내부 transform으로 조절하기 위해)
      }}>
        <Suspense fallback={<div style={{display:'flex', justifyContent:'center', alignItems:'center', height:'100%'}}>Loading 3D...</div>}>
          {/* 
             [Inner Box Size Expansion]
             Zoom 1.5에 맞춰 내부 박스를 1400x800으로 크게 확장하고
             translateY(150px)로 위치 조정
          */}
          <div style={{ 
            width: '1400px', 
            height: '800px', 
            transform: 'translateY(150px)', 
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <Spline 
              scene={`${process.env.PUBLIC_URL}/models/cat_01.splinecode`}
              onLoad={onLoad} 
            />
          </div>
        </Suspense>
      </div>

      {/* 2. 분리된 텍스트 영역 */}
      <div style={{ textAlign: 'center', color: '#555' }}>
        <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: '800', opacity: 0.9, letterSpacing: '-1px' }}>
          이벤트 여기 다 있다냥!
        </h1>
        <p style={{ margin: '10px 0 0', fontSize: '1.2rem', opacity: 0.8, color: '#777' }}>
          집사를 위해 준비했다냥!
        </p>
      </div>

    </div>
  );
}

