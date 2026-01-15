import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom'; 
import client from '../api/client'; 
import './Chatbot.css';
import useTypewriter from '../hooks/useTypewriter'; 

// 🦁 Typing Effect Component (Memoized to prevent flickering)
const TypingMessage = React.memo(({ text, onComplete }) => {
  const typedText = useTypewriter(text, 30, onComplete);
  return <div style={{whiteSpace: 'pre-wrap', lineHeight: '1.6'}}>{typedText}</div>;
}, (prevProps, nextProps) => prevProps.text === nextProps.text); 

const FRAME_COUNT = 97; 
const FRAME_RATE = 100; 

const Chatbot = () => {
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  
  // 🦁 Resizable State
  const [size, setSize] = useState({ width: 420, height: 650 });
  const isResizing = useRef(false);

  const location = useLocation(); 
  const navigate = useNavigate(); 
  
  const [messages, setMessages] = useState([
    { text: "안녕하냥! 무엇을 도와줄까냥?", sender: "bot", type: 'fast', isTyped: true }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [quickQuestions, setQuickQuestions] = useState([]);
  
  const messagesEndRef = useRef(null);

  // 🦁 Resize Logic (Top-Left Corner Drag)
  const startResize = (e) => {
    isResizing.current = true;
    e.preventDefault(); 
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing.current) return;
      
      // Calculate from Right-Bottom
      const rightOffset = 30; // .chatbot-container right
      const bottomOffset = 140; // .chat-window bottom position
      
      const newWidth = window.innerWidth - e.clientX - rightOffset;
      const newHeight = window.innerHeight - e.clientY - bottomOffset;

      setSize({
        width: Math.max(350, Math.min(newWidth, 800)), 
        height: Math.max(500, Math.min(newHeight, 900)) 
      });
    };

    const handleMouseUp = () => {
      isResizing.current = false;
    };

    if (isOpen) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isOpen]);

  // 고양이 애니메이션
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFrame(prevFrame => (prevFrame + 1) % FRAME_COUNT);
    }, FRAME_RATE);
    return () => clearInterval(interval);
  }, []);

  // 스크롤 자동 이동
  useEffect(() => {
    if (isOpen && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  // ✅ 페이지 변경 시 챗봇 리셋 및 퀵 버튼 업데이트
  useEffect(() => {
    const wasFromChatbot = location.state?.fromChatbot;

    if (!wasFromChatbot) {
      setMessages([{ text: "안녕하냥! 무엇을 도와줄까냥?", sender: "bot" }]);
      setInputValue("");
      setIsLoading(false);
    }
    
    async function loadSuggestions() {
      try {
        const res = await client.post('/api/chat/suggestions', { 
          current_path: location.pathname 
        });
        setQuickQuestions(res.data.suggestions || []);
      } catch (e) {
        console.error("퀵 버튼 로드 실패:", e);
      }
    }
    
    if (isOpen) {
      loadSuggestions();
    }
  }, [location.pathname, isOpen]); // 🦁 isOpen 추가하여 처음 열 때도 로드되게 함

  const handleToggleChat = () => setIsOpen(!isOpen);

  // 🦁 Link Parser (Markdown -> React Router)
  const renderMessage = (text) => {
    if (!text) return null;
    
    const regex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }
      
      const title = match[1];
      const url = match[2];
      
      const handleLinkClick = (linkUrl) => {
          try {
              if (linkUrl.startsWith("http")) {
                  const urlObj = new URL(linkUrl);
                  if (urlObj.origin === window.location.origin) {
                      navigate(urlObj.pathname + urlObj.search, { state: { fromChatbot: true } });
                  } else {
                      window.open(linkUrl, "_blank");
                  }
              } else {
                  navigate(linkUrl, { state: { fromChatbot: true } });
              }
          } catch (e) {
              console.error("Link Error:", e);
              navigate(linkUrl, { state: { fromChatbot: true } }); 
          }
      };

      parts.push(
        <span 
          key={lastIndex} 
          className="chat-link" 
          onClick={() => handleLinkClick(url)}
          style={{color: '#007bff', cursor: 'pointer', fontWeight: 'bold', textDecoration: 'underline'}}
        >
          {title}
        </span>
      );
      
      lastIndex = regex.lastIndex;
    }
    
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }
    
    return parts.length > 0 ? parts : text;
  };

  // 🦁 Reusable Message Sender with Parallel Fetching
  const sendMessage = async (text) => {
    setMessages(prev => [...prev, { text: text, sender: "user" }]);
    setIsLoading(true);
    
    // 1. Prepare Fast Bubble (Placeholder)
    setMessages(prev => [...prev, { text: "...", sender: "bot", type: 'fast', loading: true }]);
    
    const payload = { 
        message: text, 
        history: messages.slice(-6) 
    };

    try {
        // 🦁 Parallel Requests: Fire both immediately!
        const fastReq = fetch('/api/chat/fast', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const slowReq = fetch('/api/chat/slow', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        // 2. Handle Fast Response
        fastReq.then(async (res) => {
            const data = await res.json();
            const fastReply = data.reply || "대답을 생각중이다냥...";
            
            setMessages(prev => {
                const newMsgs = [...prev];
                // Find the loading 'fast' bubble and update it
                const lastIdx = newMsgs.findLastIndex(m => m.sender === 'bot' && m.type === 'fast');
                if (lastIdx !== -1) {
                    newMsgs[lastIdx] = { text: fastReply, sender: "bot", type: 'fast', loading: false };
                }
                return newMsgs;
            });
        }).catch(e => console.error("Fast Chat Error", e));

        // 3. Handle Slow Response
        const slowRes = await slowReq;
        const slowData = await slowRes.json();
        const slowReply = slowData.reply;
        
        // 🦁 Log RAG Debug Info
        if (slowData.debug_info) {
            console.group("🦁 RAG Debug Info");
            console.log("Keywords:", slowData.debug_info.keywords);
            console.log("Vector Search:", slowData.debug_info.vector_candidates);
            console.log("Inventory Match:", slowData.debug_info.inventory_match);
            console.groupEnd();
        }
        
        if (slowReply) {
            setMessages(prev => {
                // Check if Fast Talk is already done (isTyped: true)
                const fastMsg = prev.find(m => m.type === 'fast' && m.sender === 'bot');
                const isFastDone = fastMsg ? fastMsg.isTyped : true; // If no fast msg, show slow immediately

                return [
                    ...prev, 
                    { 
                        text: slowReply, 
                        sender: "bot", 
                        type: 'slow', 
                        loading: false,
                        hidden: !isFastDone // 🦁 Hide if Fast Talk is not done
                    }
                ];
            });
        }

    } catch (error) {
      console.error("Chat Error:", error);
      setMessages(prev => [...prev, { text: "오류가 발생했다냥. 다시 말해달라냥!", sender: "bot" }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickClick = async (q) => {
    if (q.cached_answer) {
      setMessages(prev => [...prev, { text: q.label, sender: "user" }]);
      setMessages(prev => [...prev, { text: q.cached_answer, sender: "bot" }]);
      if (q.link) navigate(q.link, { state: { fromChatbot: true } });
      return;
    }
    sendMessage(q.label);
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    const msg = inputValue;
    setInputValue("");
    sendMessage(msg);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const frameUrl = `${process.env.PUBLIC_URL}/images/cat_frames/frame_${String(currentFrame).padStart(3, '0')}.png`;

  return (
    <div className="chatbot-container">
      {isOpen && (
        <div 
            className="chat-window" 
            style={{ width: size.width, height: size.height }}
        >
          {/* 🦁 Resize Handle (Top-Left) */}
          <div 
            className="resize-handle-tl"
            onMouseDown={startResize}
            title="크기 조절"
          />

          <div className="chat-header">
            <span>냥냥 챗봇</span>
            <button onClick={handleToggleChat} className="close-btn">X</button>
          </div>
          <div className="chat-body">
            {messages.map((msg, index) => (
              <div key={index} className={`chat-message ${msg.sender}`}>
                <div className={`message-bubble ${msg.loading ? 'loading' : ''}`} style={{whiteSpace: 'pre-wrap'}}>
                  {/* 🦁 Apply Typing Effect ONLY to the latest bot 'fast' message */}
                  {msg.sender === 'bot' && msg.type === 'fast' && !msg.isTyped ? (
                    <TypingMessage 
                        text={msg.text} 
                        onComplete={() => {
                            setMessages(prev => {
                                // 1. Mark Fast Talk as Typed
                                const newMsgs = prev.map((m, i) => 
                                    i === index ? { ...m, isTyped: true } : m
                                );
                                
                                // 2. Reveal Hidden Slow Talk (if any)
                                const slowIdx = newMsgs.findIndex(m => m.type === 'slow' && m.hidden);
                                if (slowIdx !== -1) {
                                    newMsgs[slowIdx] = { ...newMsgs[slowIdx], hidden: false };
                                }
                                return newMsgs;
                            });
                        }} 
                    />
                  ) : (
                    !msg.hidden && renderMessage(msg.text) // 🦁 Don't render hidden messages
                  )}
                </div>
              </div>
            ))}
            {/* 🦁 Loading Bubble Logic is handled in sendMessage now */}
            <div ref={messagesEndRef} />
          </div>

          {quickQuestions.length > 0 && (
            <div className="quick-replies">
              {quickQuestions.map((q, idx) => (
                <button key={idx} className="quick-chip" onClick={() => handleQuickClick(q)}>
                  {q.label}
                </button>
              ))}
            </div>
          )}

          <div className="chat-input-area">
            <input 
              type="text" 
              placeholder="메시지 입력..." 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <button onClick={handleSendMessage} disabled={isLoading}>전송</button>
          </div>
        </div>
      )}
      
      <div className="cat-character" onClick={handleToggleChat}>
        <img src={frameUrl} alt="Chatbot Cat" />
        {!isOpen && <div className="chat-bubble">궁금한게 있냥?</div>}
      </div>
    </div>
  );
};

export default Chatbot;