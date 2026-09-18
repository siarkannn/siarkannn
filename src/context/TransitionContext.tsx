import React, { createContext, useContext, useRef, useState, useCallback } from "react";

interface TransitionCtx {
  activeSlug: string | null;
  setActiveSlug: (slug: string | null) => void;
  scrollTarget: string | null;
  setScrollTarget: (target: string | null) => void;
  consumeScrollTarget: () => string | null;
}

const TransitionContext = createContext<TransitionCtx>({
  activeSlug: null,
  setActiveSlug: () => {},
  scrollTarget: null,
  setScrollTarget: () => {},
  consumeScrollTarget: () => null,
});

export const useTransitionCtx = () => useContext(TransitionContext);

export function TransitionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const [scrollTarget, setScrollTargetState] = useState<string | null>(null);
  const scrollTargetRef = useRef<string | null>(null);

  const setScrollTarget = useCallback((target: string | null) => {
    scrollTargetRef.current = target;
    setScrollTargetState(target);
  }, []);

  const consumeScrollTarget = useCallback(() => {
    const target = scrollTargetRef.current;
    scrollTargetRef.current = null;
    setScrollTargetState(null);
    return target;
  }, []);

  return (
    <TransitionContext.Provider
      value={{
        activeSlug,
        setActiveSlug,
        scrollTarget,
        setScrollTarget,
        consumeScrollTarget,
      }}
    >
      {children}
    </TransitionContext.Provider>
  );
}

