import { motion } from "framer-motion";
import aboutImg from "@/assets/images/project2.jpg";

export function About() {
  return (
    <section
      id="about"
      className="relative w-full py-24 md:py-36 overflow-hidden antialiased bg-black select-none"
    >
      {/* GARIS PUTIH TIPIS DI LAPISAN PALING DEPAN */}
      <div className="absolute top-0 left-0 right-0 z-20 border-t border-white/10" />

      {/* Background Image & Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={aboutImg}
          alt="Color grading suite"
          className="w-full h-full object-cover object-center opacity-65"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-black/80" />
        <div className="absolute inset-0 bg-[#020617]/40 mix-blend-color" />
      </div>

      {/* Content Container */}
      <div className="relative z-10 w-full px-6 md:px-16 lg:px-20 max-w-[1440px] mx-auto">
        <div className="flex flex-col md:flex-row md:justify-between items-start gap-12 md:gap-4">
          {/* LEFT COLUMN: Judul Raksasa - SEKARANG FIX PAKAI GOTHAM */}
          <motion.div
            className="w-full md:w-[45%] lg:w-[40%] flex flex-col justify-start"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Mengganti font-sans menjadi font-gotham gna */}
            <h2 className="text-[2.8rem] sm:text-[3.5rem] md:text-[4rem] lg:text-[4.7rem] font-gotham font-bold text-white leading-[0.95] tracking-tight text-left">
              A<br />
              Collective
              <br />
              Of
              <br />
              Visual
              <br />
              Obsessives
            </h2>
          </motion.div>

          {/* RIGHT COLUMN: Deskripsi Ramping, Justify, Memanjang ke Bawah */}
          <motion.div
            className="w-full md:w-[50%] lg:w-[45%] space-y-7 text-left md:pt-3 flex flex-col items-start"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
          >
            {/* SUB-JUDUL KANAN: SEKARANG FIX PAKAI GOTHAM JUGA */}
            <h3 className="text-xl sm:text-2xl md:text-[1.65rem] font-gotham font-bold text-white leading-tight tracking-wide max-w-[90%] md:max-w-[75%] lg:max-w-[68%]">
              Post-production studio based in Bandung,
            </h3>

            {/* Paragraf ngetok kebawah & justify (Pakai font-sans-custom biar kontras dan rapi) */}
            <div className="space-y-6 text-[13px] md:text-[14px] text-white/85 font-sans-custom font-normal tracking-wide leading-[1.75] text-justify max-w-[100%] md:max-w-[70%] lg:max-w-[62%]">
              <p>
                Every project we work on is a collaborative effort shaped by
                perspective and goals.
              </p>

              <p>
                Specializing in Color Grading and Finishing, from the first pass
                to the final render, every frame is treated with precision,
                care, and a considered sense of style.
              </p>

              <p>
                Our process is built on dialogue and curiosity. Ideas are
                questioned, explored, and elevated together, because the best
                results come from constant thinking, tinkering, and
                collaboration.
              </p>

              <p>We don't settle for average.</p>
            </div>

            {/* Penutup baris akhir */}
            <p className="font-bold tracking-widest text-[12px] md:text-[13px]">
              Let's Created{" "}
              <span className="font-normal tracking-widest text-[12px] md:text-[13px]">
                Together.
              </span>
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
