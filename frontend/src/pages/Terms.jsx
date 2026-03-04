import React, { useEffect } from "react";
import "../styles/policies.css";

export default function Terms() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="policy-container">
      <h1>Terms and Conditions</h1>
      
      <div className="policy-section">
        <h2>1. Introduction</h2>
        <p>
          Welcome to KhammaGhani. By accessing or using our website and services, you agree to comply with and be bound by these Terms and Conditions. Please read them carefully. If you do not agree with any part of these terms, you must not use our service.
        </p>
      </div>

      <div className="policy-section">
        <h2>2. User Responsibilities</h2>
        <p>
          As a user of KhammaGhani, you agree to:
        </p>
        <ul>
          <li>Provide accurate and complete information during registration.</li>
          <li>Maintain the confidentiality of your account credentials.</li>
          <li>Use the platform only for lawful purposes.</li>
          <li>Not engage in any activity that could damage, disable, or impair the platform.</li>
        </ul>
      </div>

      <div className="policy-section">
        <h2>3. Account Registration</h2>
        <p>
          To place an order, you may be required to create an account. You are responsible for all activities that occur under your account. We reserve the right to suspend or terminate accounts that provide false information or violate these terms.
        </p>
      </div>

      <div className="policy-section">
        <h2>4. Ordering and Payments</h2>
        <p>
          All orders placed through KhammaGhani are subject to acceptance by the restaurant. Prices are listed in INR and include applicable taxes. Payments must be made via the provided online payment methods at the time of checkout. Once an order is confirmed, changes may not be possible.
        </p>
      </div>

      <div className="policy-section">
        <h2>5. Delivery Policy</h2>
        <p>
          Delivery times provided are estimates and may vary due to traffic, weather, or restaurant preparation times. Our delivery area is limited, and we reserve the right to refuse orders outside this area. You must ensure that someone is available at the delivery address to receive the order.
        </p>
      </div>

      <div className="policy-section">
        <h2>6. Cancellation Policy</h2>
        <p>
          Orders can only be cancelled within 2 minutes of placement. Once the restaurant begins preparing the food, cancellations will not be accepted, and no refunds will be issued for such requests.
        </p>
      </div>

      <div className="policy-section">
        <h2>7. Prohibited Activities</h2>
        <p>
          Users are prohibited from:
        </p>
        <ul>
          <li>Using fraudulent payment methods.</li>
          <li>Attempting to bypass security features.</li>
          <li>Using automated systems (bots) to access the service.</li>
          <li>Harassing our staff or delivery partners.</li>
        </ul>
      </div>

      <div className="policy-section">
        <h2>8. Limitation of Liability</h2>
        <p>
          KhammaGhani facilitates the marketplace between customers and restaurants. We are not liable for the quality of food provided by restaurants or for any delays caused by external factors. Our total liability is limited to the amount paid for the specific order in question.
        </p>
      </div>

      <div className="policy-section">
        <h2>9. Changes to Terms</h2>
        <p>
          We reserve the right to modify these Terms and Conditions at any time. Changes will be effective immediately upon posting on the website. Your continued use of the platform constitutes acceptance of the updated terms.
        </p>
      </div>

      <div className="policy-section">
        <h2>10. Contact Information</h2>
        <p>
          If you have any questions regarding these Terms and Conditions, please contact us at:
          <br />
          <strong>Email:</strong> khammaghani14@gmail.com
          <br />
          <strong>Address:</strong> Udaipur, Rajasthan, India
        </p>
      </div>
    </div>
  );
}
