import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { ShowreelVideo, SHOWREEL_VIDEO_SRC } from "@/components/ShowreelVideo";

export function Artist() {
  const [isOpen, setIsOpen] = useState(false);
  const [, navigate] = useLocation();
  const containerRef = useRef<HTMLDivElement>(null);
  const letterCRef = useRef<HTMLSpanElement>(null);
  const [cCenterOffset, setCCenterOffset] = useState<number | null>(null);

  // Video preview refs & state
  const previewVideoRef = useRef<HTMLVideoElement | null>(null);
  const [isPreviewActive, setIsPreviewActive] = useState(false);
  const isPreviewActiveRef = useRef(false);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const playPromiseRef = useRef<Promise<void> | null>(null);

  // Touch and holdscreen interaction refs
  const touchStartTimestampRef = useRef<number>(0);
  const touchStartPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const didScrollRef = useRef<boolean>(false);
  const isHoldingRef = useRef<boolean>(false);
  const isTouchInteractionRef = useRef<boolean>(false);
  const lastTouchEndTimeRef = useRef<number>(0);
  const arkanButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    isPreviewActiveRef.current = isPreviewActive;
  }, [isPreviewActive]);

  const handleArkanClick = useCallback(() => {
    navigate("/artist/arkantaqiyuddin");
  }, [navigate]);

  // Safe playback starter: avoids frame drop / seek-stutter by keeping frame 0 ready
  const safePlay = useCallback(() => {
    const vid = previewVideoRef.current;
    if (!vid) return;

    vid.muted = true;
    vid.defaultMuted = true;
    vid.playsInline = true;

    // Only restart from 00:00:00 if the video has ended
    if (vid.ended) {
      try {
        vid.currentTime = 0;
      } catch {}
    }

    try {
      const p = vid.play();
      if (p !== undefined) {
        playPromiseRef.current = p;
        p.catch(() => {})
          .finally(() => {
            playPromiseRef.current = null;
          });
      }
    } catch {}
  }, []);

  // Safe playback pauser: pauses after crossfade is completely invisible (opacity: 0)
  const safePause = useCallback(async () => {
    const vid = previewVideoRef.current;
    if (!vid) return;

    if (playPromiseRef.current) {
      try {
        await playPromiseRef.current;
      } catch {}
    }

    try {
      vid.pause();
      // Rewind to 0 in background while completely invisible (opacity: 0)
      vid.currentTime = 0;
    } catch {}
  }, []);

  // Start crossfade preview
  const startPreview = useCallback(() => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }

    safePlay();
    setIsPreviewActive(true);
  }, [safePlay]);

  // Stop crossfade preview: smooth 650ms dissolve matching weareabove.space
  const stopPreview = useCallback(() => {
    setIsPreviewActive(false);

    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }

    // Allow the 650ms crossfade dissolve to fully complete before pausing video
    hideTimerRef.current = setTimeout(() => {
      if (!isHoldingRef.current) {
        safePause();
      }
    }, 650);
  }, [safePause]);

  // Pre-initialize video at frame 0 on mount
  useEffect(() => {
    const vid = previewVideoRef.current;
    if (vid) {
      vid.muted = true;
      vid.defaultMuted = true;
      vid.playsInline = true;
      try {
        vid.currentTime = 0;
      } catch {}
    }
  }, []);

  // Pre-unlock video on first user interaction for mobile autoplay compliance (run once on mount)
  useEffect(() => {
    const unlockVideo = () => {
      const vid = previewVideoRef.current;
      if (vid) {
        vid.muted = true;
        vid.defaultMuted = true;
        vid.playsInline = true;
        vid.play().then(() => {
          if (!isHoldingRef.current && !isPreviewActiveRef.current) {
            vid.pause();
            try {
              vid.currentTime = 0;
            } catch {}
          }
        }).catch(() => {});
      }
    };

    window.addEventListener("touchstart", unlockVideo, { passive: true, once: true });
    window.addEventListener("click", unlockVideo, { passive: true, once: true });

    return () => {
      window.removeEventListener("touchstart", unlockVideo);
      window.removeEventListener("click", unlockVideo);
    };
  }, []);

  // When accordion is closed, dismiss preview
  useEffect(() => {
    if (!isOpen) {
      isHoldingRef.current = false;
      stopPreview();
    }
  }, [isOpen, stopPreview]);

  // Tap outside dismiss listener for mobile (matching weareabove.space)
  useEffect(() => {
    if (!isPreviewActive) return;
    const onDismiss = (e: TouchEvent) => {
      const target = e.target as HTMLElement;
      if (arkanButtonRef.current && !arkanButtonRef.current.contains(target)) {
        isHoldingRef.current = false;
        stopPreview();
      }
    };
    window.addEventListener("touchstart", onDismiss, { passive: true });
    return () => {
      window.removeEventListener("touchstart", onDismiss);
    };
  }, [isPreviewActive, stopPreview]);

  // Desktop Hover Handlers (Isolated from synthetic touch events)
  const handleMouseEnter = useCallback(() => {
    if (isTouchInteractionRef.current || Date.now() - lastTouchEndTimeRef.current < 600) {
      return;
    }
    startPreview();
  }, [startPreview]);

  const handleMouseLeave = useCallback(() => {
    if (isTouchInteractionRef.current || Date.now() - lastTouchEndTimeRef.current < 600) {
      return;
    }
    stopPreview();
  }, [stopPreview]);

  const handleClick = useCallback(() => {
    if (isTouchInteractionRef.current || Date.now() - lastTouchEndTimeRef.current < 600) {
      return;
    }
    handleArkanClick();
  }, [handleArkanClick]);

  // Mobile Touch & Holdscreen Handlers (Isolated, non-colliding)
  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLButtonElement>) => {
    isTouchInteractionRef.current = true;
    if (e.touches.length !== 1) return;

    const touch = e.touches[0];
    touchStartTimestampRef.current = Date.now();
    touchStartPosRef.current = { x: touch.clientX, y: touch.clientY };
    didScrollRef.current = false;

    // Clear any previous hold timer
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }

    // Delay preview activation by 140ms:
    // Quick taps (< 140ms) navigate directly without any video flicker or ghostfade.
    // Intentional holdscreen (>= 140ms) smoothly crossfades the preview video like weareabove.space.
    holdTimerRef.current = setTimeout(() => {
      if (!didScrollRef.current) {
        isHoldingRef.current = true;
        startPreview();
      }
    }, 140);
  }, [startPreview]);

  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLButtonElement>) => {
    if (e.touches.length !== 1) return;

    const touch = e.touches[0];
    const deltaX = Math.abs(touch.clientX - touchStartPosRef.current.x);
    const deltaY = Math.abs(touch.clientY - touchStartPosRef.current.y);

    // Cancel hold preview if user intentionally scrolls (> 10px displacement)
    if (deltaX > 10 || deltaY > 10) {
      didScrollRef.current = true;
      if (holdTimerRef.current) {
        clearTimeout(holdTimerRef.current);
        holdTimerRef.current = null;
      }
      if (isHoldingRef.current) {
        isHoldingRef.current = false;
        stopPreview();
      }
    }
  }, [stopPreview]);

  const handleTouchEnd = useCallback((e: React.TouchEvent<HTMLButtonElement>) => {
    // Prevent synthetic mouseenter/click from firing 300ms later on mobile
    if (e.cancelable) {
      e.preventDefault();
    }

    lastTouchEndTimeRef.current = Date.now();
    isTouchInteractionRef.current = false;

    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }

    if (didScrollRef.current) {
      didScrollRef.current = false;
      isHoldingRef.current = false;
      return;
    }

    const duration = Date.now() - touchStartTimestampRef.current;

    // Quick tap (< 240ms without hold activation): directly open artist page
    if (!isHoldingRef.current && duration < 240) {
      handleArkanClick();
      return;
    }

    // Held screen was active: smoothly dissolve back to ambient video
    if (isHoldingRef.current) {
      isHoldingRef.current = false;
      stopPreview();
    }
  }, [handleArkanClick, stopPreview]);

  const handleTouchCancel = useCallback(() => {
    lastTouchEndTimeRef.current = Date.now();
    isTouchInteractionRef.current = false;
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    if (isHoldingRef.current) {
      isHoldingRef.current = false;
      stopPreview();
    }
  }, [stopPreview]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
      }
      if (holdTimerRef.current) {
        clearTimeout(holdTimerRef.current);
      }
    };
  }, []);

  // Align left edge of artist name precisely with the optical center of the letter 'C' in 'COLOR'
  // across all viewport sizes (desktop and mobile), exactly like weareabove.space
  const updateOffset = useCallback(() => {
    if (containerRef.current && letterCRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const cRect = letterCRef.current.getBoundingClientRect();
      if (cRect.width > 0) {
        const center = (cRect.left - containerRect.left) + (cRect.width / 2);
        setCCenterOffset(Math.round(center * 10) / 10);
      }
    }
  }, []);

  useEffect(() => {
    updateOffset();
    const frameId = requestAnimationFrame(updateOffset);

    window.addEventListener("resize", updateOffset, { passive: true });

    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(() => {
        updateOffset();
      });
      if (containerRef.current) ro.observe(containerRef.current);
      if (letterCRef.current) ro.observe(letterCRef.current);
    }

    if (document.fonts?.ready) {
      document.fonts.ready.then(updateOffset);
    }

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", updateOffset);
      if (ro) ro.disconnect();
    };
  }, [updateOffset]);

  return (
    <section
      id="artist"
      className="relative w-full min-h-screen min-h-[100dvh] flex flex-col justify-start pt-[calc(50dvh-38px)] min-[360px]:pt-[calc(50dvh-40px)] min-[375px]:pt-[calc(50dvh-42px)] min-[390px]:pt-[calc(50dvh-46px)] min-[414px]:pt-[calc(50dvh-48px)] sm:pt-[calc(50dvh-52px)] md:pt-[13.25rem] lg:pt-[15.25rem] xl:pt-[16.25rem] md:pb-16 overflow-x-hidden antialiased bg-black select-none"
    >
      {/* Base Background Video: always continuously playing */}
      <ShowreelVideo ariaLabel="KAN Artist background video" />

      {/* Cross-fade Preview Video Overlay: buttery-smooth cinematic crossfade (matching weareabove.space) */}
      <div
        className={`absolute inset-0 overflow-hidden select-none pointer-events-none transition-opacity duration-[650ms] ease-[cubic-bezier(0.4,0,0.2,1)] z-[1] will-change-[opacity] ${
          isPreviewActive ? "opacity-100" : "opacity-0"
        }`}
        style={{
          transform: "translate3d(0, 0, 0)",
          WebkitBackfaceVisibility: "hidden",
          backfaceVisibility: "hidden",
          contain: "paint",
        }}
        aria-hidden="true"
      >
        <video
          ref={previewVideoRef}
          src={SHOWREEL_VIDEO_SRC}
          muted
          playsInline
          loop
          preload="auto"
          disablePictureInPicture
          disableRemotePlayback
          aria-hidden="true"
          tabIndex={-1}
          className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none"
          style={{
            transform: "translate3d(0, 0, 0)",
            WebkitBackfaceVisibility: "hidden",
            backfaceVisibility: "hidden",
          }}
        />
      </div>

      {/* Content Container - Matching Work page margins */}
      <div
        className="relative z-10 w-full px-8 min-[390px]:px-9 sm:px-10 md:px-[40px] max-w-full text-left transition-[padding] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
      >
        <div ref={containerRef} className="flex flex-col items-start text-left max-w-5xl">
          {/* Interactive COLOR Toggle Header with slide-up animation */}
          <motion.button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            aria-expanded={isOpen}
            animate={{ y: isOpen ? -18 : 0 }}
            transition={{
              duration: 0.4,
              ease: [0.19, 1, 0.22, 1], // GSAP Expo.easeOut
            }}
            className="group flex items-center gap-3 min-[360px]:gap-3.5 min-[390px]:gap-[15px] sm:gap-4 md:gap-[15px] lg:gap-4 text-left bg-transparent border-none p-0 cursor-pointer outline-none transition-opacity duration-200 hover:opacity-85 touch-manipulation"
            style={{
              transformOrigin: "left center",
              WebkitTapHighlightColor: "transparent",
              WebkitBackfaceVisibility: "hidden",
              backfaceVisibility: "hidden",
              willChange: "transform",
            }}
          >
            {/* Toggle Symbol (+ to —) - Jitter-Free GPU Vector Icon matching weareabove.space (1.667rem ~30px) */}
            <div
              className="relative flex items-center justify-center w-[26px] min-[360px]:w-[28px] min-[375px]:w-[29px] min-[390px]:w-[30px] min-[414px]:w-[31px] sm:w-[32px] md:w-[28px] lg:w-[32px] h-[26px] min-[360px]:h-[28px] min-[375px]:h-[29px] min-[390px]:h-[30px] min-[414px]:h-[31px] sm:h-[32px] md:h-[28px] lg:h-[32px] flex-shrink-0 md:translate-y-[12px] lg:translate-y-[15px]"
            >
              <svg
                viewBox="0 0 32 32"
                className="w-full h-full text-white pointer-events-none origin-left"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.25"
                strokeLinecap="round"
                style={{
                  display: "block",
                  transform: "translateZ(0)",
                  WebkitBackfaceVisibility: "hidden",
                  backfaceVisibility: "hidden",
                }}
              >
                {/* Horizontal line (always visible) */}
                <line x1="1.5" y1="16" x2="30.5" y2="16" />
                {/* Vertical line: langsung berganti tanpa efek pendek ke panjang & tanpa fade in/out */}
                {!isOpen && (
                  <line x1="16" y1="1.5" x2="16" y2="30.5" />
                )}
              </svg>
            </div>

            {/* COLOR Heading - widened letter-spacing to match weareabove.space */}
            <h1
              className={`text-[48px] min-[360px]:text-[52px] min-[375px]:text-[54px] min-[390px]:text-[58px] min-[414px]:text-[61px] min-[430px]:text-[63px] sm:text-[70px] md:text-[5.6rem] lg:text-[6.9rem] xl:text-[8rem] font-gotham font-bold leading-none tracking-[-0.025em] uppercase select-none transition-[font-size,letter-spacing] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                isOpen ? "text-white" : "text-[#DDDDDD]"
              }`}
            >
              <span ref={letterCRef}>C</span>OLOR
            </h1>
          </motion.button>

          {/* Collapsible Artist Name - Left-aligned with the center of letter 'C' in 'COLOR' */}
          <AnimatePresence initial={false}>
            {isOpen && (
              <motion.div
                initial={{ height: 0, y: 0 }}
                animate={{
                  height: "auto",
                  y: isOpen ? -18 : 0,
                  transition: {
                    duration: 0.4,
                    ease: [0.19, 1, 0.22, 1], // GSAP Expo.easeOut
                  },
                }}
                exit={{
                  height: 0,
                  y: 0,
                  transition: {
                    duration: 0.4,
                    ease: [0.19, 1, 0.22, 1], // GSAP Expo.easeOut
                  },
                }}
                className="overflow-hidden pl-[56px] min-[360px]:pl-[61px] min-[375px]:pl-[63px] min-[390px]:pl-[66px] min-[414px]:pl-[68px] sm:pl-[74px] md:pl-[75px] lg:pl-[89px] xl:pl-[95px] text-left transition-[padding] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
                style={{
                  WebkitFontSmoothing: "antialiased",
                  willChange: "height, transform",
                  ...(cCenterOffset !== null ? { paddingLeft: `${cCenterOffset}px` } : {}),
                }}
              >
                <div className="pt-[12px] min-[360px]:pt-[14px] sm:pt-[16px] md:pt-[18px] lg:pt-[20px] pb-1 transition-[padding] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]">
                  <button
                    ref={arkanButtonRef}
                    type="button"
                    onClick={handleClick}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    onTouchCancel={handleTouchCancel}
                    className={`text-[24px] sm:text-[30px] md:text-[45px] font-gotham font-normal ${
                      isPreviewActive ? "text-white" : "text-[#DDDDDD]"
                    } hover:text-white tracking-[0em] leading-[24px] sm:leading-[30px] md:leading-[45px] whitespace-nowrap select-none cursor-pointer bg-transparent border-none p-0 text-left transition-colors duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] outline-none touch-manipulation`}
                    style={{
                      WebkitTapHighlightColor: "transparent",
                      touchAction: "manipulation",
                    }}
                  >
                    Arkan Taqiyuddin
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}


