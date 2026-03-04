import React, { useEffect } from "react";
import "../styles/policies.css";

export default function Refund() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="policy-container">
      <h1>Refund and Cancellation Policy</h1>
      
      <div className="policy-section">
        <h2>1. Order Cancellation Rules</h2>
        <p>
          At KhammaGhani, we strive to ensure a seamless experience. Our cancellation rules are as follows:
        </p>
        <ul>
          <li><strong>Immediate Cancellation:</strong> You can cancel your order within 2 minutes of placement for a full refund.</li>
          <li><strong>Restaurant Acceptance:</strong> Once the restaurant accepts or starts preparing your order, cancellation is no longer possible.</li>
          <li><strong>Agent Assignment:</strong> If a delivery agent has already been assigned and is on the way to the restaurant, cancellation requests will not be accepted.</li>
        </ul>
      </div>

      <div className="policy-section">
        <h2>2. Refund Eligibility</h2>
        <p>
          You may be eligible for a refund in the following cases:
        </p>
        <ul>
          <li>The order was cancelled within the allowed time frame (2 minutes).</li>
          <li>The restaurant is unable to fulfill the order for any reason.</li>
          <li>Items provided are incorrect or missing (subject to verification).</li>
          <li>The food quality is significantly below standard (requires photo evidence).</li>
        </ul>
      </div>

      <div className="policy-section">
        <h2>3. Refund Processing Time</h2>
        <p>
          Once a refund is approved, it usually takes **5–7 business days** for the amount to reflect in your original payment method. The exact duration depends on the policies of your bank or payment provider.
        </p>
      </div>

      <div className="policy-section">
        <h2>4. Non-Refundable Situations</h2>
        <p>
          Refunds will not be issued in the following circumstances:
        </p>
        <ul>
          <li>Incorrect delivery address provided by the user.</li>
          <li>User is unavailable to receive the order at the time of delivery.</li>
          <li>Cancellation request made after the restaurant has started preparation.</li>
          <li>Dish preferences not being to the user's personal taste.</li>
        </ul>
      </div>

      <div className="policy-section">
        <h2>5. Payment Method Refund Process</h2>
        <p>
          Refunds are always processed back to the **original payment method** used during the transaction. We do not provide cash refunds for online payments. If you used a coupon or discount, only the actual amount paid will be refunded.
        </p>
      </div>

      <div className="policy-section">
        <h2>6. Customer Support for Refund Issues</h2>
        <p>
          If you have any issues regarding a refund or if your refund has not appeared after 7 business days, please reach out to our support team:
          <br />
          <strong>Email:</strong> khammaghani14@gmail.com
          <br />
          <strong>WhatsApp Support:</strong> +91 98765 43210 (Mon–Sun, 9 AM – 11 PM)
        </p>
      </div>
    </div>
  );
}
