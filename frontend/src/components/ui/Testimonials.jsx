import { motion, useReducedMotion } from "framer-motion";
import "./Testimonials.css";

import heroBackground from "../../assets/hero-background.jpg";

/*
  TESTIMONIALS - PLACEHOLDER CONTENT
  ----------------------------------
  No genuine customer testimonials exist in this project yet, so every entry
  below is a clearly labelled placeholder. To go live:
    1. Replace `quote`, `name`, `role` and `company` with real, approved
       customer content.
    2. Set `placeholder: false` on that entry (this removes its
       "Sample" badge).
    3. Replace the section heading / introduction copy if needed.
  Do NOT add ratings, logos or customer names that are not genuine.
*/
const testimonials = [
  {
    id: "t1",
    quote:
      "Replace this placeholder with a genuine customer testimonial describing how LeadLeak helped them keep their website healthy.",
    name: "Customer name",
    role: "Role",
    company: "Company",
    placeholder: true,
  },
  {
    id: "t2",
    quote:
      "Replace this placeholder with a genuine customer testimonial describing what changed for their business after adding LeadLeak.",
    name: "Customer name",
    role: "Role",
    company: "Company",
    placeholder: true,
  },
  {
    id: "t3",
    quote:
      "Replace this placeholder with a genuine customer testimonial describing how LeadLeak fits into the way they manage client websites.",
    name: "Customer name",
    role: "Role",
    company: "Company",
    placeholder: true,
  },
];

function QuoteMark() {
  return (
    <svg viewBox="0 0 32 24" fill="currentColor" aria-hidden="true">
      <path d="M0 24V14.4C0 6.2 4.3 1.3 12.8 0l1.2 3.4C9.6 4.6 7.7 7.2 7.5 10.8H13V24H0Zm18 0V14.4C18 6.2 22.3 1.3 30.8 0L32 3.4c-4.4 1.2-6.3 3.8-6.5 7.4H31V24H18Z" />
    </svg>
  );
}

function Testimonials() {
  const reduceMotion = useReducedMotion();

  return (
    <section
      className="testimonials-section ll-section"
      id="testimonials"
      aria-labelledby="testimonials-title"
    >
      {/* PHOTOGRAPHIC BACKGROUND */}
      <img
        className="testimonials-photo"
        src={heroBackground}
        alt=""
        aria-hidden="true"
        loading="lazy"
      />
      <div className="testimonials-overlay" aria-hidden="true" />

      <div className="ll-container testimonials-inner">
        {/* HEADING */}
        <div className="testimonials-head">
          <span className="ll-eyebrow ll-eyebrow--light">TESTIMONIALS</span>

          <h2
            id="testimonials-title"
            className="ll-title ll-title--light testimonials-title"
          >
            Words from the people
            <br />
            <span>who use LeadLeak.</span>
          </h2>

          <p className="ll-lead ll-lead--light testimonials-copy">
            A few thoughts from the businesses, developers and agencies keeping
            their websites healthy with LeadLeak.
          </p>
        </div>

        {/* TESTIMONIAL CARDS */}
        <ul className="testimonials-grid">
          {testimonials.map((item, index) => (
            <motion.li
              key={item.id}
              className={`testimonial-item testimonial-item-${index + 1}`}
              initial={{ opacity: 0, y: reduceMotion ? 0 : 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{
                duration: reduceMotion ? 0 : 0.6,
                delay: reduceMotion ? 0 : index * 0.12,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <figure className="testimonial-card">
                <div className="testimonial-top">
                  <span className="testimonial-quote-mark">
                    <QuoteMark />
                  </span>

                  {item.placeholder && (
                    <span className="testimonial-badge">Sample</span>
                  )}
                </div>

                <blockquote>{item.quote}</blockquote>

                <figcaption>
                  <span className="testimonial-avatar" aria-hidden="true">
                    {item.name.charAt(0)}
                  </span>

                  <span className="testimonial-person">
                    <strong>{item.name}</strong>
                    <small>
                      {item.role}, {item.company}
                    </small>
                  </span>
                </figcaption>
              </figure>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default Testimonials;
