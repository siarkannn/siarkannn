import React, { useEffect, useRef, useState, useCallback } from "react";
import { useRoute, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { projects } from "@/data/projects";
import { useTransitionCtx } from "@/context/TransitionContext";
import { preloadImages } from "@/utils/preload";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/** All image srcs for a project */
function projectSrcs(p: (typeof projects)[number]) {
  return [p.image, ...p.frames.map((f) => f.image)];
}

/**
 * WorkDetail stays mounted for the full lifecycle of the /work/* route
 * (App.tsx gives it key="work"). Next/Previous navigation only changes the
 * URL; this component crossfades content internally after preloading assets.
 */
export function WorkDetail() {
  const [, navigate] = useLocation();
  const [, params] = useRoute("/work/:slug");

  const urlSlug = params ? decodeURIComponent((params as { slug: string }).slug) : "";

  // displaySlug is what's actually rendered — only advances after preload
  const [displaySlug, setDisplaySlug] = useState(urlSlug);
  const pendingSlugRef = useRef<string | null>(null);

  const [navVisible, setNavVisible] = useState(true);
  const [atBottom, setAtBottom] = useState(false);
  const lastScrollY = useRef(0);
  const { setActiveSlug, setScrollTarget } = useTransitionCtx();

  // ─── Resolve projects ────────────────────────────────────────────────────
  const displayProject = projects.find((p) => p.slug === displaySlug) ?? projects[0];
  const displayIndex = projects.indexOf(displayProject);
  const prevProject = displayIndex > 0 ? projects[displayIndex - 1] : null;
  const nextProject = displayIndex < projects.length - 1 ? projects[displayIndex + 1] : null;

  // ─── Scroll to top on first mount ───────────────────────────────────────
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, []);

  // ─── Preload & crossfade on URL slug change ──────────────────────────────
  useEffect(() => {
    if (!urlSlug || urlSlug === displaySlug) return;

    const target = projects.find((p) => p.slug === urlSlug);
    if (!target) return;

    const pending = urlSlug;
    pendingSlugRef.current = pending;

    // Max 1.2s wait so rapid clicking still feels responsive
    const timeout = new Promise<void>((res) => setTimeout(res, 1200));
    Promise.race([preloadImages(projectSrcs(target)), timeout]).then(() => {
      // Only apply if this is still the latest pending navigation
      if (pendingSlugRef.current === pending) {
        setDisplaySlug(pending);
        window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
      }
    });
  }, [urlSlug]);

  // ─── Proactively preload adjacent projects ───────────────────────────────
  useEffect(() => {
    const adjacent = [prevProject, nextProject].filter(Boolean) as typeof projects;
    adjacent.forEach((p) => preloadImages(projectSrcs(p)));
  }, [displaySlug]);

  // ─── Scroll-hide navbar + bottom detection ───────────────────────────────
  useEffect(() => {
    setNavVisible(true);
    setAtBottom(false);
    lastScrollY.current = 0;

    const handleScroll = () => {
      const y = window.scrollY;
      if (y <= 2) setNavVisible(true);
      else if (y > lastScrollY.current) setNavVisible(false);
      lastScrollY.current = y;

      // Show Next/Previous only when within 120px of the bottom
      const nearBottom =
        y + window.innerHeight >= document.documentElement.scrollHeight - 120;
      setAtBottom(nearBottom);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    // If page is too short to scroll, show Previous/Next immediately
    const checkInitial = setTimeout(() => {
      const nearBottom =
        window.scrollY + window.innerHeight >=
        document.documentElement.scrollHeight - 120;
      if (nearBottom) setAtBottom(true);
    }, 200);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(checkInitial);
    };
  }, [displaySlug]);

  // ─── Navigation handlers ─────────────────────────────────────────────────
  const handleGoWork = useCallback(() => {
    setScrollTarget("work");
    setActiveSlug(null);
    navigate("/");
  }, [setScrollTarget, setActiveSlug, navigate]);

  const handleGoContact = useCallback(() => {
    setScrollTarget("contact");
    setActiveSlug(null);
    navigate("/");
  }, [setScrollTarget, setActiveSlug, navigate]);

  const handlePrev = useCallback(() => {
    if (prevProject) {
      setActiveSlug(prevProject.slug);
      navigate(`/work/${encodeURIComponent(prevProject.slug)}`);
    }
  }, [prevProject, setActiveSlug, navigate]);

  const handleNext = useCallback(() => {
    if (nextProject) {
      setActiveSlug(nextProject.slug);
      navigate(`/work/${encodeURIComponent(nextProject.slug)}`);
    }
  }, [nextProject, setActiveSlug, navigate]);

  // ─── Render ──────────────────────────────────────────────────────────────
  return (
    <motion.div
      className="min-h-screen bg-black text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: 0.5, ease: EASE } }}
      exit={{ opacity: 0, transition: { duration: 0.15, ease: [0.4, 0, 1, 1] } }}
    >
      {/* ── Fixed top navigation (stays mounted, never crossfades) ── */}
      <motion.header
        animate={{ y: navVisible ? 0 : -80 }}
        transition={{ duration: 0.12, ease: "linear" }}
        className="fixed top-0 left-0 right-0 z-50"
      >
        <nav className="flex items-center justify-between px-6 md:px-12 py-7">
          <button
            onClick={handleGoWork}
            className="text-white hover:text-white/70 cursor-pointer transition-colors duration-300 bg-transparent border-none p-0 outline-none font-gotham font-normal tracking-[-0.01em] text-[17px] md:text-[22px]"
          >
            Work
          </button>
          <button
            onClick={handleGoContact}
            className="text-white hover:text-white/70 cursor-pointer transition-colors duration-300 bg-transparent border-none p-0 outline-none font-gotham font-normal tracking-[-0.01em] text-[17px] md:text-[22px]"
          >
            Contact
          </button>
        </nav>
      </motion.header>

      {/* ── Content crossfade — only this area animates on Next/Prev ── */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={displaySlug}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.32, ease: EASE }}
          className="px-6 md:px-12 pt-24 pb-28 select-none"
        >
          <div className="grid grid-cols-1 md:grid-cols-[1fr_3fr] gap-5 md:gap-6 items-start">

            {/* Left: metadata */}
            <div className="order-2 md:order-1 w-full min-w-0 md:sticky md:top-24">
              <div className="mb-8 md:mb-10">
                <h1 className="text-[22px] md:text-[26px] font-bold leading-[1.3] break-words w-full font-['Gotham_Local'] mb-1.5 md:mb-2 tracking-[-0.01em]">
                  {displayProject.title}
                </h1>
                <p className="text-[15px] md:text-[18px] text-white font-['Gotham_Medium'] font-medium leading-snug tracking-[-0.01em]">
                  {displayProject.tagline}
                </p>
              </div>
              <div className="space-y-3 md:space-y-3.5">
                {displayProject.credits.map((credit, idx) => (
                  <div key={idx}>
                    <p className="text-[15px] md:text-[17px] font-bold text-white font-['Gotham_Local'] leading-snug tracking-[-0.01em]">
                      {credit.role}
                    </p>
                    <p className="text-[15px] md:text-[17px] text-neutral-400 font-['Gotham_Regular'] leading-snug tracking-[-0.01em]">
                      {credit.name}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: images — already preloaded before this renders */}
            <div className="order-1 md:order-2 w-full space-y-2">
              {displayProject.frames.map((frame, idx) => (
                <div
                  key={`${displaySlug}-frame-${idx}`}
                  className="relative overflow-hidden bg-neutral-900 aspect-[16/9]"
                >
                  {/* No FadeImage needed here — images are preloaded, will
                      appear instantly. The parent crossfade handles the reveal. */}
                  <img
                    src={frame.image}
                    alt=""
                    aria-label={frame.label}
                    className="w-full h-full object-cover object-center"
                    style={{ willChange: "transform" }}
                  />
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* ── Fixed bottom Previous / Next — visible only near bottom ── */}
      <motion.div
        animate={{ opacity: atBottom ? 1 : 0, pointerEvents: atBottom ? "auto" : "none" }}
        transition={{ duration: 0.3, ease: EASE }}
        className="fixed bottom-2 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-7"
      >
        {prevProject ? (
          <button
            onClick={handlePrev}
            className="text-white/60 hover:text-white transition-colors duration-300 text-[15px] md:text-[17px] cursor-pointer bg-transparent border-none p-0 outline-none font-['Gotham_Regular'] font-normal tracking-[-0.01em]"
          >
            &lsaquo; Previous
          </button>
        ) : (
          <span />
        )}
        {nextProject ? (
          <button
            onClick={handleNext}
            className="text-white/60 hover:text-white transition-colors duration-300 text-[15px] md:text-[17px] cursor-pointer bg-transparent border-none p-0 outline-none font-['Gotham_Regular'] font-normal tracking-[-0.01em]"
          >
            Next &rsaquo;
          </button>
        ) : (
          <span />
        )}
      </motion.div>
    </motion.div>
  );
}
