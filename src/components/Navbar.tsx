import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useTransitionCtx } from "@/context/TransitionContext";
import { useSmoothScroll } from "@/hooks/useSmoothScroll";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(0);
  const rafRef = useRef<number | null>(null);
  const { scrollTarget, setScrollTarget } = useTransitionCtx();
  const { scrollTo } = useSmoothScroll();

  // ─── Scroll to section requested from WorkDetail ─────────────────────────
  useEffect(() => {
    if (scrollTarget) {
      setScrollTarget(null);
      // Wait for page-enter animation to complete before scrolling
      const timer = setTimeout(() => scrollTo(scrollTarget), 380);
      return () => clearTimeout(timer);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── RAF-throttled scroll listener ───────────────────────────────────────
  useEffect(() => {
    const onScroll = () => {
      if (rafRef.current !== null) return; // already queued
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        const currentY = window.scrollY;
        setScrolled(currentY > 80);

        if (currentY <= 2) {
          setVisible(true);
        } else if (currentY > lastScrollY.current + 4) {
          // require 4px threshold to suppress micro-jitter
          setVisible(false);
        }
        lastScrollY.current = currentY;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <motion.header
      animate={{ y: visible ? 0 : -80 }}
      transition={{ duration: 0.12, ease: "linear" }}
      style={{ pointerEvents: visible ? "auto" : "none" }}
      className={`fixed top-0 left-0 right-0 z-50 ${
        scrolled ? "bg-transparent py-4" : "bg-transparent py-0"
      }`}
    >
      <nav
        className="flex items-center justify-between px-9 md:px-12 py-7 max-w-full"
        aria-label="Main navigation"
      >
        <button
          onClick={() => scrollTo("work")}
          aria-label="Scroll to Work section"
          className="text-white hover:text-white/80 cursor-pointer bg-transparent border-none p-0 outline-none font-gotham font-normal tracking-[-0.01em] text-[17px] md:text-[24px] focus-visible:ring-1 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black rounded-sm"
          style={{ transition: "font-size 0.35s cubic-bezier(0.22, 1, 0.36, 1), color 0.3s ease" }}
        >
          Work
        </button>

        <button
          onClick={() => scrollTo("contact")}
          aria-label="Scroll to Contact section"
          className="text-white hover:text-white/80 cursor-pointer bg-transparent border-none p-0 outline-none font-gotham font-normal tracking-[-0.01em] text-[17px] md:text-[24px] focus-visible:ring-1 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black rounded-sm"
          style={{ transition: "font-size 0.35s cubic-bezier(0.22, 1, 0.36, 1), color 0.3s ease" }}
        >
          Contact
        </button>
      </nav>
    </motion.header>
  );
}
