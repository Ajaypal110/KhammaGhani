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
  const [policyModal, setPolicyModal] = useState(null); // "terms" | "privacy" | null

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
        <h2 className="zomato-card-title">Sign Up</h2>

        {message && <p className="zomato-message">{message}</p>}

        <form onSubmit={registerHandler} className="zomato-form">
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="zomato-input"
            required
          />

          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="zomato-input"
            required
          />

          <input
            type="tel"
            placeholder="Mobile Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="zomato-input"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="zomato-input"
            required
          />

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

          <button type="submit" className="zomato-btn-primary" disabled={loading || !policyAccepted}>
            {loading ? "Signing up..." : "Sign Up"}
          </button>

          <div className="zomato-divider">
            <span>OR</span>
          </div>

          <button
            type="button"
            className="zomato-google-full-btn"
            onClick={googleRegisterHandler}
          >
            <img
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              alt="Google"
            />
            Continue with Google
          </button>

          <div className="zomato-register-link">
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
