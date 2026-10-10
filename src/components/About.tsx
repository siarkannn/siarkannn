import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Footer } from "@/components/Footer";
import { ShowreelVideo } from "@/components/ShowreelVideo";

export function About() {
  const [isAtBottom, setIsAtBottom] = useState(false);
  const [isAiStudioIframe, setIsAiStudioIframe] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      return (
        window.self !== window.top ||
        Boolean(typeof document !== "undefined" && document.referrer.includes("aistudio.google.com"))
      );
    } catch {
      return true;
    }
  });

  useEffect(() => {
    try {
      const isIframe =
        window.self !== window.top ||
        Boolean(typeof document !== "undefined" && document.referrer.includes("aistudio.google.com"));
      setIsAiStudioIframe(isIframe);
    } catch {
      setIsAiStudioIframe(true);
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (typeof window === "undefined") return;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = window.innerHeight;
      const scrollY = window.scrollY || document.documentElement.scrollTop || 0;
      // Check if at the very bottom of the page (within 8px tolerance)
      const atBottom = scrollY + clientHeight >= scrollHeight - 8;
      setIsAtBottom(atBottom);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  return (
    <>
      <section
        id="about"
        className="relative w-full min-h-screen md:h-screen md:min-h-[100dvh] flex flex-col justify-start md:justify-center items-center overflow-hidden antialiased bg-black select-none"
      >
        {/* Background Video with Dark Overlay */}
        <ShowreelVideo overlayClassName="bg-black/60" ariaLabel="KAN About background video" />

        {/* Content Container */}
      <div
        className="relative z-10 w-full px-8 min-[390px]:px-9 sm:px-10 md:px-12 lg:px-14 xl:px-16 max-w-[1520px] mx-auto pt-[80px] min-[390px]:pt-[82px] sm:pt-[86px] md:pt-0 pb-10 md:pb-0 flex flex-col justify-start md:justify-center items-center transition-[padding,max-width] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
      >
        <div
          className="w-full flex flex-col md:flex-row md:justify-between items-start md:items-center gap-[30px] min-[390px]:gap-[34px] sm:gap-10 md:gap-8 lg:gap-12 xl:gap-14 pt-0 pb-2 md:py-0 transition-[gap] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
        >
          {/* LEFT COLUMN: Judul Besar - Vertically Centered */}
          <div
            className="w-full md:w-auto flex flex-col justify-center items-start text-left flex-shrink-0"
          >
            <h2 className="text-[49px] min-[390px]:text-[55px] sm:text-[61px] md:text-[5.4rem] lg:text-[6.7rem] xl:text-[7.85rem] font-gotham font-bold text-white leading-[0.92] sm:leading-[0.90] md:leading-[0.89] lg:leading-[0.87] tracking-[-0.045em] text-left md:whitespace-nowrap -ml-[2.5px] min-[390px]:-ml-[3px] md:ml-0">
              An<br />
              Independent<br />
              Visual<br />
              Enthusiast
            </h2>
          </div>

          {/* RIGHT COLUMN: Deskripsi Ramping */}
          <div
            className="w-full md:w-[50%] lg:w-[48.2%] xl:w-[46.4%] max-w-[582px] lg:max-w-[636px] xl:max-w-[645px] md:ml-auto text-left flex flex-col items-start transition-[width,max-width] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
          >
            {/* INTRO */}
            <div className="mb-3 min-[390px]:mb-3.5 sm:mb-3.5 md:mb-3.5 lg:mb-4 xl:mb-4">
              <h3 className="text-[17.5px] min-[360px]:text-[18px] min-[390px]:text-[18.5px] sm:text-[22px] md:text-[24px] lg:text-[27px] xl:text-[30px] font-gotham font-medium md:font-['Gotham_Regular'] md:font-normal md:[-webkit-text-stroke:0.6px_rgba(255,255,255,0.92)] text-white/90 min-[390px]:text-white/92 leading-[1.28] sm:leading-snug md:leading-[30px] lg:leading-[33px] xl:leading-[36px] tracking-[-0.015em] antialiased">
                Post-production studio
                <br />
                based in Bandung,
              </h3>
            </div>

            {/* BODY */}
            <div className="space-y-[24px] min-[390px]:space-y-[26px] sm:space-y-5 md:space-y-6 lg:space-y-6.5 xl:space-y-7 text-[12.6px] min-[360px]:text-[12.8px] min-[375px]:text-[13.2px] min-[390px]:text-[13.6px] sm:text-[14.2px] md:text-[15.6px] lg:text-[16.5px] xl:text-[17.4px] text-white/95 font-['Gotham_Regular'] font-normal tracking-[-0.012em] sm:tracking-normal leading-[1.40] min-[390px]:leading-[1.44] sm:leading-[1.46] md:leading-[23.5px] lg:leading-[25px] xl:leading-[26.8px] text-left antialiased">
              <p>
                <span className="md:hidden block">
                  <span className="block whitespace-nowrap">An independent post-production practice</span>
                  <span className="block whitespace-nowrap">built on curiosity, craft, and visual clarity.</span>
                  <span className="block whitespace-nowrap">Each project begins with a clear perspective,</span>
                  <span className="block whitespace-nowrap">shaped through thoughtful choices toward</span>
                  <span className="block whitespace-nowrap">distinct visual outcomes.</span>
                </span>
                <span className="hidden md:inline">
                  <span className="md:inline-block whitespace-normal lg:whitespace-nowrap">An independent post-production practice built on curiosity,</span>
                  <br />
                  <span className="md:inline-block whitespace-normal lg:whitespace-nowrap">craft, and visual clarity. Each project begins with a clear</span>
                  <br />
                  <span className="md:inline-block whitespace-normal lg:whitespace-nowrap">perspective, shaped through thoughtful choices toward</span>
                  <br />
                  <span className="md:inline-block whitespace-normal lg:whitespace-nowrap">distinct visual outcomes.</span>
                </span>
              </p>

              <p>
                <span className="md:hidden block">
                  <span className="block whitespace-nowrap">Specializing in Color Grading and Finishing,</span>
                  <span className="block whitespace-nowrap">from the first pass to the final render, every frame</span>
                  <span className="block whitespace-nowrap">is treated with precision, care, and a considered</span>
                  <span className="block whitespace-nowrap">sense of style.</span>
                </span>
                <span className="hidden md:inline">
                  <span className="md:inline-block whitespace-normal lg:whitespace-nowrap">Specializing in Color Grading and Finishing, from the first creative pass</span>
                  <br />
                  <span className="md:inline-block whitespace-normal lg:whitespace-nowrap">to the final render, every frame is treated with precision, care, and a</span>
                  <br />
                  <span className="md:inline-block whitespace-normal lg:whitespace-nowrap">considered sense of style.</span>
                </span>
              </p>

              <p>
                My process is built on dialogue and curiosity.{" "}
                <br className="sm:hidden" />
                Ideas are questioned, explored, and elevated{" "}
                <br className="sm:hidden" />
                together, because the best results come from{" "}
                <br className="sm:hidden" />
                constant thinking, tinkering, <span className="whitespace-nowrap">and collaboration.</span>
              </p>

              <p>
                We don&apos;t settle for average.
              </p>

              <p className="font-['Gotham_Regular'] font-normal text-white">
                We are <span className="inline-block font-gotham font-bold text-white tracking-[0.055em] md:tracking-[0.065em] ml-[0.06em]">KAN</span>.
              </p>
            </div>
          </div>
        </div>
      </div>
      </section>

      <section
        id="about-contact"
        style={{ transition: "none" }}
        className={`relative z-20 w-full min-h-[calc(100dvh-50px)] md:h-screen md:h-[100dvh] md:min-h-[100dvh] md:max-h-screen flex flex-col justify-between bg-black text-white antialiased select-none border-t ${
          isAtBottom ? "border-white/20 md:border-transparent" : "border-white/20"
        } transition-none`}
      >
        <div
          className="mx-auto w-full max-w-[1120px] md:max-w-[1140px] lg:max-w-[1180px] xl:max-w-[1200px] flex-1 px-[18px] min-[390px]:px-[21px] sm:px-8 md:px-16 pt-[48px] min-[390px]:pt-[58px] sm:pt-[50px] md:pt-16 lg:pt-20 pb-[36px] min-[390px]:pb-[42px] sm:pb-[55px] md:pb-16 lg:pb-20 flex flex-col justify-center transition-[padding,max-width] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
        >
          <div className={`w-full ${!isAiStudioIframe ? "md:translate-y-[26px]" : ""}`}>
            <h2 className="text-center font-gotham font-bold text-[32px] min-[360px]:text-[33px] min-[375px]:text-[33.5px] min-[390px]:text-[34px] min-[414px]:text-[35px] sm:text-[40px] md:text-[60px] lg:text-[76px] xl:text-[86px] leading-[1.02] md:leading-[1.02] lg:leading-[1.0] xl:leading-[0.98] tracking-[-0.035em] md:tracking-[-0.045em] mb-7 min-[390px]:mb-8 sm:mb-8 md:mb-8 lg:mb-9 xl:mb-10 -translate-y-2 sm:-translate-y-4 md:-translate-y-[10px] lg:-translate-y-[14px] xl:-translate-y-[18px]">
              <span className="inline-block whitespace-nowrap">
                Let&apos;s <span className="inline-block -ml-[0.13em] lg:-ml-[0.14em]">Create</span>
              </span>
              <br />
              <span className="inline-block whitespace-nowrap">
                Something <span className="inline-block tracking-[0.01em] -ml-[0.12em] lg:-ml-[0.13em]">KAN</span>
              </span>
            </h2>

            <div className="border-t border-white/20 pt-4 min-[390px]:pt-[18px] sm:pt-6 md:pt-4 lg:pt-[18px] grid grid-cols-1 md:grid-cols-12 gap-6 min-[390px]:gap-7 sm:gap-8 md:gap-x-5 lg:gap-x-6 xl:gap-x-7 items-start md:items-start md:-translate-y-[1px]">
            <div className="text-left md:col-span-4 lg:col-span-4">
              <h3 
                className="font-['Gotham_Regular'] font-normal text-[17.5px] min-[375px]:text-[18.5px] min-[390px]:text-[19.5px] sm:text-[23px] md:text-[27px] lg:text-[31px] xl:text-[32px] leading-snug tracking-[-0.02em] mb-[4px] min-[375px]:mb-[5px] md:mb-2 text-white"
                style={{ WebkitTextStroke: "1px rgba(255, 255, 255, 0.85)" }}
              >
                Visit <span className="inline-block -ml-[0.06em] md:-ml-[0.07em]">Us</span>
              </h3>
              <p className="font-['Gotham_Regular'] font-normal text-[13px] min-[375px]:text-[14px] min-[390px]:text-[14.5px] sm:text-[15px] md:text-[16px] lg:text-[17px] leading-[1.28] min-[375px]:leading-[1.3] sm:leading-[1.35] md:leading-[1.55] lg:leading-[1.58] text-white/80 tracking-[-0.01em]">
                Jl. Anggrek B2 No. 25,
                <br />
                Pondok Padalarang Indah
                <br />
                Bandung 40553 - Indonesia.
              </p>
              <a
                href="https://www.google.com/maps/search/?api=1&query=Jl.+Anggrek+B2+No.+25+Pondok+Padalarang+Indah+Bandung+40553+Indonesia"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-0.5 md:mt-2.5 lg:mt-[11px] translate-y-0 md:-translate-y-[3px] font-['Gotham_Regular'] font-normal text-[13px] min-[375px]:text-[14px] min-[390px]:text-[14.5px] sm:text-[15px] md:text-[16px] lg:text-[17px] text-white/80 hover:text-white transition-colors duration-200 tracking-[-0.01em]"
              >
                Map It
              </a>
            </div>

            <div className="text-left -translate-y-[3px] min-[390px]:-translate-y-[4px] md:translate-y-0 md:col-span-4 lg:col-span-4 md:pl-0 lg:pl-1 xl:pl-2 md:-translate-x-[8px]">
              <h3 
                className="font-['Gotham_Regular'] font-normal text-[17.5px] min-[375px]:text-[18.5px] min-[390px]:text-[19.5px] sm:text-[23px] md:text-[27px] lg:text-[31px] xl:text-[32px] leading-snug tracking-[-0.02em] mb-[4px] min-[375px]:mb-[5px] md:mb-2 text-white md:whitespace-nowrap md:translate-y-0"
                style={{ WebkitTextStroke: "1px rgba(255, 255, 255, 0.85)" }}
              >
                <span aria-label="General">
                  Genera<span aria-hidden="true">I</span><span className="sr-only">l</span>
                </span>{" "}
                <span className="inline-block -ml-[0.06em] md:-ml-[0.07em] -translate-x-[1px]">
                  Inquiries
                </span>
              </h3>
              <p className="font-['Gotham_Regular'] font-normal text-[13px] min-[375px]:text-[14px] min-[390px]:text-[14.5px] sm:text-[15px] md:text-[16px] lg:text-[17px] leading-[1.28] min-[375px]:leading-[1.3] sm:leading-[1.35] md:leading-[1.55] lg:leading-[1.58] tracking-[-0.01em] md:whitespace-nowrap">
                <a
                  href="mailto:hello@wearekan.space"
                  className="text-white/80 hover:text-white transition-colors duration-200 inline-block translate-y-0 md:translate-y-0"
                >
                  hello@wearekan.space
                </a>
              </p>
            </div>

            <div className="text-left -translate-y-[6px] min-[390px]:-translate-y-[8px] md:translate-y-0 md:col-span-4 lg:col-span-4 md:pl-0 lg:pl-1 xl:pl-2">
              <h3 
                className="font-['Gotham_Regular'] font-normal text-[17.5px] min-[375px]:text-[18.5px] min-[390px]:text-[19.5px] sm:text-[23px] md:text-[27px] lg:text-[31px] xl:text-[32px] leading-snug tracking-[-0.02em] mb-[4px] min-[375px]:mb-[5px] md:mb-2 text-white md:whitespace-nowrap md:translate-y-0"
                style={{ WebkitTextStroke: "1px rgba(255, 255, 255, 0.85)" }}
              >
                Contact
              </h3>
              <p className="font-['Gotham_Regular'] font-normal text-[14px] min-[360px]:text-[14.5px] min-[375px]:text-[15px] sm:text-[16px] md:text-[16px] lg:text-[17px] leading-[1.3] min-[375px]:leading-[1.33] sm:leading-[1.35] md:leading-[1.55] lg:leading-[1.58] text-white/80 tracking-[-0.01em] whitespace-nowrap md:translate-y-0">
                <span>Arkan Taqiyuddin</span> |{" "}
                <a
                  href="https://wa.me/6289674934797"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[12.5px] min-[360px]:text-[13px] min-[375px]:text-[13.5px] min-[390px]:text-[14px] min-[414px]:text-[14.5px] sm:text-[15px] md:text-[15px] lg:text-[16px] xl:text-[16.5px] text-white/80 hover:text-white transition-colors duration-200"
                >
                  +62 896-7493-4797
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>

        <div className="w-full border-t border-white/20" />
        <Footer isAboutPage />
      </section>
    </>
  );
}
