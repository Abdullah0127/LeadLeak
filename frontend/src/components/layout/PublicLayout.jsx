import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";

import Navbar from "./Navbar";
import Footer from "./Footer";

function PublicLayout() {
  // PUBLIC WEBSITE LAYOUT
  const { pathname, hash } = useLocation();

  // SCROLL TO SECTION (#features, #pricing...) OR BACK TO TOP ON PAGE CHANGE
  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0, behavior: "auto" });
      return undefined;
    }

    const id = decodeURIComponent(hash.slice(1));

    // SMALL DELAY SO THE PAGE SECTIONS ARE RENDERED FIRST
    const timer = window.setTimeout(() => {
      document
        .getElementById(id)
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 60);

    return () => window.clearTimeout(timer);
  }, [pathname, hash]);

  return (
    <div className="flex min-h-screen flex-col">
      {/* PUBLIC NAVBAR */}
      <Navbar />

      {/* PUBLIC PAGE CONTENT */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* PUBLIC FOOTER */}
      <Footer />
    </div>
  );
}

export default PublicLayout;
