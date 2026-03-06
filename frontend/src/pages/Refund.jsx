import React, { useEffect } from "react";
import "../styles/policies.css";
import SEO from "../components/SEO";

export default function Refund() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="policy-container">
      <SEO 
        title="Refund and Cancellation Policy - KhammaGhani"
        description="Understand KhammaGhani's refund and cancellation policies, eligibility criteria, and processing times for food orders."
        keywords="refund policy, cancellation rules, KhammaGhani refund, money back guarantee"
        url="/refund"
      />
      <h1>Refund and Cancellation Policy</h1>
      
      <div className="policy-section">
        <h2>1. Order Cancellation Rules</h2>
        <p>
          At KhammaGhani, we strive to ensure a seamless experience. Our cancellation rules are as follows:
        </p>
        <ul>
          <li><strong>Quick Cancellation (Within 2 Mins):</strong> Cancel within 2 minutes of placement for a <strong>100% full refund</strong>.</li>
          <li><strong>Late Cancellation (After 2 Mins):</strong> After 2 minutes, a <strong>10% cancellation fee</strong> will be deducted. The remaining 90% will be refunded.</li>
          <li><strong>Food Prepared/Out for Delivery:</strong> Once the restaurant has prepared the food or the order is out for delivery, cancellation may not be allowed or a refund may not be provided.</li>
          <li><strong>Restaurant Cancellation:</strong> If the restaurant cancels your order for any reason, you will receive a <strong>100% full refund</strong>.</li>
          <li><strong>Failed Payments:</strong> If payment is deducted but the order fails, the full amount will be automatically refunded.</li>
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
        <ul>
          <li><strong>UPI / Wallet:</strong> Within <strong>2–5 business days</strong>.</li>
          <li><strong>Debit / Credit Card:</strong> Within <strong>5–10 business days</strong>.</li>
        </ul>
        <p>
          The exact duration depends on the policies of your bank or payment provider. Refunds are always processed back to the original payment method.
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
          <strong>Address:</strong> Udaipur, Rajasthan, India
        </p>
      </div>
    </div>
  );
}
