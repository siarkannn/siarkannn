import React, { useEffect, useRef, useState } from "react";
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
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasVideoError, setHasVideoError] = useState(false);
  const isVisibleRef = useRef(true);

  const isPresent = useIsPresent();

  const setupVideoAttributes = (video: HTMLVideoElement) => {
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.setAttribute("muted", "");
    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "true");
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video || hasVideoError) return;

    setupVideoAttributes(video);

    // Safe reset to second 0 only if video has actually progressed past 0.1s
    // (Prevents interrupting initial buffer with an asynchronous seek that freezes playback in WebKit / Instagram WebView)
    if (video.currentTime > 0.1 && !video.seeking) {
      try {
        video.currentTime = 0;
      } catch (e) {}
    }

    const markPlaying = () => {
      if (!hasVideoError) {
        setIsPlaying(true);
      }
    };

    // Robust play attempt with pending promise guard to prevent AbortError spam in WebView
    let isPlayPending = false;
    const attemptPlay = () => {
      const v = videoRef.current;
      if (!v || v.error || hasVideoError || isPlayPending) return;
      if (v.paused) {
        if (!v.muted) v.muted = true;
        isPlayPending = true;
        const p = v.play();
        if (p !== undefined) {
          p.then(() => {
            isPlayPending = false;
            markPlaying();
          }).catch(() => {
            isPlayPending = false;
            // Handled silently: auto-retried via startup watchdog or passive user touch
          });
        } else {
          isPlayPending = false;
        }
      }
    };

    // Modern browsers: fire at the exact frame the video compositor renders the first frame
    if ("requestVideoFrameCallback" in video) {
      try {
        (video as HTMLVideoElement & { requestVideoFrameCallback: (cb: () => void) => number })
          .requestVideoFrameCallback(() => {
            if (!video.paused) {
              markPlaying();
            }
          });
      } catch (e) {}
    }

    // Check if video is already actively playing with rendered frames
    if (!video.paused) {
      markPlaying();
    }

    const onPlaying = () => {
      markPlaying();
    };
    video.addEventListener("playing", onPlaying);

    const onTimeUpdate = () => {
      if (!video.paused) {
        markPlaying();
      }
      // Backup loop safeguard: only if genuinely paused at the end and not seeking
      if (video.duration && video.currentTime >= video.duration - 0.2 && video.paused && !video.seeking) {
        try {
          video.currentTime = 0;
        } catch (e) {}
        attemptPlay();
      }
    };
    video.addEventListener("timeupdate", onTimeUpdate);

    const onReadyToPlay = () => {
      attemptPlay();
      if (!video.paused) {
        markPlaying();
      }
    };
    video.addEventListener("loadeddata", onReadyToPlay, { passive: true });
    video.addEventListener("canplay", onReadyToPlay, { passive: true });
    video.addEventListener("canplaythrough", onReadyToPlay, { passive: true });

    const onLoadedMetadata = () => {
      attemptPlay();
    };
    video.addEventListener("loadedmetadata", onLoadedMetadata, { passive: true });

    const onSeeked = () => {
      attemptPlay();
      if (!video.paused) {
        markPlaying();
      }
    };
    video.addEventListener("seeked", onSeeked, { passive: true });

    // Explicit loop fallback: ensures short clip seamlessly loops even if WebView ignores 'loop'
    const onEnded = () => {
      if (!video.seeking) {
        try {
          video.currentTime = 0;
        } catch (e) {}
        attemptPlay();
      }
    };
    video.addEventListener("ended", onEnded);

    // Auto-recovery with debounce to avoid interfering with native loop seek in WebKit / Instagram WebView
    let pauseRecoveryTimer: ReturnType<typeof setTimeout> | null = null;
    const onPause = () => {
      if (video.ended) return;
      if (pauseRecoveryTimer) clearTimeout(pauseRecoveryTimer);
      pauseRecoveryTimer = setTimeout(() => {
        const v = videoRef.current;
        if (v && v.paused && !hasVideoError) {
          attemptPlay();
        }
      }, 80);
    };
    video.addEventListener("pause", onPause);

    // Play attempts: immediate and micro-delayed fallback attempts
    attemptPlay();
    const t1 = setTimeout(attemptPlay, 40);
    const t2 = setTimeout(attemptPlay, 150);
    const t3 = setTimeout(attemptPlay, 400);

    // In-app browser startup watchdog:
    let startupWatchdog: ReturnType<typeof setInterval> | null = setInterval(() => {
      const v = videoRef.current;
      if (!v || hasVideoError) {
        if (startupWatchdog) clearInterval(startupWatchdog);
        return;
      }
      if (v.paused) {
        attemptPlay();
      } else if (!v.paused) {
        markPlaying();
        if (startupWatchdog) {
          clearInterval(startupWatchdog);
          startupWatchdog = null;
        }
      }
    }, 150);

    const watchdogTimeout = setTimeout(() => {
      if (startupWatchdog) {
        clearInterval(startupWatchdog);
        startupWatchdog = null;
      }
    }, 4500);

    video.addEventListener("waiting", attemptPlay, { passive: true });
    video.addEventListener("stalled", attemptPlay, { passive: true });

    const onError = () => {
      setHasVideoError(true);
      setIsPlaying(false);
    };
    video.addEventListener("error", onError, { passive: true });

    // Handle WebView transitions (e.g. Instagram in-app browser opening or switching tabs)
    const onVisibilityChange = () => {
      attemptPlay();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    document.addEventListener("webkitvisibilitychange", onVisibilityChange);
    window.addEventListener("focus", attemptPlay);
    window.addEventListener("pageshow", attemptPlay);

    // Mobile user interaction unlock:
    // On iOS WKWebView / Instagram in-app browser, listening on touchstart, click & pointerdown
    // guarantees immediate video start upon the first screen tap or gesture, then auto-removes to save CPU.
    const interactionEvents = ["touchstart", "touchend", "click", "pointerdown"] as const;
    let removeInteractionListeners: (() => void) | null = null;
    const onUserInteraction = () => {
      const v = videoRef.current;
      if (v && !v.error) {
        if (v.paused) {
          attemptPlay();
        } else {
          removeInteractionListeners?.();
        }
      }
    };

    removeInteractionListeners = () => {
      interactionEvents.forEach((evt) => {
        window.removeEventListener(evt, onUserInteraction, { capture: true });
        document.removeEventListener(evt, onUserInteraction, { capture: true });
      });
    };

    interactionEvents.forEach((evt) => {
      window.addEventListener(evt, onUserInteraction, { passive: true, capture: true });
      document.addEventListener(evt, onUserInteraction, { passive: true, capture: true });
    });

    // IntersectionObserver to auto-play when entering viewport without stopping exit transitions
    let observer: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== "undefined") {
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            isVisibleRef.current = entry.isIntersecting;
            if (entry.isIntersecting) {
              attemptPlay();
            }
          }
        },
        { threshold: 0.05 }
      );
      observer.observe(video);
    }

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(watchdogTimeout);
      if (startupWatchdog) {
        clearInterval(startupWatchdog);
      }
      if (pauseRecoveryTimer) {
        clearTimeout(pauseRecoveryTimer);
      }
      if (observer) {
        observer.disconnect();
      }
      video.removeEventListener("playing", onPlaying);
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("loadeddata", onReadyToPlay);
      video.removeEventListener("canplay", onReadyToPlay);
      video.removeEventListener("canplaythrough", onReadyToPlay);
      video.removeEventListener("loadedmetadata", onLoadedMetadata);
      video.removeEventListener("seeked", onSeeked);
      video.removeEventListener("ended", onEnded);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("waiting", attemptPlay);
      video.removeEventListener("stalled", attemptPlay);
      video.removeEventListener("error", onError);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      document.removeEventListener("webkitvisibilitychange", onVisibilityChange);
      window.removeEventListener("focus", attemptPlay);
      window.removeEventListener("pageshow", attemptPlay);
      removeInteractionListeners?.();
    };
  }, [hasVideoError]);

  return (
    <div
      className={`absolute inset-0 overflow-hidden select-none bg-black ${className}`}
      aria-label={ariaLabel}
      role="region"
    >
      {/* 
        1. Instant Base Poster:
        - Preloaded via <link rel="preload"> in index.html for instant 0ms zero-latency rendering.
        - Sits at z-0 so there is NEVER a black blank screen, flash, or delay on any mobile browser or WebView.
      */}
      {posterSrc && (
        <img
          src={posterSrc}
          alt=""
          aria-hidden="true"
          fetchPriority="high"
          decoding="async"
          className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none z-0"
          style={{
            display: "block",
          }}
        />
      )}

      {/* 
        2. Native Hardware Video:
        - Direct src & native poster on video element ensures identical color space pipeline without cross-fade pops.
        - Native autoPlay, muted, loop, playsInline directly handled by browser media engine.
        - Fully opaque z-[1] eliminates WebKit GPU software-texture to hardware-overlay color shifts.
      */}
      {!hasVideoError && (
        <video
          ref={(el) => {
            videoRef.current = el;
            if (el) {
              setupVideoAttributes(el);
              if (el.paused) {
                const p = el.play();
                if (p !== undefined) {
                  p.catch(() => {});
                }
              }
            }
          }}
          src={src}
          poster={posterSrc}
          autoPlay
          muted
          loop
          playsInline
          webkit-playsinline="true"
          preload="auto"
          disablePictureInPicture
          disableRemotePlayback
          aria-hidden="true"
          tabIndex={-1}
          className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none z-[1]"
          style={{
            display: "block",
          }}
        />
      )}

      {/* Optional contextual overlay (e.g. dark contrast scrim on About page) */}
      {overlayClassName && (
        <div className={`absolute inset-0 z-10 pointer-events-none ${overlayClassName}`} />
      )}
    </div>
  );
}



