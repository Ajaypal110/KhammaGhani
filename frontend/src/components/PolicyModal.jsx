import { useEffect } from "react";

const policyContent = {
  terms: {
    title: "Terms and Conditions",
    sections: [
      { heading: "1. Introduction", text: "Welcome to KhammaGhani. By accessing or using our website and services, you agree to comply with and be bound by these Terms and Conditions. Please read them carefully. If you do not agree with any part of these terms, you must not use our service." },
      { heading: "2. User Responsibilities", text: "As a user of KhammaGhani, you agree to:", list: ["Provide accurate and complete information during registration.", "Maintain the confidentiality of your account credentials.", "Use the platform only for lawful purposes.", "Not engage in any activity that could damage, disable, or impair the platform."] },
      { heading: "3. Account Registration", text: "To place an order, you may be required to create an account. You are responsible for all activities that occur under your account. We reserve the right to suspend or terminate accounts that provide false information or violate these terms." },
      { heading: "4. Ordering and Payments", text: "All orders placed through KhammaGhani are subject to acceptance by the restaurant. Prices are listed in INR and include applicable taxes. Payments must be made via the provided online payment methods at the time of checkout. Once an order is confirmed, changes may not be possible." },
      { heading: "5. Cash on Delivery (COD) Fee", text: "Orders placed via Cash on Delivery (COD) will incur an additional, non-refundable ₹20 handling fee to cover payment collection processing." },
      { heading: "6. Delivery Policy", text: "Delivery times provided are estimates and may vary due to traffic, weather, or restaurant preparation times. Our delivery area is limited, and we reserve the right to refuse orders outside this area." },
      { heading: "7. Cancellation Policy", text: "Orders can only be cancelled within 2 minutes of placement. Once the restaurant begins preparing the food, cancellations will not be accepted, and no refunds will be issued for such requests." },
      { heading: "8. Prohibited Activities", text: "Users are prohibited from:", list: ["Using fraudulent payment methods.", "Attempting to bypass security features.", "Using automated systems (bots) to access the service.", "Harassing our staff or delivery partners."] },
      { heading: "9. Limitation of Liability", text: "KhammaGhani facilitates the marketplace between customers and restaurants. We are not liable for the quality of food provided by restaurants or for any delays caused by external factors." },
      { heading: "10. Changes to Terms", text: "We reserve the right to modify these Terms and Conditions at any time. Changes will be effective immediately upon posting on the website." },
      { heading: "11. Contact Information", text: "Email: khammaghani14@gmail.com | Address: Udaipur, Rajasthan, India" },
    ],
  },
  privacy: {
    title: "Privacy Policy",
    sections: [
      { heading: "1. Introduction", text: "At KhammaGhani, we value your privacy and are committed to protecting your personal data. This Privacy Policy outlines how we collect, use, and safeguard your information." },
      { heading: "2. Information We Collect", text: "We collect information that allows us to provide a better service to you, including:", list: ["Name: To identify you during orders and delivery.", "Phone Number: For order updates and delivery coordination.", "Address: To deliver your food to the correct location.", "Payment Information: Processed securely via our payment partners.", "Device Information: Such as IP address and browser type."] },
      { heading: "3. How We Use Your Information", text: "Your information is used to:", list: ["Process and deliver your food orders.", "Provide customer support and resolve issues.", "Send order confirmations and updates.", "Improve our platform and user experience.", "Comply with legal obligations."] },
      { heading: "4. Data Protection and Security", text: "We implement a variety of security measures to maintain the safety of your personal information. Your data is stored on secure servers, and all payment transactions are encrypted using SSL technology." },
      { heading: "5. Cookies and Tracking", text: "We use cookies to enhance your experience, remember your preferences, and track website usage. You can choose to disable cookies through your browser settings." },
      { heading: "6. Third-Party Services", text: "We may share your information with trusted third-party service providers strictly for the purpose of fulfilling your orders. We do not sell or rent your personal information to third parties for marketing purposes." },
      { heading: "7. User Rights", text: "You have the right to access, correct, or delete your personal information stored with us. You can manage your profile settings through your account or contact our support team." },
      { heading: "8. Policy Updates", text: "We may update this Privacy Policy from time to time. We will notify you of any significant changes by posting the new policy on this page." },
      { heading: "9. Contact Information", text: "Email: khammaghani14@gmail.com | Address: Udaipur, Rajasthan, India" },
    ],
  },
  refund: {
    title: "Refund and Cancellation Policy",
    sections: [
      { heading: "1. Order Cancellation Rules", text: "At KhammaGhani, we strive to ensure a seamless experience. Our cancellation rules are as follows:", list: ["Immediate Cancellation: You can cancel your order within 2 minutes of placement for a full refund.", "Restaurant Acceptance: Once the restaurant accepts or starts preparing your order, cancellation is no longer possible.", "Agent Assignment: If a delivery agent has already been assigned and is on the way, cancellation requests will not be accepted."] },
      { heading: "2. Refund Eligibility", text: "You may be eligible for a refund in the following cases:", list: ["The order was cancelled within the allowed time frame (2 minutes).", "The restaurant is unable to fulfill the order for any reason.", "Items provided are incorrect or missing (subject to verification).", "The food quality is significantly below standard (requires photo evidence)."] },
      { heading: "3. Refund Processing Time", text: "Once a refund is approved, it usually takes 5–7 business days for the amount to reflect in your original payment method." },
      { heading: "4. Non-Refundable Situations", text: "Refunds will not be issued in the following circumstances:", list: ["Incorrect delivery address provided by the user.", "User is unavailable to receive the order at the time of delivery.", "Cancellation request made after the restaurant has started preparation.", "Dish preferences not being to the user's personal taste.", "The ₹20 handling fee specifically for Cash on Delivery (COD) orders is entirely non-refundable even if the order qualifies for a refund."] },
      { heading: "5. Payment Method Refund Process", text: "Refunds are always processed back to the original payment method used during the transaction. We do not provide cash refunds for online payments." },
      { heading: "6. Customer Support", text: "Email: khammaghani14@gmail.com | Address: Udaipur, Rajasthan, India" },
    ],
  },
};

export default function PolicyModal({ type, onClose }) {
  const policy = policyContent[type];

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  if (!policy) return null;

  return (
    <div className="policy-modal-overlay" onClick={onClose}>
      <div className="policy-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="policy-modal-header">
          <h2>{policy.title}</h2>
          <button className="policy-modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="policy-modal-body">
          {policy.sections.map((section, i) => (
            <div key={i} className="policy-modal-section">
              <h3>{section.heading}</h3>
              <p>{section.text}</p>
              {section.list && (
                <ul>
                  {section.list.map((item, j) => (
                    <li key={j}>{item}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
