import project1 from "@/assets/images/project1.jpg";
import project2 from "@/assets/images/project2.jpg";
import project3 from "@/assets/images/project3.jpg";
import project7 from "@/assets/images/PT21.jpg";
import project8 from "@/assets/images/PT22.jpg";
import project9 from "@/assets/images/PT23.jpg";
import project10 from "@/assets/images/PT31.jpg";
import project11 from "@/assets/images/PT32.jpg";
import project12 from "@/assets/images/PT33.jpg";
import project13 from "@/assets/images/PT41.jpg";
import project14 from "@/assets/images/PT42.jpg";
import project15 from "@/assets/images/PT43.jpg";
import project16 from "@/assets/images/PT51.jpg";
import project17 from "@/assets/images/PT52.jpg";
import project18 from "@/assets/images/PT53.jpg";
import project19 from "@/assets/images/PT61.jpg";
import project20 from "@/assets/images/PT62.jpg";
import project21 from "@/assets/images/PT63.jpg";

export interface Project {
  id: number;
  slug: string;
  title: string;
  category: string;
  subtitle: string;
  image: string;
  tagline: string;
  credits: { role: string; name: string }[];
  frames: { label: string; image: string }[];
}

export const projects: Project[] = [
  {
    id: 1,
    slug: "Color Grading",
    title: "Ayubyayulestariofficial",
    category: "Commercial",
    subtitle: "Color grading",
    image: project1,
    tagline: "Color grading",
    credits: [
      { role: "Director", name: "Yusni Mustafa" },
      { role: "Director of Photography", name: "Achmad Efendi" },
      { role: "Colorist", name: "Arkan Taqiyuddin" },
    ],
    frames: [
      { label: "RAN frame 1", image: project1 },
      { label: "RAN frame 2", image: project2 },
      { label: "RAN frame 3", image: project3 },
    ],
  },
  {
    id: 2,
    slug: "samsara-film",
    title: "Byayudyahandari",
    category: "Commercial",
    subtitle: "Color grading",
    image: project7,
    tagline: "Color Grading",
    credits: [
      { role: "Director", name: "Achmad Efendi" },
      { role: "Director of Photography", name: "Achmad Efendi" },
      { role: "Colorist", name: "Arkan Taqiyuddin" },
    ],
    frames: [
      { label: "byayudyahandari frame 1", image: project7 },
      { label: "byayudyahandari frame 1", image: project8 },
      { label: "byayudyahandari frame 2", image: project9 },
    ],
  },
  {
    id: 3,
    slug: "OASE “Desert Of Dubai”",
    title: "OASE “Desert Of Dubai”",
    category: "Commercial",
    subtitle: "Color Grading",
    image: project10,
    tagline: "Color Grading",
    credits: [
      { role: "Director", name: "Achmad Efendi" },
      { role: "Director of Photography", name: "Achmad Efendi" },
      { role: "Colorist", name: "Arkan Taqiyuddin" },
    ],
    frames: [
      { label: "Galery Indonesia Kaya frame 1", image: project10 },
      { label: "Galery Indonesia Kaya frame 2", image: project11 },
      { label: "Galery Indonesia Kaya frame 3", image: project12 },
    ],
  },
  {
    id: 4,
    slug: "Sony Filmmaking",
    title: "Sony Filmmaking Experience",
    category: "Film & Episodic",
    subtitle: "Color grading",
    image: project13,
    tagline: "Color Grading",
    credits: [
      { role: "Director", name: "Danesauruss" },
      { role: "Director of Photography", name: "Danesauruss" },
      { role: "Colorist", name: "Arkan Taqiyuddin" },
    ],
    frames: [
      { label: "Lavani frame 1", image: project14 },
      { label: "Lavani frame 2", image: project13 },
      { label: "Lavani frame 3", image: project15 },
    ],
  },
  {
    id: 5,
    slug: "immateurplayground",
    title: "Immateurplayground",
    category: "Film & Episodic",
    subtitle: "Color Grading",
    image: project16,
    tagline: "Color Grading",
    credits: [
      { role: "Director", name: "Erlangga Dimas Septiana" },
      { role: "Director of Photography", name: "Yoghi Putra Wijaya" },
      { role: "Colorist", name: "Arkan Taqiyuddin" },
    ],
    frames: [
      { label: "Fanta frame 1", image: project16 },
      { label: "Fanta frame 2", image: project17 },
      { label: "Fanta frame 3", image: project18 },
    ],
  },
  {
    id: 6,
    slug: "Sony Alpha Festival 2026",
    title: "Sony Alpha Festival 2026",
    category: "Music Video",
    subtitle: "Color Grading",
    image: project19,
    tagline: "Color Grading",
    credits: [
      { role: "Director", name: "Danesauruss" },
      { role: "Director of Photography", name: "Danesauruss" },
      { role: "Colorist", name: "Arkan Taqiyuddin" },
    ],
    frames: [
      { label: "Silent Horizon frame 1", image: project19 },
      { label: "Silent Horizon frame 2", image: project21 },
      { label: "Silent Horizon frame 3", image: project20 },
    ],
  },
];
