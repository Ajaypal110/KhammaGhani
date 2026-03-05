import { useState, useEffect } from "react";
import "../styles/contactUs.css";

export default function ContactUs() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Full name is required";
    if (!form.email.trim()) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Enter a valid email";
    if (!form.phone.trim()) errs.phone = "Phone number is required";
    if (!form.subject.trim()) errs.subject = "Subject is required";
    if (!form.message.trim()) errs.message = "Message is required";
    return errs;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setSending(true);

    try {
      await window.emailjs.send(
        "KhammaGhani@110125",
        "template_erekb7i",
        {
          user_name: form.name,
          user_email: form.email,
          phone: form.phone,
          user_massage: form.message,
        },
        "0xjutl8DL6lunqORh"
      );
      setSubmitted(true);
      setForm({ name: "", email: "", phone: "", subject: "", message: "" });
      setTimeout(() => setSubmitted(false), 5000);
    } catch (err) {
      alert("Failed to send message. Please try again later.");
      console.error("EmailJS error:", err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="contact-page">
      {/* =================== HERO =================== */}
      <section className="contact-hero">
        <div className="contact-hero-content">
          <h1>
            Contact <span>Us</span>
          </h1>
          <p>
            We are here to help you with your orders, feedback, and support.
            Reach out to us anytime!
          </p>
        </div>
      </section>

      {/* =================== INFO CARDS =================== */}
      <section className="contact-section">
        <h2 className="contact-section-title">Get In Touch</h2>
        <p className="contact-section-subtitle">
          Multiple ways to reach us — we're always happy to hear from you
        </p>

        <div className="contact-info-grid">
          <div className="contact-info-card">
            <div className="info-icon">📧</div>
            <h4>Email Us</h4>
            <p>
              <a href="mailto:khammaghani14@gmail.com">khammaghani14@gmail.com</a>
            </p>
            <p style={{ fontSize: "12px", marginTop: "6px" }}>We reply within 24 hours</p>
          </div>

          <div className="contact-info-card">
            <div className="info-icon">📞</div>
            <h4>Call Us</h4>
            <p>+91 80945 48637</p>
            <p style={{ fontSize: "12px", marginTop: "6px" }}>Customer Support Line</p>
          </div>

          <div className="contact-info-card">
            <div className="info-icon">🕐</div>
            <h4>Service Hours</h4>
            <p>9:00 AM – 10:00 PM</p>
            <p style={{ fontSize: "12px", marginTop: "6px" }}>Monday to Sunday</p>
          </div>
        </div>
      </section>

      {/* =================== FORM + MAP =================== */}
      <section className="contact-section" style={{ paddingTop: 0 }}>
        <div className="contact-main-grid">
          {/* ---- FORM ---- */}
          <div className="contact-form-card">
            <h3>📩 Send Us a Message</h3>

            {submitted && (
              <div className="contact-form-success">
                ✅ Your message has been sent successfully! We'll get back to you soon.
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="contact-form-row">
                <div>
                  <input
                    name="name"
                    placeholder="Full Name"
                    value={form.name}
                    onChange={handleChange}
                  />
                  {errors.name && <div className="contact-form-error">{errors.name}</div>}
                </div>
                <div>
                  <input
                    name="email"
                    placeholder="Email Address"
                    value={form.email}
                    onChange={handleChange}
                  />
                  {errors.email && <div className="contact-form-error">{errors.email}</div>}
                </div>
              </div>

              <div className="contact-form-row">
                <div>
                  <input
                    name="phone"
                    placeholder="Phone Number"
                    value={form.phone}
                    onChange={handleChange}
                  />
                  {errors.phone && <div className="contact-form-error">{errors.phone}</div>}
                </div>
                <div>
                  <input
                    name="subject"
                    placeholder="Subject"
                    value={form.subject}
                    onChange={handleChange}
                  />
                  {errors.subject && <div className="contact-form-error">{errors.subject}</div>}
                </div>
              </div>

              <textarea
                name="message"
                placeholder="Write your message here..."
                value={form.message}
                onChange={handleChange}
              />
              {errors.message && <div className="contact-form-error">{errors.message}</div>}

              <button type="submit" className="contact-submit-btn" disabled={sending}>
                {sending ? "Sending..." : "Send Message"}
              </button>
            </form>
          </div>

          {/* ---- MAP ---- */}
          <div className="contact-map-card">
            <iframe
              title="KhammaGhani Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d115771.67275874945!2d73.62993831328978!3d24.585445199999996!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3967e56c0f28d8e3%3A0xb21d73b36e2e0e84!2sUdaipur%2C%20Rajasthan!5e0!3m2!1sen!2sin!4v1709400000000!5m2!1sen!2sin"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>

      {/* =================== FRANCHISE SUPPORT =================== */}
      <section className="contact-section" style={{ paddingTop: 0 }}>
        <div className="contact-franchise-banner">
          <div className="franchise-emoji">🏪</div>
          <div>
            <h3>Franchise Support</h3>
            <p>
              KhammaGhani operates through 15 official franchises across India.
              If you have any issues related to your orders, delivery, food
              quality, or franchise inquiries, our dedicated support team is
              here to assist you. Reach out to us via email or phone and we'll
              resolve your concern as quickly as possible.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
