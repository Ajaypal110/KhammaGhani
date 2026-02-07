import { useState } from "react";
import { auth } from "../firebase";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";

function OtpLogin() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [confirmResult, setConfirmResult] = useState(null);

  const sendOtp = async () => {
    window.recaptchaVerifier = new RecaptchaVerifier(
      auth,
      "recaptcha-container",
      { size: "invisible" }
    );

    const result = await signInWithPhoneNumber(
      auth,
      "+91" + phone,
      window.recaptchaVerifier
    );

    setConfirmResult(result);
    alert("OTP sent");
  };

  const verifyOtp = async () => {
    const res = await confirmResult.confirm(otp);

    // 🔐 Send Firebase token to backend
    const token = await res.user.getIdToken();

    const { data } = await API.post("/auth/firebase-login", {
      token,
      phone,
    });

    localStorage.setItem("token", data.token);
    navigate("/");
  };

  return (
    <div>
      <h2>Login with Mobile</h2>

      {!confirmResult ? (
        <>
          <input
            placeholder="Mobile number"
            onChange={(e) => setPhone(e.target.value)}
          />
          <button onClick={sendOtp}>Send OTP</button>
        </>
      ) : (
        <>
          <input
            placeholder="Enter OTP"
            onChange={(e) => setOtp(e.target.value)}
          />
          <button onClick={verifyOtp}>Verify OTP</button>
        </>
      )}

      <div id="recaptcha-container"></div>
    </div>
  );
}

export default OtpLogin;
