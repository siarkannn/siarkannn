import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { useTransitionCtx } from "@/context/TransitionContext";
import { smoothScrollTo } from "@/hooks/useSmoothScroll";
import { ShowreelVideo } from "@/components/ShowreelVideo";

export function Hero() {
  const [location, navigate] = useLocation();
  const { setScrollTarget } = useTransitionCtx();

  const handleContact = () => {
    if (location === "/about") {
      smoothScrollTo("about-contact");
    } else {
      setScrollTarget("about-contact");
      navigate("/about");
    }
  };

  return (
    <section
      id="hero"
      className="relative h-screen h-[100dvh] min-h-[100dvh] overflow-hidden bg-black select-none"
    >
      {/* Background Video using ShowreelVideo */}
      <ShowreelVideo ariaLabel="Arkan Taqiyuddin Showreel background video" />

      {/* ─── CONTENT ─── */}
      <div className="absolute inset-0 z-10 pointer-events-none">

        {/* NAME + COLORIST: Fluid responsive layout transition across maximize/restore down and resize */}
        <div
          className={[
            "absolute pointer-events-auto",
            "bottom-[60%] translate-y-1/2 left-1/2 -translate-x-1/2 w-[calc(100%-3rem)] max-w-[390px] min-[390px]:max-w-[430px]",
            "flex flex-col items-center justify-center text-center",
            "md:bottom-10 md:translate-y-0 md:left-12 md:-ml-[3.5px] md:translate-x-0 md:w-auto md:max-w-[calc(50vw-3.5rem)]",
            "md:items-start md:justify-start md:text-left",
            "transform-gpu",
            "transition-[bottom,left,transform,width,max-width,padding,margin] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
          ].join(" ")}
        >
          <h1 className="flex flex-col items-center text-center w-full md:w-auto md:flex-row md:flex-nowrap md:items-baseline md:gap-x-[0.22em] text-white font-['Gotham_Local'] font-bold leading-none gap-y-1 md:gap-y-0 md:whitespace-nowrap transform-gpu transition-[font-size,gap] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]">
            <span className="text-[clamp(3.05rem,calc(5.5vw+1.6rem),6.2rem)] tracking-[-0.04em] block w-full text-center md:inline-block md:w-auto md:text-left transform-gpu transition-[font-size,letter-spacing,transform] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]">
              Arkan
            </span>
            <span className="text-[clamp(3.05rem,calc(5.5vw+1.6rem),6.2rem)] tracking-[-0.04em] block w-full text-center md:inline-block md:w-auto md:text-left transform-gpu transition-[font-size,letter-spacing,transform] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]">
              Taqiyuddin
            </span>
          </h1>

          {/* Colorist */}
          <p className="text-white/90 leading-none tracking-[-0.01em] mt-3.5 md:mt-3.5 font-['Gotham_Medium'] font-medium text-[20px] md:text-[30px] text-center md:text-left w-full md:w-auto transform-gpu transition-[font-size,letter-spacing,transform,margin,opacity] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]">
            Colorist
          </p>
        </div>

        {/* BOTTOM ROW */}
        <div
          className="absolute bottom-0 left-0 right-0 pb-10 pointer-events-auto flex flex-col md:block items-center transition-[padding,margin,transform] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
        >
          {/* Centre: down arrow (Truly centered across entire viewport on both Desktop & Mobile) */}
          <div className="order-2 md:order-none md:absolute md:left-1/2 md:-translate-x-1/2 md:bottom-10 flex justify-center items-center pointer-events-auto transition-[transform,bottom,left] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]">
            <button
              onClick={(e) => {
                e.preventDefault();
                smoothScrollTo("work", undefined, 1000);
              }}
              onPointerDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              aria-label="Scroll to work"
              className="w-[34px] h-[48px] border-[2px] border-white rounded-[17px] flex items-center justify-center hover:border-white/70 transition-colors duration-300 translate-y-[4px] translate-x-[1px] cursor-pointer bg-transparent outline-none select-none touch-manipulation"
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

          {/* Right / Top-on-mobile: Instagram | Contact */}
          <div className="w-full order-1 md:order-none flex justify-center md:justify-end md:pr-12 mb-5 md:mb-0 transition-[padding,margin,transform] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]">
            <nav className="flex items-center gap-[4.5px] md:gap-[6.5px] font-['Gotham_Medium'] font-medium text-[15px] md:text-[21px] text-[#DDDDDD] leading-none md:translate-x-[3px] md:translate-y-[2px] tracking-[-0.01em] transition-[font-size,gap,transform] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]">
              <a
                href="https://www.instagram.com/siarkannn/"
                target="_blank"
                rel="noopener noreferrer"
                className="relative group hover:text-white transition-colors duration-300 inline-block touch-manipulation outline-none select-none"
              >
                <span>Instagram</span>
                <span
                  className="absolute left-0 right-0 -bottom-[1px] md:-bottom-[1.5px] h-[1px] bg-white transition-transform duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] origin-left scale-x-0 group-hover:scale-x-100 group-active:scale-x-100 pointer-events-none"
                  aria-hidden="true"
                />
              </a>
              <span
                className="inline-block w-[2.25px] md:w-[3.2px] h-[15px] md:h-[19.5px] bg-[#DDDDDD] self-center rounded-[1px] translate-y-[1.5px] md:translate-y-[2px]"
                aria-hidden="true"
              />
              <button
                type="button"
                onClick={handleContact}
                className="relative group hover:text-white transition-colors duration-300 cursor-pointer bg-transparent border-none p-0 outline-none text-[#DDDDDD] inline-block touch-manipulation select-none"
              >
                <span>Contact</span>
                <span
                  className="absolute left-0 right-0 -bottom-[1px] md:-bottom-[1.5px] h-[1px] bg-white transition-transform duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] origin-left scale-x-0 group-hover:scale-x-100 group-active:scale-x-100 pointer-events-none"
                  aria-hidden="true"
                />
              </button>
            </nav>
          </div>
        </div>
      </div>
    </section>
  );
}
