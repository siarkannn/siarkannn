import React, { useEffect, useRef, useCallback } from "react";
import { useIsPresent } from "framer-motion";

const BASE_URL = (import.meta.env.BASE_URL || "/").replace(/\/+$/, "");
export const SHOWREEL_VIDEO_SRC = `${BASE_URL}/video/showreel.mp4`;
export const SHOWREEL_POSTER_SRC = `${BASE_URL}/poster.jpg`;

interface ShowreelVideoProps {
  src?: string;
  posterSrc?: string;
  className?: string;
  overlayClassName?: string;
  ariaLabel?: string;
}

export function ShowreelVideo({
  src = SHOWREEL_VIDEO_SRC,
  posterSrc = SHOWREEL_POSTER_SRC,
  className = "",
  overlayClassName,
  ariaLabel = "KAN Showreel background video",
}: ShowreelVideoProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const isPresent = useIsPresent();
  const isMountedRef = useRef(true);

  // Safe playback executor that never stalls or rejects with unhandled AbortError
  const safePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video || !isMountedRef.current) return;

    // Guarantee native inline autoplay flags
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;

    if (video.paused || video.ended) {
      const promise = video.play();
      if (promise !== undefined) {
        promise.catch(() => {
          // Autoplay will unlock on user gesture
        });
      }
    }
  }, []);

  // Primary playback initialization starting at 00:00:00 and continuous playback watchdog
  useEffect(() => {
    isMountedRef.current = true;
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.loop = true;
    video.autoplay = true;

    // Always start from 00:00:00 on each page mount
    try {
      video.currentTime = 0;
    } catch {}

    const resetToStart = () => {
      try {
        video.currentTime = 0;
      } catch {}
      safePlay();
    };

    if (video.readyState >= 1) {
      resetToStart();
    } else {
      video.addEventListener("loadedmetadata", resetToStart, { once: true });
    }

    // Initial start
    safePlay();

    // Auto-resume if browser power-saving or background throttling pauses video
    const onPause = () => {
      if (isMountedRef.current && document.visibilityState === "visible") {
        requestAnimationFrame(safePlay);
      }
    };

    // Seamless loop fallback if native loop stalls at end of stream
    const onEnded = () => {
      if (!isMountedRef.current) return;
      try {
        video.currentTime = 0;
        safePlay();
      } catch {}
    };

    // Auto-resume on buffer stall
    const onStalled = () => {
      if (isMountedRef.current) {
        safePlay();
      }
    };

    video.addEventListener("pause", onPause);
    video.addEventListener("ended", onEnded);
    video.addEventListener("stalled", onStalled);
    video.addEventListener("waiting", onStalled);
    video.addEventListener("loadedmetadata", safePlay);
    video.addEventListener("canplay", safePlay);

    // Watchdog interval: checks every 1.5s while tab is visible and component is mounted
    // If the video became paused unexpectedly (e.g. after scrolling, tab switch, power saving), resumes it seamlessly
    const interval = setInterval(() => {
      if (isMountedRef.current && document.visibilityState === "visible" && video.paused) {
        safePlay();
      }
    }, 1500);

    // Resume immediately when returning to tab
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible" && isMountedRef.current) {
        safePlay();
      }
    };

    // Resume on any user interaction (scroll back to top, touch, click, wheel, focus)
    const onUserInteraction = () => {
      if (isMountedRef.current && video.paused) {
        safePlay();
      }
    };

    window.addEventListener("touchstart", onUserInteraction, { passive: true });
    window.addEventListener("click", onUserInteraction, { passive: true });
    window.addEventListener("scroll", onUserInteraction, { passive: true });
    window.addEventListener("wheel", onUserInteraction, { passive: true });
    window.addEventListener("focus", onUserInteraction);
    window.addEventListener("pageshow", onUserInteraction);
    window.addEventListener("kan:page-ready", onUserInteraction);
    document.addEventListener("visibilitychange", onVisibilityChange);

    // Intersection Observer: detects when section enters viewport (e.g. scrolling back up)
    let observer: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== "undefined" && containerRef.current) {
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting && isMountedRef.current) {
              safePlay();
            }
          }
        },
        { threshold: [0, 0.1, 0.5] }
      );
      observer.observe(containerRef.current);
    }

    return () => {
      isMountedRef.current = false;
      clearInterval(interval);
      video.removeEventListener("loadedmetadata", resetToStart);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("ended", onEnded);
      video.removeEventListener("stalled", onStalled);
      video.removeEventListener("waiting", onStalled);
      video.removeEventListener("loadedmetadata", safePlay);
      video.removeEventListener("canplay", safePlay);

      window.removeEventListener("touchstart", onUserInteraction);
      window.removeEventListener("click", onUserInteraction);
      window.removeEventListener("scroll", onUserInteraction);
      window.removeEventListener("wheel", onUserInteraction);
      window.removeEventListener("focus", onUserInteraction);
      window.removeEventListener("pageshow", onUserInteraction);
      window.removeEventListener("kan:page-ready", onUserInteraction);
      document.removeEventListener("visibilitychange", onVisibilityChange);

      if (observer) {
        observer.disconnect();
      }

      // Only pause when truly unmounted from DOM after exit animation has completed
      try {
        if (!video.paused) {
          video.pause();
        }
      } catch {}
    };
  }, [safePlay]);

  // Route transition coordinator: ensure playback starts immediately when entering
  // (Never prematurely pauses during exit transition so the video plays continuously)
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isPresent) {
      safePlay();
    }
  }, [isPresent, safePlay]);

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 overflow-hidden select-none bg-black ${className}`}
      aria-label={ariaLabel}
      role="region"
    >
      {/* Background Video: native hardware decoding with instant poster fallback */}
      <video
        ref={videoRef}
        src={src}
        poster={posterSrc}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        disablePictureInPicture
        disableRemotePlayback
        aria-hidden="true"
        tabIndex={-1}
        className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none"
      >
        <source src={src} type="video/mp4" />
      </video>

      {/* Optional contextual overlay (e.g. dark scrim on About page) */}
      {overlayClassName && (
        <div className={`absolute inset-0 z-10 pointer-events-none ${overlayClassName}`} />
      )}
    </div>
  );
}
