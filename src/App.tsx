import React, { Component, ErrorInfo, ReactNode } from "react";
import { useLocation } from "wouter";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence, useIsPresent } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { Portfolio } from "@/components/Portfolio";
import { Footer } from "@/components/Footer";
import { WorkDetail } from "@/pages/WorkDetail";
import { About } from "@/components/About";
import { Artist } from "@/components/Artist";
import { ArtistScrollToTop } from "@/components/ArtistScrollToTop";
import { KanPage } from "@/pages/KanPage";
import { TopLoadingBar } from "@/components/TopLoadingBar";
import { TransitionProvider, useTransitionCtx } from "@/context/TransitionContext";
import { smoothScrollTo, getIsScrolling } from "@/hooks/useSmoothScroll";
import { findProjectBySlug } from "@/data/projects";
import {
  getIsInitialAppLoad,
  getIsRestoringScroll,
  restoreScrollForPath,
  resetScrollForPath,
  markAppInitialLoadComplete,
} from "@/utils/scrollRestoration";

function updateDocumentTitle(rawLoc: string) {
  if (typeof document === "undefined") return;
  const loc = rawLoc.replace(/\/+$/, "") || "/";
  if (loc === "/" || loc === "/kan") {
    document.title = "Home - KAN";
  } else if (loc === "/artist/arkantaqiyuddin" || loc === "/arkan" || loc === "/arkantaqiyuddin") {
    document.title = "Arkan Taqiyuddin - Colorist - KAN";
  } else if (loc === "/work" || loc === "/works") {
    document.title = "Work - KAN";
  } else if (loc === "/about") {
    document.title = "About - KAN";
  } else if (loc === "/artist") {
    document.title = "Artist - KAN";
  } else if (loc.startsWith("/work/")) {
    const rawSlug = loc.slice(6).split("?")[0].split("#")[0];
    const slug = decodeURIComponent(rawSlug).trim();
    const { project } = findProjectBySlug(slug);
    if (project?.title) {
      document.title = `${project.title} - KAN`;
    } else {
      document.title = "Work - KAN";
    }
  } else {
    document.title = "KAN — Independent Post-Production";
  }
}

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("App Error Boundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
          <h1 className="text-2xl font-bold mb-4 font-['Gotham_Local']">siarkannn</h1>
          <p className="text-white/70 mb-6 text-sm">Something went wrong while loading this page.</p>
          <button
            onClick={() => {
              window.location.href = "/";
            }}
            className="px-6 py-2 border border-white rounded-full text-sm hover:bg-white hover:text-black transition-colors"
          >
            Return to Home
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const EXPO_EASE_IN_OUT: [number, number, number, number] = [0.87, 0, 0.13, 1];

const pageVariants = {
  initial: {
    y: "-100%",
  },
  animate: {
    y: "0%",
    transition: {
      duration: 1.0,
      ease: EXPO_EASE_IN_OUT,
    },
  },
  exit: {
    y: "100%",
    transition: {
      duration: 1.0,
      ease: EXPO_EASE_IN_OUT,
    },
  },
};

let hasInitialAppRendered = false;

function PageTransition({
  children,
  pageKey,
  path = "/",
}: {
  children: React.ReactNode;
  pageKey: string;
  path?: string;
}) {
  const isPresent = useIsPresent();
  const isInitialLoad = useRef(!hasInitialAppRendered);
  const [isAnimating, setIsAnimating] = useState(() => !isInitialLoad.current);
  const scrollYRef = useRef(0);
  const frozenScrollY = useRef<number | null>(null);

  useEffect(() => {
    hasInitialAppRendered = true;
  }, []);

  // Track live scroll position while the page is actively present
  useEffect(() => {
    if (!isPresent) return;
    const updateScroll = () => {
      scrollYRef.current = window.scrollY || document.documentElement.scrollTop || 0;
    };
    updateScroll();
    window.addEventListener("scroll", updateScroll, { passive: true });
    return () => window.removeEventListener("scroll", updateScroll);
  }, [isPresent]);

  // Synchronously freeze the exact scroll offset on exit so the exiting page never snaps to top
  if (!isPresent && frozenScrollY.current === null) {
    frozenScrollY.current =
      scrollYRef.current || (typeof window !== "undefined" ? window.scrollY : 0);
  }

  // When a new page enters, ensure window scroll position is 0 immediately
  useEffect(() => {
    if (isPresent && !isInitialLoad.current) {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
    }
  }, [isPresent]);

  // Failsafe watchdog timer: guarantees the entering page is released from fixed positioning
  useEffect(() => {
    if (isAnimating && isPresent) {
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, 1050);
      return () => clearTimeout(timer);
    }
  }, [isAnimating, isPresent]);

  return (
    <motion.main
      key={pageKey}
      className={
        isAnimating || !isPresent
          ? `fixed inset-0 w-full overflow-hidden bg-black ${
              isPresent ? "z-20 pointer-events-none" : "z-10 pointer-events-none"
            }`
          : "relative w-full min-h-screen bg-black pointer-events-auto"
      }
      variants={pageVariants}
      initial={isInitialLoad.current ? false : "initial"}
      animate="animate"
      exit="exit"
      style={{
        WebkitBackfaceVisibility: "hidden",
        backfaceVisibility: "hidden",
        WebkitTransformStyle: "flat",
        transformStyle: "flat",
        willChange: isAnimating || !isPresent ? "transform" : "auto",
      }}
      onAnimationComplete={() => {
        if (isPresent) {
          setIsAnimating(false);
        }
      }}
    >
      <Navbar currentPath={path} isPagePresent={isPresent} />
      <div
        className="w-full min-h-screen bg-black antialiased overflow-x-hidden"
        style={
          !isPresent && frozenScrollY.current && frozenScrollY.current > 0
            ? {
                transform: `translate3d(0, -${frozenScrollY.current}px, 0)`,
                WebkitTransform: `translate3d(0, -${frozenScrollY.current}px, 0)`,
              }
            : undefined
        }
      >
        {children}
      </div>
    </motion.main>
  );
}

function WorkPage() {
  const { consumeScrollTarget } = useTransitionCtx();

  useEffect(() => {
    const isInitial = getIsInitialAppLoad();
    const target = consumeScrollTarget();
    if (target) {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
      const timer = setTimeout(() => {
        smoothScrollTo(target);
      }, 1010);
      return () => clearTimeout(timer);
    } else if (isInitial) {
      restoreScrollForPath("/work");
    } else {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
      resetScrollForPath("/work");
    }
  }, [consumeScrollTarget]);

  return (
    <>
      <div className="pt-[82px] min-[390px]:pt-[86px] sm:pt-[88px] md:pt-[92px]">
        <Portfolio />
      </div>
      <Footer isWorkPage />
      <ArtistScrollToTop />
    </>
  );
}

function Home() {
  const { consumeScrollTarget } = useTransitionCtx();

  useEffect(() => {
    const isInitial = getIsInitialAppLoad();
    const target = consumeScrollTarget();
    if (target && target !== "bounce-collaborate") {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
      const timer = setTimeout(() => {
        smoothScrollTo(target);
      }, 1010);
      return () => clearTimeout(timer);
    } else if (isInitial) {
      restoreScrollForPath("/artist/arkantaqiyuddin");
    } else {
      window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
      resetScrollForPath("/artist/arkantaqiyuddin");
    }
  }, [consumeScrollTarget]);

  return (
    <>
      <Hero />
      <Portfolio />
      <Footer isArtistPage />
      <ArtistScrollToTop />
    </>
  );
}

function AboutPage() {
  const { consumeScrollTarget } = useTransitionCtx();

  useEffect(() => {
    const isInitial = getIsInitialAppLoad();
    const target = consumeScrollTarget();
    if (target) {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
      const timer = setTimeout(() => {
        smoothScrollTo(target);
      }, 1010);
      return () => clearTimeout(timer);
    } else if (isInitial) {
      restoreScrollForPath("/about");
    } else {
      window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
      resetScrollForPath("/about");
    }
  }, [consumeScrollTarget]);

  return <About />;
}

function ArtistPage() {
  const { consumeScrollTarget } = useTransitionCtx();

  useEffect(() => {
    const isInitial = getIsInitialAppLoad();
    const target = consumeScrollTarget();
    if (target) {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
      const timer = setTimeout(() => {
        smoothScrollTo(target);
      }, 1010);
      return () => clearTimeout(timer);
    } else if (isInitial) {
      restoreScrollForPath("/artist");
    } else {
      window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
      resetScrollForPath("/artist");
    }
  }, [consumeScrollTarget]);

  return (
    <>
      <Artist />
      <ArtistScrollToTop />
    </>
  );
}

function AppRoutes() {
  const [rawLocation] = useLocation();
  const location = rawLocation.replace(/\/+$/, "") || "/";
  const isKanHome = location === "/" || location === "/kan";
  const isArtistProfile = location === "/artist/arkantaqiyuddin" || location === "/arkan" || location === "/arkantaqiyuddin";
  const isWork = location === "/work" || location === "/works";
  const isAbout = location === "/about";
  const isArtist = location === "/artist";
  const isWorkDetail = location.startsWith("/work/") && location.length > 6;
  const workSlug = isWorkDetail
    ? decodeURIComponent(location.slice(6))
    : "";

  // Synchronous and immediate document title update on every router location transition
  if (typeof document !== "undefined") {
    updateDocumentTitle(location);
  }

  useEffect(() => {
    updateDocumentTitle(location);
    try {
      sessionStorage.setItem("kan_active_route", location);
      sessionStorage.setItem("kan_session_active", "true");
    } catch (e) {}

    // Mark initial app load as complete after layout and scroll restoration settle
    const timer = setTimeout(() => {
      markAppInitialLoadComplete();
    }, 1500);
    return () => clearTimeout(timer);
  }, [location]);

  // Smooth layout coordinator for window restore down, maximize, and responsive resize (Desktop & Mobile)
  const [, setResizeTick] = useState(0);
  useEffect(() => {
    if (typeof window === "undefined") return;

    let rafId: number | null = null;
    let timerId: ReturnType<typeof setTimeout> | null = null;
    let lastW = window.innerWidth;
    let lastH = window.innerHeight;

    const onResize = () => {
      const curW = window.innerWidth;
      const curH = window.innerHeight;
      if (curW === lastW && curH === lastH) return;
      lastW = curW;
      lastH = curH;

      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        setResizeTick((t) => (t + 1) % 10000);
      });

      // Secondary settling tick for OS window restore-down / maximize animations
      if (timerId) clearTimeout(timerId);
      timerId = setTimeout(() => {
        setResizeTick((t) => (t + 1) % 10000);
      }, 160);
    };

    window.addEventListener("resize", onResize, { passive: true });
    window.addEventListener("orientationchange", onResize, { passive: true });
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
      if (rafId) cancelAnimationFrame(rafId);
      if (timerId) clearTimeout(timerId);
    };
  }, []);

  return (
    <div className="relative w-full min-h-screen bg-black overflow-x-hidden">
      <AnimatePresence initial={false}>
        {isKanHome ? (
          <PageTransition key="kan" pageKey="kan" path="/">
            <KanPage />
          </PageTransition>
        ) : isWork ? (
          <PageTransition key="work" pageKey="work" path="/work">
            <WorkPage />
          </PageTransition>
        ) : isArtistProfile ? (
          <PageTransition
            key="artist-arkan"
            pageKey="artist-arkan"
            path="/artist/arkantaqiyuddin"
          >
            <Home />
          </PageTransition>
        ) : isAbout ? (
          <PageTransition key="about" pageKey="about" path="/about">
            <AboutPage />
          </PageTransition>
        ) : isArtist ? (
          <PageTransition key="artist" pageKey="artist" path="/artist">
            <ArtistPage />
          </PageTransition>
        ) : (
          <PageTransition key={location} pageKey={location} path={location}>
            <WorkDetail key={location} slug={workSlug} />
          </PageTransition>
        )}
      </AnimatePresence>
    </div>
  );
}

export function App() {
  return (
    <ErrorBoundary>
      <TransitionProvider>
        <TopLoadingBar />
        <AppRoutes />
      </TransitionProvider>
    </ErrorBoundary>
  );
}

export default App;
