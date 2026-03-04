import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from "react-icons/fa";
import { Link } from "react-router-dom";
import "../styles/footer.css";

export default function Footer() {
  return (
    <footer className="global-footer">
      <div className="footer-container">
        <div className="footer-col about-col">
          <div className="footer-brand">
            <span className="brand-icon">KG</span>
            <span className="brand-text">Khamma <span className="brand-accent">Ghani</span></span>
          </div>
          <p className="footer-desc">
            Experience the royal flavors of Rajasthan delivered right to your doorstep. Authentic spices, traditional recipes, and unmatched hospitality.
          </p>
        </div>

        <div className="footer-col links-col">
          <h4>Quick Links</h4>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/profile">My Profile</Link></li>
            <li><Link to="/cart">Cart</Link></li>
            <li><a href="#">About Us</a></li>
          </ul>
        </div>

        <div className="footer-col legal-col">
          <h4>Legal</h4>
          <ul>
            <li><Link to="/terms">Terms & Conditions</Link></li>
            <li><Link to="/privacy">Privacy Policy</Link></li>
            <li><Link to="/refund-policy">Refund Policy</Link></li>
          </ul>
        </div>

        <div className="footer-col social-col">
          <h4>Connect With Us</h4>
          <div className="social-icons">
            <a href="#" className="social-icon" aria-label="Facebook"><FaFacebookF /></a>
            <a href="#" className="social-icon" aria-label="Twitter"><FaTwitter /></a>
            <a href="https://www.instagram.com/_khammaghani_restaurants/" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="Instagram"><FaInstagram /></a>
            <a href="#" className="social-icon" aria-label="LinkedIn"><FaLinkedinIn /></a>
          </div>
          <p className="footer-contact">khammaghani14@gmail.com</p>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} KhammaGhani. All rights reserved. Made with ❤️ for Rajasthan.</p>
      </div>
    </footer>
  );
}
