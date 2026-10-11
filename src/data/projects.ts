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
    slug: "ayubyayulestariofficial-bridal-portrait",
    title: "Ayubyayulestariofficial",
    category: "Commercial",
    subtitle: "Bridal Portrait",
    image: project1,
    tagline: "Bridal Portrait",
    credits: [
      { role: "Director", name: "Yusni Mustafa" },
      { role: "Director of Photography", name: "Achmad Efendi" },
      { role: "Colorist", name: "Arkan Taqiyuddin" },
    ],
    frames: [
      { label: "Ayubyayulestariofficial frame 1", image: project1 },
      { label: "Ayubyayulestariofficial frame 2", image: project2 },
      { label: "Ayubyayulestariofficial frame 3", image: project3 },
    ],
  },
  {
    id: 2,
    slug: "byayudyahandari-fashion-editorial",
    title: "Byayudyahandari",
    category: "Commercial",
    subtitle: "Fashion Editorial",
    image: project7,
    tagline: "Fashion Editorial",
    credits: [
      { role: "Director", name: "Achmad Efendi" },
      { role: "Director of Photography", name: "Achmad Efendi" },
      { role: "Colorist", name: "Arkan Taqiyuddin" },
    ],
    frames: [
      { label: "Byayudyahandari frame 1", image: project7 },
      { label: "Byayudyahandari frame 2", image: project8 },
      { label: "Byayudyahandari frame 3", image: project9 },
    ],
  },
  {
    id: 3,
    slug: "oase-desert-of-dubai-fashion-film",
    title: 'OASE "Desert Of Dubai"',
    category: "Commercial",
    subtitle: "Fashion Film",
    image: project10,
    tagline: "Fashion Film",
    credits: [
      { role: "Director", name: "Achmad Efendi" },
      { role: "Director of Photography", name: "Achmad Efendi" },
      { role: "Colorist", name: "Arkan Taqiyuddin" },
    ],
    frames: [
      { label: 'OASE "Desert Of Dubai" frame 1', image: project10 },
      { label: 'OASE "Desert Of Dubai" frame 2', image: project11 },
      { label: 'OASE "Desert Of Dubai" frame 3', image: project12 },
    ],
  },
  {
    id: 4,
    slug: "sony-filmmaking-experience-brand-experience",
    title: "Sony Filmmaking Experience",
    category: "Film & Episodic",
    subtitle: "Brand Experience",
    image: project13,
    tagline: "Brand Experience",
    credits: [
      { role: "Director", name: "Danesauruss" },
      { role: "Director of Photography", name: "Danesauruss" },
      { role: "Colorist", name: "Arkan Taqiyuddin" },
    ],
    frames: [
      { label: "Sony Filmmaking Experience frame 1", image: project14 },
      { label: "Sony Filmmaking Experience frame 2", image: project13 },
      { label: "Sony Filmmaking Experience frame 3", image: project15 },
    ],
  },
  {
    id: 5,
    slug: "immateurplayground-visual-campaign",
    title: "Immateurplayground",
    category: "Film & Episodic",
    subtitle: "Visual Campaign",
    image: project16,
    tagline: "Visual Campaign",
    credits: [
      { role: "Director", name: "Erlangga Dimas Septiana" },
      { role: "Director of Photography", name: "Yoghi Putra Wijaya" },
      { role: "Colorist", name: "Arkan Taqiyuddin" },
    ],
    frames: [
      { label: "Immateurplayground frame 1", image: project16 },
      { label: "Immateurplayground frame 2", image: project17 },
      { label: "Immateurplayground frame 3", image: project18 },
    ],
  },
  {
    id: 6,
    slug: "sony-alpha-festival-2026-brand-film",
    title: "Sony Alpha Festival 2026",
    category: "Music Video",
    subtitle: "Brand Film",
    image: project19,
    tagline: "Brand Film",
    credits: [
      { role: "Director", name: "Danesauruss" },
      { role: "Director of Photography", name: "Danesauruss" },
      { role: "Colorist", name: "Arkan Taqiyuddin" },
    ],
    frames: [
      { label: "Sony Alpha Festival 2026 frame 1", image: project19 },
      { label: "Sony Alpha Festival 2026 frame 2", image: project21 },
      { label: "Sony Alpha Festival 2026 frame 3", image: project20 },
    ],
  },
];

export const kanProjects: Project[] = [
  {
    id: 101,
    slug: "ayubyayulestariofficial-bridal-portrait",
    title: "Ayubyayulestariofficial",
    category: "Commercial",
    subtitle: "Bridal Portrait",
    image: project1,
    tagline: "Bridal Portrait",
    credits: [
      { role: "Production", name: "KAN Studio" },
      { role: "Director", name: "Yusni Mustafa" },
      { role: "Director of Photography", name: "Achmad Efendi" },
      { role: "Colorist", name: "Arkan Taqiyuddin" },
    ],
    frames: [
      { label: "Ayubyayulestariofficial frame 1", image: project1 },
      { label: "Ayubyayulestariofficial frame 2", image: project2 },
      { label: "Ayubyayulestariofficial frame 3", image: project3 },
    ],
  },
  {
    id: 102,
    slug: "byayudyahandari-fashion-editorial",
    title: "Byayudyahandari",
    category: "Commercial",
    subtitle: "Fashion Editorial",
    image: project7,
    tagline: "Fashion Editorial",
    credits: [
      { role: "Production", name: "KAN Studio" },
      { role: "Director", name: "Achmad Efendi" },
      { role: "Director of Photography", name: "Achmad Efendi" },
      { role: "Colorist", name: "Arkan Taqiyuddin" },
    ],
    frames: [
      { label: "Byayudyahandari frame 1", image: project7 },
      { label: "Byayudyahandari frame 2", image: project8 },
      { label: "Byayudyahandari frame 3", image: project9 },
    ],
  },
  {
    id: 103,
    slug: "oase-desert-of-dubai-fashion-film",
    title: 'OASE "Desert Of Dubai"',
    category: "Commercial",
    subtitle: "Fashion Film",
    image: project10,
    tagline: "Fashion Film",
    credits: [
      { role: "Production", name: "KAN Studio" },
      { role: "Director", name: "Achmad Efendi" },
      { role: "Director of Photography", name: "Achmad Efendi" },
      { role: "Colorist", name: "Arkan Taqiyuddin" },
    ],
    frames: [
      { label: 'OASE "Desert Of Dubai" frame 1', image: project10 },
      { label: 'OASE "Desert Of Dubai" frame 2', image: project11 },
      { label: 'OASE "Desert Of Dubai" frame 3', image: project12 },
    ],
  },
  {
    id: 104,
    slug: "sony-filmmaking-experience-brand-experience",
    title: "Sony Filmmaking Experience",
    category: "Film & Episodic",
    subtitle: "Brand Experience",
    image: project13,
    tagline: "Brand Experience",
    credits: [
      { role: "Production", name: "KAN Studio" },
      { role: "Director", name: "Danesauruss" },
      { role: "Director of Photography", name: "Danesauruss" },
      { role: "Colorist", name: "Arkan Taqiyuddin" },
    ],
    frames: [
      { label: "Sony Filmmaking Experience frame 1", image: project14 },
      { label: "Sony Filmmaking Experience frame 2", image: project13 },
      { label: "Sony Filmmaking Experience frame 3", image: project15 },
    ],
  },
  {
    id: 105,
    slug: "immateurplayground-visual-campaign",
    title: "Immateurplayground",
    category: "Film & Episodic",
    subtitle: "Visual Campaign",
    image: project16,
    tagline: "Visual Campaign",
    credits: [
      { role: "Production", name: "KAN Studio" },
      { role: "Director", name: "Erlangga Dimas Septiana" },
      { role: "Director of Photography", name: "Yoghi Putra Wijaya" },
      { role: "Colorist", name: "Arkan Taqiyuddin" },
    ],
    frames: [
      { label: "Immateurplayground frame 1", image: project16 },
      { label: "Immateurplayground frame 2", image: project17 },
      { label: "Immateurplayground frame 3", image: project18 },
    ],
  },
  {
    id: 106,
    slug: "sony-alpha-festival-2026-brand-film",
    title: "Sony Alpha Festival 2026",
    category: "Music Video",
    subtitle: "Brand Film",
    image: project19,
    tagline: "Brand Film",
    credits: [
      { role: "Production", name: "KAN Studio" },
      { role: "Director", name: "Danesauruss" },
      { role: "Director of Photography", name: "Danesauruss" },
      { role: "Colorist", name: "Arkan Taqiyuddin" },
    ],
    frames: [
      { label: "Sony Alpha Festival 2026 frame 1", image: project19 },
      { label: "Sony Alpha Festival 2026 frame 2", image: project21 },
      { label: "Sony Alpha Festival 2026 frame 3", image: project20 },
    ],
  },
];

export function findProjectBySlug(rawSlug?: string | null): { project: Project; list: Project[]; index: number } {
  if (!rawSlug || typeof rawSlug !== "string") {
    return { project: projects[0], list: projects, index: 0 };
  }

  const cleanSlug = decodeURIComponent(rawSlug).toLowerCase().trim();
  const normSlug = cleanSlug.replace(/[^a-z0-9]/g, "");

  if (!normSlug) {
    return { project: projects[0], list: projects, index: 0 };
  }

  const matchFn = (p: Project) => {
    const normPslug = p.slug.toLowerCase().replace(/[^a-z0-9]/g, "");
    const normPtitle = p.title.toLowerCase().replace(/[^a-z0-9]/g, "");
    return (
      p.slug.toLowerCase().trim() === cleanSlug ||
      p.title.toLowerCase().trim() === cleanSlug ||
      normPslug === normSlug ||
      normPtitle === normSlug ||
      (normSlug.length >= 4 && (normSlug.startsWith(normPslug) || normPslug.startsWith(normSlug))) ||
      (cleanSlug.includes("ayub") && (p.id === 1 || p.id === 101)) ||
      (cleanSlug.includes("byayu") && (p.id === 2 || p.id === 102)) ||
      (cleanSlug.includes("oase") && (p.id === 3 || p.id === 103)) ||
      (cleanSlug.includes("filmmaking") && (p.id === 4 || p.id === 104)) ||
      (cleanSlug.includes("immateur") && (p.id === 5 || p.id === 105)) ||
      (cleanSlug.includes("festival") && (p.id === 6 || p.id === 106)) ||
      (cleanSlug === "samsara-film" && p.slug.toLowerCase().includes("byayu")) ||
      (cleanSlug === "color grading" && (p.id === 1 || p.id === 101))
    );
  };

  let idx = projects.findIndex(matchFn);
  if (idx !== -1) {
    return { project: projects[idx], list: projects, index: idx };
  }

  idx = kanProjects.findIndex(matchFn);
  if (idx !== -1) {
    return { project: kanProjects[idx], list: kanProjects, index: idx };
  }

  return { project: projects[0], list: projects, index: 0 };
}


