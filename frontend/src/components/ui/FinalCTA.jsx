import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import heroImage from "../../assets/chris-liverani.jpg";
import sslImage from "../../assets/ssl.jpg";
import serverImage from "../../assets/nvidia.png";
import "./FinalCTA.css";

function FinalCTA() {
  return (
    <section className="final-cta-section">
      <div className="final-cta-container">
        {/* FINAL CTA - LEFT CONTENT */}
        <motion.div
          className="final-cta-content"
          initial={{ opacity: 0, x: -25 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="final-cta-eyebrow">
            YOUR WEBSITE DESERVES BETTER
          </span>

          <h2>
            Don't let a broken website
            <br />
            <span>cost you another lead.</span>
          </h2>

          <p>
            Keep an eye on your website, catch problems early, and protect every
            opportunity with LeadLeak. Start monitoring your website with
            confidence.
          </p>

          {/* FINAL CTA - ACTION BUTTONS */}
          <div className="final-cta-actions">
            <Link to="/register" className="final-cta-primary">
              Start monitoring
              <span aria-hidden="true">↗</span>
            </Link>

            <Link to="/login" className="final-cta-secondary">
              Sign in to your account
            </Link>
          </div>

          {/* FINAL CTA - TRUST NOTE */}
          <div className="final-cta-note">
            <span className="final-cta-check">✓</span>
            Simple setup. Clear monitoring. Better visibility.
          </div>
        </motion.div>

        {/* FINAL CTA - IMAGE VISUAL */}
        <motion.div
          className="final-cta-visual"
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.15 }}
        >
          <div className="final-cta-image-wrapper">
            <img
              src={heroImage}
              alt="Website monitoring visual"
              className="final-cta-main-image"
            />

            <div className="final-cta-image-overlay" />

            {/* FINAL CTA - MONITORING CARD */}
            <div className="final-cta-monitor-card">
              <span className="monitor-card-indicator" />
              <div>
                <strong>Website monitoring</strong>
                <span>Stay informed about website issues</span>
              </div>
            </div>

            {/* FINAL CTA - UPTIME CARD */}
            <div className="final-cta-uptime-card">
              <img src={serverImage} alt="" />

              <div className="uptime-card-content">
                <strong>Uptime tracking</strong>
                <span>Know when your site is down</span>
              </div>

              <span className="uptime-card-live">
                <span className="uptime-card-live-dot" />
                Preview
              </span>
            </div>

            {/* FINAL CTA - SSL CARD */}
            <div className="final-cta-ssl-card">
              <img src={sslImage} alt="" />

              <div className="ssl-card-content">
                <strong>SSL Security</strong>
                <span>Certificate monitoring</span>
              </div>

              <span className="ssl-card-check">✓</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default FinalCTA;
