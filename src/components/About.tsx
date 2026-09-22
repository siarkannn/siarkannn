import { motion } from "framer-motion";
import { Footer } from "@/components/Footer";
import { ShowreelVideo } from "@/components/ShowreelVideo";

export function About() {
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
          className="w-full flex flex-col md:flex-row md:justify-between items-start md:items-center gap-9 sm:gap-10 md:gap-8 lg:gap-12 xl:gap-14 pt-0 pb-2 md:py-0 transition-[gap] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
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
            className="w-full md:w-[50%] lg:w-[48%] xl:w-[46%] max-w-[580px] lg:max-w-[620px] md:ml-auto text-left flex flex-col items-start transition-[width,max-width] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
          >
            {/* INTRO */}
            <div className="mb-3 min-[390px]:mb-3.5 sm:mb-3.5 md:mb-3.5 lg:mb-4 xl:mb-4">
              <h3 className="text-[19px] min-[390px]:text-[20.5px] sm:text-[22px] md:text-[25px] lg:text-[28px] xl:text-[30px] font-['Gotham_Medium'] font-normal text-white/90 leading-snug md:leading-[1.22] tracking-[-0.015em] subpixel-antialiased [text-shadow:0_0_0_transparent]">
                Post-production studio
                <br />
                based in Bandung,
              </h3>
            </div>

            {/* BODY */}
            <div className="space-y-6 min-[390px]:space-y-[26px] sm:space-y-5 md:space-y-6 lg:space-y-6.5 xl:space-y-7 text-[13px] min-[360px]:text-[13.5px] min-[375px]:text-[13.8px] min-[390px]:text-[14.2px] sm:text-[14.2px] md:text-[16px] lg:text-[17px] xl:text-[17.5px] text-white/95 font-['Gotham_Regular'] font-normal tracking-normal leading-[1.35] min-[375px]:leading-[1.37] min-[390px]:leading-[1.39] sm:leading-[1.46] md:leading-[1.46] lg:leading-[1.48] text-left antialiased">
              <p>
                An independent post-production practice driven by curiosity, precision, and a deep respect for visual craft. Every project is approached with care and a considered{" "}
                <br className="sm:hidden" />
                sense of style.
              </p>

              <p>
                Specializing in Color Grading and Finishing, dedicated to shaping mood, texture, and visual narrative. From the first creative pass to the final master render, every frame is treated with precision, care, and intention.
              </p>

              <p>
                My process is built on curiosity and collaboration. Ideas are questioned, explored, and elevated through constant thinking, tinkering, and refinement, because the best results come from thoughtful decisions and continuous exploration.
              </p>

              <p>
                We don&apos;t settle for average.
              </p>

              <p className="font-['Gotham_Regular'] font-normal text-white">
                We are <span className="font-gotham font-bold text-white tracking-[-0.01em]">KAN</span>.
              </p>
            </div>
          </div>
        </div>
      </div>
      </section>

      <section
        id="about-contact"
        className="relative z-20 flex flex-col justify-between min-h-screen min-h-[100dvh] bg-black text-white antialiased select-none border-t border-white/20"
      >
        <div
          className="mx-auto w-full max-w-[1120px] flex-1 px-[18px] min-[390px]:px-[21px] sm:px-8 md:px-16 pt-5 min-[390px]:pt-7 sm:pt-10 md:pt-16 lg:pt-20 pb-5 min-[390px]:pb-6 sm:pb-8 md:pb-16 lg:pb-20 flex flex-col justify-center transition-[padding,max-width] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
        >
          <h2 className="text-center font-gotham font-bold text-[31px] min-[360px]:text-[33px] min-[375px]:text-[35px] min-[390px]:text-[37px] min-[414px]:text-[39px] min-[430px]:text-[41px] sm:text-[45px] md:text-[4.75rem] lg:text-[5.5rem] leading-[1.04] sm:leading-[1.0] md:leading-[0.90] tracking-[-0.02em] md:tracking-[-0.025em] mb-5 min-[390px]:mb-6 sm:mb-8 md:mb-14 lg:mb-16 -translate-y-2.5 min-[390px]:-translate-y-3.5 sm:-translate-y-3 md:translate-y-0">
            <span className="inline-block whitespace-nowrap">
              Let&apos;s Create
            </span>
            <br />
            <span className="inline-block whitespace-nowrap">
              Something <span className="inline-block tracking-[0.02em] md:tracking-[0.025em]">KAN</span>
            </span>
          </h2>

          <div className="border-t border-white/20 pt-4 min-[390px]:pt-[18px] sm:pt-6 md:pt-3.5 lg:pt-4 grid grid-cols-1 md:grid-cols-3 gap-6 min-[390px]:gap-7 sm:gap-8 md:gap-8 lg:gap-10">
            <div className="text-left">
              <h3 
                className="font-['Gotham_Regular'] font-normal text-[17.5px] min-[375px]:text-[18.5px] min-[390px]:text-[19.5px] sm:text-[23px] md:text-[25px] lg:text-[28px] leading-snug tracking-[-0.02em] mb-[1.5px] min-[390px]:mb-[2.5px] md:mb-1.5 text-white"
                style={{ WebkitTextStroke: "1px rgba(255, 255, 255, 0.85)" }}
              >
                Visit Us
              </h3>
              <p className="font-['Gotham_Regular'] font-normal text-[13px] min-[375px]:text-[14px] min-[390px]:text-[14.5px] sm:text-[16.5px] md:text-[17.5px] lg:text-[19px] leading-[1.28] min-[375px]:leading-[1.3] sm:leading-[1.3] md:leading-[1.5] text-white/80 tracking-[-0.01em]">
                Jl. Anggrek B2 No. 25,
                <br />
                Pondok Padalarang Indah
                <br />
                Kabupaten Bandung Barat - Indonesia.
              </p>
              <a
                href="https://www.google.com/maps/search/?api=1&query=Jl.+Anggrek+B2+No.+25+Pondok+Padalarang+Indah+Kabupaten+Bandung+Barat+Indonesia"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-0.5 md:mt-0.5 font-['Gotham_Regular'] font-normal text-[13px] min-[375px]:text-[14px] min-[390px]:text-[14.5px] sm:text-[16.5px] md:text-[17.5px] lg:text-[19px] text-white/80 hover:text-white transition-colors duration-200 tracking-[-0.01em]"
              >
                Map It
              </a>
            </div>

            <div className="text-left -translate-y-[3px] min-[390px]:-translate-y-[4px] md:translate-y-0">
              <h3 
                className="font-['Gotham_Regular'] font-normal text-[17.5px] min-[375px]:text-[18.5px] min-[390px]:text-[19.5px] sm:text-[23px] md:text-[25px] lg:text-[28px] leading-snug tracking-[-0.02em] mb-[1.5px] min-[390px]:mb-[2.5px] md:mb-1.5 text-white"
                style={{ WebkitTextStroke: "1px rgba(255, 255, 255, 0.85)" }}
              >
                General Inquiries
              </h3>
              <p className="font-['Gotham_Regular'] font-normal text-[13px] min-[375px]:text-[14px] min-[390px]:text-[14.5px] sm:text-[16.5px] md:text-[17.5px] lg:text-[19px] leading-[1.28] min-[375px]:leading-[1.3] sm:leading-[1.3] md:leading-[1.5] tracking-[-0.01em]">
                <a
                  href="mailto:hello@siarkannn"
                  className="text-white/80 hover:text-white transition-colors duration-200 inline-block translate-y-0 md:translate-y-[2.5px]"
                >
                  hello@siarkannn
                </a>
              </p>
            </div>

            <div className="text-left -translate-y-[6px] min-[390px]:-translate-y-[8px] md:translate-y-0">
              <h3 
                className="font-['Gotham_Regular'] font-normal text-[17.5px] min-[375px]:text-[18.5px] min-[390px]:text-[19.5px] sm:text-[23px] md:text-[25px] lg:text-[28px] leading-snug tracking-[-0.02em] mb-[1.5px] min-[390px]:mb-[2.5px] md:mb-1.5 text-white"
                style={{ WebkitTextStroke: "1px rgba(255, 255, 255, 0.85)" }}
              >
                Services
              </h3>
              <p className="font-['Gotham_Regular'] font-normal text-[13px] min-[375px]:text-[14px] min-[390px]:text-[14.5px] sm:text-[16.5px] md:text-[17.5px] lg:text-[19px] leading-[1.28] min-[375px]:leading-[1.3] sm:leading-[1.3] md:leading-[1.5] text-white/80 tracking-[-0.01em]">
                Color Grading
                <br />
                Post-Production
                <br />
                Visual Finishing
                <br />
                Creative Projects
              </p>
            </div>
          </div>
        </div>

        <div className="w-full border-t border-white/20" />
        <Footer isAboutPage />
      </section>
    </>
  );
}
