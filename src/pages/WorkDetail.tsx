import React, { useEffect, useState, useCallback, useRef } from "react";
import { useRoute, useLocation } from "wouter";
import { motion } from "framer-motion";
import { projects, kanProjects, findProjectBySlug, type Project } from "@/data/projects";
import { useTransitionCtx } from "@/context/TransitionContext";
import { preloadImages } from "@/utils/preload";
import { getIsInitialAppLoad, restoreScrollForPath, resetScrollForPath } from "@/utils/scrollRestoration";

/** All image srcs for a project */
function projectSrcs(p: Project) {
  return [p.image, ...p.frames.map((f) => f.image)];
}

/**
 * WorkDetail displays a project's details, frames, and bottom navigation
 * to previous / next projects in sequence.
 */
export function WorkDetail({ slug: propSlug }: { slug?: string } = {}) {
  const [, navigate] = useLocation();
  const [, params] = useRoute("/work/:slug");

  // Freeze the slug for this instance's entire lifecycle so that when an instance
  // is exiting during AnimatePresence, it NEVER morphs into the new route's project!
  const [frozenSlug] = useState(() => {
    if (propSlug) return propSlug;
    if (params && (params as { slug?: string }).slug) {
      return decodeURIComponent((params as { slug: string }).slug);
    }
    if (typeof window !== "undefined") {
      const match = window.location.pathname.match(/^\/work\/(.+)/);
      if (match) return decodeURIComponent(match[1]);
    }
    return "";
  });

  const urlSlug = propSlug || frozenSlug;
  const { setActiveSlug } = useTransitionCtx();

  // ─── Resolve projects using canonical matcher ─────────────────────────────
  const { project: displayProject, list: listToUse, index: displayIndex } = findProjectBySlug(urlSlug);

  const prevProject =
    displayIndex > 0
      ? listToUse[displayIndex - 1]
      : listToUse.length > 1
      ? listToUse[listToUse.length - 1]
      : null;
  const nextProject =
    displayIndex < listToUse.length - 1
      ? listToUse[displayIndex + 1]
      : listToUse.length > 1
      ? listToUse[0]
      : null;

  // ─── Document Title synchronization ──────────────────────────────────────
  useEffect(() => {
    if (typeof document !== "undefined" && displayProject?.title) {
      document.title = `${displayProject.title} - KAN`;
    }
  }, [displayProject?.title]);

  // ─── Restore scroll position on refresh or reset to top on navigation ──
  useEffect(() => {
    if (getIsInitialAppLoad() && typeof window !== "undefined") {
      restoreScrollForPath(window.location.pathname);
    } else if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
      resetScrollForPath(window.location.pathname);
    }
  }, [frozenSlug]);

  // ─── Proactively preload current and adjacent projects ───────────────────
  useEffect(() => {
    // Defer preloading until page transition animation has completed (800ms)
    // so image decoding NEVER competes with the 60fps mobile page transition!
    const timer = setTimeout(() => {
      if (displayProject) {
        preloadImages(projectSrcs(displayProject));
      }
      const adjacent = [prevProject, nextProject].filter(Boolean) as Project[];
      adjacent.forEach((p) => preloadImages(projectSrcs(p)));
    }, 800);
    return () => clearTimeout(timer);
  }, [displayProject, prevProject, nextProject]);


  const [isNavigating, setIsNavigating] = useState(false);
  const navTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (navTimerRef.current) clearTimeout(navTimerRef.current);
    };
  }, []);

  const handlePrev = useCallback(() => {
    if (prevProject && !isNavigating) {
      setIsNavigating(true);
      setActiveSlug(prevProject.slug);
      if (typeof document !== "undefined" && prevProject.title) {
        document.title = `${prevProject.title} - KAN`;
      }
      navigate(`/work/${encodeURIComponent(prevProject.slug)}`);
      navTimerRef.current = setTimeout(() => {
        setIsNavigating(false);
      }, 750);
    }
  }, [prevProject, isNavigating, setActiveSlug, navigate]);

  const handleNext = useCallback(() => {
    if (nextProject && !isNavigating) {
      setIsNavigating(true);
      setActiveSlug(nextProject.slug);
      if (typeof document !== "undefined" && nextProject.title) {
        document.title = `${nextProject.title} - KAN`;
      }
      navigate(`/work/${encodeURIComponent(nextProject.slug)}`);
      navTimerRef.current = setTimeout(() => {
        setIsNavigating(false);
      }, 750);
    }
  }, [nextProject, isNavigating, setActiveSlug, navigate]);

  // ─── Render ──────────────────────────────────────────────────────────────
  return (
    <div key={displayProject.slug} className="min-h-screen bg-black text-white flex flex-col justify-between">
      <div className="px-7 min-[390px]:px-8 sm:px-9 md:px-12 pt-[86px] min-[390px]:pt-[88px] sm:pt-[90px] md:pt-24 pb-8 select-none flex-1 transition-[padding] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_2.4fr] lg:grid-cols-[1fr_2.5fr] gap-6 min-[390px]:gap-7 md:gap-8 lg:gap-10 items-start transition-[gap] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]">

          {/* Left: metadata */}
          <div
            className="order-2 md:order-1 w-full min-w-0 text-left md:sticky md:top-24"
          >
            {/* Title & Tagline / Subtitle */}
            <div key={`${displayProject.slug}-title`} className="mb-7 min-[390px]:mb-8 md:mb-10 text-left">
              <h1 className="text-[23px] min-[390px]:text-[24px] sm:text-[26px] md:text-[44px] lg:text-[47px] xl:text-[48px] font-bold leading-[1.14] md:leading-[1.08] font-['Gotham_Local'] mb-1 min-[390px]:mb-[3px] md:mb-[2px] tracking-[-0.02em] text-white break-words [overflow-wrap:anywhere] text-left">
                {displayProject.title}
              </h1>
              <p className="text-[17px] min-[390px]:text-[17.5px] sm:text-[18.5px] md:text-[25px] lg:text-[27px] xl:text-[28px] text-white font-['Gotham_Medium'] font-normal leading-[1.2] md:leading-[1.14] tracking-[-0.015em] text-left">
                {displayProject.tagline}
              </p>
            </div>

            {/* Credits list */}
            <div className="flex flex-col text-left">
              {displayProject.credits.map((credit, idx) => {
                const isFirst = idx === 0;

                return (
                  <div
                    key={idx}
                    className={`flex flex-col text-left items-start ${
                      isFirst
                        ? ""
                        : "mt-[14px] min-[390px]:mt-[15.5px] md:mt-4"
                    }`}
                  >
                    <p className="text-[14px] min-[390px]:text-[14.5px] sm:text-[15px] md:text-[17px] font-['Gotham_Local'] font-bold text-white leading-[1.2] md:leading-snug tracking-[-0.01em] text-left">
                      {credit.role}
                    </p>
                    <p className="text-[14px] min-[390px]:text-[14.5px] sm:text-[15px] md:text-[17px] text-white font-['Gotham_Regular'] font-normal leading-[1.28] md:leading-snug tracking-[-0.01em] mt-[2.5px] min-[390px]:mt-[3px] md:mt-1 text-left">
                      {credit.name}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: images */}
          <div className="order-1 md:order-2 w-full space-y-2">
            {displayProject.frames.map((frame, idx) => (
              <div
                key={`${displayProject.slug}-frame-${idx}`}
                className="relative overflow-hidden bg-black aspect-[16/9]"
              >
                <img
                  key={`${displayProject.slug}-img-${idx}`}
                  src={frame.image}
                  alt={`${displayProject.title} frame ${idx + 1}`}
                  loading={idx === 0 ? "eager" : "lazy"}
                  fetchPriority={idx === 0 ? "high" : "auto"}
                  decoding="async"
                  className="w-full h-full object-cover object-center"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Bottom Previous / Next Navigation ── */}
      <div className="w-full flex items-center justify-between px-7 min-[390px]:px-8 sm:px-9 md:px-12 pt-10 md:pt-12 pb-44 sm:pb-48 md:pb-36 lg:pb-40 select-none transition-[padding] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]">
        {prevProject ? (
          <button
            onClick={handlePrev}
            disabled={isNavigating}
            aria-label="Previous project"
            className="group inline-flex items-center gap-[7.5px] min-[390px]:gap-[8px] md:gap-[11px] text-[#DDDDDD] hover:text-white transition-colors duration-200 text-[14px] min-[390px]:text-[14.5px] sm:text-[15px] md:text-[23px] cursor-pointer bg-transparent border-none p-0 outline-none font-['Gotham_Regular'] md:font-gotham font-normal md:font-medium tracking-[-0.01em] disabled:pointer-events-none transform-gpu md:translate-y-[2px]"
          >
            <svg
              viewBox="0 0 10 16"
              fill="currentColor"
              className="w-[4.2px] h-[7.2px] min-[390px]:w-[4.6px] min-[390px]:h-[7.8px] md:w-[0.28em] md:h-[0.48em] shrink-0 self-center block text-[#DDDDDD] group-hover:text-white fill-current -translate-y-[0.5px] min-[390px]:translate-y-0 sm:translate-y-[1px] md:translate-y-[5px] transition-colors duration-200"
              aria-hidden="true"
            >
              <polygon points="5.4,0 10,0 4.6,8 10,16 5.4,16 0,8" />
            </svg>
            <span className="inline-block text-[#DDDDDD] group-hover:text-white leading-none transition-colors duration-200 md:translate-y-[2px] [paint-order:stroke_fill] [-webkit-text-stroke:0.5px_currentColor] md:[-webkit-text-stroke:0px]">Previous</span>
          </button>
        ) : (
          <span />
        )}

        {nextProject ? (
          <button
            onClick={handleNext}
            disabled={isNavigating}
            aria-label="Next project"
            className="group inline-flex items-center gap-[7.5px] min-[390px]:gap-[8px] md:gap-[11px] text-[#DDDDDD] hover:text-white transition-colors duration-200 text-[14px] min-[390px]:text-[14.5px] sm:text-[15px] md:text-[23px] cursor-pointer bg-transparent border-none p-0 outline-none font-['Gotham_Regular'] md:font-gotham font-normal md:font-medium tracking-[-0.01em] disabled:pointer-events-none transform-gpu md:translate-y-[2px]"
          >
            <span className="inline-block text-[#DDDDDD] group-hover:text-white leading-none transition-colors duration-200 md:translate-y-[2px] [paint-order:stroke_fill] [-webkit-text-stroke:0.5px_currentColor] md:[-webkit-text-stroke:0px]">Next</span>
            <svg
              viewBox="0 0 10 16"
              fill="currentColor"
              className="w-[4.2px] h-[7.2px] min-[390px]:w-[4.6px] min-[390px]:h-[7.8px] md:w-[0.28em] md:h-[0.48em] shrink-0 self-center block text-[#DDDDDD] group-hover:text-white fill-current -translate-y-[0.5px] min-[390px]:translate-y-0 sm:translate-y-[1px] md:translate-y-[5px] transition-colors duration-200"
              aria-hidden="true"
            >
              <polygon points="0,0 4.6,0 10,8 4.6,16 0,16 5.4,8" />
            </svg>
          </button>
        ) : (
          <span />
        )}
      </div>
    </div>
  );
}

