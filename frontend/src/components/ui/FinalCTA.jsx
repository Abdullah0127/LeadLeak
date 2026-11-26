import { motion, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";
import heroImage from "../../assets/chris-liverani.jpg";
import "./FinalCTA.css";

function FinalCTA() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="final-cta-section ll-section">
      {/* FINAL CTA - PHOTOGRAPHIC BACKGROUND */}
      <img
        src={heroImage}
        alt="Website monitoring visual"
        className="final-cta-photo"
        loading="lazy"
      />
      <div className="final-cta-overlay" aria-hidden="true" />

      <div className="ll-container final-cta-container">
        <motion.div
          className="final-cta-content"
          initial={{ opacity: 0, y: reduceMotion ? 0 : 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: reduceMotion ? 0 : 0.7 }}
        >
          <span className="ll-eyebrow ll-eyebrow--light">
            YOUR WEBSITE DESERVES BETTER
          </span>

          <h2 className="ll-title ll-title--light final-cta-title">
            Don't let a broken website
            <br />
            <span>cost you another lead.</span>
          </h2>

          <p className="ll-lead ll-lead--light final-cta-copy">
            Keep an eye on your website, catch problems early, and protect every
            opportunity with LeadLeak. Start monitoring your website with
            confidence.
          </p>

          {/* FINAL CTA - ACTION BUTTONS */}
          <div className="final-cta-actions">
            <Link to="/register" className="ll-btn ll-btn--sage">
              Start monitoring
              <span aria-hidden="true">↗</span>
            </Link>

            <Link to="/login" className="ll-btn ll-btn--outline">
              Sign in to your account
            </Link>
          </div>

          {/* FINAL CTA - TRUST NOTE */}
          <div className="final-cta-note">
            <span className="final-cta-check">✓</span>
            Simple setup. Clear monitoring. Better visibility.
          </div>
        </motion.div>

        {/* FINAL CTA - INLINE SIGNAL STRIP */}
        <motion.ul
          className="final-cta-strip"
          initial={{ opacity: 0, y: reduceMotion ? 0 : 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: reduceMotion ? 0 : 0.7, delay: 0.15 }}
        >
          <li>
            <span className="final-cta-strip-dot" aria-hidden="true" />
            <span className="final-cta-strip-text">
              <strong>Website monitoring</strong>
              <span>Stay informed about website issues</span>
            </span>
          </li>

          <li>
            <span className="final-cta-strip-dot" aria-hidden="true" />
            <span className="final-cta-strip-text">
              <strong>Uptime tracking</strong>
              <span>Know when your site is down</span>
            </span>
            <span className="final-cta-strip-tag">Preview</span>
          </li>

          <li>
            <span className="final-cta-strip-dot" aria-hidden="true" />
            <span className="final-cta-strip-text">
              <strong>SSL Security</strong>
              <span>Certificate monitoring</span>
            </span>
            <span className="final-cta-strip-check" aria-hidden="true">
              ✓
            </span>
          </li>
        </motion.ul>
      </div>
    </section>
  );
}

export default FinalCTA;
