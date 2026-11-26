import { motion } from "framer-motion";
import "./WhoItsFor.css";

// WHO IT'S FOR - REAL CARD IMAGES
import carlosMuza from "../../assets/carlos-muza.jpg";
import markusWinkler from "../../assets/markus-winkler.jpg";
import nvidiaImage from "../../assets/nvidia.png";

// Simple SVG icons for each audience
function AgencyIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="4" width="18" height="15" rx="2" />
      <path d="M3 9h18M8 4v5M16 4v5M8 13h3M8 16h8" />
    </svg>
  );
}

function DeveloperIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="m8 8-5 4 5 4M16 8l5 4-5 4M14 5l-4 14" />
    </svg>
  );
}

function BusinessIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6M9 9h.01M15 9h.01" />
    </svg>
  );
}

const audiences = [
  {
    number: "01",
    title: "Digital Marketing Agencies",
    description:
      "Manage and monitor client websites from one place. Identify website issues before they affect your clients' campaigns and leads.",
    benefits: [
      "Monitor multiple client websites",
      "Stay informed about website issues",
      "Keep clients updated",
    ],
    Icon: AgencyIcon,
    image: carlosMuza,
    imageAlt: "Laptop showing a website analytics dashboard",
    tag: "Client websites",
  },
  {
    number: "02",
    title: "WordPress Developers",
    description:
      "Keep the websites you build and maintain under control. Spot downtime, SSL problems and other supported issues without constant manual checks.",
    benefits: [
      "Keep track of client websites",
      "Identify technical problems",
      "Improve website maintenance",
    ],
    Icon: DeveloperIcon,
    image: nvidiaImage,
    imageAlt: "Rows of servers in a data center",
    tag: "Site maintenance",
  },
  {
    number: "03",
    title: "Small Businesses",
    description:
      "Your website helps customers reach your business. Monitor its health and get notified when something needs your attention.",
    benefits: [
      "Monitor website availability",
      "Receive important alerts",
      "Protect online opportunities",
    ],
    Icon: BusinessIcon,
    image: markusWinkler,
    imageAlt: "Typewriter with the word Contact on the page",
    tag: "Customer enquiries",
  },
];

function WhoItsFor() {
  return (
    <section className="who-its-for-section ll-section">
      <div className="ll-container">
        {/* WHO IT'S FOR - HEADING */}
        <div className="who-its-for-heading">
          <div>
            <span className="ll-eyebrow">WHO IT'S FOR</span>

            <h2 className="ll-title who-its-for-title">
              One platform.
              <br />
              <span>Different needs. One goal.</span>
            </h2>
          </div>

          <p className="ll-lead who-its-for-copy">
            Whether you manage client websites or run your own business,
            LeadLeak helps you stay aware of website problems.
          </p>
        </div>

        {/* WHO IT'S FOR - AUDIENCE CARDS */}
        <div className="who-its-for-grid">
          {audiences.map((audience, index) => {
            const Icon = audience.Icon;

            return (
              <motion.article
                key={audience.number}
                className="audience-card"
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.12,
                }}
              >
                {/* AUDIENCE CARD - REAL IMAGE HEADER */}
                <div className="audience-card-media">
                  <img
                    src={audience.image}
                    alt={audience.imageAlt}
                    loading="lazy"
                  />

                  <span className="audience-card-tag">{audience.tag}</span>

                  <span className="audience-number">{audience.number}</span>

                  <div className="audience-icon">
                    <Icon />
                  </div>
                </div>

                {/* AUDIENCE CARD - CONTENT */}
                <div className="audience-card-body">
                  <h3>{audience.title}</h3>

                  <p className="audience-description">{audience.description}</p>

                  <div className="audience-divider" />

                  <ul className="audience-benefits">
                    {audience.benefits.map((benefit) => (
                      <li key={benefit}>
                        <span className="audience-check">✓</span>
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default WhoItsFor;
