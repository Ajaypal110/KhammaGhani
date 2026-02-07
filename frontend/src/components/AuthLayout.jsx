function AuthLayout({ title, children }) {
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#f8f8f8"
    }}>
      <div style={{
        width: "100%",
        maxWidth: "400px",
        background: "#fff",
        padding: "24px",
        borderRadius: "8px",
        boxShadow: "0 0 10px rgba(0,0,0,0.1)"
      }}>
        <h2 style={{ textAlign: "center" }}>{title}</h2>
        {children}
      </div>
    </div>
  );
}

export default AuthLayout;
