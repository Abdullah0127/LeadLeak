import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, useScroll, useSpring } from "framer-motion";

import image from "../../assets/leadleak.png";
import Button from "../common/Button";

function Navbar() {
  const navigate = useNavigate();

  // NAVBAR SCROLL PROGRESS LINE
  const { scrollYProgress } = useScroll();
  const progressScale = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });

  const [menuOpen, setMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // NAVBAR SCROLL EFFECT
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // NAVBAR LINKS
  const navLinks = [
    { label: "Features", href: "/#features" },
    { label: "How It Works", href: "/#how-it-works" },
    { label: "Pricing", href: "/#pricing" },
  ];

  // NAVBAR COMPONENT STYLES
  const navLinkStyle = `group relative py-1 text-sm font-medium transition-colors duration-200 after:absolute after:-bottom-0.5 after:left-0 after:h-0.5 after:w-0 after:rounded-full after:bg-current after:transition-all after:duration-300 hover:after:w-full ${
    isScrolled
      ? "text-white/80 hover:text-white"
      : "text-muted hover:text-brand-700"
  }`;

  return (
    <header className="sticky top-3 z-50 mx-auto w-full max-w-6xl px-4">
      {/* NAVBAR CONTAINER */}
      <nav
        className={`relative overflow-hidden rounded-2xl border transition-all duration-300 ${
          isScrolled
            ? "border-brand-600 bg-brand-700 shadow-xl shadow-brand-900/15"
            : "border-border bg-white/95 shadow-sm shadow-black/5 backdrop-blur-xl"
        }`}
      >
        {/* NAVBAR SCROLL PROGRESS */}
        <motion.div
          aria-hidden="true"
          style={{ scaleX: progressScale }}
          className="absolute bottom-0 left-0 h-[2px] w-full origin-left bg-gradient-to-r from-brand-500 to-emerald-300"
        />

        <div className="flex items-center justify-between px-5 py-3 md:px-7">
          {/* BRAND LOGO */}
          <Link
            to="/"
            className="flex shrink-0 items-center"
            onClick={() => setMenuOpen(false)}
          >
            <img
              src={image}
              alt="LeadLeak"
              className="h-9 w-auto object-contain"
            />
          </Link>

          {/* DESKTOP NAVIGATION */}
          <div className="hidden items-center gap-9 md:flex">
            {navLinks.map((link) => (
              <Link key={link.label} to={link.href} className={navLinkStyle}>
                {link.label}
              </Link>
            ))}
          </div>

          {/* DESKTOP ACTIONS */}
          <div className="hidden items-center gap-5 md:flex">
            <Link
              to="/login"
              className={`text-sm font-semibold transition-colors ${
                isScrolled
                  ? "text-white hover:text-brand-100"
                  : "text-ink hover:text-brand-700"
              }`}
            >
              Log in
            </Link>

            <Button
              onClick={() => navigate("/register")}
              variant={isScrolled ? "secondary" : "primary"}
              className="rounded-xl px-5"
            >
              Get Started
            </Button>
          </div>

          {/* MOBILE MENU BUTTON */}
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className={`rounded-lg border px-4 py-2 text-sm font-semibold transition-colors md:hidden ${
              isScrolled
                ? "border-white/20 text-white hover:bg-white/10"
                : "border-border text-ink hover:bg-surface"
            }`}
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
          >
            {menuOpen ? "Close" : "Menu"}
          </button>
        </div>

        {/* MOBILE NAVIGATION */}
        {menuOpen && (
          <div
            className={`border-t px-5 py-5 md:hidden ${
              isScrolled ? "border-white/15" : "border-border"
            }`}
          >
            <div className="flex flex-col gap-5">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={navLinkStyle}
                >
                  {link.label}
                </Link>
              ))}

              <div
                className={`flex flex-col gap-4 border-t pt-5 ${
                  isScrolled ? "border-white/15" : "border-border"
                }`}
              >
                <Link
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className={`text-sm font-semibold ${
                    isScrolled ? "text-white" : "text-ink"
                  }`}
                >
                  Log in
                </Link>

                <Button
                  onClick={() => {
                    setMenuOpen(false);
                    navigate("/register");
                  }}
                  variant={isScrolled ? "secondary" : "primary"}
                  className="w-full rounded-xl"
                >
                  Get Started
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}

export default Navbar;
