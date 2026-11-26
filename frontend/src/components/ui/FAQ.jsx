import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import "./FAQ.css";

const faqData = [
  {
    id: 1,
    question: "What is LeadLeak?",
    answer:
      "LeadLeak helps businesses, developers, and agencies monitor their websites and identify problems that could cause them to lose potential customers.",
    icon: "🛡️",
    iconPosition: "right",
  },
  {
    id: 2,
    question: "What can LeadLeak monitor?",
    answer:
      "Our planned monitoring checks include website uptime, response time, and SSL certificate health. Contact form monitoring is also planned.",
  },
  {
    id: 3,
    question: "Do I need to install anything on my website?",
    answer:
      "Basic uptime, SSL, and response-time checks are designed to work externally. Some advanced checks, such as contact form testing, may require additional setup.",
  },
  {
    id: 4,
    question: "Can I monitor multiple websites?",
    answer:
      "Yes. Our planned plans have different website limits. The Agency plan is designed for managing multiple client websites from one workspace.",
    icon: "🌐",
    iconPosition: "left",
  },
  {
    id: 5,
    question: "How will I know if my website goes down?",
    answer:
      "LeadLeak is being built to send email notifications when a monitored website experiences an issue and when it recovers.",
  },
  {
    id: 6,
    question: "Does contact form monitoring create fake leads?",
    answer:
      "Contact form testing will require your authorization and configuration. It is being designed to avoid sending unwanted test submissions into your real sales pipeline.",
    icon: "✉️",
    iconPosition: "right",
  },
  {
    id: 7,
    question: "Can I change my plan later?",
    answer:
      "Plan upgrades and changes are intended to be supported as your website monitoring needs grow. Subscription management will be added later.",
  },
];

// FAQ - SUPPORT AVATAR ICON
function ShieldIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 3 4.5 6v5.5c0 4.6 3.1 8.1 7.5 9.5 4.4-1.4 7.5-4.9 7.5-9.5V6L12 3Z" />
      <path d="m9 12 2.2 2.2L15.5 10" />
    </svg>
  );
}

function FAQ() {
  const [activeId, setActiveId] = useState(1);
  const reduceMotion = useReducedMotion();

  const toggleFAQ = (id) => {
    setActiveId((current) => (current === id ? null : id));
  };

  return (
    <section className="faq-section ll-section" id="faq">
      <div className="ll-container faq-layout">
        {/* FAQ - STICKY INTRODUCTION COLUMN */}
        <motion.div
          className="faq-intro"
          initial={{ opacity: 0, y: reduceMotion ? 0 : 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: reduceMotion ? 0 : 0.6 }}
        >
          <span className="ll-eyebrow">QUESTIONS & ANSWERS</span>

          <h2 className="ll-title faq-title">
            Got questions?
            <br />
            <span>We've got answers.</span>
          </h2>

          <p className="ll-lead faq-copy">
            Here are a few things you might want to know about protecting your
            website with LeadLeak.
          </p>

          <div className="faq-support">
            <span className="faq-support-avatar">
              <ShieldIcon />
            </span>

            <span className="faq-support-info">
              <strong>LeadLeak Support</strong>
              <small>Frequently asked questions</small>
            </span>
          </div>

          <div className="faq-support-note">
            <span className="faq-online-dot" />
            Here to help you keep your website protected.
          </div>
        </motion.div>

        {/* FAQ - ACCORDION */}
        <motion.div
          className="faq-list"
          initial={{ opacity: 0, y: reduceMotion ? 0 : 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: reduceMotion ? 0 : 0.6 }}
        >
          {faqData.map((item) => {
            const isOpen = activeId === item.id;

            return (
              <div
                className={`faq-item ${isOpen ? "is-open" : ""}`}
                key={item.id}
              >
                <h3 className="faq-item-heading">
                  <button
                    type="button"
                    className="faq-question"
                    onClick={() => toggleFAQ(item.id)}
                    aria-expanded={isOpen}
                    aria-controls={`faq-answer-${item.id}`}
                    id={`faq-question-${item.id}`}
                  >
                    <span className="faq-question-text">{item.question}</span>

                    <span className="faq-toggle" aria-hidden="true">
                      {isOpen ? "−" : "+"}
                    </span>
                  </button>
                </h3>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={`faq-answer-${item.id}`}
                      className="faq-answer"
                      role="region"
                      aria-labelledby={`faq-question-${item.id}`}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{
                        duration: reduceMotion ? 0 : 0.3,
                        ease: "easeInOut",
                      }}
                    >
                      <p>{item.answer}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

export default FAQ;
