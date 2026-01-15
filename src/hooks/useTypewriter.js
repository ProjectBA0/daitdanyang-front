import { useState, useEffect, useRef } from 'react';

const useTypewriter = (textToType, speed = 30, onComplete) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    // 텍스트가 없거나 바뀌면 초기화
    if (!textToType) {
      setDisplayedText('');
      setCurrentIndex(0);
      return;
    }

    // 이미 다 쳤으면 중단 (리렌더링 방지)
    if (currentIndex >= textToType.length) return;

    const typeChar = () => {
      setDisplayedText((prev) => {
        // 현재 인덱스 기준으로 다음 글자 추가
        if (currentIndex < textToType.length) {
          return prev + textToType.charAt(currentIndex);
        }
        return prev;
      });

      setCurrentIndex((prev) => prev + 1);
    };

    timerRef.current = setTimeout(typeChar, speed);

    return () => clearTimeout(timerRef.current);
  }, [currentIndex, textToType, speed]); // currentIndex가 바뀔 때마다 재실행

  // 완료 체크
  useEffect(() => {
    if (textToType && currentIndex === textToType.length) {
        if (onComplete) onComplete();
    }
  }, [currentIndex, textToType, onComplete]);

  return displayedText;
};

export default useTypewriter;
