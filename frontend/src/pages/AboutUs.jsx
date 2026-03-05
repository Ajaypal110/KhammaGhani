import { useEffect } from "react";
import "../styles/aboutUs.css";

const franchiseCities = [
  { name: "Jaipur", emoji: "🏰" },
  { name: "Delhi", emoji: "🏛️" },
  { name: "Mumbai", emoji: "🌊" },
  { name: "Udaipur", emoji: "🏖️" },
  { name: "Jodhpur", emoji: "🏜️" },
  { name: "Goa", emoji: "🌴" },
  { name: "Bangalore", emoji: "💻" },
  { name: "Pune", emoji: "🏞️" },
  { name: "Noida", emoji: "🏢" },
  { name: "Hyderabad", emoji: "🍗" },
  { name: "Surat", emoji: "💎" },
  { name: "Kashmir", emoji: "🏔️" },
  { name: "Sikkim", emoji: "⛰️" },
  { name: "Darjeeling", emoji: "🍵" },
  { name: "Bhopal", emoji: "🕌" },
];

const offers = [
  { icon: "📱", label: "Easy Online Ordering" },
  { icon: "🔒", label: "Secure Payments" },
  { icon: "🚀", label: "Fast Delivery" },
  { icon: "🥗", label: "Fresh & Quality Food" },
  { icon: "✅", label: "Reliable Service" },
];

export default function AboutUs() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="about-page">
      {/* =================== HERO =================== */}
      <section className="about-hero">
        <div className="about-hero-content">
          <h1>
            About <span>KhammaGhani</span>
          </h1>
          <p>
            Connecting customers with our official restaurant franchises across
            India — delivering authentic Rajasthani flavors, right to your doorstep.
          </p>
        </div>
      </section>

      {/* =================== INTRO + MISSION =================== */}
      <section className="about-section">
        <h2 className="about-section-title">Who We Are</h2>
        <p className="about-section-subtitle">
          A platform built with passion for food and hospitality
        </p>

        <div className="about-intro-grid">
          <div className="about-intro-card">
            <div className="card-icon orange">🍛</div>
            <h3>Our Story</h3>
            <p>
              KhammaGhani is a food ordering platform that connects customers
              with official KhammaGhani restaurant franchises across India. The
              platform allows users to browse menus, place orders, and enjoy
              delicious meals delivered from trusted KhammaGhani locations —
              ensuring every bite carries the authentic taste of Rajasthan.
            </p>
          </div>

          <div className="about-intro-card">
            <div className="card-icon blue">🎯</div>
            <h3>Our Mission</h3>
            <p>
              To deliver high-quality food with fast and reliable service while
              maintaining the authentic taste and experience of the KhammaGhani
              brand. We believe great food should be accessible to everyone, and
              every order should feel like a celebration of flavors.
            </p>
          </div>
        </div>
      </section>

      {/* =================== FRANCHISE NETWORK =================== */}
      <section className="about-franchise-section">
        <div className="about-section">
          <h2 className="about-section-title">Our Franchise Network</h2>
          <p className="about-section-subtitle">
            Currently operating <strong>15 official franchises</strong> across
            India's most vibrant cities
          </p>

          <div className="franchise-grid">
            {franchiseCities.map((city) => (
              <div key={city.name} className="franchise-card">
                <div className="city-icon">{city.emoji}</div>
                <h4>{city.name}</h4>
                <p>Official KhammaGhani Franchise</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =================== WHAT WE OFFER =================== */}
      <section className="about-section">
        <h2 className="about-section-title">What We Offer</h2>
        <p className="about-section-subtitle">
          Everything you need for a seamless food ordering experience
        </p>

        <div className="offer-grid">
          {offers.map((item) => (
            <div key={item.label} className="offer-card">
              <div className="offer-icon">{item.icon}</div>
              <h4>{item.label}</h4>
            </div>
          ))}
        </div>
      </section>

      {/* =================== VISION =================== */}
      <section className="about-section">
        <div className="about-vision">
          <h3>🌟 Our Vision</h3>
          <p>
            To expand the KhammaGhani franchise network across more cities
            in India and beyond, while maintaining the highest standards of
            food quality, customer satisfaction, and the authentic Rajasthani
            dining experience that our brand is known for.
          </p>
        </div>
      </section>

      {/* =================== CONTACT =================== */}
      <section className="about-section" style={{ paddingTop: 0 }}>
        <div className="about-contact-card">
          <div className="contact-icon">📩</div>
          <h3>Get In Touch</h3>
          <p>Have questions or want to partner with us?</p>
          <a href="mailto:khammaghani14@gmail.com">khammaghani14@gmail.com</a>
          <p style={{ marginTop: "8px", fontSize: "13px" }}>
            Udaipur, Rajasthan, India
          </p>
        </div>
      </section>
    </div>
  );
}
