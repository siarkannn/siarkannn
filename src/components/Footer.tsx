import { KanHeroWordmark } from "@/components/KanLogoK";

export interface FooterProps {
  className?: string;
  isAboutPage?: boolean;
  isArtistPage?: boolean;
  isWorkPage?: boolean;
}

export function FooterWordmarkCopyright({
  className = "",
  isAboutPage = false,
  isArtistPage = false,
  isWorkPage = false,
}: {
  className?: string;
  isAboutPage?: boolean;
  isArtistPage?: boolean;
  isWorkPage?: boolean;
}) {
  const shiftClass = isAboutPage
    ? "-translate-y-[5px] min-[390px]:-translate-y-[6px] md:-translate-y-[14px] lg:-translate-y-[15px]"
    : isArtistPage || isWorkPage
    ? "-translate-y-[5px] min-[390px]:-translate-y-[6px] md:-translate-y-[10px] lg:-translate-y-[11px]"
    : "";

  return (
    <div
      className={`flex flex-col items-center justify-center text-center mx-auto w-full select-none ${shiftClass} ${className}`.trim()}
    >
      <div className="w-full flex items-center justify-center text-center mx-auto transition-none">
        <KanHeroWordmark
          className="w-[74px] min-[360px]:w-[76px] min-[375px]:w-[78px] min-[390px]:w-[80px] sm:w-[80px] md:w-[70px] lg:w-[72px] xl:w-[74px] h-auto block mx-auto text-[#F1F2F2]"
          style={{
            contain: "none",
            transform: "none",
            WebkitTransform: "none",
            willChange: "auto",
          }}
        />
      </div>
      <p className="w-full mt-[14px] min-[360px]:mt-[14.5px] min-[390px]:mt-[15px] sm:mt-[15.5px] md:mt-[14px] lg:mt-[14.5px] xl:mt-[15px] font-['Gotham_Regular'] font-normal text-[9px] min-[360px]:text-[9.5px] min-[390px]:text-[10px] min-[414px]:text-[10.5px] sm:text-[11px] md:text-[12.5px] lg:text-[13px] leading-normal text-white/40 tracking-[-0.01em] text-center justify-center mx-auto transition-none md:-translate-y-[4px]">
        Copyright &copy; 2026 KAN Space.
      </p>
    </div>
  );
}

export function Footer({
  className = "",
  isAboutPage = false,
  isArtistPage = false,
  isWorkPage = false,
}: FooterProps = {}) {
  const desktopPb = isAboutPage
    ? "md:pb-[30px] lg:pb-[34px]"
    : isArtistPage
    ? "md:pb-[33px] lg:pb-[37px]"
    : isWorkPage
    ? "md:pb-[33px] lg:pb-[37px]"
    : "md:pb-[33px] lg:pb-[37px]";

  const desktopPt = isAboutPage
    ? "md:pt-[61px] lg:pt-[65px]"
    : "md:pt-[58px] lg:pt-[62px]";
  const ptClasses = isAboutPage
    ? `pt-[58px] min-[390px]:pt-[60px] sm:pt-[62px] ${desktopPt}`
    : `pt-[53px] min-[390px]:pt-[55px] sm:pt-[57px] ${desktopPt}`;
  const mobilePb = isAboutPage
    ? "pb-[40px] min-[390px]:pb-[42px] sm:pb-[44px]"
    : isWorkPage
    ? "pb-[43px] min-[390px]:pb-[45px] sm:pb-[45px]"
    : isArtistPage
    ? "pb-[43px] min-[390px]:pb-[45px] sm:pb-[45px]"
    : "pb-[43px] min-[390px]:pb-[45px] sm:pb-[45px]";
  const pbClasses = `${mobilePb} ${desktopPb}`;

  return (
    <footer
      id="contact"
      className={`w-full bg-black text-white font-['Gotham_Local'] select-none overflow-x-hidden ${className}`.trim()}
      style={{
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      <div
        className={`w-full max-w-screen-xl mx-auto px-4 sm:px-6 md:px-8 ${ptClasses} ${pbClasses} flex flex-col items-center justify-center text-center transition-[padding] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]`}
      >
        <FooterWordmarkCopyright
          isAboutPage={isAboutPage}
          isArtistPage={isArtistPage}
          isWorkPage={isWorkPage}
        />
      </div>
    </footer>
  );
}

export default Footer;

