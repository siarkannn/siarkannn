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
    ? "pt-[89px] min-[390px]:pt-[91px]"
    : "pt-[88px] min-[390px]:pt-[90px]";
  const bottomPaddingMobile = "pb-[14px] min-[390px]:pb-[16px]";

  const topPaddingDesktop = isAboutPage
    ? "md:pt-[60px] lg:pt-[64px]"
    : isArtistPage || isWorkPage
    ? "md:pt-[62px] lg:pt-[66px]"
    : "md:pt-[50px] lg:pt-[54px]";
  const bottomPaddingDesktop = isWorkPage || isArtistPage
    ? "md:pb-[36px] lg:pb-[40px]"
    : "md:pb-[37px] lg:pb-[41px]";

  const contentTranslateMobile = isAboutPage
    ? "-translate-y-[35px] min-[360px]:-translate-y-[36px] min-[390px]:-translate-y-[37px] min-[414px]:-translate-y-[38px]"
    : isArtistPage || isWorkPage
    ? "-translate-y-[34px] min-[360px]:-translate-y-[35px] min-[390px]:-translate-y-[36px] min-[414px]:-translate-y-[37px]"
    : "-translate-y-[34px] min-[360px]:-translate-y-[35px] min-[390px]:-translate-y-[36px] min-[414px]:-translate-y-[37px]";

  return (
    <footer
      id="contact"
      className={`w-full bg-black text-white font-['Gotham_Local'] select-none overflow-x-hidden ${className}`.trim()}
    >
      <div
        className={`w-full max-w-screen-xl mx-auto px-4 sm:px-6 md:px-8 ${topPaddingMobile} sm:pt-[46px] ${topPaddingDesktop} ${bottomPaddingMobile} sm:pb-[29px] ${bottomPaddingDesktop} flex flex-col items-center justify-center text-center transition-[padding,max-width] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]`}
      >
        {/* ── Copyright ── */}
        <div className={`flex flex-col items-center justify-center text-center mx-auto w-full ${contentTranslateMobile} sm:-translate-y-[7px] md:-translate-y-[8px]`}>
          <div className="w-full flex items-center justify-center text-center mx-auto">
            <KanWordmark className="text-[31px] min-[360px]:text-[33px] min-[375px]:text-[35px] min-[390px]:text-[37px] min-[414px]:text-[39px] min-[430px]:text-[41px] sm:text-[31px] md:text-[29px] lg:text-[32px] xl:text-[35px] leading-none text-[#F1F2F2] text-center justify-center mx-auto" />
          </div>
          <p className="w-full mt-[7px] min-[390px]:mt-[8.5px] sm:mt-[8px] md:mt-[10px] font-gotham font-normal text-[10px] min-[390px]:text-[10.5px] sm:text-[11px] md:text-[12.5px] lg:text-[13px] leading-tight text-white/40 tracking-[-0.01em] text-center justify-center mx-auto">
            Copyright &copy; 2026 KAN.
          </p>
        </div>
      </div>
    </footer>
  );
}

