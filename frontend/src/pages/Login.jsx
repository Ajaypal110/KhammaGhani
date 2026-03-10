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


  const isValidEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  /* =====================
     UNIFIED LOGIN
  ===================== */
  const loginHandler = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const { data } = await API.post("/auth/unified-login", {
        identifier: email, // This is now Email or Agent ID
        password,
      });

      // Unified Token Management
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);
      localStorage.setItem("userName", data.name);

      // Role-based Redirection
      if (data.role === "restaurant") {
        localStorage.setItem("restaurantToken", data.token); // Legacy support
        navigate("/restaurant/dashboard");
      } else if (data.role === "deliveryAgent") {
        localStorage.setItem("agentToken", data.token); // Legacy support
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
    <div className="zomato-auth-wrapper">
      <div className="zomato-hero">
        <h1 className="zomato-hero-title">#DISCOVER THE BEST FOOD<br/>NEAR YOU</h1>
        <div className="zomato-brand-badge">Khammaghani</div>
        <img 
          src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=800&auto=format&fit=crop" 
          alt="Food Background" 
          className="zomato-hero-img" 
        />
      </div>

      <div className="zomato-auth-card">
        <h2 className="zomato-card-title">Login</h2>

        {message && <p className="zomato-message">{message}</p>}

        {step === "login" && (
          <form onSubmit={loginHandler} className="zomato-form">
            <input
              type="email" /* using email type for better mobile keyboard */
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="zomato-input"
              required
            />

            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="zomato-input"
              required
            />

            <div className="zomato-forgot">
              <span onClick={() => setStep("forgot")}>
                Forgot password?
              </span>
            </div>

            <button type="submit" className="zomato-btn-primary" disabled={loading}>
              {loading ? "Authenticating..." : "Login"}
            </button>

            <div className="zomato-divider">
              <span>OR</span>
            </div>

            <button
              type="button"
              className="zomato-google-full-btn"
              onClick={googleLoginHandler}
            >
              <img
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                alt="Google"
              />
              Continue with Google
            </button>

            <div className="zomato-register-link">
              New user? <span onClick={() => navigate("/register")}>Sign Up</span>
            </div>
          </form>
        )}

        {step === "forgot" && (
          <div className="zomato-form">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="zomato-input"
              required
            />
            <button className="zomato-btn-primary" onClick={sendOtpHandler} disabled={loading}>
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>
            <div className="zomato-register-link" style={{ marginTop: '16px' }}>
              <span onClick={() => setStep("login")}>Back to login</span>
            </div>
          </div>
        )}

        {step === "otp" && (
          <div className="zomato-form">
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="zomato-input"
              required
            />
            <button className="zomato-btn-primary" onClick={verifyOtpHandler}>Verify OTP</button>
          </div>
        )}

        {step === "reset" && (
          <div className="zomato-form">
            <input
              type="password"
              placeholder="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="zomato-input"
              required
            />
            <button className="zomato-btn-primary" onClick={resetPasswordHandler}>
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
