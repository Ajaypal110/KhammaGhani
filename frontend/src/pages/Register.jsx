import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import "../styles/auth.css";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../firebase";
import PolicyModal from "../components/PolicyModal";
import "../styles/policies.css";
import { FiEye, FiEyeOff } from "react-icons/fi";

export default function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [policyAccepted, setPolicyAccepted] = useState(false);
  const [policyModal, setPolicyModal] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const isValidEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  /* =====================
     REGISTER + AUTO LOGIN
  ===================== */
  const registerHandler = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!policyAccepted) {
      setMessage("Please accept the Terms & Conditions and Privacy Policy to continue.");
      return;
    }

    setLoading(true);

    if (!isValidEmail(email)) {
      setMessage("Enter a valid email address");
      setLoading(false);
      return;
    }

    try {
      const { data } = await API.post("/auth/register", {
        name,
        email,
        phone,
        password,
      });

      localStorage.setItem("token", data.token);
      localStorage.removeItem("role");
      navigate("/");
    } catch (err) {
      setMessage(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  /* =====================
     GOOGLE REGISTER / LOGIN
  ===================== */
  const googleRegisterHandler = async () => {
    setMessage("");

    if (!policyAccepted) {
      setMessage("Please accept the Terms & Conditions and Privacy Policy to continue.");
      return;
    }

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
      setMessage(err.response?.data?.message || "Google sign-in failed");
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
        <h2 className="kg-auth-card-title">Register</h2>

        {message && <p className="kg-auth-message">{message}</p>}

        <form onSubmit={registerHandler} className="kg-auth-form">
          <div className="kg-input-group">
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="kg-input"
              required
            />
          </div>

          <div className="kg-input-group">
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="kg-input"
              required
            />
          </div>

          <div className="kg-input-group">
            <input
              type="tel"
              placeholder="Mobile Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="kg-input"
            />
          </div>

          <div className="kg-input-group kg-password-group">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="kg-input"
              required
            />
            <div 
              className="kg-password-toggle" 
              onClick={() => setShowPassword(!showPassword)}
              title={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
            </div>
          </div>

          <label className="auth-policy-checkbox" style={{ marginTop: "4px" }}>
            <input
              type="checkbox"
              checked={policyAccepted}
              onChange={(e) => setPolicyAccepted(e.target.checked)}
            />
            <span>
              I agree to the{" "}
              <a href="#" onClick={(e) => { e.preventDefault(); setPolicyModal("terms"); }}>Terms & Conditions</a>{" "}
              and{" "}
              <a href="#" onClick={(e) => { e.preventDefault(); setPolicyModal("privacy"); }}>Privacy Policy</a>
            </span>
          </label>

          <button type="submit" className="kg-btn-primary" disabled={loading || !policyAccepted}>
            {loading ? "Signing up..." : "Sign Up"}
          </button>

          <div className="kg-auth-divider">
            <span>or</span>
          </div>

          <div className="kg-social-row">
            <button
              type="button"
              className="kg-social-btn"
              onClick={googleRegisterHandler}
              title="Continue with Google"
            >
              <img
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                alt="Google"
              />
            </button>
          </div>

          <div className="kg-register-link">
            Already have an account? <span onClick={() => navigate("/login")}>Login</span>
          </div>
        </form>
      </div>

      {policyModal && (
        <PolicyModal type={policyModal} onClose={() => setPolicyModal(null)} />
      )}
    </div>
  );
}
