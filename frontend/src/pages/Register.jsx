import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import "../styles/auth.css";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../firebase";
import PolicyModal from "../components/PolicyModal";
import "../styles/policies.css";

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
        <h2 className="kg-auth-card-title">Create Account</h2>

        {message && <p className="kg-auth-message">{message}</p>}

        <form onSubmit={registerHandler} className="kg-auth-form">
          <div className="kg-input-group">
            <div className="kg-input-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
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
            <div className="kg-input-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
            </div>
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
            <div className="kg-input-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
            </div>
            <input
              type="tel"
              placeholder="Mobile Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="kg-input"
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
              required
            />
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
