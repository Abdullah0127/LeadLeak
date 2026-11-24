import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
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

  const toggleFAQ = (id) => {
    setActiveId((current) => (current === id ? null : id));
  };

  return (
    <section className="faq-chat-section" id="faq">
      <div className="faq-chat-container">
        {/* FAQ HEADING */}
        <motion.div
          className="faq-chat-heading"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="faq-chat-eyebrow">QUESTIONS & ANSWERS</span>

          <h2>
            Got questions?
            <br />
            <span>We've got answers.</span>
          </h2>

          <p>
            Here are a few things you might want to know about protecting your
            website with LeadLeak.
          </p>
        </motion.div>

        {/* FAQ CHAT ACCORDION */}
        <motion.div
          className="faq-chat-box"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.6 }}
        >
          <div className="faq-chat-timestamp">
            <span className="faq-support-avatar">
              <ShieldIcon />
            </span>

            <span className="faq-support-info">
              <strong>LeadLeak Support</strong>
              <small>
                <span className="faq-online-dot" />
                Frequently asked questions
              </small>
            </span>
          </div>

          <div className="faq-chat-list">
            {faqData.map((item, index) => {
              const isOpen = activeId === item.id;

              return (
                <div className="faq-chat-item" key={item.id}>
                  {/* QUESTION MESSAGE */}
                  <div className="faq-question-row">
                    <button
                      type="button"
                      className={`faq-question-bubble ${
                        isOpen ? "faq-question-active" : ""
                      }`}
                      onClick={() => toggleFAQ(item.id)}
                      aria-expanded={isOpen}
                      aria-controls={`faq-answer-${item.id}`}
                      id={`faq-question-${item.id}`}
                    >
                      {item.icon && (
                        <span
                          className={`faq-message-icon icon-${item.iconPosition || "right"}`}
                          aria-hidden="true"
                        >
                          {item.icon}
                        </span>
                      )}

                      <span>{item.question}</span>
                    </button>

                    <button
                      type="button"
                      className={`faq-expand-button ${
                        isOpen ? "faq-expand-active" : ""
                      }`}
                      onClick={() => toggleFAQ(item.id)}
                      aria-label={
                        isOpen
                          ? `Close ${item.question}`
                          : `Open ${item.question}`
                      }
                      aria-expanded={isOpen}
                      aria-controls={`faq-answer-${item.id}`}
                    >
                      {isOpen ? "−" : "+"}
                    </button>
                  </div>

                  {/* ANSWER MESSAGE */}
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        id={`faq-answer-${item.id}`}
                        className="faq-answer-row"
                        initial={{ opacity: 0, height: 0, y: -8 }}
                        animate={{ opacity: 1, height: "auto", y: 0 }}
                        exit={{ opacity: 0, height: 0, y: -8 }}
                        transition={{
                          duration: 0.3,
                          ease: "easeInOut",
                        }}
                      >
                        <div
                          className="faq-answer-bubble"
                          role="region"
                          aria-labelledby={`faq-question-${item.id}`}
                        >
                          {item.answer}
                        </div>

                        <span className="faq-answer-avatar" aria-hidden="true">
                          <ShieldIcon />
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          <div className="faq-chat-footer">
            <span className="faq-online-dot" />
            Here to help you keep your website protected.
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default FAQ;
