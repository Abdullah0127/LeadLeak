import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import "./Pricing.css";
import nvidiaImage from "../../assets/nvidia.png";

const plans = [
  {
    name: "Starter",
    description: "Everything you need to keep your first website healthy.",
    price: "5",
    period: "per month",
    websites: "1 website",
    icon: "starter",
    features: [
      "Website uptime monitoring",
      "SSL certificate monitoring",
      "Response time tracking",
      "Email notifications",
      "Basic monitoring history",
    ],
    buttonText: "Get started",
    popular: false,
  },
  {
    name: "Pro",
    description: "More protection and visibility for growing businesses.",
    price: "15",
    period: "per month",
    websites: "5 websites",
    icon: "pro",
    features: [
      "Everything in Starter",
      "Contact form monitoring",
      "Incident notifications",
      "Recovery notifications",
      "Detailed monitoring history",
    ],
    buttonText: "Choose Pro",
    popular: true,
  },
  {
    name: "Agency",
    description: "A simpler way to monitor and manage client websites.",
    price: "39",
    period: "per month",
    websites: "20 websites",
    icon: "agency",
    features: [
      "Everything in Pro",
      "Client website organization",
      "Agency workspace",
      "Consolidated reports",
      "Manage multiple client websites",
    ],
    buttonText: "Choose Agency",
    popular: false,
  },
];

// Small icon shown beside each plan name
function PlanIcon({ type }) {
  const paths = {
    starter: (
      <>
        <rect x="3" y="4" width="18" height="12" rx="2" />
        <path d="M8 20h8M12 16v4" />
      </>
    ),
    pro: <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" />,
    agency: <path d="m12 3 9 5-9 5-9-5 9-5ZM3 13l9 5 9-5" />,
  };

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[type]}
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
      className="pricing-check-icon"
    >
      <path
        d="m5 10 3.2 3.2L15.5 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Pricing() {
  return (
    <section className="pricing-section ll-section" id="pricing">
      <div className="ll-container">
        <motion.div
          className="pricing-heading"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
        >
          <span className="ll-eyebrow pricing-eyebrow">SIMPLE, TRANSPARENT PRICING</span>

          <h2 className="ll-title">
            Plans that work best
            <br />
            <span>for your business.</span>
          </h2>

          <p className="ll-lead">
            Choose the right level of protection for your websites. Start small
            and grow whenever your business needs more.
          </p>
        </motion.div>

        <div className="pricing-grid">
          {plans.map((plan, index) => (
            <motion.article
              key={plan.name}
              className={`pricing-card ${
                plan.popular ? "pricing-card-popular" : ""
              }`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.5, delay: index * 0.12 }}
            >
              {plan.popular && (
                <>
                  <div className="pricing-popular-label">MOST POPULAR</div>
                  <img
                    className="pricing-card-bg"
                    src={nvidiaImage}
                    alt=""
                    aria-hidden="true"
                    loading="lazy"
                  />
                </>
              )}

              <div className="pricing-card-top">
                <div className="pricing-plan-header">
                  <span className="pricing-plan-icon">
                    <PlanIcon type={plan.icon} />
                  </span>
                  <h3>{plan.name}</h3>
                </div>
                <p className="pricing-description">{plan.description}</p>

                <div className="pricing-price">
                  <span className="pricing-currency">$</span>
                  <span className="pricing-amount">{plan.price}</span>
                  <span className="pricing-period">/{plan.period}</span>
                </div>

                <p className="pricing-website-limit">{plan.websites}</p>

                <Link
                  to="/register"
                  className={`pricing-button ${
                    plan.popular ? "pricing-button-primary" : ""
                  }`}
                >
                  {plan.buttonText}
                  <span aria-hidden="true">↗</span>
                </Link>
              </div>

              <div className="pricing-divider" />

              <div className="pricing-features">
                <h4>What's included</h4>

                <ul>
                  {plan.features.map((feature) => (
                    <li key={feature}>
                      <span className="pricing-check">
                        <CheckIcon />
                      </span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.article>
          ))}
        </div>

        <motion.div
          className="pricing-bottom-note"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="pricing-note-dot" />
          Need a different setup?
          <Link to="/register">Let's find the right plan for you.</Link>
        </motion.div>
      </div>
    </section>
  );
}

export default Pricing;
