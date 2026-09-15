import { motion } from "framer-motion";
import { smoothScrollTo } from "@/hooks/useSmoothScroll";
import { KanHeroWordmark } from "@/components/KanLogoK";
import { ShowreelVideo } from "@/components/ShowreelVideo";

export function KanHero() {
  return (
    <section
      id="kan-hero"
      className="relative h-screen h-[100dvh] min-h-[100dvh] overflow-hidden bg-black select-none"
    >
      {/* Background Video with Native Hardware Plane & Poster */}
      <ShowreelVideo ariaLabel="KAN Showreel background video" />

      {/* Hero Center Typography: Flawless fluid scale-in / scale-out with zero jitter */}
      <div
        className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none px-6 md:px-12 transition-[padding] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
      >
        <div className="text-center w-full flex items-center justify-center">
          <h1 className="flex items-center justify-center m-0 p-0 select-none">
            <span className="sr-only">KAN</span>
            <KanHeroWordmark
              className="w-[clamp(270px,calc(38vw+110px),620px)] h-auto text-white transform-gpu transition-[width] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
              style={{
                filter: "drop-shadow(0 0 0.5px rgba(255,255,255,0.2))",
              }}
            />
          </h1>
        </div>
      </div>

      {/* Bottom Controls: Center Down Arrow matching Screenshot 1004 */}
      <div
        className="absolute bottom-0 left-0 right-0 pb-10 flex items-center justify-center pointer-events-auto z-20 transition-[padding] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
      >
        {/* Centre: down arrow pill from homepage */}
        <button
          onClick={() => smoothScrollTo("kan-intro")}
          aria-label="Scroll to content"
          className="w-[34px] h-[48px] border-[2px] border-white rounded-[17px] flex items-center justify-center hover:border-white/70 transition-colors duration-300 translate-y-[4px] translate-x-[1px] cursor-pointer bg-transparent"
        >
          <div className="text-white flex items-center justify-center -translate-y-[3.8px]">
            <svg
              width="18"
              height="30"
              viewBox="0 0 18 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="9" y1="2" x2="9" y2="20.5" />
              <polyline points="2 13.5 9 20.5 16 13.5" />
            </svg>
          </div>
        </button>
      </div>
    </section>
  );
}
