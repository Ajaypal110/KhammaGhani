import { useEffect } from "react";

export default function ConfirmModal({ title, message, onConfirm, onCancel, confirmText = "Confirm", cancelText = "Cancel", confirmColor = "#ef4444" }) {
  useEffect(() => {
    // Prevent background scrolling when modal is open
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background: "rgba(0, 0, 0, 0.5)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10000,
      }}
      onClick={onCancel} // Clicking overlay cancels
    >
      <div
        style={{
          background: "#fff",
          padding: "32px",
          borderRadius: "20px",
          width: "90%",
          maxWidth: "400px",
          textAlign: "center",
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.15)",
          animation: "scaleUp 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
        }}
        onClick={(e) => e.stopPropagation()} // Prevent overlay click from closing
      >
        <div style={{ fontSize: "48px", marginBottom: "16px" }}>⚠️</div>
        <h3 style={{ margin: "0 0 12px", fontSize: "22px", fontWeight: "800", color: "#1e293b", letterSpacing: "-0.5px" }}>
          {title}
        </h3>
        <p style={{ margin: "0 0 28px", color: "#64748b", fontSize: "16px", lineHeight: "1.5" }}>
          {message}
        </p>
        <div style={{ display: "flex", gap: "12px" }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1,
              padding: "14px",
              borderRadius: "12px",
              border: "1.5px solid #cbd5e1",
              background: "#fff",
              color: "#334155",
              fontWeight: "600",
              fontSize: "15px",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = "#f8fafc")}
            onMouseOut={(e) => (e.currentTarget.style.background = "#fff")}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1,
              padding: "14px",
              borderRadius: "12px",
              border: "none",
              background: confirmColor,
              color: "#fff",
              fontWeight: "700",
              fontSize: "15px",
              cursor: "pointer",
              transition: "all 0.2s",
              boxShadow: `0 4px 12px ${confirmColor}40`,
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.boxShadow = `0 6px 16px ${confirmColor}60`;
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = `0 4px 12px ${confirmColor}40`;
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
      <style>
        {`
          @keyframes scaleUp {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
          }
        `}
      </style>
    </div>
  );
}
