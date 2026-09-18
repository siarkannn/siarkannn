import React, { useEffect, useState, useRef } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";

export function TopLoadingBar() {
  const [location] = useLocation();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const isFirstMount = useRef(true);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearAllTimers = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  };

  useEffect(() => {
    // Skip loading bar on initial hard load / first render
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }

    clearAllTimers();
    setLoading(true);
    setProgress(0.15);

    // Multi-stage progression mimicking high-end portfolio site loaders (like weareabove.space)
    const t1 = setTimeout(() => {
      setProgress(0.45);
    }, 50);

    const t2 = setTimeout(() => {
      setProgress(0.82);
    }, 280);

    const t3 = setTimeout(() => {
      setProgress(1);
    }, 620);

    const t4 = setTimeout(() => {
      setLoading(false);
      const t5 = setTimeout(() => {
        setProgress(0);
      }, 300);
      timersRef.current.push(t5);
    }, 820);

    timersRef.current.push(t1, t2, t3, t4);

    return () => {
      clearAllTimers();
    };
  }, [location]);

  return (
    <div
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 z-[999999] pointer-events-none h-[2px] md:h-[2.5px] w-full overflow-hidden"
    >
      <AnimatePresence>
        {loading && (
          <motion.div
            key="top-loading-bar-wrapper"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.25, ease: "easeOut" } }}
            className="w-full h-full relative"
          >
            <motion.div
              className="h-full bg-white"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: progress }}
              transition={{
                duration: progress === 1 ? 0.2 : 0.32,
                ease: progress === 1 ? [0.25, 1, 0.5, 1] : [0.16, 1, 0.3, 1],
              }}
              style={{
                width: "100%",
                willChange: "transform",
                transformOrigin: "left center",
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
