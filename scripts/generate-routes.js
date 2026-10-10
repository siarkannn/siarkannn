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
    title: 'About - KAN SPACE',
    description: 'Independent post-production studio based in Bandung specializing in Color Grading and Finishing.',
  },
  {
    path: 'artist',
    title: 'Artist - KAN SPACE',
    description: 'Post-production artists and colorists at KAN.',
  },
  {
    path: 'artist/arkantaqiyuddin',
    title: 'Arkan Taqiyuddin - Colorist - KAN SPACE',
    description: 'Arkan Taqiyuddin — Colorist at KAN specializing in Color Grading and Finishing.',
  },
  {
    path: 'arkan',
    title: 'Arkan Taqiyuddin - Colorist - KAN SPACE',
    description: 'Arkan Taqiyuddin — Colorist at KAN specializing in Color Grading and Finishing.',
  },
  {
    path: 'arkantaqiyuddin',
    title: 'Arkan Taqiyuddin - Colorist - KAN SPACE',
    description: 'Arkan Taqiyuddin — Colorist at KAN specializing in Color Grading and Finishing.',
  },
  {
    path: 'work',
    title: 'Work - KAN SPACE',
    description: 'Commercials, films, music videos, and visual campaigns color graded by KAN.',
  },
  {
    path: 'works',
    title: 'Work - KAN SPACE',
    description: 'Commercials, films, music videos, and visual campaigns color graded by KAN.',
  },
  {
    path: 'kan',
    title: 'HOME - KAN SPACE',
    description: 'KAN is a Bandung based independent post-production studio, specializing in tailor-made Color Grading and finishing. Latest Work.',
  },
  // Individual project routes (canonical)
  {
    path: 'work/ayubyayulestariofficial-bridal-portrait',
    title: 'Ayubyayulestariofficial - KAN SPACE',
    description: 'Ayubyayulestariofficial — Bridal Portrait. Colorist: Arkan Taqiyuddin.',
    image: 'previews/ayubyayulestariofficial.jpg',
  },
  {
    path: 'work/byayudyahandari-fashion-editorial',
    title: 'Byayudyahandari - KAN SPACE',
    description: 'Byayudyahandari — Fashion Editorial. Colorist: Arkan Taqiyuddin.',
    image: 'previews/byayudyahandari.jpg',
  },
  {
    path: 'work/oase-desert-of-dubai-fashion-film',
    title: 'OASE "Desert Of Dubai" - KAN SPACE',
    description: 'OASE "Desert Of Dubai" — Fashion Film. Colorist: Arkan Taqiyuddin.',
    image: 'previews/oase-desert-of-dubai.jpg',
  },
  {
    path: 'work/sony-filmmaking-experience-brand-experience',
    title: 'Sony Filmmaking Experience - KAN SPACE',
    description: 'Sony Filmmaking Experience — Brand Experience. Colorist: Arkan Taqiyuddin.',
    image: 'previews/sony-filmmaking-experience.jpg',
  },
  {
    path: 'work/immateurplayground-visual-campaign',
    title: 'Immateurplayground - KAN SPACE',
    description: 'Immateurplayground — Visual Campaign. Colorist: Arkan Taqiyuddin.',
    image: 'previews/immateurplayground.jpg',
  },
  {
    path: 'work/sony-alpha-festival-2026-brand-film',
    title: 'Sony Alpha Festival 2026 - KAN SPACE',
    description: 'Sony Alpha Festival 2026 — Brand Film. Colorist: Arkan Taqiyuddin.',
    image: 'previews/sony-alpha-festival-2026.jpg',
  },
  // Individual project routes (short aliases for direct sharing)
  {
    path: 'work/ayubyayulestariofficial',
    title: 'Ayubyayulestariofficial - KAN SPACE',
    description: 'Ayubyayulestariofficial — Bridal Portrait. Colorist: Arkan Taqiyuddin.',
    image: 'previews/ayubyayulestariofficial.jpg',
  },
  {
    path: 'work/byayudyahandari',
    title: 'Byayudyahandari - KAN SPACE',
    description: 'Byayudyahandari — Fashion Editorial. Colorist: Arkan Taqiyuddin.',
    image: 'previews/byayudyahandari.jpg',
  },
  {
    path: 'work/oase-desert-of-dubai',
    title: 'OASE "Desert Of Dubai" - KAN SPACE',
    description: 'OASE "Desert Of Dubai" — Fashion Film. Colorist: Arkan Taqiyuddin.',
    image: 'previews/oase-desert-of-dubai.jpg',
  },
  {
    path: 'work/sony-filmmaking-experience',
    title: 'Sony Filmmaking Experience - KAN SPACE',
    description: 'Sony Filmmaking Experience — Brand Experience. Colorist: Arkan Taqiyuddin.',
    image: 'previews/sony-filmmaking-experience.jpg',
  },
  {
    path: 'work/immateurplayground',
    title: 'Immateurplayground - KAN SPACE',
    description: 'Immateurplayground — Visual Campaign. Colorist: Arkan Taqiyuddin.',
    image: 'previews/immateurplayground.jpg',
  },
  {
    path: 'work/sony-alpha-festival-2026',
    title: 'Sony Alpha Festival 2026 - KAN SPACE',
    description: 'Sony Alpha Festival 2026 — Brand Film. Colorist: Arkan Taqiyuddin.',
    image: 'previews/sony-alpha-festival-2026.jpg',
  },
  {
    path: 'work/sony-alpha-festival-2025',
    title: 'Sony Alpha Festival 2026 - KAN SPACE',
    description: 'Sony Alpha Festival 2026 — Brand Film. Colorist: Arkan Taqiyuddin.',
    image: 'previews/sony-alpha-festival-2026.jpg',
  },
];

function escapeHtmlAttr(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// Helper to replace title, meta tags, and structured data safely
function customizeHtml(html, title, description, canonicalPath, imagePath) {
  let custom = html;
  const canonicalUrl = canonicalPath ? `https://www.siarkannn.space/${canonicalPath.replace(/^\/+/, '')}` : 'https://www.siarkannn.space/';
  const imageUrl = imagePath ? `https://www.siarkannn.space/${imagePath.replace(/^\/+/, '')}` : 'https://www.siarkannn.space/og-image.jpg';
  const safeTitle = escapeHtmlAttr(title);
  const safeDesc = escapeHtmlAttr(description);

  if (title) {
    custom = custom.replace(/<title>.*?<\/title>/gi, `<title>${title}</title>`);
    custom = custom.replace(/<meta\s+property=["']og:title["']\s+content=["'].*?["']\s*\/?>/gi, `<meta property="og:title" content="${safeTitle}" />`);
    custom = custom.replace(/<meta\s+name=["']twitter:title["']\s+content=["'].*?["']\s*\/?>/gi, `<meta name="twitter:title" content="${safeTitle}" />`);
    custom = custom.replace(/<meta\s+itemprop=["']name["']\s+content=["'].*?["']\s*\/?>/gi, `<meta itemprop="name" content="${safeTitle}" />`);
  }
  if (description) {
    custom = custom.replace(/<meta\s+name=["']description["']\s+content=["'].*?["']\s*\/?>/gi, `<meta name="description" content="${safeDesc}" />`);
    custom = custom.replace(/<meta\s+property=["']og:description["']\s+content=["'].*?["']\s*\/?>/gi, `<meta property="og:description" content="${safeDesc}" />`);
    custom = custom.replace(/<meta\s+name=["']twitter:description["']\s+content=["'].*?["']\s*\/?>/gi, `<meta name="twitter:description" content="${safeDesc}" />`);
    custom = custom.replace(/<meta\s+itemprop=["']description["']\s+content=["'].*?["']\s*\/?>/gi, `<meta itemprop="description" content="${safeDesc}" />`);
  }
  if (imagePath) {
    custom = custom.replace(/<meta\s+property=["']og:image["']\s+content=["'].*?["']\s*\/?>/gi, `<meta property="og:image" content="${imageUrl}" />`);
    custom = custom.replace(/<meta\s+property=["']og:image:secure_url["']\s+content=["'].*?["']\s*\/?>/gi, `<meta property="og:image:secure_url" content="${imageUrl}" />`);
    custom = custom.replace(/<meta\s+name=["']twitter:image["']\s+content=["'].*?["']\s*\/?>/gi, `<meta name="twitter:image" content="${imageUrl}" />`);
    custom = custom.replace(/<meta\s+itemprop=["']image["']\s+content=["'].*?["']\s*\/?>/gi, `<meta itemprop="image" content="${imageUrl}" />`);
    custom = custom.replace(/<link\s+rel=["']image_src["']\s+href=["'].*?["']\s*\/?>/gi, `<link rel="image_src" href="${imageUrl}" />`);
    if (title) {
      custom = custom.replace(/<meta\s+property=["']og:image:alt["']\s+content=["'].*?["']\s*\/?>/gi, `<meta property="og:image:alt" content="${safeTitle}" />`);
      custom = custom.replace(/<meta\s+name=["']twitter:image:alt["']\s+content=["'].*?["']\s*\/?>/gi, `<meta name="twitter:image:alt" content="${safeTitle}" />`);
    }
  }
  if (canonicalPath) {
    custom = custom.replace(/<link\s+rel=["']canonical["']\s+href=["'].*?["']\s*\/?>/gi, `<link rel="canonical" href="${canonicalUrl}" />`);
    custom = custom.replace(/<meta\s+property=["']og:url["']\s+content=["'].*?["']\s*\/?>/gi, `<meta property="og:url" content="${canonicalUrl}" />`);
    custom = custom.replace(/<meta\s+name=["']twitter:url["']\s+content=["'].*?["']\s*\/?>/gi, `<meta name="twitter:url" content="${canonicalUrl}" />`);

    // Inject accurate WebPage structured data graph while keeping Organization root intact
    const pageSchema = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Organization",
          "@id": "https://www.siarkannn.space/#organization",
          "name": "KAN SPACE",
          "alternateName": ["siarkannn", "KAN Studio", "KAN"],
          "url": "https://www.siarkannn.space/",
          "logo": "https://www.siarkannn.space/favicon-48x48.png",
          "image": imageUrl,
          "description": "KAN is a Bandung based independent post-production studio, specializing in tailor-made Color Grading and finishing. Latest Work.",
          "sameAs": ["https://www.instagram.com/siarkannn/"]
        },
        {
          "@type": "WebSite",
          "@id": "https://www.siarkannn.space/#website",
          "url": "https://www.siarkannn.space/",
          "name": "KAN SPACE",
          "description": "KAN is a Bandung based independent post-production studio, specializing in tailor-made Color Grading and finishing. Latest Work.",
          "publisher": { "@id": "https://www.siarkannn.space/#organization" }
        },
        {
          "@type": "WebPage",
          "@id": `${canonicalUrl}#webpage`,
          "url": canonicalUrl,
          "name": title || "HOME - KAN SPACE",
          "description": description || "KAN is a Bandung based independent post-production studio, specializing in tailor-made Color Grading and finishing. Latest Work.",
          "image": imageUrl,
          "isPartOf": { "@id": "https://www.siarkannn.space/#website" }
        }
      ]
    };

    custom = custom.replace(
      /<script\s+type=["']application\/ld\+json["']>[\s\S]*?<\/script>/i,
      `<script type="application/ld+json">\n${JSON.stringify(pageSchema, null, 2)}\n    </script>`
    );
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

  const customContent = customizeHtml(indexHtml, route.title, route.description, route.path, route.image);

  // Write dist/[route]/index.html
  fs.writeFileSync(path.join(targetDir, 'index.html'), customContent, 'utf-8');

  // Also write dist/[route].html for clean URL matching on Vercel Edge Network
  const directHtmlPath = path.join(distDir, `${route.path}.html`);
  fs.mkdirSync(path.dirname(directHtmlPath), { recursive: true });
  fs.writeFileSync(directHtmlPath, customContent, 'utf-8');

  console.log(`✓ Pre-generated static route: /${route.path}`);
}
