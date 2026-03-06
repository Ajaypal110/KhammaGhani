import { useState } from "react";
import { auth, googleProvider } from "../firebase";
import { signInWithPopup } from "firebase/auth";
import API from "../api/axios";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState("login"); // login | otp

  const sendOtp = async () => {
    await API.post("/auth/send-email-otp", { email, phone });
    setStep("otp");
  };

  const verifyOtp = async () => {
    const res = await API.post("/auth/verify-otp", { email, phone, otp });
    localStorage.setItem("token", res.data.token);
    alert("Logged in");
  };

  const googleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      const res = await API.post("/auth/google-login", {
        email: user.email,
        name: user.displayName,
        profileImage: user.photoURL,
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role || "user");
      localStorage.setItem("userName", res.data.name || user.displayName);
      alert("Google login success");
    } catch (err) {
      alert(err.response?.data?.message || "Google login failed");
    }
  };

  return (
    <div>
      <h2>Login / Register</h2>

      <input placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
      <input placeholder="Mobile (optional)" onChange={(e) => setPhone(e.target.value)} />

      {step === "login" && (
        <button onClick={sendOtp}>Login with Email OTP</button>
      )}

      {step === "otp" && (
        <>
          <input placeholder="Enter OTP" onChange={(e) => setOtp(e.target.value)} />
          <button onClick={verifyOtp}>Verify OTP</button>
        </>
      )}

      <hr />

      <button onClick={googleSignIn}>Continue with Google</button>
    </div>
  );
}
