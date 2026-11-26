import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useMotionValue,
} from "framer-motion";

import { useEffect, useRef, useState } from "react";

// HOME PAGE - LOCAL IMAGE ASSETS
import carlosMuza from "../../assets/carlos-muza.jpg";
import chrisLiverani from "../../assets/chris-liverani.jpg";
import heroImage from "../../assets/hero.png";
import heroBackground from "../../assets/hero-background.jpg";
import markusWinkler from "../../assets/markus-winkler.jpg";
import nvidiaImage from "../../assets/nvidia.png";
import sslHealth from "../../assets/ssl.jpg";
import stephenPhillips from "../../assets/stephen-phillips.jpg";

// HOME PAGE - TUNNEL IMAGE DATA
const IMAGES = [
  {
    src: carlosMuza,
    title: "Website Monitoring",
    status: "Live",
    metric: "24/7",
  },
  {
    src: chrisLiverani,
    title: "Uptime Tracking",
    status: "Online",
    metric: "99.98%",
  },
  {
    src: heroImage,
    title: "Lead Protection",
    status: "Active",
    metric: "Forms OK",
  },
  {
    src: markusWinkler,
    title: "Performance Insights",
    status: "Tracking",
    metric: "245 ms",
  },
  {
    src: nvidiaImage,
    title: "Server Infrastructure",
    status: "Healthy",
    metric: "Online",
  },
  {
    src: sslHealth,
    title: "SSL Security",
    status: "Secure",
    metric: "HTTPS",
  },
  {
    src: stephenPhillips,
    title: "Response Time",
    status: "Fast",
    metric: "Monitored",
  },
];

// HOME PAGE - HERO FEATURE CHIPS
const HERO_CHIPS = ["Uptime checks", "SSL tracking", "Form monitoring"];

// HOME PAGE - TUNNEL CARD POSITIONS
const TUNNEL_CARDS = IMAGES.map((item, index) => {
  const angle = index * 137.5 * (Math.PI / 180);

  return {
    item,
    angleCos: Math.cos(angle),
    angleSin: Math.sin(angle),
    radiusFactorX: 0.28 + (index % 3) * 0.08,
    radiusFactorY: 0.26 + (index % 2) * 0.09,
    rotationZ: (index % 2 === 0 ? 1 : -1) * (3 + (index % 5) * 2),
    index,
  };
});

// HOME PAGE - ANIMATION CONFIGURATION
const SPRING_CONFIG = {
  stiffness: 60,
  damping: 25,
  mass: 0.5,
};

// HOME PAGE - SCROLL POINT WHERE THE BACKGROUND IMAGE HAS FADED OUT
const IMAGE_FADE_END = 0.35;

// HOME PAGE - MOUSE PARALLAX EFFECT
function useCameraParallax(enabled) {
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);

  const x = useSpring(rawX, SPRING_CONFIG);
  const y = useSpring(rawY, SPRING_CONFIG);

  useEffect(() => {
    if (!enabled) return undefined;

    const handlePointerMove = (event) => {
      rawX.set((event.clientX / window.innerWidth - 0.5) * 2);

      rawY.set((event.clientY / window.innerHeight - 0.5) * 2);
    };

    window.addEventListener("pointermove", handlePointerMove, {
      passive: true,
    });

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
    };
  }, [enabled, rawX, rawY]);

  return { x, y };
}

// HOME PAGE - INDIVIDUAL TUNNEL CARD
function TunnelCard({ card, progress, pointer, total, stage }) {
  const staggerSpan = 0.55;

  const start = (card.index / total) * (1 - staggerSpan);
  const end = start + staggerSpan;

  const localProgress = useTransform(progress, [start, end], [0, 1]);

  const farZ = stage.isMobile ? -1200 : -1700;
  const nearZ = stage.isMobile ? 350 : 500;

  const z = useTransform(localProgress, [0, 1], [farZ, nearZ]);

  const opacity = useTransform(
    localProgress,
    [0, 0.18, 0.82, 0.98],
    [0, 1, 1, 0],
  );

  const cardWidth = stage.isMobile
    ? Math.max(130, Math.min(180, stage.width * 0.38))
    : Math.max(180, Math.min(270, stage.width * 0.18));

  const baseX = card.angleCos * (stage.width * card.radiusFactorX);

  const baseY = card.angleSin * (stage.height * card.radiusFactorY);

  const panStrength = stage.isMobile ? 20 : 45;

  const transform = useTransform(
    [z, pointer.x, pointer.y],
    ([currentZ, pointerX, pointerY]) => {
      const offsetX = baseX - pointerX * panStrength;
      const offsetY = baseY - pointerY * panStrength;

      return `translate3d(
        calc(-50% + ${offsetX}px),
        calc(-50% + ${offsetY}px),
        ${currentZ}px
      ) rotateZ(${card.rotationZ}deg)`;
    },
  );

  return (
    <motion.div
      style={{
        width: cardWidth,
        transform,
        opacity,
        zIndex: card.index + 1,
      }}
      className="pointer-events-auto absolute left-1/2 top-1/2 aspect-[4/5] cursor-pointer select-none will-change-transform"
    >
      <div className="group relative h-full w-full overflow-hidden rounded-[1.75rem] bg-cream-2 shadow-2xl shadow-forest-900/30 ring-1 ring-white/50 transition-all duration-500 hover:ring-2 hover:ring-sage">
        <img
          src={card.item.src}
          alt={card.item.title}
          draggable={false}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
        />

        {/* TUNNEL CARD - READABILITY GRADIENT */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#153D2E]/90 via-[#153D2E]/10 to-transparent" />

        {/* TUNNEL CARD - LIVE STATUS CHIP */}
        <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 shadow-sm backdrop-blur-md">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-forest-800 opacity-60" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-forest-800" />
          </span>

          <span className="text-[9px] font-semibold uppercase tracking-wider text-forest-900">
            {card.item.status}
          </span>
        </div>

        {/* TUNNEL CARD - TITLE AND METRIC */}
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-3 sm:p-4">
          <span className="text-[10px] font-medium uppercase leading-snug tracking-widest text-white drop-shadow-md sm:text-xs">
            {card.item.title}
          </span>

          <span className="shrink-0 rounded-full border border-white/25 bg-white/15 px-2 py-0.5 text-[9px] font-semibold text-white backdrop-blur-md sm:text-[10px]">
            {card.item.metric}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

// HOME PAGE - PERSPECTIVE TUNNEL HERO
function PerspectiveTunnelHero() {
  const sectionRef = useRef(null);

  const reduceMotion = useReducedMotion();

  const [stage, setStage] = useState({
    width: 1440,
    height: 900,
    isMobile: false,
  });

  // HOME PAGE - RESPONSIVE DIMENSIONS
  useEffect(() => {
    const updateDimensions = () => {
      setStage({
        width: window.innerWidth,
        height: window.innerHeight,
        isMobile: window.innerWidth < 768,
      });
    };

    updateDimensions();

    window.addEventListener("resize", updateDimensions);

    return () => {
      window.removeEventListener("resize", updateDimensions);
    };
  }, []);

  // HOME PAGE - NORMAL PAGE SCROLL ANIMATION
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 80,
    damping: 30,
    restDelta: 0.0001,
  });

  const pointer = useCameraParallax(!reduceMotion);

  // HOME PAGE - BACKGROUND IMAGE FADES OUT WHILE SCROLLING
  const imageOpacity = useTransform(
    smoothProgress,
    [0, IMAGE_FADE_END],
    [1, 0.08],
  );

  const imageScale = useTransform(smoothProgress, [0, 1], [1, 1.12]);

  // HOME PAGE - LIGHT GUIDES APPEAR AS THE IMAGE FADES
  const guideOpacity = useTransform(
    smoothProgress,
    [0, IMAGE_FADE_END],
    [0, 1],
  );

  // HOME PAGE - HERO TEXT STAYS READABLE ON IMAGE AND ON LIGHT BACKGROUND
  const titleScale = useTransform(smoothProgress, [0, 0.5, 1], [1, 1.12, 1.4]);

  const titleOpacity = useTransform(smoothProgress, [0, 0.85, 1], [1, 1, 0]);

  const textColor = useTransform(
    smoothProgress,
    [0, IMAGE_FADE_END],
    ["rgba(255, 255, 255, 1)", "rgba(21, 61, 46, 1)"],
  );

  const accentColor = useTransform(
    smoothProgress,
    [0, IMAGE_FADE_END],
    ["rgba(201, 227, 161, 1)", "rgba(27, 73, 54, 1)"],
  );

  const bodyColor = useTransform(
    smoothProgress,
    [0, IMAGE_FADE_END],
    ["rgba(255, 255, 255, 0.92)", "rgba(62, 68, 64, 1)"],
  );

  const chipBackground = useTransform(
    smoothProgress,
    [0, IMAGE_FADE_END],
    ["rgba(255, 255, 255, 0.14)", "rgba(201, 227, 161, 0.45)"],
  );

  const chipBorder = useTransform(
    smoothProgress,
    [0, IMAGE_FADE_END],
    ["rgba(255, 255, 255, 0.35)", "rgba(27, 73, 54, 0.2)"],
  );

  const textShadow = useTransform(
    smoothProgress,
    [0, IMAGE_FADE_END],
    ["0 2px 28px rgba(0, 0, 0, 0.55)", "0 2px 28px rgba(0, 0, 0, 0)"],
  );

  const promptOpacity = useTransform(smoothProgress, [0, 0.12], [1, 0]);

  return (
    <section
      ref={sectionRef}
      className="relative h-[220vh] bg-cream"
      aria-label="LeadLeak website monitoring"
    >
      <div
        className="sticky top-0 flex h-svh w-full items-center justify-center overflow-hidden text-ink"
        style={{
          perspective: stage.isMobile ? "900px" : "1200px",
          transformStyle: "preserve-3d",
        }}
      >
        {/* HOME PAGE - REAL IMAGE BACKGROUND (FADES ON SCROLL) */}
        <motion.div
          style={{ opacity: imageOpacity }}
          className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
        >
          <motion.img
            src={heroBackground}
            alt=""
            aria-hidden="true"
            loading="eager"
            style={{ scale: imageScale }}
            className="h-full w-full object-cover object-center"
          />

          {/* HOME PAGE - BRAND TINT FOR TEXT READABILITY */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#153D2E]/60 via-[#153D2E]/35 to-[#153D2E]/70" />

          {/* HOME PAGE - SOFT SPOTLIGHT BEHIND HERO TEXT */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_55%_45%_at_50%_50%,rgba(21,61,46,0.55),transparent_100%)]" />

          {/* HOME PAGE - RINGS ON IMAGE */}
          <div className="absolute left-1/2 top-1/2 h-[48vmin] w-[48vmin] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/20" />

          <div className="absolute left-1/2 top-1/2 h-[76vmin] w-[76vmin] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-white/20" />
        </motion.div>

        {/* HOME PAGE - LIGHT TUNNEL GUIDES (APPEAR AS IMAGE FADES) */}
        <motion.div
          style={{ opacity: guideOpacity }}
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
        >
          <div className="absolute inset-0 bg-[radial-gradient(#c9e3a1_1px,transparent_1px)] [background-size:28px_28px] [mask-image:radial-gradient(ellipse_70%_70%_at_50%_50%,#000_60%,transparent_100%)] opacity-70" />

          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(201,227,161,0.35)_0%,transparent_70%)]" />

          <div className="absolute h-[48vmin] w-[48vmin] rounded-full border border-forest-800/15" />

          <div className="absolute h-[76vmin] w-[76vmin] rounded-full border border-dashed border-forest-800/15" />
        </motion.div>

        {/* HOME PAGE - CENTRAL HERO CONTENT */}
        <motion.div
          style={{
            scale: titleScale,
            opacity: titleOpacity,
            color: textColor,
            textShadow,
          }}
          className="pointer-events-none z-0 flex max-w-4xl flex-col items-center px-6 text-center"
        >
          <motion.p
            style={{
              backgroundColor: chipBackground,
              borderColor: chipBorder,
            }}
            className="mb-6 inline-flex items-center gap-2.5 rounded-full border px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] backdrop-blur-md sm:tracking-[0.3em]"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sage opacity-70" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-sage" />
            </span>
            SMART WEBSITE MONITORING
          </motion.p>

          <h1 className="font-display text-6xl font-medium leading-[0.92] tracking-tight sm:text-7xl md:text-8xl lg:text-[7.5rem]">
            NEVER LOSE
            <br />
            <motion.span style={{ color: accentColor }}>A LEAD.</motion.span>
          </h1>

          <motion.p
            style={{ color: bodyColor }}
            className="mt-7 max-w-[44ch] text-sm font-normal leading-6 sm:text-base sm:leading-7"
          >
            Detect website problems early, monitor performance, and protect
            every opportunity to connect with your customers.
          </motion.p>

          {/* HOME PAGE - HERO FEATURE CHIPS */}
          <div className="mt-7 flex flex-wrap items-center justify-center gap-2.5">
            {HERO_CHIPS.map((chip) => (
              <motion.span
                key={chip}
                style={{
                  backgroundColor: chipBackground,
                  borderColor: chipBorder,
                }}
                className="inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-semibold backdrop-blur-md"
              >
                <svg
                  viewBox="0 0 20 20"
                  fill="none"
                  aria-hidden="true"
                  className="h-3.5 w-3.5"
                >
                  <path
                    d="m5 10 3.2 3.2L15.5 6"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {chip}
              </motion.span>
            ))}
          </div>
        </motion.div>

        {/* HOME PAGE - SCROLL PROMPT */}
        <motion.div
          style={{ opacity: promptOpacity }}
          className="pointer-events-none absolute bottom-8 z-20 flex flex-col items-center gap-2 text-xs font-medium uppercase tracking-[0.3em] text-white/85 [text-shadow:0_1px_10px_rgba(0,0,0,0.5)]"
        >
          <span>Scroll to Explore</span>

          <div className="h-8 w-px bg-gradient-to-b from-white to-transparent" />
        </motion.div>

        {/* HOME PAGE - 3D TUNNEL CARDS */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{ transformStyle: "preserve-3d" }}
        >
          {TUNNEL_CARDS.map((card) => (
            <TunnelCard
              key={card.index}
              card={card}
              progress={smoothProgress}
              pointer={pointer}
              total={TUNNEL_CARDS.length}
              stage={stage}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default PerspectiveTunnelHero;
