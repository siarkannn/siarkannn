import { motion } from "framer-motion";
import { KanWordmark } from "@/components/KanLogoK";

interface FooterProps {
  className?: string;
  isAboutPage?: boolean;
  isArtistPage?: boolean;
  isWorkPage?: boolean;
}

export function Footer({ className = "", isAboutPage = false, isArtistPage = false, isWorkPage = false }: FooterProps = {}) {
  const topPaddingMobile = isAboutPage
    ? "pt-[90px] min-[390px]:pt-[92px]"
    : "pt-[88px] min-[390px]:pt-[90px]";
  const bottomPaddingMobile = isArtistPage || isWorkPage
    ? "pb-[13px] min-[390px]:pb-[15px]"
    : "pb-[14px] min-[390px]:pb-[16px]";

  const topPaddingDesktop = isAboutPage
    ? "md:pt-[66px] lg:pt-[70px]"
    : isArtistPage || isWorkPage
    ? "md:pt-[62px] lg:pt-[66px]"
    : "md:pt-[50px] lg:pt-[54px]";
  const bottomPaddingDesktop = isAboutPage
    ? "md:pb-[31px] lg:pb-[35px]"
    : isWorkPage || isArtistPage
    ? "md:pb-[35px] lg:pb-[39px]"
    : "md:pb-[37px] lg:pb-[41px]";

  const contentTranslateMobile = isAboutPage
    ? "-translate-y-[35px] min-[360px]:-translate-y-[36px] min-[390px]:-translate-y-[37px] min-[414px]:-translate-y-[38px]"
    : isArtistPage || isWorkPage
    ? "-translate-y-[34px] min-[360px]:-translate-y-[35px] min-[390px]:-translate-y-[36px] min-[414px]:-translate-y-[37px]"
    : "-translate-y-[34px] min-[360px]:-translate-y-[35px] min-[390px]:-translate-y-[36px] min-[414px]:-translate-y-[37px]";

  const wordmarkSizeClasses =
    "text-[27px] min-[360px]:text-[28.5px] min-[375px]:text-[30px] min-[390px]:text-[31.5px] min-[414px]:text-[33px] min-[480px]:text-[35px] sm:text-[40px] md:text-[31px] lg:text-[32px]";

  return (
    <footer
      id="contact"
      className={`w-full bg-black text-white font-['Gotham_Local'] select-none overflow-x-hidden ${className}`.trim()}
    >
      <div
        className={`w-full max-w-screen-xl mx-auto px-4 sm:px-6 md:px-8 ${topPaddingMobile} sm:pt-[46px] ${topPaddingDesktop} ${bottomPaddingMobile} sm:pb-[29px] ${bottomPaddingDesktop} flex flex-col items-center justify-center text-center transition-[padding] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]`}
      >
        {/* ── Copyright ── */}
        <div className={`flex flex-col items-center justify-center text-center mx-auto w-full transition-none ${contentTranslateMobile} sm:-translate-y-[7px] md:-translate-y-[8px]`}>
          <div className="w-full flex items-center justify-center text-center mx-auto transition-none">
            <KanWordmark className={`${wordmarkSizeClasses} leading-none text-[#F1F2F2] text-center justify-center mx-auto transition-none`} />
          </div>
          <p className="w-full mt-[11.5px] min-[360px]:mt-[12px] min-[375px]:mt-[12.5px] min-[390px]:mt-[13px] min-[414px]:mt-[13.5px] sm:mt-[12.5px] md:mt-[11.5px] lg:mt-[12px] font-['Gotham_Regular'] font-normal text-[8px] min-[390px]:text-[8.5px] sm:text-[9px] md:text-[12.5px] lg:text-[13px] leading-tight text-white/40 tracking-[-0.01em] text-center justify-center mx-auto transition-none">
            Copyright &copy; 2026 KAN Space.
          </p>
        </div>
      </div>
    </footer>
  );
}

