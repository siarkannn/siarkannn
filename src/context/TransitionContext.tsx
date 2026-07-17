import React, { createContext, useContext, useRef, useState } from "react";

interface TransitionCtx {
  activeSlug: string | null;
  setActiveSlug: (slug: string | null) => void;
  scrollTarget: string | null;
  setScrollTarget: (target: string | null) => void;
  audioRef: React.RefObject<HTMLAudioElement | null>;
}

const TransitionContext = createContext<TransitionCtx>({
  activeSlug: null,
  setActiveSlug: () => {},
  scrollTarget: null,
  setScrollTarget: () => {},
  audioRef: { current: null },
});

export const useTransitionCtx = () => useContext(TransitionContext);

export function TransitionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const [scrollTarget, setScrollTarget] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  return (
    <TransitionContext.Provider
      value={{ activeSlug, setActiveSlug, scrollTarget, setScrollTarget, audioRef }}
    >
      {children}
    </TransitionContext.Provider>
  );
}
