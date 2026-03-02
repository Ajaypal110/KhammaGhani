import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import "../styles/auth.css";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../firebase";


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

  const isValidEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  /* =====================
     LOGIN
  ===================== */
  const loginHandler = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!isValidEmail(email)) {
      setMessage("Enter a valid email address");
      return;
    }

    try {
      const { data } = await API.post("/auth/login", {
        email,
        password,
      });

      localStorage.setItem("token", data.token);
      localStorage.removeItem("role");
      navigate("/");
    }catch (err) {
  console.log("LOGIN ERROR 👉", err.response?.data || err.message);
  setMessage(err.response?.data?.message || "Login failed");
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
      });

      localStorage.setItem("token", data.token);
      localStorage.removeItem("role");
      navigate("/");
    } catch {
      setMessage("Google login failed");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Login</h2>

        {message && <p className="auth-message">{message}</p>}

        {/* ================= LOGIN ================= */}
        {step === "login" && (
          <form onSubmit={loginHandler}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <div className="forgot-password">
              <span onClick={() => setStep("forgot")}>
                Forgot password?
              </span>
            </div>

            <button type="submit">Login</button>

            {/* GOOGLE LOGIN */}
            <button
              type="button"
              className="google-btn google-flex"
              onClick={googleLoginHandler}
            >
              <img
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                alt="Google"
                className="google-icon"
              />
              Continue with Google
            </button>

            {/* ✅ RESTAURANT LOGIN BUTTON (ADDED) */}
            <button
              type="button"
              className="restaurant-btn"
              onClick={() => navigate("/restaurant/login")}
            >
              Restaurant Login
            </button>

            <div className="auth-link">
              New user?{" "}
              <span onClick={() => navigate("/register")}>Register</span>
            </div>
          </form>
        )}

        {/* ================= FORGOT ================= */}
        {step === "forgot" && (
          <>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <button onClick={sendOtpHandler} disabled={loading}>
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>

            <div className="auth-link">
              <span onClick={() => setStep("login")}>Back to login</span>
            </div>
          </>
        )}

        {/* ================= OTP ================= */}
        {step === "otp" && (
          <>
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
            />

            <button onClick={verifyOtpHandler}>Verify OTP</button>
          </>
        )}

        {/* ================= RESET ================= */}
        {step === "reset" && (
          <>
            <input
              type="password"
              placeholder="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />

            <button onClick={resetPasswordHandler}>
              Reset Password
            </button>
          </>
        )}
      </div>
    </div>
  );
}
