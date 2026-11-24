
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import "./FeaturesWithPanel.css";

// FEATURES - REAL PREVIEW IMAGES
import chrisLiverani from "../../assets/chris-liverani.jpg";
import markusWinkler from "../../assets/markus-winkler.jpg";
import nvidiaImage from "../../assets/nvidia.png";
import sslImage from "../../assets/ssl.jpg";

// FEATURES - PHOTO SHOWN INSIDE EACH PREVIEW CARD
const PREVIEW_PHOTOS = {
  uptime: {
    src: nvidiaImage,
    alt: "Server racks running in a data center",
    caption: "Server infrastructure",
  },
  ssl: {
    src: sslImage,
    alt: "Secure SSL padlock illustration",
    caption: "Encrypted connection",
  },
  speed: {
    src: chrisLiverani,
    alt: "Performance chart on a monitor",
    caption: "Performance data",
  },
  forms: {
    src: markusWinkler,
    alt: "Typewriter with the word Contact",
    caption: "Contact form check",
  },
};

function PreviewPhoto({ type }) {
  const photo = PREVIEW_PHOTOS[type];

  return (
    <div className="preview-photo">
      <img src={photo.src} alt={photo.alt} loading="lazy" />
      <span className="preview-photo-tag">
        <span className="preview-photo-dot" />
        {photo.caption}
      </span>
    </div>
  );
}

const features = [
  {
    number: "01",
    title: "Uptime Monitoring",
    description:
      "Know immediately when your website goes offline. LeadLeak keeps checking your website so you can respond before customers notice.",
    label: "Website availability",
    type: "uptime",
  },
  {
    number: "02",
    title: "SSL Monitoring",
    description:
      "Keep your website secure. Track SSL certificate validity and identify certificate problems before they affect visitor trust.",
    label: "Website security",
    type: "ssl",
  },
  {
    number: "03",
    title: "Response Time",
    description:
      "Understand how quickly your website responds. Track performance changes and identify slowdowns.",
    label: "Performance tracking",
    type: "speed",
  },
  {
    number: "04",
    title: "Form Monitoring",
    description:
      "Protect your incoming leads. Check whether your website contact forms are working correctly.",
    label: "Lead protection",
    type: "forms",
  },
];

// Visual preview for each LeadLeak feature
function FeaturePreview({ type }) {
  if (type === "uptime") {
    return (
      <div className="preview-dashboard">
        <div className="preview-topbar">
          <span className="preview-brand">LEADLEAK</span>
          <span className="preview-status">
            <span className="status-dot" />
            Monitoring preview
          </span>
        </div>

        <div className="preview-content">
          <PreviewPhoto type="uptime" />
          <span className="preview-label">WEBSITE STATUS</span>
          <h3>Website is online</h3>
          <div className="uptime-value">99.98%</div>
          <p className="preview-muted">Illustrative uptime percentage</p>

          <div className="uptime-bars">
            {Array.from({ length: 28 }, (_, index) => (
              <span key={index} />
            ))}
          </div>

          <div className="preview-footer">
            <span>Last check</span>
            <strong>Preview data</strong>
          </div>
        </div>
      </div>
    );
  }

  if (type === "ssl") {
    return (
      <div className="preview-dashboard">
        <div className="preview-topbar">
          <span className="preview-brand">LEADLEAK</span>
          <span className="preview-status">
            <span className="status-dot" />
            Security preview
          </span>
        </div>

        <div className="preview-content">
          <PreviewPhoto type="ssl" />
          <div className="ssl-icon">✓</div>
          <span className="preview-label">SSL CERTIFICATE</span>
          <h3>Connection is secure</h3>
          <p className="preview-muted">
            Your certificate status preview
          </p>

          <div className="ssl-details">
            <div>
              <span>Certificate status</span>
              <strong>Valid</strong>
            </div>
            <div>
              <span>Website protocol</span>
              <strong>HTTPS</strong>
            </div>
            <div>
              <span>Expiry tracking</span>
              <strong>Enabled</strong>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (type === "speed") {
    return (
      <div className="preview-dashboard">
        <div className="preview-topbar">
          <span className="preview-brand">LEADLEAK</span>
          <span className="preview-status">Performance preview</span>
        </div>

        <div className="preview-content">
          <PreviewPhoto type="speed" />
          <span className="preview-label">RESPONSE TIME</span>
          <h3>Website performance</h3>

          <div className="speed-value">
            245<span>ms</span>
          </div>

          <p className="preview-muted">
            Example response time measurement
          </p>

          <div className="speed-chart">
            {[45, 65, 52, 80, 60, 72, 48, 90, 68, 76, 55, 82].map(
              (height, index) => (
                <span key={index} style={{ height: `${height}%` }} />
              )
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="preview-dashboard">
      <div className="preview-topbar">
        <span className="preview-brand">LEADLEAK</span>
        <span className="preview-status">Form preview</span>
      </div>

      <div className="preview-content">
        <PreviewPhoto type="forms" />
        <span className="preview-label">CONTACT FORM CHECK</span>
        <h3>Lead form monitoring</h3>
        <p className="preview-muted">
          Example contact form monitoring status
        </p>

        <div className="form-preview">
          <div className="form-preview-field">
            <span>Name</span>
            <div />
          </div>
          <div className="form-preview-field">
            <span>Email address</span>
            <div />
          </div>
          <div className="form-preview-field">
            <span>Message</span>
            <div className="message-field" />
          </div>
          <div className="form-preview-button">
            Form check preview
          </div>
        </div>
      </div>
    </div>
  );
}

function FeaturesWithPanel() {
  const [active, setActive] = useState(0);

  return (
    <section className="features-panel-section" id="features">
      <div className="features-panel-container">
        <div className="features-panel-heading">
          <span className="features-panel-eyebrow">
            COMPLETE WEBSITE PROTECTION
          </span>

          <h2>
            Everything your website needs.
            <br />
            <span>Nothing important missed.</span>
          </h2>

          <p>
            From website availability to contact form health,
            LeadLeak helps you identify problems before they
            turn into lost opportunities.
          </p>
        </div>

        <div className="features-panel-layout">
          {/* LEFT SIDE - FEATURE LIST */}
          <div className="features-list">
            {features.map((feature, index) => (
              <div
                className={`feature-item ${
                  active === index ? "active" : ""
                }`}
                key={feature.number}
                onClick={() => setActive(index)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    setActive(index);
                  }
                }}
                role="button"
                tabIndex={0}
                aria-pressed={active === index}
              >
                <div className="feature-item-heading">
                  <span className="feature-item-number">
                    {feature.number}
                  </span>

                  <span className="feature-item-title">
                    {feature.title}
                  </span>

                  <span className="feature-item-arrow">
                    {active === index ? "−" : "+"}
                  </span>
                </div>

                <AnimatePresence initial={false}>
                  {active === index && (
                    <motion.div
                      className="feature-item-description"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <p>{feature.description}</p>
                      <span>{feature.label}</span>

                      {/* PREVIEW ON MOBILE */}
                      <div className="mobile-feature-preview">
                        <FeaturePreview type={feature.type} />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

          {/* RIGHT SIDE - LARGE PREVIEW */}
          <div className="desktop-feature-preview">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
                className="desktop-preview-inner"
              >
                <FeaturePreview type={features[active].type} />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}

export default FeaturesWithPanel;
