import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { Portfolio } from "@/components/Portfolio";
import { Footer } from "@/components/Footer";
import { WorkDetail } from "@/pages/WorkDetail";
import { TransitionProvider, useTransitionCtx } from "@/context/TransitionContext";

// Stable public URL — lets browser preload audio before React mounts
const HERO_AUDIO_URL = "/audio/far_far_away.mp3";

const PAGE_ENTER: [number, number, number, number] = [0.22, 1, 0.36, 1];
const PAGE_EXIT: [number, number, number, number] = [0.4, 0, 1, 1];

function AudioPlayer() {
  const { audioRef } = useTransitionCtx();
  return (
    <audio ref={audioRef} src={HERO_AUDIO_URL} loop playsInline preload="auto" />
  );
}

function Home() {
  return (
    <motion.main
      className="bg-black min-h-screen text-foreground antialiased overflow-x-hidden w-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: 0.5, ease: PAGE_ENTER } }}
      exit={{ opacity: 0, transition: { duration: 0.15, ease: PAGE_EXIT } }}
    >
      <Navbar />
      <Hero />
      <Portfolio />
      <Footer />
    </motion.main>
  );
}

function AppRoutes() {
  const [location] = useLocation();
  const isHome = location === "/";

  return (
    <AnimatePresence mode="wait" initial={false}>
      {isHome
        ? <Home key="home" />
        : <WorkDetail key="work" />}
    </AnimatePresence>
  );
}

function App() {
  return (
    <TransitionProvider>
      <AudioPlayer />
      <AppRoutes />
    </TransitionProvider>
  );
}

export default App;
