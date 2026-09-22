import fs from 'node:fs';
import path from 'node:path';

const distDir = path.join(process.cwd(), 'dist');
const indexPath = path.join(distDir, 'index.html');

if (!fs.existsSync(indexPath)) {
  console.error('dist/index.html not found, cannot generate routes');
  process.exit(1);
}

const indexHtml = fs.readFileSync(indexPath, 'utf-8');

// List of routes to pre-generate physical static HTML files for
const routes = [
  {
    path: 'about',
    title: 'About - KAN',
    description: 'Independent post-production studio based in Bandung specializing in Color Grading and Finishing.',
  },
  {
    path: 'artist',
    title: 'Artist - KAN',
    description: 'Post-production artists and colorists at KAN.',
  },
  {
    path: 'artist/arkantaqiyuddin',
    title: 'Arkan Taqiyuddin - Colorist - KAN',
    description: 'Arkan Taqiyuddin — Colorist at KAN specializing in Color Grading and Finishing.',
  },
  {
    path: 'arkan',
    title: 'Arkan Taqiyuddin - Colorist - KAN',
    description: 'Arkan Taqiyuddin — Colorist at KAN specializing in Color Grading and Finishing.',
  },
  {
    path: 'arkantaqiyuddin',
    title: 'Arkan Taqiyuddin - Colorist - KAN',
    description: 'Arkan Taqiyuddin — Colorist at KAN specializing in Color Grading and Finishing.',
  },
  {
    path: 'work',
    title: 'Work - KAN',
    description: 'Commercials, films, music videos, and visual campaigns color graded by KAN.',
  },
  {
    path: 'works',
    title: 'Work - KAN',
    description: 'Commercials, films, music videos, and visual campaigns color graded by KAN.',
  },
  {
    path: 'kan',
    title: 'Home - KAN',
    description: 'KAN — Independent Post-Production',
  },
  // Individual project routes (canonical)
  {
    path: 'work/ayubyayulestariofficial-bridal-portrait',
    title: 'Ayubyayulestariofficial - KAN',
    description: 'Ayubyayulestariofficial — Bridal Portrait. Colorist: Arkan Taqiyuddin.',
  },
  {
    path: 'work/byayudyahandari-fashion-editorial',
    title: 'Byayudyahandari - KAN',
    description: 'Byayudyahandari — Fashion Editorial. Colorist: Arkan Taqiyuddin.',
  },
  {
    path: 'work/oase-desert-of-dubai-fashion-film',
    title: 'OASE "Desert Of Dubai" - KAN',
    description: 'OASE "Desert Of Dubai" — Fashion Film. Colorist: Arkan Taqiyuddin.',
  },
  {
    path: 'work/sony-filmmaking-experience-brand-experience',
    title: 'Sony Filmmaking Experience - KAN',
    description: 'Sony Filmmaking Experience — Brand Experience. Colorist: Arkan Taqiyuddin.',
  },
  {
    path: 'work/immateurplayground-visual-campaign',
    title: 'Immateurplayground - KAN',
    description: 'Immateurplayground — Visual Campaign. Colorist: Arkan Taqiyuddin.',
  },
  {
    path: 'work/sony-alpha-festival-2026-brand-film',
    title: 'Sony Alpha Festival 2026 - KAN',
    description: 'Sony Alpha Festival 2026 — Brand Film. Colorist: Arkan Taqiyuddin.',
  },
  // Individual project routes (short aliases for direct sharing)
  {
    path: 'work/ayubyayulestariofficial',
    title: 'Ayubyayulestariofficial - KAN',
    description: 'Ayubyayulestariofficial — Bridal Portrait. Colorist: Arkan Taqiyuddin.',
  },
  {
    path: 'work/byayudyahandari',
    title: 'Byayudyahandari - KAN',
    description: 'Byayudyahandari — Fashion Editorial. Colorist: Arkan Taqiyuddin.',
  },
  {
    path: 'work/oase-desert-of-dubai',
    title: 'OASE "Desert Of Dubai" - KAN',
    description: 'OASE "Desert Of Dubai" — Fashion Film. Colorist: Arkan Taqiyuddin.',
  },
  {
    path: 'work/sony-filmmaking-experience',
    title: 'Sony Filmmaking Experience - KAN',
    description: 'Sony Filmmaking Experience — Brand Experience. Colorist: Arkan Taqiyuddin.',
  },
  {
    path: 'work/immateurplayground',
    title: 'Immateurplayground - KAN',
    description: 'Immateurplayground — Visual Campaign. Colorist: Arkan Taqiyuddin.',
  },
  {
    path: 'work/sony-alpha-festival-2026',
    title: 'Sony Alpha Festival 2026 - KAN',
    description: 'Sony Alpha Festival 2026 — Brand Film. Colorist: Arkan Taqiyuddin.',
  },
  {
    path: 'work/sony-alpha-festival-2025',
    title: 'Sony Alpha Festival 2026 - KAN',
    description: 'Sony Alpha Festival 2026 — Brand Film. Colorist: Arkan Taqiyuddin.',
  },
];

// Helper to replace title and meta tags safely
function customizeHtml(html, title, description, canonicalPath) {
  let custom = html;
  if (title) {
    custom = custom.replace(/<title>.*?<\/title>/gi, `<title>${title}</title>`);
    custom = custom.replace(/<meta\s+property=["']og:title["']\s+content=["'].*?["']\s*\/?>/gi, `<meta property="og:title" content="${title}" />`);
    custom = custom.replace(/<meta\s+name=["']twitter:title["']\s+content=["'].*?["']\s*\/?>/gi, `<meta name="twitter:title" content="${title}" />`);
    custom = custom.replace(/<meta\s+itemprop=["']name["']\s+content=["'].*?["']\s*\/?>/gi, `<meta itemprop="name" content="${title}" />`);
  }
  if (description) {
    custom = custom.replace(/<meta\s+name=["']description["']\s+content=["'].*?["']\s*\/?>/gi, `<meta name="description" content="${description}" />`);
    custom = custom.replace(/<meta\s+property=["']og:description["']\s+content=["'].*?["']\s*\/?>/gi, `<meta property="og:description" content="${description}" />`);
    custom = custom.replace(/<meta\s+name=["']twitter:description["']\s+content=["'].*?["']\s*\/?>/gi, `<meta name="twitter:description" content="${description}" />`);
    custom = custom.replace(/<meta\s+itemprop=["']description["']\s+content=["'].*?["']\s*\/?>/gi, `<meta itemprop="description" content="${description}" />`);
  }
  if (canonicalPath) {
    const canonicalUrl = `https://siarkannn.vercel.app/${canonicalPath.replace(/^\/+/, '')}`;
    custom = custom.replace(/<link\s+rel=["']canonical["']\s+href=["'].*?["']\s*\/?>/gi, `<link rel="canonical" href="${canonicalUrl}" />`);
    custom = custom.replace(/<meta\s+property=["']og:url["']\s+content=["'].*?["']\s*\/?>/gi, `<meta property="og:url" content="${canonicalUrl}" />`);
    custom = custom.replace(/<meta\s+name=["']twitter:url["']\s+content=["'].*?["']\s*\/?>/gi, `<meta name="twitter:url" content="${canonicalUrl}" />`);
    // Synchronize WebSite url in JSON-LD
    custom = custom.replace(/"url":\s*"https:\/\/siarkannn\.vercel\.app\/"/g, `"url": "${canonicalUrl}"`);
  }
  return custom;
}

// 1. Generate dist/404.html (Universal SPA fallback)
fs.writeFileSync(path.join(distDir, '404.html'), indexHtml, 'utf-8');
console.log('✓ Created dist/404.html fallback');

// 2. Generate directory index.html and root .html files for every route
for (const route of routes) {
  const targetDir = path.join(distDir, route.path);
  fs.mkdirSync(targetDir, { recursive: true });

  const customContent = customizeHtml(indexHtml, route.title, route.description, route.path);

  // Write dist/[route]/index.html
  fs.writeFileSync(path.join(targetDir, 'index.html'), customContent, 'utf-8');

  // Also write dist/[route].html for clean URL matching on Vercel Edge Network
  const directHtmlPath = path.join(distDir, `${route.path}.html`);
  fs.mkdirSync(path.dirname(directHtmlPath), { recursive: true });
  fs.writeFileSync(directHtmlPath, customContent, 'utf-8');

  console.log(`✓ Pre-generated static route: /${route.path}`);
}
