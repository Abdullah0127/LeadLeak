import { motion } from "framer-motion";
import "./HowItWorks.css";

// HOW IT WORKS - REAL STEP IMAGES
import carlosMuza from "../../assets/carlos-muza.jpg";
import nvidiaImage from "../../assets/nvidia.png";
import sslImage from "../../assets/ssl.jpg";
import stephenPhillips from "../../assets/stephen-phillips.jpg";

// Pin icon used on each step card
function Pin({ className = "" }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M16 3a1 1 0 0 1 .117 1.993L16 5v4.764l1.894 3.789a1 1 0 0 1 .1.331L18 14v2a1 1 0 0 1-.883.993L17 17h-4v4a1 1 0 0 1-1.993.117L11 21v-4H7a1 1 0 0 1-.993-.883L6 16v-2a1 1 0 0 1 .06-.34l.046-.107L8 9.762V5a1 1 0 0 1 .117-1.993L8 3h8Z" />
    </svg>
  );
}

// Four steps for LeadLeak
const steps = [
  {
    number: "01",
    title: "Create Your Account",
    description:
      "Sign up for LeadLeak in minutes. Create your account and set up your workspace to get started.",
    label: "Get started",
    image: carlosMuza,
  },
  {
    number: "02",
    title: "Add Your Website",
    description:
      "Enter the website URL you want to protect. You can organize your websites inside your LeadLeak workspace.",
    label: "Connect your website",
    image: stephenPhillips,
  },
  {
    number: "03",
    title: "Verify Your Website",
    description:
      "Confirm that you own or have permission to monitor the website. This helps keep website monitoring secure.",
    label: "Secure verification",
    image: sslImage,
  },
  {
    number: "04",
    title: "Monitor and Get Alerts",
    description:
      "LeadLeak checks your website and supported forms. Receive alerts when a problem is detected.",
    label: "Stay protected",
    image: nvidiaImage,
  },
];

// Individual pinned card
function StepCard({ step, className = "", rotate = "" }) {
  return (
    <motion.article
      className={`how-card-position ${className}`}
      initial={{ opacity: 0, y: 25 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5 }}
    >
      <div className={`how-card-outer ${rotate}`}>
        <Pin className="how-card-pin" />

        <div className="how-card-inner">
          <div className="how-card-header">
            <span className="how-card-number">{step.number}</span>

            <div className="how-card-photo">
              <img src={step.image} alt="" loading="lazy" />
            </div>
          </div>

          <h3>{step.title}</h3>

          <p>{step.description}</p>

          <span className="how-card-label">{step.label}</span>
        </div>
      </div>
    </motion.article>
  );
}

function HowItWorks() {
  return (
    <section className="how-it-works-section" id="how-it-works">
      <div className="how-it-works-container">
        {/* SECTION INTRODUCTION */}
        <div className="how-it-works-heading">
          <span className="how-it-works-eyebrow">HOW LEADLEAK WORKS</span>

          <h2>
            Four steps to
            <br />
            <span>protect every opportunity.</span>
          </h2>

          <p>
            Getting started is simple. Connect your website, verify ownership
            and let LeadLeak help you monitor what matters.
          </p>
        </div>

        {/* PINNED STEP CARDS */}
        <div className="how-steps-canvas">
          {/* ANIMATED CONNECTING PATH */}
          <svg
            className="how-steps-connector"
            viewBox="0 0 1000 850"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <motion.path
              d="
                M 290 145
                C 480 145, 530 285, 710 285
                C 850 285, 500 425, 290 445
                C 290 575, 535 665, 750 665
              "
              stroke="#8db59b"
              strokeWidth="2"
              strokeDasharray="8 8"
              fill="none"
              strokeLinecap="round"
              initial={{ strokeDashoffset: 0 }}
              whileInView={{ strokeDashoffset: -160 }}
              viewport={{ once: false }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          </svg>

          {/* STEP 1 */}
          <StepCard
            step={steps[0]}
            className="how-step-one"
            rotate="how-card-rotate-left"
          />

          {/* STEP 2 */}
          <StepCard
            step={steps[1]}
            className="how-step-two"
            rotate="how-card-rotate-right"
          />

          {/* STEP 3 */}
          <StepCard
            step={steps[2]}
            className="how-step-three"
            rotate="how-card-rotate-left"
          />

          {/* STEP 4 */}
          <StepCard
            step={steps[3]}
            className="how-step-four"
            rotate="how-card-rotate-right"
          />
        </div>

        {/* BOTTOM MESSAGE */}
        <div className="how-it-works-bottom">
          <p>
            Your website works for your business.
            <strong> Let LeadLeak watch over it.</strong>
          </p>
        </div>
      </div>
    </section>
  );
}

export default HowItWorks;
