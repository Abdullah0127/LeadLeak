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

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

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
  const navLinkStyle =
    "group relative py-1 text-[15px] font-medium text-charcoal transition-colors duration-300 hover:text-forest-800 after:absolute after:-bottom-0.5 after:left-0 after:h-px after:w-0 after:bg-forest-800 after:transition-all after:duration-300 hover:after:w-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-forest-800";

  return (
    <header
      className={`sticky top-0 z-50 w-full border-b transition-all duration-300 ${
        isScrolled
          ? "border-forest-900/10 bg-white/95 shadow-[0_10px_30px_-18px_rgba(21,61,46,0.35)] backdrop-blur-xl"
          : "border-transparent bg-white"
      }`}
    >
      {/* NAVBAR CONTAINER */}
      <nav className="relative mx-auto w-full max-w-7xl" aria-label="Main">
        <div className="flex items-center justify-between px-5 py-3.5 md:px-8">
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
          <div className="hidden items-center gap-10 md:flex">
            {navLinks.map((link) => (
              <Link key={link.label} to={link.href} className={navLinkStyle}>
                {link.label}
              </Link>
            ))}
          </div>

          {/* DESKTOP ACTIONS */}
          <div className="hidden items-center gap-6 md:flex">
            <Link
              to="/login"
              className="text-[15px] font-semibold text-forest-900 transition-colors duration-300 hover:text-forest-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-forest-800"
            >
              Log in
            </Link>

            <Button
              onClick={() => navigate("/register")}
              variant="forest"
              className="rounded-full px-6 py-2.5"
            >
              Get Started
            </Button>
          </div>

          {/* MOBILE MENU BUTTON */}
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="rounded-full border border-forest-900/20 px-5 py-2 text-sm font-semibold text-forest-900 transition-colors hover:bg-cream-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-800 md:hidden"
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
          >
            {menuOpen ? "Close" : "Menu"}
          </button>
        </div>

        {/* MOBILE NAVIGATION */}
        {menuOpen && (
          <div className="border-t border-forest-900/10 bg-white px-5 py-6 md:hidden">
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

              <div className="flex flex-col gap-4 border-t border-forest-900/10 pt-5">
                <Link
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className="text-[15px] font-semibold text-forest-900"
                >
                  Log in
                </Link>

                <Button
                  onClick={() => {
                    setMenuOpen(false);
                    navigate("/register");
                  }}
                  variant="forest"
                  className="w-full rounded-full"
                >
                  Get Started
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* NAVBAR SCROLL PROGRESS */}
      <motion.div
        aria-hidden="true"
        style={{ scaleX: progressScale }}
        className="absolute bottom-0 left-0 h-[2px] w-full origin-left bg-gradient-to-r from-forest-800 to-sage"
      />
    </header>
  );
}

export default Navbar;
