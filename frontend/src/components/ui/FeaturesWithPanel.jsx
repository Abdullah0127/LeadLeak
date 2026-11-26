import { useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
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
  const tabRefs = useRef([]);
  const reduceMotion = useReducedMotion();

  const current = features[active];

  // KEYBOARD NAVIGATION FOR THE TAB RAIL (ARROWS, HOME, END)
  const handleTabKeyDown = (event) => {
    const lastIndex = features.length - 1;
    let next = null;

    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      next = active === lastIndex ? 0 : active + 1;
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      next = active === 0 ? lastIndex : active - 1;
    } else if (event.key === "Home") {
      next = 0;
    } else if (event.key === "End") {
      next = lastIndex;
    }

    if (next !== null) {
      event.preventDefault();
      setActive(next);
      tabRefs.current[next]?.focus();
    }
  };

  return (
    <section className="features-section ll-section" id="features">
      <div className="ll-container">
        {/* FEATURES - ASYMMETRICAL HEADING */}
        <div className="features-head">
          <div className="features-head-title">
            <span className="ll-eyebrow ll-eyebrow--light">
              COMPLETE WEBSITE PROTECTION
            </span>

            <h2 className="ll-title ll-title--light">
              Everything your website needs.
              <br />
              <span>Nothing important missed.</span>
            </h2>
          </div>

          <p className="ll-lead ll-lead--light features-head-copy">
            From website availability to contact form health,
            LeadLeak helps you identify problems before they
            turn into lost opportunities.
          </p>
        </div>

        {/* FEATURES - TAB RAIL */}
        <div
          className="features-tabs"
          role="tablist"
          aria-label="Website protection features"
          onKeyDown={handleTabKeyDown}
        >
          {features.map((feature, index) => (
            <button
              key={feature.number}
              ref={(node) => {
                tabRefs.current[index] = node;
              }}
              type="button"
              role="tab"
              id={`feature-tab-${feature.type}`}
              aria-selected={active === index}
              aria-controls="feature-stage"
              tabIndex={active === index ? 0 : -1}
              className={`features-tab ${active === index ? "is-active" : ""}`}
              onClick={() => setActive(index)}
            >
              <span className="features-tab-number">{feature.number}</span>
              <span className="features-tab-title">{feature.title}</span>
              <span className="features-tab-label">{feature.label}</span>
            </button>
          ))}
        </div>

        {/* FEATURES - ACTIVE STAGE */}
        <div
          className="features-stage"
          id="feature-stage"
          role="tabpanel"
          aria-labelledby={`feature-tab-${current.type}`}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={current.type}
              className="features-stage-inner"
              initial={{ opacity: 0, y: reduceMotion ? 0 : 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: reduceMotion ? 0 : -10 }}
              transition={{ duration: reduceMotion ? 0 : 0.35 }}
            >
              <div className="features-stage-copy">
                <span className="features-stage-number" aria-hidden="true">
                  {current.number}
                </span>

                <h3>{current.title}</h3>

                <p>{current.description}</p>

                <span className="features-stage-label">{current.label}</span>
              </div>

              <div className="features-stage-preview">
                <FeaturePreview type={current.type} />
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

export default FeaturesWithPanel;
