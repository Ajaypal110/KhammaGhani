import React, { useEffect } from "react";
import "../styles/policies.css";

export default function Privacy() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="policy-container">
      <h1>Privacy Policy</h1>
      
      <div className="policy-section">
        <h2>1. Introduction</h2>
        <p>
          At KhammaGhani, we value your privacy and are committed to protecting your personal data. This Privacy Policy outlines how we collect, use, and safeguard your information when you visit our website or use our services.
        </p>
      </div>

      <div className="policy-section">
        <h2>2. Information We Collect</h2>
        <p>
          We collect information that allows us to provide a better service to you, including:
        </p>
        <ul>
          <li><strong>Name:</strong> To identify you during orders and delivery.</li>
          <li><strong>Phone Number:</strong> For order updates and delivery coordination.</li>
          <li><strong>Address:</strong> To deliver your food to the correct location.</li>
          <li><strong>Payment Information:</strong> Processed securely via our payment partners (we do not store your full card details).</li>
          <li><strong>Device Information:</strong> Such as IP address and browser type for security and analytics.</li>
        </ul>
      </div>

      <div className="policy-section">
        <h2>3. How We Use Your Information</h2>
        <p>
          Your information is used to:
        </p>
        <ul>
          <li>Process and deliver your food orders.</li>
          <li>Provide customer support and resolve issues.</li>
          <li>Send order confirmations and updates.</li>
          <li>Improve our platform and user experience.</li>
          <li>Comply with legal obligations.</li>
        </ul>
      </div>

      <div className="policy-section">
        <h2>4. Data Protection and Security</h2>
        <p>
          We implement a variety of security measures to maintain the safety of your personal information. Your data is stored on secure servers, and all payment transactions are encrypted using SSL technology. While we strive to protect your data, no method of transmission over the internet is 100% secure.
        </p>
      </div>

      <div className="policy-section">
        <h2>5. Cookies and Tracking</h2>
        <p>
          We use cookies to enhance your experience, remember your preferences, and track website usage. You can choose to disable cookies through your browser settings, though some features of our platform may not function correctly.
        </p>
      </div>

      <div className="policy-section">
        <h2>6. Third-Party Services</h2>
        <p>
          We may share your information with trusted third-party service providers (e.g., payment processors, delivery partners) strictly for the purpose of fulfilling your orders. We do not sell or rent your personal information to third parties for marketing purposes.
        </p>
      </div>

      <div className="policy-section">
        <h2>7. User Rights</h2>
        <p>
          You have the right to access, correct, or delete your personal information stored with us. You can manage your profile settings through your account or contact our support team for assistance with data-related requests.
        </p>
      </div>

      <div className="policy-section">
        <h2>8. Policy Updates</h2>
        <p>
          We may update this Privacy Policy from time to time. We will notify you of any significant changes by posting the new policy on this page with an updated "Last Modified" date.
        </p>
      </div>

      <div className="policy-section">
        <h2>9. Contact Information</h2>
        <p>
          If you have any questions or concerns regarding our Privacy Policy or data handling practices, please contact us at:
          <br />
          <strong>Email:</strong> khammaghani14@gmail.com
          <br />
          <strong>Address:</strong> Udaipur, Rajasthan, India
        </p>
      </div>
    </div>
  );
}
