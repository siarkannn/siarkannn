import { useEffect, useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useTransitionCtx } from "@/context/TransitionContext";
import { useSmoothScroll } from "@/hooks/useSmoothScroll";

// Served from public/ — Vercel CDN with Range-request support, no Vite hash
const VIDEO_URL = "/video/showreel.mp4";
const POSTER_URL = "/poster.jpg";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

function IconSpeaker() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
    </svg>
  );
}

function IconMute() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <line x1="23" y1="9" x2="17" y2="15" />
      <line x1="17" y1="9" x2="23" y2="15" />
    </svg>
  );
}

export function Hero() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const { audioRef } = useTransitionCtx();
  const { scrollTo } = useSmoothScroll();
  const [isMuted, setIsMuted] = useState(false);

  // ── Video: fast start for in-app browsers ────────────────────────────────
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Attempt immediate play (works when autoplay is allowed)
    const tryPlay = () => video.play().catch(() => {});

    if (video.readyState >= 3) {
      // Already have enough data (HAVE_FUTURE_DATA / HAVE_ENOUGH_DATA)
      tryPlay();
    } else {
      video.addEventListener("canplay", tryPlay, { once: true });
    }

    // In-app browsers (Instagram, TikTok, WhatsApp) block autoplay until
    // the first user gesture. Re-attempt on any tap/click.
    const unlockVideo = () => {
      if (video.paused) video.play().catch(() => {});
    };
    window.addEventListener("touchstart", unlockVideo, { passive: true, once: true });
    window.addEventListener("click", unlockVideo, { passive: true, once: true });

    return () => {
      video.removeEventListener("canplay", tryPlay);
      window.removeEventListener("touchstart", unlockVideo);
      window.removeEventListener("click", unlockVideo);
    };
  }, []);

  // ── Audio: unlock on first gesture ───────────────────────────────────────
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.play().catch(() => {
      const unlock = () => {
        audio.play().catch(() => {});
        window.removeEventListener("click", unlock);
        window.removeEventListener("touchstart", unlock);
      };
      window.addEventListener("click", unlock, { passive: true });
      window.addEventListener("touchstart", unlock, { passive: true });
    });
  }, []);

  const toggleMute = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = !audio.muted;
    setIsMuted(audio.muted);
  }, [audioRef]);

  return (
    <section
      id="hero"
      className="relative h-screen overflow-hidden bg-black select-none"
    >
      {/* VIDEO — poster prevents black screen while video loads */}
      <div className="absolute inset-0" style={{ willChange: "transform" }}>
        <video
          ref={videoRef}
          src={VIDEO_URL}
          poster={POSTER_URL}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          disablePictureInPicture
          className="w-full h-full object-cover object-center"
          style={{ display: "block" }}
        />
      </div>

      {/* ─── CONTENT ─── */}
      <div className="absolute inset-0 z-10 pointer-events-none">

        {/* NAME + COLORIST */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE, delay: 0 }}
          className={[
            "absolute pointer-events-auto",
            "top-[38%] -translate-y-1/2 left-6 right-6",
            "flex flex-col items-center text-center",
            "md:top-auto md:translate-y-0 md:bottom-[76px]",
            "md:left-12 md:right-auto",
            "md:items-start md:text-left",
          ].join(" ")}
        >
          <h1 className="flex flex-col text-white font-['Gotham_Local'] font-bold leading-none gap-y-1">
            <span className="text-[clamp(3rem,7vw,6rem)] tracking-[-0.05em] inline-block">
              Arkan
            </span>
            <span className="text-[clamp(3rem,7vw,6rem)] tracking-[-0.05em] inline-block">
              Taqiyuddin
            </span>
          </h1>

          {/* Colorist — mobile only */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, ease: EASE, delay: 0.15 }}
            className="md:hidden text-white leading-none tracking-[-0.01em] opacity-95 mt-3 font-['Gotham_Medium'] font-medium text-[18px]"
          >
            Colorist
          </motion.p>
        </motion.div>

        {/* BOTTOM ROW */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE, delay: 0.1 }}
          className={[
            "absolute bottom-0 left-0 right-0 pb-9 pointer-events-auto",
            "md:pb-7",
            "flex flex-col items-center gap-4",
            "md:grid md:grid-cols-[1fr_auto_1fr] md:items-center md:gap-0",
          ].join(" ")}
        >
          {/* Desktop left: Colorist */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, ease: EASE, delay: 0.15 }}
            className="hidden md:block pl-12 text-white leading-none tracking-[-0.01em] opacity-95 font-['Gotham_Regular'] font-normal text-[30px]"
          >
            Colorist
          </motion.p>

          {/* Centre: down arrow */}
          <button
            onClick={() => scrollTo("work")}
            aria-label="Scroll to work"
            className="w-[34px] h-[50px] border-[2px] border-white rounded-[17px] flex items-center justify-center hover:border-white/70 transition-colors duration-300 order-2 md:order-2 md:-translate-y-[10px]"
          >
            <div className="text-white">
              <svg
                width="19"
                height="32"
                viewBox="0 2 18 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="9" y1="2" x2="9" y2="19" />
                <polyline points="2 12.5 9 19.5 16 12.5" />
              </svg>
            </div>
          </button>

          {/* Right / Top-on-mobile: Instagram | Contact */}
          <nav className="flex justify-center md:justify-end md:pr-12 gap-1 font-['Gotham_Medium'] font-medium text-[14px] md:text-[20px] text-white/85 md:text-white/90 leading-none order-1 md:order-3 mb-1 md:mb-0 tracking-[-0.01em]">
            <a
              href="https://www.instagram.com/siarkannn/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors duration-300"
            >
              Instagram
            </a>
            <span className="opacity-100 font-normal">|</span>
            <button
              onClick={() => scrollTo("contact")}
              className="hover:text-white transition-colors duration-300"
            >
              Contact
            </button>
          </nav>
        </motion.div>
      </div>
    </section>
  );
}
