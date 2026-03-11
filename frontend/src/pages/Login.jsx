import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import "../styles/auth.css";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../firebase";
import PolicyModal from "../components/PolicyModal";
import "../styles/policies.css";


export default function Login() {
  const navigate = useNavigate();

  // login | forgot | otp | reset
  const [step, setStep] = useState("login");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [policyAccepted, setPolicyAccepted] = useState(false);
  const [policyModal, setPolicyModal] = useState(null); // "terms" | "privacy" | null


  const isValidEmail = (val) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);

  const isValidIdentifier = (val) => {
    if (!val || !val.trim()) return false;
    if (val.includes("@")) return isValidEmail(val);
    return val.trim().length >= 2;
  };

  /* =====================
     UNIFIED LOGIN
  ===================== */
  const loginHandler = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!isValidIdentifier(email)) {
      setMessage("Please enter a valid Email or ID (Agent/Admin).");
      return;
    }
    if (!password) {
      setMessage("Password is required.");
      return;
    }

    setLoading(true);

    try {
      const { data } = await API.post("/auth/unified-login", {
        identifier: email,
        password,
      });

      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);
      localStorage.setItem("userName", data.name);

      if (data.role === "restaurant") {
        localStorage.setItem("restaurantToken", data.token);
        navigate("/restaurant/dashboard");
      } else if (data.role === "deliveryAgent") {
        localStorage.setItem("agentToken", data.token);
        navigate("/agent/dashboard");
      } else if (data.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/");
      }
    } catch (err) {
      console.log("LOGIN ERROR 👉", err.response?.data || err.message);
      setMessage(err.response?.data?.message || "Login failed. Check your ID/Email and password.");
    } finally {
      setLoading(false);
    }
  };

  /* =====================
     SEND RESET OTP
  ===================== */
  const sendOtpHandler = async () => {
    if (!isValidEmail(email)) {
      setMessage("Enter a valid email address");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      await API.post("/auth/send-reset-otp", { email });
      setStep("otp");
      setMessage("OTP sent to your email");
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtpHandler = () => {
    if (!otp) {
      setMessage("OTP is required");
      return;
    }
    setMessage("");
    setStep("reset");
  };

  const resetPasswordHandler = async () => {
    if (!newPassword) {
      setMessage("New password is required");
      return;
    }

    setMessage("");

    try {
      await API.post("/auth/reset-password", {
        email,
        otp,
        newPassword,
      });

      setMessage("Password reset successful. Please login.");
      setStep("login");
      setPassword("");
      setOtp("");
      setNewPassword("");
    } catch (err) {
      setMessage(err.response?.data?.message || "Password reset failed");
    }
  };

  /* =====================
     GOOGLE LOGIN
  ===================== */
  const googleLoginHandler = async () => {
    setMessage("");

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      const { data } = await API.post("/auth/google-login", {
        email: user.email,
        name: user.displayName,
        profileImage: user.photoURL,
      });

      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role || "user");
      localStorage.setItem("userName", data.name || user.displayName);
      navigate("/");
    } catch (err) {
      console.error("GOOGLE LOGIN FAIL 👉", err);
      const errorMsg = err.response?.data?.message || err.message || "Google login failed";
      setMessage(errorMsg);
    }
  };

  return (
    <div className="kg-auth-page">
      {/* ===== HERO SECTION ===== */}
      <div className="kg-auth-hero">
        <div className="kg-auth-hero-overlay" />
        <img
          src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=800&auto=format&fit=crop"
          alt="Food Background"
          className="kg-auth-hero-img"
        />
        <div className="kg-auth-hero-content">
          <h1 className="kg-auth-hero-title">
            RAJASTHAN'S #1 FOOD<br />DELIVERY APP
          </h1>
          <div className="kg-auth-brand-badge">Khammaghani</div>
        </div>
      </div>

      {/* ===== AUTH CARD ===== */}
      <div className="kg-auth-card">
        <h2 className="kg-auth-card-title">
          {step === "login" && "Log in or sign up"}
          {step === "forgot" && "Forgot Password"}
          {step === "otp" && "Verify OTP"}
          {step === "reset" && "Reset Password"}
        </h2>

        {message && <p className="kg-auth-message">{message}</p>}

        {/* ===== LOGIN STEP ===== */}
        {step === "login" && (
          <form onSubmit={loginHandler} className="kg-auth-form">
            <div className="kg-input-group">
              <div className="kg-input-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
              <input
                type="text"
                placeholder="Email or Agent / Admin ID"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="kg-input"
                autoComplete="username"
                required
              />
            </div>

            <div className="kg-input-group">
              <div className="kg-input-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </div>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="kg-input"
                autoComplete="current-password"
                required
              />
            </div>

            <div className="kg-forgot-row">
              <span onClick={() => setStep("forgot")}>Forgot password?</span>
            </div>

            <button type="submit" className="kg-btn-primary" disabled={loading}>
              {loading ? "Authenticating..." : "Continue"}
            </button>

            <div className="kg-auth-divider">
              <span>or</span>
            </div>

            <div className="kg-social-row">
              <button
                type="button"
                className="kg-social-btn"
                onClick={googleLoginHandler}
                title="Continue with Google"
              >
                <img
                  src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                  alt="Google"
                />
              </button>
              <button
                type="button"
                className="kg-social-btn"
                onClick={() => navigate("/register")}
                title="Sign up with Email"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#E23744" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
              </button>
            </div>

            <div className="kg-auth-footer-text">
              By continuing, you agree to our<br/>
              <span onClick={() => navigate("/terms")}>Terms of Service</span>
              {" · "}
              <span onClick={() => navigate("/privacy")}>Privacy Policy</span>
            </div>

            <div className="kg-register-link">
              New here? <span onClick={() => navigate("/register")}>Create an account</span>
            </div>
          </form>
        )}

        {/* ===== FORGOT PASSWORD STEP ===== */}
        {step === "forgot" && (
          <div className="kg-auth-form">
            <div className="kg-input-group">
              <div className="kg-input-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
              </div>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="kg-input"
                required
              />
            </div>
            <button className="kg-btn-primary" onClick={sendOtpHandler} disabled={loading}>
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>
            <div className="kg-register-link" style={{ marginTop: '16px' }}>
              <span onClick={() => setStep("login")}>← Back to login</span>
            </div>
          </div>
        )}

        {/* ===== OTP STEP ===== */}
        {step === "otp" && (
          <div className="kg-auth-form">
            <div className="kg-input-group">
              <div className="kg-input-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </div>
              <input
                type="text"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="kg-input"
                required
              />
            </div>
            <button className="kg-btn-primary" onClick={verifyOtpHandler}>Verify OTP</button>
          </div>
        )}

        {/* ===== RESET PASSWORD STEP ===== */}
        {step === "reset" && (
          <div className="kg-auth-form">
            <div className="kg-input-group">
              <div className="kg-input-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </div>
              <input
                type="password"
                placeholder="New password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="kg-input"
                required
              />
            </div>
            <button className="kg-btn-primary" onClick={resetPasswordHandler}>
              Reset Password
            </button>
          </div>
        )}
      </div>

      {policyModal && (
        <PolicyModal type={policyModal} onClose={() => setPolicyModal(null)} />
      )}
    </div>
  );
}
