import { motion, useReducedMotion } from "framer-motion";
import "./HowItWorks.css";

// HOW IT WORKS - REAL STEP IMAGES
import carlosMuza from "../../assets/carlos-muza.jpg";
import nvidiaImage from "../../assets/nvidia.png";
import sslImage from "../../assets/ssl.jpg";
import stephenPhillips from "../../assets/stephen-phillips.jpg";

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

// Individual step card
function StepCard({ step, index, reduceMotion }) {
  return (
    <motion.li
      className={`how-step how-step-${index + 1}`}
      initial={{ opacity: 0, y: reduceMotion ? 0 : 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{
        duration: reduceMotion ? 0 : 0.6,
        delay: reduceMotion ? 0 : index * 0.1,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <article className="how-card">
        <div className="how-card-photo">
          <img src={step.image} alt="" loading="lazy" />
          <span className="how-card-number">{step.number}</span>
        </div>

        <div className="how-card-body">
          <h3>{step.title}</h3>

          <p>{step.description}</p>

          <span className="how-card-label">{step.label}</span>
        </div>
      </article>
    </motion.li>
  );
}

function HowItWorks() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="how-section ll-section" id="how-it-works">
      <div className="ll-container">
        {/* SECTION INTRODUCTION */}
        <div className="how-head">
          <div>
            <span className="ll-eyebrow">HOW LEADLEAK WORKS</span>

            <h2 className="ll-title how-head-title">
              Four steps to
              <br />
              <span>protect every opportunity.</span>
            </h2>
          </div>

          <p className="ll-lead how-head-copy">
            Getting started is simple. Connect your website, verify ownership
            and let LeadLeak help you monitor what matters.
          </p>
        </div>

        {/* STAGGERED STEP CARDS */}
        <ol className="how-steps">
          {steps.map((step, index) => (
            <StepCard
              key={step.number}
              step={step}
              index={index}
              reduceMotion={reduceMotion}
            />
          ))}
        </ol>

        {/* BOTTOM MESSAGE */}
        <div className="how-bottom">
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
