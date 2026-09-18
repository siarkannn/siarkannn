import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { useTransitionCtx } from "@/context/TransitionContext";
import { smoothScrollTo } from "@/hooks/useSmoothScroll";
import { KanWordmark } from "@/components/KanLogoK";

export function KanFooter() {
  const [location, navigate] = useLocation();
  const { setScrollTarget } = useTransitionCtx();

  const handleCollaborate = () => {
    setScrollTarget("about-contact");
    if (location === "/about") {
      smoothScrollTo("about-contact");
    } else {
      navigate("/about");
    }
  };

  return (
    <footer
      id="kan-contact"
      className="bg-black text-white font-['Gotham_Local'] select-none"
    >
      <div
        className="px-[34px] min-[390px]:px-[35px] sm:px-[36px] md:px-16 pt-[112px] sm:pt-[116px] md:pt-[22px] lg:pt-[30px] pb-[17px] sm:pb-[21px] md:pb-[44px] transition-[padding] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
      >
        {/* Main Grid matching Screenshot 1006 */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-0 md:gap-0 md:items-start -translate-y-[38px] min-[390px]:-translate-y-[42px] sm:-translate-y-[46px] md:translate-y-0">
          {/* Let's Collaborate */}
          <div className="pb-16 md:pb-0 md:col-span-6 pt-1 sm:pt-1.5 md:pt-[86px] lg:pt-[94px] md:-ml-4 -translate-y-[8px] md:-translate-y-[5px]">
            <button
              type="button"
              onClick={handleCollaborate}
              className="text-left group inline-block bg-transparent border-none p-0 cursor-pointer touch-manipulation select-none md:-translate-x-[3px]"
              aria-label="Navigate to contact section"
            >
              <h2 className="text-[1.78rem] min-[390px]:text-[1.85rem] sm:text-[1.93rem] md:text-[3.25rem] font-bold leading-[1.18] sm:leading-[1.2] md:leading-[1.15] tracking-[-0.03em] text-[#DDDDDD] transition-opacity duration-300 group-hover:opacity-70">
                Let's
                <br />
                Collaborate{" "}
                <span className="inline-block text-[0.95em] min-[390px]:text-[1em] sm:text-[1em] md:text-[1em] font-bold align-baseline ml-1 sm:ml-1.5 md:ml-1.5 -translate-x-[5px] md:-translate-x-[10px] text-[#DDDDDD]">
                  →
                </span>
              </h2>
            </button>
          </div>

          {/* ── Contact ── */}
          <div
            className="flex flex-col items-start pb-10 md:pb-0 md:col-span-2 md:col-start-8 md:pl-24 md:pt-[104px] lg:pt-[112px] -translate-y-[4px] md:translate-y-0 md:translate-x-[2px]"
          >
            <h4 
              className="text-[19px] min-[390px]:text-[20px] sm:text-[21px] md:text-[31px] font-['Gotham_Regular'] font-normal tracking-[-0.02em] mb-2.5 min-[390px]:mb-3 sm:mb-3.5 md:mb-3 leading-none text-white"
              style={{ WebkitTextStroke: "1px rgba(255, 255, 255, 0.85)" }}
            >
              Contact
            </h4>
            <a
              href="mailto:hello@siarkannn"
              className="block text-white/80 text-[14px] min-[390px]:text-[14.5px] sm:text-[15px] md:text-[17.5px] mb-[7px] min-[390px]:mb-[9px] sm:mb-[11px] md:mb-3 hover:opacity-70 transition-opacity font-['Gotham_Regular'] font-normal tracking-[-0.01em] leading-[1.26] min-[390px]:leading-[1.28] sm:leading-[1.3] md:leading-[1.5] translate-y-[1px] md:translate-y-[2.5px]"
            >
              hello@siarkannn
            </a>
            <a
              href="https://www.instagram.com/siarkannn/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="inline-block text-[#DDDDDD] hover:text-white transition-colors duration-200 -translate-y-[1px] md:-translate-y-[2px]"
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-[20px] h-[20px] min-[390px]:w-[21px] min-[390px]:h-[21px] sm:w-[22px] sm:h-[22px] md:w-[21px] md:h-[21px]"
              >
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </a>
          </div>

          {/* ── Address ── */}
          <div
            className="flex flex-col items-start -translate-y-[4px] md:translate-y-0 md:col-span-2 md:col-start-11 md:pl-6 lg:pl-8 xl:pl-10 md:pt-[104px] lg:pt-[112px]"
          >
            <h4 
              className="text-[19px] min-[390px]:text-[20px] sm:text-[21px] md:text-[31px] font-['Gotham_Regular'] font-normal tracking-[-0.02em] mb-2.5 min-[390px]:mb-3 sm:mb-3.5 md:mb-3 leading-none text-white"
              style={{ WebkitTextStroke: "1px rgba(255, 255, 255, 0.85)" }}
            >
              Address
            </h4>
            <a
              href="https://www.google.com/maps/search/?api=1&query=Jl.+Anggrek+B2+No.+25+Pondok+Padalarang+Indah+Kabupaten+Bandung+Barat+Indonesia"
              target="_blank"
              rel="noopener noreferrer"
              className="block text-white/80 text-[14px] min-[390px]:text-[14.5px] sm:text-[15px] md:text-[17.5px] leading-[1.26] min-[390px]:leading-[1.28] sm:leading-[1.3] md:leading-[1.5] font-['Gotham_Regular'] font-normal tracking-[-0.01em] hover:opacity-70 transition-opacity translate-y-[1px] md:translate-y-[2.5px]"
            >
              Jl. Anggrek B2 No. 25,
              <br />
              Pondok Padalarang Indah
              <br />
              Kabupaten Bandung Barat - Indonesia.
            </a>
          </div>
        </div>

        {/* ── Copyright ── */}
        <div className="flex justify-center md:justify-start mt-10 min-[390px]:mt-11 sm:mt-12 md:mt-[44px] lg:mt-[46px] md:-ml-4">
          <p className="text-[9px] min-[390px]:text-[9.5px] sm:text-[10px] md:text-[13.5px] text-white/40 font-['Gotham_Regular'] tracking-[-0.01em] -translate-y-[4px] md:translate-y-[8px]">
            Copyright &copy; 2026 KAN.
          </p>
        </div>
      </div>
    </footer>
  );
}
