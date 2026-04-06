import React, { useState, useEffect, useRef } from "react";

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([{ role: "bot", text: "Howdy! I'm Reveille-Bot. What's on your mind?" }]);
  const chatEndRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = { role: "user", text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");

    try {
      const res = await fetch("http://127.0.0.1:8080/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });
      
      const data = await res.json();
      if (data.reply) {
        setMessages(prev => [...prev, { role: "bot", text: data.reply }]);
      } else {
        throw new Error("No reply from bot");
      }
    } catch (err) {
      console.error("Frontend Fetch Error:", err);
      setMessages(prev => [...prev, { role: "bot", text: "Connection error. Is the backend running?" }]);
    }
  };

  return (
    <div style={{ position: "fixed", bottom: "20px", right: "20px", zIndex: 1000 }}>
      {isOpen ? (
        <div style={{ width: "320px", height: "450px", background: "#1f2028", border: "1px solid #aa3bff", borderRadius: "15px", display: "flex", flexDirection: "column", overflow: "hidden", boxShadow: "0 10px 25px rgba(0,0,0,0.5)" }}>
          <div style={{ background: "#aa3bff", padding: "12px", fontWeight: "bold", color: "white", display: "flex", justifyContent: "space-between" }}>
            <span>🧋 Reveille Bot</span>
            <button onClick={() => setIsOpen(false)} style={{ background: "none", border: "none", color: "white", cursor: "pointer", fontSize: "1.2rem" }}>✕</button>
          </div>
          
          <div style={{ flex: 1, padding: "15px", overflowY: "auto", color: "white" }}>
            {messages.map((m, i) => (
              <div key={i} style={{ marginBottom: "12px", textAlign: m.role === "user" ? "right" : "left" }}>
                <span style={{ 
                  background: m.role === "user" ? "#aa3bff" : "#2e303a", 
                  padding: "8px 14px", 
                  borderRadius: "12px", 
                  display: "inline-block",
                  maxWidth: "80%",
                  lineHeight: "1.4"
                }}>
                  {m.text}
                </span>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          <div style={{ padding: "15px", borderTop: "1px solid #2e303a", display: "flex", gap: "8px" }}>
            <input 
              value={input} 
              onChange={(e) => setInput(e.target.value)} 
              onKeyPress={(e) => e.key === "Enter" && sendMessage()} 
              style={{ flex: 1, background: "#16171d", border: "1px solid #2e303a", color: "white", padding: "10px", borderRadius: "8px" }} 
              placeholder="Type here..." 
            />
            <button onClick={sendMessage} style={{ background: "#aa3bff", color: "white", border: "none", borderRadius: "8px", padding: "0 15px", fontWeight: "bold", cursor: "pointer" }}>Go</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setIsOpen(true)} style={{ width: "65px", height: "65px", borderRadius: "50%", background: "#aa3bff", color: "white", fontSize: "2.2rem", border: "none", cursor: "pointer", boxShadow: "0 5px 20px rgba(170, 59, 255, 0.5)" }}>
          💬
        </button>
      )}
    </div>
  );
};

export default ChatBot;