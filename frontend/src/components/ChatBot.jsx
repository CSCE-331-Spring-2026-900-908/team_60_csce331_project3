import React, { useState, useEffect, useRef } from "react";

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([{ role: "bot", text: "Howdy! I'm your Aura Guide. Looking for a drink recommendation?" }]);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = { role: "user", text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");

    try {
      const res = await fetch("http://localhost:8080/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });
      
      const data = await res.json();
      if (data.reply) {
        setMessages(prev => [...prev, { role: "bot", text: data.reply }]);
      } else {
        throw new Error("No reply");
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: "bot", text: "I'm having trouble connecting to the tea leaves. Is the backend running?" }]);
    }
  };

  return (
    <div style={{ position: "fixed", bottom: "30px", right: "30px", zIndex: 2000, fontFamily: "'Inter', sans-serif" }}>
      {isOpen ? (
        <div style={chatWindow}>
          {/* Header */}
          <div style={chatHeader}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={statusDot}></div>
              <span style={{ fontWeight: "800", letterSpacing: "0.5px" }}>aura guide</span>
            </div>
            <button onClick={() => setIsOpen(false)} style={closeBtn}>✕</button>
          </div>
          
          {/* Messages Area */}
          <div style={messageContainer}>
            {messages.map((m, i) => (
              <div key={i} style={{ marginBottom: "15px", textAlign: m.role === "user" ? "right" : "left" }}>
                <div style={{ 
                  background: m.role === "user" ? "#2d6a4f" : "rgba(255,255,255,0.8)", 
                  color: m.role === "user" ? "white" : "#1b4332", 
                  padding: "10px 16px", 
                  borderRadius: m.role === "user" ? "20px 20px 4px 20px" : "20px 20px 20px 4px", 
                  display: "inline-block",
                  maxWidth: "85%",
                  fontSize: "0.9rem",
                  fontWeight: m.role === "user" ? "500" : "600",
                  boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
                  lineHeight: "1.4"
                }}>
                  {m.text}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Input Area */}
          <div style={inputArea}>
            <input 
              value={input} 
              onChange={(e) => setInput(e.target.value)} 
              onKeyPress={(e) => e.key === "Enter" && sendMessage()} 
              style={textInput} 
              placeholder="Ask about flavors..." 
            />
            <button onClick={sendMessage} style={sendBtn}>→</button>
          </div>
        </div>
      ) : (
        /* Floating Toggle Button */
        <button onClick={() => setIsOpen(true)} style={toggleBtn}>
          <span style={{ fontSize: "1.8rem" }}>🧋</span>
          <div style={notificationPing}></div>
        </button>
      )}
    </div>
  );
};

// --- AURA CHAT STYLES ---
const chatWindow = {
  width: "350px",
  height: "500px",
  background: "rgba(232, 245, 233, 0.95)", // Mint glass
  backdropFilter: "blur(15px)",
  border: "1px solid rgba(255, 255, 255, 0.5)",
  borderRadius: "30px",
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
  boxShadow: "0 20px 40px rgba(27, 67, 50, 0.15)"
};

const chatHeader = {
  background: "#1b4332",
  padding: "20px",
  color: "white",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  textTransform: "uppercase",
  fontSize: "0.75rem"
};

const statusDot = {
  width: "8px",
  height: "8px",
  background: "#52b788",
  borderRadius: "50%",
  boxShadow: "0 0 10px #52b788"
};

const closeBtn = {
  background: "none",
  border: "none",
  color: "white",
  cursor: "pointer",
  fontSize: "1rem",
  opacity: 0.7
};

const messageContainer = {
  flex: 1,
  padding: "20px",
  overflowY: "auto",
  scrollbarWidth: "none"
};

const inputArea = {
  padding: "20px",
  background: "white",
  display: "flex",
  gap: "10px",
  borderTop: "1px solid rgba(0,0,0,0.05)"
};

const textInput = {
  flex: 1,
  background: "#f1f8f1",
  border: "none",
  color: "#1b4332",
  padding: "12px 15px",
  borderRadius: "15px",
  outline: "none",
  fontSize: "0.9rem",
  fontWeight: "600"
};

const sendBtn = {
  background: "#2d6a4f",
  color: "white",
  border: "none",
  borderRadius: "12px",
  width: "45px",
  fontWeight: "bold",
  cursor: "pointer",
  fontSize: "1.2rem",
  transition: "0.2s"
};

const toggleBtn = {
  width: "70px",
  height: "70px",
  borderRadius: "24px",
  background: "#1b4332",
  color: "white",
  border: "none",
  cursor: "pointer",
  boxShadow: "0 10px 25px rgba(27, 67, 50, 0.3)",
  position: "relative",
  transition: "transform 0.3s ease"
};

const notificationPing = {
  position: "absolute",
  top: "-2px",
  right: "-2px",
  width: "14px",
  height: "14px",
  background: "#52b788",
  borderRadius: "50%",
  border: "3px solid #e8f5e9"
};

export default ChatBot;