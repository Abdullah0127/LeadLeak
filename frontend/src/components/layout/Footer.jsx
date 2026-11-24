import { Link } from "react-router-dom";
import "./Footer.css";
import logo from "../../assets/leadleak.png";

// FOOTER - REAL IMAGES FOR THE COVERAGE STRIP
import chrisLiverani from "../../assets/chris-liverani.jpg";
import markusWinkler from "../../assets/markus-winkler.jpg";
import nvidiaImage from "../../assets/nvidia.png";
import sslImage from "../../assets/ssl.jpg";

// FOOTER - WHAT LEADLEAK MONITORS
const COVERAGE = [
  {
    title: "Uptime monitoring",
    note: "Know when your site goes offline",
    image: nvidiaImage,
  },
  {
    title: "SSL monitoring",
    note: "Keep certificates healthy",
    image: sslImage,
  },
  {
    title: "Response time",
    note: "Spot slowdowns early",
    image: chrisLiverani,
  },
  {
    title: "Form monitoring",
    note: "Protect your incoming leads",
    image: markusWinkler,
  },
];

function Footer() {
  // FOOTER - BACK TO TOP
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="leadleak-footer">
      {/* FOOTER - NAVIGATION AREA */}
      <div className="footer-container">
        {/* FOOTER - MONITORING COVERAGE STRIP */}
        <div className="footer-coverage">
          {COVERAGE.map((item) => (
            <Link key={item.title} to="/#features" className="footer-coverage-card">
              <img src={item.image} alt="" loading="lazy" />

              <span className="footer-coverage-arrow" aria-hidden="true">
                ↗
              </span>

              <span className="footer-coverage-text">
                <strong>{item.title}</strong>
                <small>{item.note}</small>
              </span>
            </Link>
          ))}
        </div>

        <div className="footer-top">
          {/* FOOTER - BRAND */}
          <div className="footer-brand">
            <Link to="/" className="footer-logo">
              <img src={logo} alt="LeadLeak logo" />
            </Link>

            <p>
              Website monitoring and lead protection for businesses, developers,
              and agencies. Keep your website healthy and every opportunity
              protected.
            </p>

            {/* FOOTER - CONTACT CARD */}
            <a href="mailto:support@leadleak.com" className="footer-contact">
              <span className="footer-contact-icon">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <path d="m3.5 7 8.5 6 8.5-6" />
                </svg>
              </span>

              <span className="footer-contact-text">
                <small>Email us</small>
                <strong>support@leadleak.com</strong>
              </span>
            </a>
          </div>

          {/* FOOTER - PRODUCT LINKS */}
          <div className="footer-column">
            <h3>Product</h3>
            <Link to="/#features">Features</Link>
            <Link to="/#how-it-works">How It Works</Link>
            <Link to="/#pricing">Pricing</Link>
          </div>

          {/* FOOTER - COMPANY LINKS */}
          <div className="footer-column">
            <h3>Company</h3>
            <Link to="/#about">About Us</Link>
            <Link to="/#contact">Contact</Link>
            <Link to="/register">Get Started</Link>
          </div>

          {/* FOOTER - SUPPORT LINKS */}
          <div className="footer-column">
            <h3>Support</h3>
            <a href="mailto:support@leadleak.com">Email Support</a>
            <Link to="/#faq">FAQs</Link>
            <Link to="/#privacy">Privacy Policy</Link>
            <Link to="/#terms">Terms of Service</Link>
          </div>
        </div>

        {/* FOOTER - COPYRIGHT */}
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} LeadLeak. All rights reserved.</p>

          <p className="footer-tagline">
            <span className="footer-tagline-dot" />
            Built to protect every opportunity.
          </p>

          <button
            type="button"
            className="footer-top-button"
            onClick={scrollToTop}
            aria-label="Back to top"
          >
            Back to top
            <span aria-hidden="true">↑</span>
          </button>
        </div>
      </div>

      {/* FOOTER - BRAND WATERMARK */}
      <div className="footer-watermark" aria-hidden="true">
        <span>LeadLeak</span>
      </div>
    </footer>
  );
}

export default Footer;
