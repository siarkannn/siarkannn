import { motion } from "framer-motion";
import { useSmoothScroll } from "@/hooks/useSmoothScroll";

export function Footer() {
  const { scrollTo } = useSmoothScroll();

  // Tap "Let's Collaborate":
  //   1. Smooth scroll to the very top of the page
  //   2. Once top is reached, smooth scroll back down to #contact
  // Both legs use the same easeInOutQuart curve as the navbar "Contact" tap.
  const handleCollaborate = () => {
    scrollTo("top", () => {
      scrollTo("contact");
    });
  };

  return (
    <footer
      id="contact"
      className="bg-black text-white font-['Gotham_Local'] select-none"
    >
      <div className="px-10 md:px-16 pt-14 md:pt-20 pb-5 md:pb-12">

        {/* ── Main grid ── */}
        {/*
          Desktop: 3 zones
            col 1 (span-6): Let's Collaborate
            col 2 (start-8, span-2): Contact
            col 3 (start-10, span-3): Address
          Mobile: stacked col
        */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-0 md:gap-0 pb-0 md:pb-24 md:items-start">

          {/* ── Let's Collaborate ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="pb-20 md:pb-0 md:col-span-6"
          >
            <button
              onClick={handleCollaborate}
              className="text-left group inline-block bg-transparent border-none p-0 cursor-pointer"
              aria-label="Scroll to contact section"
            >
              <h2 className="text-[2rem] md:text-[3rem] font-bold leading-[1.05] tracking-[-0.03em] transition-opacity duration-300 group-hover:opacity-70">
                Let's
                <br />
                Collaborate <span className="inline-block">→</span>
              </h2>
            </button>
          </motion.div>

          {/* ── Contact ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
            className="flex flex-col items-start pb-10 md:pb-0 md:col-span-2 md:col-start-8 md:pl-14"
          >
            <h4 className="text-[20px] md:text-[26px] font-bold tracking-[-0.01em] mb-3 md:mb-5 leading-none">
              Contact
            </h4>
            <a
              href="mailto:hello@siarkannn"
              className="block text-white text-[14px] md:text-[15px] mb-2 hover:opacity-70 transition-opacity font-['Gotham_Regular'] tracking-[-0.01em] leading-snug"
            >
              hello@siarkannn
            </a>
            <a
              href="https://www.instagram.com/siarkannn/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="inline-block text-white hover:opacity-70 transition-opacity"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
            </a>
          </motion.div>

          {/* ── Address ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            className="flex flex-col items-start md:col-span-2 md:col-start-11"
          >
            <h4 className="text-[20px] md:text-[26px] font-bold tracking-[-0.01em] mb-3 md:mb-5 leading-none">
              Address
            </h4>
            <a
              href="https://www.google.com/maps/search/?api=1&query=Jl.+Anggrek+B2+No.+25+Pondok+Padalarang+Indah+Kabupaten+Bandung+Barat+Indonesia"
              target="_blank"
              rel="noopener noreferrer"
              className="block text-white text-[14px] md:text-[15px] leading-[1.55] font-['Gotham_Regular'] tracking-[-0.01em] hover:opacity-70 transition-opacity"
            >
              Jl. Anggrek B2 No. 25,
              <br />
              Pondok Padalarang Indah
              <br />
              Kabupaten Bandung Barat - Indonesia.
            </a>
          </motion.div>
        </div>

        {/* ── Copyright ── */}
        <div className="flex justify-center md:justify-start mt-20 md:mt-0">
          <p className="text-[10px] md:text-[13px] text-white/40 font-['Gotham_Regular'] tracking-[-0.01em]">
            Copyright &copy; 2026 Siarkannn.
          </p>
        </div>

      </div>
    </footer>
  );
}
