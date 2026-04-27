import { useState } from "react";

export default function InfoButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="App information"
        style={{
          position: "fixed", top: "1.2rem", right: "1.2rem", zIndex: 9000,
          width: "2.4rem", height: "2.4rem", borderRadius: "50%",
          background: "#1b4332", color: "white",
          border: "2px solid rgba(82,183,136,0.6)", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 4px 16px rgba(27,67,50,0.25)",
          fontSize: "1.1rem", fontFamily: "inherit",
        }}
      >
        ⓘ
      </button>
    </>
  );
}