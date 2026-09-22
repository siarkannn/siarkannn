import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { ShowreelVideo } from "@/components/ShowreelVideo";

export function Artist() {
  const [isOpen, setIsOpen] = useState(false);
  const [, navigate] = useLocation();

  const handleArkanClick = () => {
    navigate("/artist/arkantaqiyuddin");
  };

  return (
    <section
      id="artist"
      className="relative w-full h-screen min-h-[100dvh] flex flex-col justify-start pt-[calc(50dvh-38px)] min-[360px]:pt-[calc(50dvh-40px)] min-[375px]:pt-[calc(50dvh-42px)] min-[390px]:pt-[calc(50dvh-46px)] min-[414px]:pt-[calc(50dvh-48px)] sm:pt-[calc(50dvh-52px)] md:pt-[13.25rem] lg:pt-[15.25rem] xl:pt-[16.25rem] md:pb-16 overflow-hidden antialiased bg-black select-none"
    >
      {/* Background Video with Native Hardware Acceleration & Poster */}
      <ShowreelVideo ariaLabel="KAN Artist background video" />

      {/* Content Container - Matching Work page margins */}
      <div
        className="relative z-10 w-full px-8 min-[390px]:px-9 sm:px-10 md:px-12 max-w-full text-left transition-[padding] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
      >
        <div className="flex flex-col items-start text-left max-w-5xl">
          {/* Interactive COLOR Toggle Header - Shifts upward with ultra-smooth easing */}
          <motion.button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            aria-expanded={isOpen}
            animate={{
              y: isOpen ? -18 : 0,
            }}
            transition={{
              duration: 0.4,
              ease: [0.19, 1, 0.22, 1], // GSAP Expo.easeOut (matching weareabove.space)
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
            <h1 className="text-[48px] min-[360px]:text-[52px] min-[375px]:text-[54px] min-[390px]:text-[58px] min-[414px]:text-[61px] min-[430px]:text-[63px] sm:text-[70px] md:text-[5.6rem] lg:text-[6.9rem] xl:text-[8rem] font-gotham font-bold text-white leading-none tracking-[-0.025em] uppercase select-none">
              COLOR
            </h1>
          </motion.button>

          {/* Collapsible Artist Name - Seamless reveal with smooth layout expansion (no fade in / fade out) */}
          <AnimatePresence initial={false}>
            {isOpen && (
              <motion.div
                initial={{ height: 0 }}
                animate={{
                  height: "auto",
                  transition: {
                    duration: 0.4,
                    ease: [0.19, 1, 0.22, 1], // GSAP Expo.easeOut
                  },
                }}
                exit={{
                  height: 0,
                  transition: {
                    duration: 0.4,
                    ease: [0.19, 1, 0.22, 1], // GSAP Expo.easeOut (matching weareabove.space)
                  },
                }}
                className="overflow-hidden -mt-0.5 sm:mt-0 md:mt-0.5 pl-[75px] sm:pl-[76px] md:pl-[76px] lg:pl-[84px] xl:pl-[88px] text-left"
                style={{
                  WebkitFontSmoothing: "antialiased",
                  willChange: "height",
                }}
              >
                <div className="pb-1">
                  <button
                    type="button"
                    onClick={handleArkanClick}
                    className="text-[17px] min-[360px]:text-[18px] min-[375px]:text-[19px] min-[390px]:text-[20px] min-[414px]:text-[21px] sm:text-[23px] md:text-[28px] lg:text-[33px] xl:text-[36px] font-gotham font-normal text-[#DDDDDD] hover:text-white tracking-[0em] leading-tight select-none cursor-pointer bg-transparent border-none p-0 text-left transition-colors duration-300 outline-none touch-manipulation"
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

