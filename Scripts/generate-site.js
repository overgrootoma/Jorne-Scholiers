const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const projectsDir = path.join(root, 'Projects');
const archiveDir = path.join(root, 'Archive');
const photographyDir = path.join(root, 'photography');

const siteUrl = (process.env.SITE_URL || 'https://overgrootoma.github.io/Jorne-Scholiers/').replace(/\/?$/, '/');
const siteName = 'Jorne Scholiers';
const profileImage = 'images/Jorne%20Scholiers%20about%20picture.jpg';
const profileImageFile = path.join(root, 'images', 'Jorne Scholiers about picture.jpg');
const defaultSocialImage = 'images/ME.webp';
const defaultDescription = 'Portfolio of Jorne Scholiers, a visual and graphic designer in Ghent working across identities, editorial design, typography, photography, and creative coding.';

const palette = ['#0000FF'];
// Edit these lists to update the quiet information columns on the homepage.
const homepageProfile = {
  personal: [
    'Jorne Scholiers',
    '2005',
    'Visual Designer',
    'Belgium',
  ],
  exhibitions: [
    {
      label: 'Antwerp Art Weekend — MONAR X UGG, 2025',
      href: 'project-2025-0-big-summer-energy.html',
    },
  ],
  experience: [
    'Intern at Broos Stoffels 2026',
  ],
  education: [
    'LUCA, Visual Design, Graphic Studio 2023-2026',
  ],
  links: [
    { label: 'Accidental Graphics', href: 'https://overgrootoma.github.io/Accidental-Graphics/index.html' },
    { label: 'Instagram', href: 'https://www.instagram.com/byjorne/' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/jorne-scholiers-28555923b/' },
    { label: 'Email', href: 'mailto:jorne.scholiers@icloud.com' },
    { label: '+32472 45 21 64', href: 'tel:+32472452164' },
  ],
};
const projectOrder = [
  '2026 Sound Translations of Fungal Forms',
  '2026 Isolation',
  '2025 BrilliantBooks',
  '2025 Big summer energy',
  '2025 Colis Paris',
  '2025 Off all things bord ',
  '2025 Hotel Identity',
  '2024 Poster Party',
  '2024 Mars Attacks',
  '2024 YesYouCan',
];

const titleOverrides = {
  '2025 BrilliantBooks': 'Brilliant Books',
  '2025 Big summer energy': 'Big Summer Energy',
  '2025 Colis Paris': 'Colis Paris',
  '2025 Off all things bord ': 'Of All Things: Bord',
  '2025 Hotel Identity': 'Hotel Identity',
};

const projectKeywords = {
  '2026 Sound Translations of Fungal Forms': ['creative coding', 'generative design', 'sound design', 'installation design'],
  '2026 Isolation': ['creative coding', 'generative design', 'editorial design', 'experimental photography'],
  '2025 BrilliantBooks': ['book design', 'editorial design', 'typography'],
  '2025 Big summer energy': ['experimental photography', 'art direction', 'exhibition design'],
  '2025 Colis Paris': ['packaging design', 'visual identity', 'graphic design'],
  '2025 Off all things bord ': ['editorial design', 'magazine design', 'typography'],
  '2025 Hotel Identity': ['brand identity', 'visual identity', 'graphic design'],
  '2024 Poster Party': ['poster design', 'typography', 'graphic design'],
  '2024 YesYouCan': ['packaging design', 'brand identity', 'graphic design'],
};

const mediaSizeOverrides = {
  projects: {
    // '2025 BrilliantBooks': {
    //   'PortfolioFotos_Team6_1 groot.jpeg': 6,
    //   'PortfolioFotos_Team6_10 groot.jpeg': 2,
    // },
  },
  archive: {
    // '2026': {
    //   '63.webp': 6,
    // },
  },
  photography: {
    // 'Photo 2025': {
    //   'wildlife1.webp': 6,
    // },
  },
};

const imageExts = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif', '.bmp', '.svg']);
const videoExts = new Set(['.mp4', '.webm', '.mov', '.m4v', '.ogv']);
const descriptionFiles = ['description.md', 'description.txt', 'info.txt', 'about.txt', 'README.md'];
const pageConfigFile = 'page.json';

function readDirSafe(dir) {
  try {
    return fs.readdirSync(dir, { withFileTypes: true });
  } catch (err) {
    return [];
  }
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function stripHtml(value) {
  return String(value || '')
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function truncateDescription(value, maxLength = 160) {
  const text = stripHtml(value);
  if (text.length <= maxLength) return text;
  const shortened = text.slice(0, maxLength - 1).replace(/\s+\S*$/, '');
  return `${shortened}…`;
}

function firstSentence(value) {
  const text = stripHtml(value);
  const match = text.match(/^.*?[.!?](?=\s|$)/);
  return match ? match[0] : text;
}

function absoluteUrl(relativePath = '') {
  return new URL(relativePath, siteUrl).href;
}

function jsonForHtml(value) {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}

function personSchema() {
  return {
    '@type': 'Person',
    '@id': `${siteUrl}#jorne-scholiers`,
    name: siteName,
    url: siteUrl,
    image: absoluteUrl(profileImage),
    jobTitle: 'Visual and Graphic Designer',
    description: defaultDescription,
    email: 'mailto:jorne.scholiers@icloud.com',
    sameAs: [
      'https://www.instagram.com/byjorne/',
      'https://www.linkedin.com/in/jorne-scholiers-28555923b/',
    ],
    affiliation: {
      '@type': 'EducationalOrganization',
      name: 'LUCA School of Arts',
    },
    homeLocation: {
      '@type': 'Place',
      name: 'Ghent, Belgium',
    },
    knowsAbout: ['Graphic design', 'Visual identity', 'Editorial design', 'Typography', 'Photography', 'Creative coding'],
  };
}

function toUrlPath(...parts) {
  return parts.map((part) => encodeURIComponent(part)).join('/');
}

function normalizeTitle(value) {
  return value.replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim();
}

function parseFolderName(name) {
  const trimmed = name.trim();
  let match = trimmed.match(/^(\d+)[-_ ]+(\d{4})[-_ ]+(.+)$/);
  if (match) {
    return {
      index: Number(match[1]),
      year: Number(match[2]),
      title: normalizeTitle(match[3]),
    };
  }
  match = trimmed.match(/^(\d{4})[-_ ]+(.+)$/);
  if (match) {
    return {
      index: 0,
      year: Number(match[1]),
      title: normalizeTitle(match[2]),
    };
  }
  return {
    index: 0,
    year: 0,
    title: normalizeTitle(trimmed),
  };
}

function slugify(value) {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug || 'item';
}

function listFiles(dir) {
  return readDirSafe(dir)
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .filter((name) => !name.startsWith('.'));
}

function isImage(file) {
  return imageExts.has(path.extname(file).toLowerCase());
}

function imageDimensions(filePath) {
  if (!fs.existsSync(filePath)) return null;
  const buffer = fs.readFileSync(filePath);

  if (
    buffer.length >= 24
    && buffer[0] === 0x89
    && buffer.toString('ascii', 1, 4) === 'PNG'
  ) {
    return {
      width: buffer.readUInt32BE(16),
      height: buffer.readUInt32BE(20),
    };
  }

  const gifSignature = buffer.toString('ascii', 0, 6);
  if (buffer.length >= 10 && (gifSignature === 'GIF87a' || gifSignature === 'GIF89a')) {
    return {
      width: buffer.readUInt16LE(6),
      height: buffer.readUInt16LE(8),
    };
  }

  if (buffer.length >= 4 && buffer[0] === 0xff && buffer[1] === 0xd8) {
    let offset = 2;
    while (offset < buffer.length) {
      while (offset < buffer.length && buffer[offset] === 0xff) offset += 1;
      if (offset >= buffer.length) break;
      const marker = buffer[offset];
      offset += 1;
      if (marker === 0xd8 || marker === 0xd9) continue;
      if (offset + 2 > buffer.length) break;
      const length = buffer.readUInt16BE(offset);
      if (length < 2 || offset + length > buffer.length) break;
      if (
        marker === 0xc0 || marker === 0xc1 || marker === 0xc2 || marker === 0xc3
        || marker === 0xc5 || marker === 0xc6 || marker === 0xc7
        || marker === 0xc9 || marker === 0xca || marker === 0xcb
        || marker === 0xcd || marker === 0xce || marker === 0xcf
      ) {
        return {
          width: buffer.readUInt16BE(offset + 5),
          height: buffer.readUInt16BE(offset + 3),
        };
      }
      offset += length;
    }
  }

  if (
    buffer.length >= 30
    && buffer.toString('ascii', 0, 4) === 'RIFF'
    && buffer.toString('ascii', 8, 12) === 'WEBP'
  ) {
    const chunkType = buffer.toString('ascii', 12, 16);
    if (chunkType === 'VP8X' && buffer.length >= 30) {
      return {
        width: 1 + buffer.readUIntLE(24, 3),
        height: 1 + buffer.readUIntLE(27, 3),
      };
    }
    if (chunkType === 'VP8L' && buffer.length >= 25 && buffer[20] === 0x2f) {
      const bits = buffer.readUInt32LE(21);
      return {
        width: 1 + (bits & 0x3fff),
        height: 1 + ((bits >>> 14) & 0x3fff),
      };
    }
    if (
      chunkType === 'VP8 '
      && buffer.length >= 30
      && buffer[23] === 0x9d
      && buffer[24] === 0x01
      && buffer[25] === 0x2a
    ) {
      return {
        width: buffer.readUInt16LE(26) & 0x3fff,
        height: buffer.readUInt16LE(28) & 0x3fff,
      };
    }
  }

  return null;
}

function imageDimensionAttributes(filePath) {
  const dimensions = imageDimensions(filePath);
  return dimensions ? ` width="${dimensions.width}" height="${dimensions.height}"` : '';
}

function imageOrientation(filePath) {
  const dimensions = imageDimensions(filePath);
  if (!dimensions) return '';
  if (dimensions.width > dimensions.height) return 'landscape';
  if (dimensions.width < dimensions.height) return 'portrait';
  return 'square';
}

function imageSpanForOrientation(orientation) {
  return orientation === 'landscape' ? 2 : 1;
}

function readDescription(dir) {
  for (const file of descriptionFiles) {
    const fullPath = path.join(dir, file);
    if (fs.existsSync(fullPath)) {
      return fs.readFileSync(fullPath, 'utf8').trim();
    }
  }
  return '';
}

function readPageConfig(dir) {
  const fullPath = path.join(dir, pageConfigFile);
  if (!fs.existsSync(fullPath)) return {};
  try {
    return JSON.parse(fs.readFileSync(fullPath, 'utf8'));
  } catch (err) {
    return {};
  }
}

function previewImagePath(project) {
  const preferred = project.pageConfig?.preview_image;
  if (preferred && rootImageDimensionAttributes(preferred)) return preferred;
  return project.images[0]
    ? toUrlPath('Projects', project.dirName, project.images[0])
    : '';
}

function projectIndexImagePath(project) {
  const preferred = project.pageConfig?.index_image;
  if (preferred && rootImageDimensionAttributes(preferred)) return preferred;
  return previewImagePath(project);
}

function rootImageDimensionAttributes(urlPath) {
  try {
    return imageDimensionAttributes(path.join(root, decodeURIComponent(urlPath)));
  } catch (err) {
    return '';
  }
}

function homepageImages(project) {
  const homepageDir = readDirSafe(path.join(projectsDir, project.dirName))
    .filter((entry) => entry.isDirectory() && /^homepage/i.test(entry.name))
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))[0];
  if (homepageDir) {
    const homepageFiles = listFiles(path.join(projectsDir, project.dirName, homepageDir))
      .filter(isImage)
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
      .map((file) => `${homepageDir}/${file}`);
    if (homepageFiles.length) return homepageFiles;
  }

  const preferred = project.pageConfig?.homepage_images;
  if (!Array.isArray(preferred) || !preferred.length) {
    return project.images.slice(0, 5);
  }
  const projectDir = path.join(projectsDir, project.dirName);
  const selected = preferred.filter((file) => {
    if (typeof file !== 'string' || !isImage(file)) return false;
    const normalized = path.normalize(file);
    if (path.isAbsolute(normalized) || normalized.startsWith('..')) return false;
    return fs.existsSync(path.join(projectDir, normalized));
  });
  return selected.length ? selected : project.images.slice(0, 5);
}

function textToHtml(text) {
  if (!text) return '';
  const escaped = escapeHtml(text);
  const paragraphs = escaped.split(/\n\s*\n/);
  return paragraphs
    .map((para) => `<p>${para.replace(/\n/g, '<br>')}</p>`)
    .join('\n');
}

function normalizeMediaSpan(value) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    const rounded = Math.round(value);
    return rounded >= 1 && rounded <= 6 ? rounded : null;
  }
  if (typeof value !== 'string') return null;
  const normalized = value.trim().toLowerCase();
  return /^[1-6]$/.test(normalized) ? Number(normalized) : null;
}

function resolveMediaSpan({ type, dirName, fileName, pageConfig, kind = 'image', fallback = 4 }) {
  const fileSpanKey = kind === 'image' ? 'image_spans' : 'other_file_spans';
  const defaultSpanKey = kind === 'image' ? 'default_image_span' : 'default_other_file_span';
  const requested = pageConfig?.[fileSpanKey]?.[fileName]
    ?? pageConfig?.[defaultSpanKey]
    ?? mediaSizeOverrides[type]?.[dirName]?.[fileName];
  return normalizeMediaSpan(requested) ?? fallback;
}

function orderFilesByPreference(files, preferredOrder) {
  if (!Array.isArray(preferredOrder) || !preferredOrder.length) return files;
  const remaining = new Set(files);
  const ordered = [];
  preferredOrder.forEach((file) => {
    if (remaining.has(file)) {
      ordered.push(file);
      remaining.delete(file);
    }
  });
  files.forEach((file) => {
    if (remaining.has(file)) {
      ordered.push(file);
      remaining.delete(file);
    }
  });
  return ordered;
}

function youtubeVideoId(value) {
  if (typeof value !== 'string') return '';
  const trimmed = value.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;
  const match = trimmed.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : '';
}

function buildItems(baseDir, type) {
  const dirs = readDirSafe(baseDir).filter((entry) => entry.isDirectory());
  const items = [];
  for (const dirent of dirs) {
    const fullPath = path.join(baseDir, dirent.name);
    const parsed = parseFolderName(dirent.name);
    const pageConfig = readPageConfig(fullPath);
    const ignoredFiles = new Set(Array.isArray(pageConfig.ignored_files) ? pageConfig.ignored_files : []);
    const files = listFiles(fullPath)
      .filter((file) => file !== pageConfigFile && !ignoredFiles.has(file))
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
    const orderedFiles = type === 'archive' || type === 'photography' ? [...files].reverse() : files;
    const images = orderedFiles.filter(isImage);
    const otherFiles = orderedFiles.filter((file) => !isImage(file) && !descriptionFiles.includes(file));
    const thumbnailConfig = pageConfig.thumbnail_gallery;
    const thumbnailDir = typeof thumbnailConfig?.directory === 'string'
      ? thumbnailConfig.directory
      : '';
    const thumbnailImages = thumbnailDir
      ? listFiles(path.join(fullPath, thumbnailDir))
        .filter(isImage)
        .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
      : [];
    const description = type === 'projects' ? readDescription(fullPath) : '';
    const slugBase = `${parsed.year || '0000'}-${parsed.index || 0}-${parsed.title || dirent.name}`;
    const slug = slugify(slugBase);

    items.push({
      dirName: dirent.name,
      title: parsed.title || dirent.name,
      year: parsed.year,
      index: parsed.index,
      slug,
      images,
      otherFiles,
      thumbnailDir,
      thumbnailImages,
      description,
      pageConfig,
    });
  }

  items.sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year;
    if (a.index !== b.index) return b.index - a.index;
    return a.title.localeCompare(b.title);
  });

  return items;
}

function renderHead({
  title,
  description = defaultDescription,
  fileName = '',
  canonicalFile = fileName,
  image = defaultSocialImage,
  imageAlt = `${siteName} visual design portfolio`,
  pageType = 'website',
  schema = null,
  noIndex = false,
}) {
  const canonicalUrl = absoluteUrl(canonicalFile);
  const socialImage = absoluteUrl(image);
  const safeDescription = truncateDescription(description);
  const robots = noIndex ? 'noindex, follow' : 'index, follow, max-image-preview:large';
  const structuredData = schema
    ? `\n  <script type="application/ld+json">${jsonForHtml({ '@context': 'https://schema.org', ...schema })}</script>`
    : '';
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(safeDescription)}">
  <meta name="author" content="${siteName}">
  <meta name="robots" content="${robots}">
  <link rel="canonical" href="${escapeHtml(canonicalUrl)}">
  <meta property="og:locale" content="en_BE">
  <meta property="og:type" content="${escapeHtml(pageType)}">
  <meta property="og:site_name" content="${siteName}">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(safeDescription)}">
  <meta property="og:url" content="${escapeHtml(canonicalUrl)}">
  <meta property="og:image" content="${escapeHtml(socialImage)}">
  <meta property="og:image:alt" content="${escapeHtml(imageAlt)}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(safeDescription)}">
  <meta name="twitter:image" content="${escapeHtml(socialImage)}">
  <meta name="theme-color" content="#ebebeb">
  <link rel="icon" type="image/jpeg" href="images/blue%20favicon.jpg">
  <!-- Google tag (gtag.js) -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-RELMELQ5K1"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());

    gtag('config', 'G-RELMELQ5K1');
  </script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Bitcount+Grid+Double+Ink:wght@100..900&amp;family=Open+Sans:ital,wght@0,300..800;1,300..800&amp;display=swap" rel="stylesheet">
  <link rel="stylesheet" href="Css/style.css">${structuredData}
</head>`;
}

function renderIntroCopy() {
  return `<p>
    Hello,<br>
    My name is Jorne Scholiers, a Visual Design student at LUCA School of Arts Ghent.<br><br>
    I have some <a href="index.html#project-grid">projects</a> you can look at, along with other work in my <a href="archive.html">archive</a> that shows what I've been experimenting with.<br>
    Or maybe you will like some of my <a href="photography.html">Photography</a>. Some of my projects appear on my <a href="https://www.instagram.com/byjorne/" target="_blank" rel="noopener">Instagram</a>.<br><br>
    Don't hesitate to <a href="mailto:jorne.scholiers@icloud.com">contact me</a>, I'd love to hear from you.<br>
    Oh and I am working on a little experimental <a href="https://overgrootoma.github.io/Accidental-Graphics/index.html" target="_blank" rel="noopener">site</a> as well :)
  </p>`;
}

function renderIntro() {
  return `
<section class="intro" id="intro">
  <h1 class="visually-hidden">Jorne Scholiers — Visual and Graphic Designer in Ghent</h1>
  ${renderIntroCopy()}
</section>`;
}

function renderMobileIntro() {
  return `<details class="mobile-intro">
    <summary>Introduction</summary>
    <div class="mobile-intro-copy">${renderIntroCopy()}</div>
  </details>`;
}

function renderProjectRows(projects, { compact = false } = {}) {
  return projects.map((project, index) => {
    const displayTitle = project.pageConfig?.index_title || project.title;
    const image = projectIndexImagePath(project);
    const dimensions = rootImageDimensionAttributes(image);
    const loading = index === 0 ? ' loading="eager" fetchpriority="high"' : ' loading="lazy"';
    const summary = compact
      ? '<span class="project-row-action">View project</span>'
      : `<p class="project-summary">${escapeHtml(firstSentence(project.description || `${project.title}, a visual design project by Jorne Scholiers.`))}</p>`;
    return `
      <a class="project-row" href="project-${project.slug}.html">
        <div class="project-info">
          <h2>${escapeHtml(displayTitle)}</h2>
          <div class="project-year">${escapeHtml(project.year)}</div>
          ${summary}
        </div>
        <div class="project-thumb">
          <img src="${image}" alt="Preview of ${escapeHtml(displayTitle)} by Jorne Scholiers"${dimensions}${loading} decoding="async">
        </div>
      </a>`;
  }).join('');
}

function renderProjectRail(projects, { linkToSections = false, currentSlug = null } = {}) {
  const railBlocks = projects
    .map((project) => {
      const previewImage = projectIndexImagePath(project);
      const title = escapeHtml(project.title);
      const href = linkToSections ? `#project-${project.slug}` : `project-${project.slug}.html`;
      const current = project.slug === currentSlug ? ' is-current' : '';
      const ariaCurrent = project.slug === currentSlug ? ' aria-current="page"' : '';
      return `<a class="rail-block${current}" href="${href}" style="--rail-color: ${project.accent}; --rail-text-color: ${railTextColor(project.accent)}" data-title="${title}" data-image="${previewImage}" aria-label="${title}"${ariaCurrent}><span>${title}</span></a>`;
    })
    .join('\n');

  return `<aside class="project-rail" aria-label="Project quick navigation">
      ${railBlocks || '<div class="rail-empty"></div>'}
    </aside>
    <div class="rail-preview" id="rail-preview">
      <div class="rail-preview-title"></div>
      <img alt="Project preview" />
    </div>`;
}

function renderHomeProjectGrid(projects) {
  const cards = projects.map((project, index) => {
    const title = project.pageConfig?.index_title || project.title;
    const image = projectIndexImagePath(project);
    const dimensions = rootImageDimensionAttributes(image);
    const loading = index < 3 ? ' loading="eager"' : ' loading="lazy"';
    return `<a class="home-grid-card" href="project-${project.slug}.html" style="--grid-card-color: ${project.accent}; --grid-card-text: ${railTextColor(project.accent)}">
      <span class="home-grid-card-image"><img src="${escapeHtml(image)}" alt="Preview of ${escapeHtml(title)}"${dimensions}${loading} decoding="async"></span>
      <span class="home-grid-card-info"><strong>${escapeHtml(title)}</strong></span>
    </a>`;
  }).join('\n');

  return `<section class="home-project-grid" id="project-grid" aria-label="All projects" hidden>
    <div class="home-project-grid-cards" style="--home-project-columns: ${Math.max(Math.ceil(projects.length / 3), 1)}">${cards}</div>
  </section>`;
}

function renderHome(projects) {
  const renderTextList = (items, { interactiveFirst = false } = {}) => items.map((item, index) => {
    if (interactiveFirst && index === 0) {
      return `<li>${escapeHtml(item)}</li>`;
    }
    return `<li>${escapeHtml(item)}</li>`;
  }).join('');
  const renderLinkList = (items) => items.map((item) => {
    if (!item.href) return `<li><span>${escapeHtml(item.label)}</span></li>`;
    const external = /^https?:/i.test(item.href) ? ' target="_blank" rel="noopener"' : '';
    return `<li><a href="${escapeHtml(item.href)}"${external}>${escapeHtml(item.label)}</a></li>`;
  }).join('');

  const projectLinks = projects.map((project, projectIndex) => {
    const page = `project-${project.slug}.html`;
    const displayTitle = project.pageConfig?.index_title || project.title;
    const preferredImages = homepageImages(project);
    const previewImages = preferredImages.slice(0, 4);
    const images = previewImages.map((file, imageIndex) => {
        const fileParts = file.split(/[\\/]/).filter(Boolean);
        const src = toUrlPath('Projects', project.dirName, ...fileParts);
        const dimensions = imageDimensionAttributes(path.join(projectsDir, project.dirName, ...fileParts));
        const loading = projectIndex === 0 && imageIndex === 0 ? ' loading="eager" fetchpriority="high"' : ' loading="lazy"';
        return `<img src="${src}" alt="${escapeHtml(project.title)}, image ${imageIndex + 1}"${dimensions}${loading} decoding="async">`;
      }).join('\n');

    return `<li>
      <a class="home-project-link" href="${page}" data-home-project="${escapeHtml(project.slug)}" aria-describedby="home-project-year-${escapeHtml(project.slug)}">
        <small id="home-project-year-${escapeHtml(project.slug)}">${escapeHtml(project.year || '')}</small>
        <span>${escapeHtml(displayTitle)}</span>
      </a>
      <div class="home-project-preview" data-home-preview="${escapeHtml(project.slug)}" aria-hidden="true">
        ${images}
      </div>
    </li>`;
  }).join('\n');

  return `
<main class="page-home home-exhibition">
  <h1 class="visually-hidden">Jorne Scholiers — selected visual design projects</h1>
  <aside class="home-information" aria-label="Information">
    <div class="home-about-columns">
      <section class="home-about-primary">
        <h2>About</h2>
        <ul class="home-info-list">${renderTextList(homepageProfile.personal, { interactiveFirst: true })}</ul>
        <nav class="home-profile-links" aria-label="Important links">
          <ul>${renderLinkList(homepageProfile.links)}</ul>
        </nav>
      </section>
      <div class="home-about-secondary">
        <section>
          <h2>Exhibitions</h2>
          <ul class="home-info-list">${renderLinkList(homepageProfile.exhibitions)}</ul>
        </section>
        <section class="home-experience">
          <h2>Experience</h2>
          <ul class="home-info-list">${renderTextList(homepageProfile.experience)}</ul>
        </section>
        <section class="home-education">
          <h2>Education</h2>
          <ul class="home-info-list">${renderTextList(homepageProfile.education)}</ul>
        </section>
      </div>
    </div>
  </aside>
  <section class="home-project-index" aria-labelledby="home-projects-title">
    <h2 class="visually-hidden" id="home-projects-title">Projects</h2>
    <ol>${projectLinks || '<li>No projects yet.</li>'}</ol>
  </section>
  <div class="home-portrait-preview" data-home-portrait aria-hidden="true">
    <img src="${profileImage}" alt="Portrait of Jorne Scholiers"${imageDimensionAttributes(profileImageFile)} loading="eager" decoding="async">
  </div>
  <a class="home-archive-link" href="archive.html">Archive</a>
</main>`;
}

function archiveSortValue(item) {
  if (item.year) return item.year;
  const match = String(item.title || '').match(/\b(19|20)\d{2}\b/);
  return match ? Number(match[0]) : 0;
}

function railTextColor(accent) {
  return accent === '#1e2ede' ? 'rgba(235, 235, 235, 0.92)' : 'rgba(0, 0, 0, 0.75)';
}

function collectionPreviewPath(baseDirName, item) {
  return item.images[0] ? toUrlPath(baseDirName, item.dirName, item.images[0]) : '';
}

function renderCollectionIndex(items, {
  heading,
  introText,
  activeCollection,
  railAriaLabel,
  sectionPrefix,
  baseDirName,
  collectionType,
  previewPrefix,
  emptyState,
}) {
  const orderedItems = [...items].sort((a, b) => {
    const yearDiff = archiveSortValue(b) - archiveSortValue(a);
    if (yearDiff !== 0) return yearDiff;
    if (a.index !== b.index) return b.index - a.index;
    return b.title.localeCompare(a.title, undefined, { numeric: true });
  });
  const railLinks = orderedItems
    .map((item) => {
      const yearLabel = archiveSortValue(item) || item.title;
      const accent = item.accent || palette[0];
      return `<a class="archive-rail-block" href="#${sectionPrefix}-${item.slug}" style="--rail-color: ${accent}; --rail-text-color: ${railTextColor(accent)}" data-title="${escapeHtml(previewPrefix)} ${escapeHtml(String(yearLabel))}" data-image="${collectionPreviewPath(baseDirName, item)}" aria-label="${escapeHtml(String(yearLabel))}"><span>${escapeHtml(String(yearLabel))}</span></a>`;
    })
    .join('\n');

  const sections = orderedItems
    .map((item) => {
      const accent = item.accent || palette[0];
      const markerText = railTextColor(accent);
      const orderedImages = orderFilesByPreference(item.images, item.pageConfig?.image_order);
      const orderedOtherFiles = orderFilesByPreference(item.otherFiles, item.pageConfig?.other_file_order);
      const gallery = orderedImages
        .map((file, idx) => {
          const src = toUrlPath(baseDirName, item.dirName, file);
          const orientation = imageOrientation(path.join(root, baseDirName, item.dirName, file));
          const span = resolveMediaSpan({
            type: collectionType,
            dirName: item.dirName,
            fileName: file,
            pageConfig: item.pageConfig,
            kind: 'image',
            fallback: imageSpanForOrientation(orientation),
          });
          const orientationAttr = orientation ? ` data-orientation="${orientation}"` : '';
          const dimensions = imageDimensionAttributes(path.join(root, baseDirName, item.dirName, file));
          return `
      <figure data-span="${span}"${orientationAttr}>
        <div class="media-frame">
          <img src="${src}" alt="${escapeHtml(item.title)} image ${idx + 1}"${dimensions} loading="lazy" decoding="async">
        </div>
      </figure>`;
        })
        .join('\n');

      const mediaBlocks = [];
      const downloadLinks = [];

      orderedOtherFiles.forEach((file) => {
        const href = toUrlPath(baseDirName, item.dirName, file);
        const ext = path.extname(file).toLowerCase();
        const span = resolveMediaSpan({
          type: collectionType,
          dirName: item.dirName,
          fileName: file,
          pageConfig: item.pageConfig,
          kind: 'other',
          fallback: 2,
        });
        if (ext === '.pdf') {
          mediaBlocks.push(`
      <figure data-span="${span}" class="media-card">
        <div class="media-frame">
          <iframe class="media-embed media-embed--pdf" src="${href}" title="${escapeHtml(file)}" loading="lazy"></iframe>
        </div>
        <figcaption class="media-caption">${escapeHtml(file)}</figcaption>
      </figure>`);
          return;
        }
        if (videoExts.has(ext)) {
          mediaBlocks.push(`
      <figure data-span="${span}" class="media-card">
        <div class="media-frame">
          <video class="media-embed media-embed--video" controls preload="metadata">
            <source src="${href}" type="video/${ext.replace('.', '')}">
          </video>
        </div>
      </figure>`);
          return;
        }
        downloadLinks.push(`<li><a href="${href}" target="_blank" rel="noopener">${escapeHtml(file)}</a></li>`);
      });

      const mediaSection = mediaBlocks.length
        ? `<section class="detail-media">\n    ${mediaBlocks.join('\n')}\n  </section>`
        : '';

      const filesBlock = downloadLinks.length
        ? `<section class="detail-files"><h3 class="title-font">Files</h3><ul>${downloadLinks.join('')}</ul></section>`
        : '';
      const yearLabel = archiveSortValue(item) || item.title;
      return `
    <article class="archive-entry" id="${sectionPrefix}-${item.slug}" style="--archive-accent: ${accent}; --archive-marker-text: ${markerText}">
      <div class="archive-entry-content">
        <section class="detail-gallery archive-entry-gallery">
          ${gallery || '<div class="empty-state">No images yet.</div>'}
        </section>
        ${mediaSection}
        ${filesBlock}
      </div>
    </article>`;
    })
    .join('\n');
  const headingMarkup = heading
    ? `<h1 class="title-font"><a class="archive-heading-link" href="index.html" aria-label="Back to homepage">${escapeHtml(heading)}</a></h1>`
    : '';

  return `
<main class="page-archive" id="${sectionPrefix}-top">
  <aside class="archive-rail" aria-label="${escapeHtml(railAriaLabel)}">
    ${railLinks || '<div class="rail-empty"></div>'}
  </aside>
  <div class="rail-preview" id="rail-preview">
    <div class="rail-preview-title"></div>
    <img alt="Preview" />
  </div>
  <section class="archive-intro${heading ? '' : ' archive-intro--without-heading'}">
    ${headingMarkup}
    <div class="archive-intro-meta">
      <nav class="projects-view-toggle archive-view-toggle" aria-label="Archive view">
        <a class="projects-view-toggle__button${activeCollection === 'designs' ? ' is-active' : ''}" href="archive.html"${activeCollection === 'designs' ? ' aria-current="page"' : ''}>Design</a>
        <a class="projects-view-toggle__button${activeCollection === 'photography' ? ' is-active' : ''}" href="photography.html"${activeCollection === 'photography' ? ' aria-current="page"' : ''}>Photography</a>
      </nav>
    </div>
  </section>
  <section class="archive-list">
    ${sections || `<div class="empty-state">${escapeHtml(emptyState)}</div>`}
  </section>
</main>`;
}

function renderArchiveIndex(items) {
  return renderCollectionIndex(items, {
    heading: '',
    introText: 'Experiments, drafts, and side quests.',
    activeCollection: 'designs',
    railAriaLabel: 'Archive years navigation',
    sectionPrefix: 'archive',
    baseDirName: 'Archive',
    collectionType: 'archive',
    previewPrefix: 'Archive',
    emptyState: 'Add folders inside the Archive directory to populate this page.',
  });
}

function renderPhotographyIndex(items) {
  return renderCollectionIndex(items, {
    heading: '',
    introText: 'Selected photography work and ongoing series.',
    activeCollection: 'photography',
    railAriaLabel: 'Photography years navigation',
    sectionPrefix: 'photography',
    baseDirName: 'photography',
    collectionType: 'photography',
    previewPrefix: 'Photography',
    emptyState: 'Add folders inside the photography directory to populate this page.',
  });
}

function renderProjectsIndex(projects) {
  return `
<main class="page-projects">
  <section class="projects-overview">
    ${renderMobileIntro()}
    <h1 class="visually-hidden">Graphic design projects</h1>
    <div class="projects-view-toggle" role="group" aria-label="Project index view">
      <button class="projects-view-toggle__button is-active" type="button" data-projects-view="list" aria-pressed="true">List</button>
      <button class="projects-view-toggle__button" type="button" data-projects-view="grid" aria-pressed="false">Grid</button>
    </div>
    <div class="projects-list" data-projects-list data-view="list">
      ${renderProjectRows(projects) || '<div class="empty-state">Projects will be added here.</div>'}
    </div>
  </section>
</main>`;
}

function renderProjectStepNav(nav) {
  if (!nav) return '';
  return `
  <nav class="project-step-nav" aria-label="Project navigation">
    <a class="project-step project-step--prev" href="${nav.prev.href}" aria-label="Previous project: ${escapeHtml(nav.prev.title)}">
      <span class="project-step-arrow" aria-hidden="true">&lt;</span>
      <span class="project-step-label">${escapeHtml(nav.prev.label || nav.prev.title)}</span>
    </a>
    <a class="project-step project-step--next" href="${nav.next.href}" aria-label="Next project: ${escapeHtml(nav.next.title)}">
      <span class="project-step-label">${escapeHtml(nav.next.label || nav.next.title)}</span>
      <span class="project-step-arrow" aria-hidden="true">&gt;</span>
    </a>
  </nav>`;
}

function renderProjectPage(item, type, nav = null) {
  const title = escapeHtml(item.title);
  const base = type === 'projects' ? 'Projects' : 'Archive';
  const pageConfig = item.pageConfig || {};
  const galleryClass = pageConfig.gallery_class || 'detail-gallery';
  const orderedImages = orderFilesByPreference(item.images, pageConfig.image_order);
  const orderedOtherFiles = orderFilesByPreference(item.otherFiles, pageConfig.other_file_order);
  const images = orderedImages
    .map((file, idx) => {
      const src = toUrlPath(base, item.dirName, file);
      const dimensions = imageDimensionAttributes(path.join(root, base, item.dirName, file));
      const loading = idx === 0 ? ' loading="eager" fetchpriority="high"' : ' loading="lazy"';
      const span = resolveMediaSpan({
        type,
        dirName: item.dirName,
        fileName: file,
        pageConfig,
        kind: 'image',
        fallback: 4,
      });
      return `
      <figure data-span="${span}">
        <div class="media-frame">
          <img src="${src}" alt="${title} by Jorne Scholiers — image ${idx + 1}"${dimensions}${loading} decoding="async">
        </div>
        ${type === 'projects' ? '' : `<figcaption>${escapeHtml(file)}</figcaption>`}
      </figure>`;
    })
    .join('\n');

  const mediaBlocks = [];
  const downloadLinks = [];

  orderedOtherFiles.forEach((file) => {
    const href = toUrlPath(base, item.dirName, file);
    const ext = path.extname(file).toLowerCase();
    const span = resolveMediaSpan({
      type,
      dirName: item.dirName,
      fileName: file,
      pageConfig,
      kind: 'other',
      fallback: 4,
    });
    if (type === 'projects') {
      if (videoExts.has(ext)) {
        mediaBlocks.push(`
      <figure data-span="${span}" class="media-card">
        <div class="media-frame">
          <video class="media-embed media-embed--video" controls preload="metadata">
            <source src="${href}" type="video/${ext.replace('.', '')}">
          </video>
        </div>
      </figure>`);
        return;
      }
      downloadLinks.push(`<li><a class="media-link" href="${href}" target="_blank" rel="noopener">${escapeHtml(file)}</a></li>`);
      return;
    }
    if (ext === '.pdf') {
      mediaBlocks.push(`
      <figure data-span="${span}" class="media-card">
        <div class="media-frame">
          <iframe class="media-embed media-embed--pdf" src="${href}" title="${escapeHtml(file)}" loading="lazy"></iframe>
        </div>
        <figcaption class="media-caption">${escapeHtml(file)}</figcaption>
      </figure>`);
      return;
    }
    if (videoExts.has(ext)) {
      mediaBlocks.push(`
      <figure data-span="${span}" class="media-card">
        <div class="media-frame">
          <video class="media-embed media-embed--video" controls preload="metadata">
            <source src="${href}" type="video/${ext.replace('.', '')}">
          </video>
        </div>
      </figure>`);
      return;
    }
    downloadLinks.push(`<li><a href="${href}" target="_blank" rel="noopener">${escapeHtml(file)}</a></li>`);
  });

  const descriptionHtml = type === 'projects'
    ? textToHtml(item.description || 'Project information will be added here.')
    : '';

  const descriptionBlock = descriptionHtml
    ? `<section class="detail-description">${descriptionHtml}</section>`
    : '';

  const showcaseConfig = type === 'projects' ? pageConfig.youtube_showcase : null;
  const showcaseId = youtubeVideoId(showcaseConfig?.url || showcaseConfig?.id || '');
  const showcaseTitle = escapeHtml(showcaseConfig?.title || 'Video showcase');
  const showcaseStart = Number.parseInt(showcaseConfig?.start, 10);
  const showcaseStartParam = Number.isFinite(showcaseStart) && showcaseStart > 0
    ? `&amp;start=${showcaseStart}`
    : '';
  const showcaseBlock = showcaseId
    ? `<section class="detail-showcase" aria-label="${showcaseTitle}">
    <div class="youtube-frame">
      <iframe src="https://www.youtube-nocookie.com/embed/${showcaseId}?rel=0${showcaseStartParam}" title="${showcaseTitle}" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
    </div>
  </section>`
    : '';

  const thumbnailTitle = escapeHtml(pageConfig.thumbnail_gallery?.title || 'All images');
  const thumbnailItems = (item.thumbnailImages || []).map((file, idx) => {
    const src = toUrlPath(base, item.dirName, item.thumbnailDir, file);
    const dimensions = imageDimensionAttributes(path.join(root, base, item.dirName, item.thumbnailDir, file));
    return `<figure>
      <img src="${src}" alt="${title} generated image ${idx + 1}"${dimensions} loading="lazy" decoding="async">
    </figure>`;
  }).join('\n');
  const thumbnailBlock = thumbnailItems
    ? `<section class="detail-thumbnail-section" aria-label="${thumbnailTitle}">
    <div class="detail-gallery detail-thumbnail-gallery">
      ${thumbnailItems}
    </div>
  </section>`
    : '';

  const mediaSection = mediaBlocks.length
    ? `<section class="detail-media">\n    ${mediaBlocks.join('\n')}\n  </section>`
    : '';

  const filesBlock = downloadLinks.length
    ? (type === 'projects'
      ? `<section class="detail-files"><ul>${downloadLinks.join('')}</ul></section>`
      : `<section class="detail-files"><h2 class="title-font">Files</h2><ul>${downloadLinks.join('')}</ul></section>`)
    : '';
  const visualFilesBlock = type === 'projects' || !filesBlock ? '' : `\n      ${filesBlock}`;
  const informationFilesBlock = type === 'projects' && filesBlock ? `\n        ${filesBlock}` : '';
  const projectInformationClass = type === 'projects' && filesBlock ? ' project-information--has-files' : '';

  const backLink = type === 'projects'
    ? '<a class="back-link" href="index.html">&larr; Back to home</a>'
    : '';

  return `
<main class="page-detail">
  ${type === 'projects' && nav?.projects ? renderProjectRail(nav.projects, { currentSlug: item.slug }) : ''}
  <div class="project-detail-layout">
    <div class="project-visual-zone" id="project-visuals">
      <section class="${galleryClass}">
        ${images || '<div class="empty-state">No images yet.</div>'}
      </section>
      ${mediaSection}
      ${showcaseBlock}
      ${thumbnailBlock}${visualFilesBlock}
      ${type === 'projects' ? renderProjectStepNav(nav) : ''}
    </div>
    <aside class="project-information${projectInformationClass}" data-project-information>
      <button class="project-information-toggle" type="button" aria-expanded="true" aria-label="Toggle project information">
        <span class="project-information-toggle__title">${title}</span>
        <span class="project-information-toggle__mark" aria-hidden="true">−</span>
      </button>
      <div class="project-information-content">
        ${backLink}
        <h1 class="title-font">${title}</h1>
        ${descriptionBlock}${informationFilesBlock}
      </div>
    </aside>
  </div>
</main>`;
}

function renderSimplePage({ title, heading, content }) {
  return `
<main class="page-simple">
  <section class="simple-block">
    <h1 class="title-font">${escapeHtml(heading)}</h1>
    ${content}
  </section>
</main>`;
}

function renderAboutPage() {
  return `
<main class="page-simple">
  <section class="about-intro" tabindex="0" aria-label="Biography and contact information">
    <a class="back-link" href="index.html">&larr; Index</a>
    <h1 class="title-font">About</h1>
    <p>I&#39;m Jorne Scholiers, I am studying Visual Design at LUCA School of Arts in Ghent. My creative style is best described as abstract, experimental and bold. I&#39;ve always been drawn to visually dense work, the kind that invites you to look closer and keep discovering new details.</p>
    <p>I&#39;m always open to opportunities or collaborations. Feel free to contact me.</p>
    <p><a href="mailto:Jorne.Scholiers@icloud.com">Jorne.Scholiers@icloud.com</a></p>
  </section>
  <section class="about-details" tabindex="0" aria-label="Education, experience, and exhibitions">
    <section class="about-section" aria-labelledby="about-education-title">
      <h2 class="title-font" id="about-education-title">Education</h2>
      <ul class="about-list">
        <li>
          <span class="about-role">Visual Design, LUCA School of Arts Ghent</span>
          <span class="about-year">2023-Now</span>
        </li>
      </ul>
    </section>
    <section class="about-section" aria-labelledby="about-experience-title">
      <h2 class="title-font" id="about-experience-title">Experience</h2>
      <ul class="about-list">
        <li>
          <span class="about-role">Internship at Broos</span>
          <span class="about-year">2026</span>
        </li>
      </ul>
    </section>
    <section class="about-section" aria-labelledby="about-exhibitions-title">
      <h2 class="title-font" id="about-exhibitions-title">Exhibitions</h2>
      <ul class="about-list">
        <li>
          <span class="about-role"><a class="about-link" href="project-2025-0-big-summer-energy.html">Antwerp Art Weekend at Monar x UGG</a></span>
          <span class="about-year">2025</span>
        </li>
      </ul>
    </section>
  </section>
  <div class="about-portrait" tabindex="0" aria-label="Portrait of Jorne Scholiers">
    <img class="about-portrait-base" src="${profileImage}" alt="Blurred portrait of Jorne Scholiers"${imageDimensionAttributes(profileImageFile)} loading="eager" fetchpriority="high" decoding="async">
    <img class="about-portrait-hover" src="${profileImage}" alt="Portrait of Jorne Scholiers"${imageDimensionAttributes(profileImageFile)} loading="lazy" decoding="async">
  </div>
</main>`;
}

function renderFooter() {
  return `<footer class="site-footer">
    <div class="site-footer-copy">
      <div>&copy; 2026 Jorne Scholiers.</div>
      <div class="site-footer-rights">All rights reserved.</div>
    </div>
  </footer>`;
}

function renderLogoSlot() {
  return `<a class="site-logo-slot" href="index.html" aria-label="Back to homepage">
    <img src="images/Asset%201.svg" alt="" width="560" height="198">
  </a>`;
}

function renderLayout({ title, description, fileName, canonicalFile, image, imageAlt, pageType, schema, noIndex, bodyClass, main }) {
  const accessibleMain = main.replace('<main', '<main id="main-content"');
  return `${renderHead({ title, description, fileName, canonicalFile, image, imageAlt, pageType, schema, noIndex })}
<body class="${bodyClass}">
  ${renderLogoSlot()}
  ${accessibleMain}
  ${renderFooter()}
  <script src="Scripts/site.js" defer></script>
</body>
</html>`;
}

function writeFile(fileName, content) {
  fs.writeFileSync(path.join(root, fileName), content.replace(/[ \t]+$/gm, ''), 'utf8');
}

function writeSearchFiles(pageNames) {
  const urls = pageNames.map((fileName) => `  <url><loc>${escapeHtml(absoluteUrl(fileName))}</loc></url>`).join('\n');
  writeFile('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`);
  writeFile('robots.txt', `User-agent: *
Allow: /

Sitemap: ${absoluteUrl('sitemap.xml')}
`);
}

function writeLegacyRedirect(fileName, canonicalFile, label) {
  const destination = escapeHtml(canonicalFile);
  const head = renderHead({
    title: `${label} | ${siteName}`,
    description: `This page has moved to the current ${label} project page.`,
    fileName,
    canonicalFile,
    noIndex: true,
  }).replace('</head>', `  <meta http-equiv="refresh" content="0; url=${destination}">\n</head>`);
  writeFile(fileName, `${head}
<body>
  ${renderLogoSlot()}
  <main class="page-simple">
    <p>This page has moved to <a href="${destination}">${escapeHtml(label)}</a>.</p>
  </main>
  ${renderFooter()}
</body>
</html>`);
}

function buildSite() {
  let projects = buildItems(projectsDir, 'projects');
  const archive = buildItems(archiveDir, 'archive');
  const photography = buildItems(photographyDir, 'photography');

  projects.forEach((project) => {
    const override = titleOverrides[project.dirName];
    if (override) {
      project.title = override;
    }
  });

  if (projectOrder.length) {
    const lookup = new Map(projects.map((project) => [project.dirName.toLowerCase(), project]));
    const ordered = [];
    projectOrder.forEach((dirName) => {
      const item = lookup.get(dirName.toLowerCase());
      if (item) {
        ordered.push(item);
        lookup.delete(dirName.toLowerCase());
      }
    });
    projects.forEach((project) => {
      if (lookup.has(project.dirName.toLowerCase())) {
        ordered.push(project);
      }
    });
    projects = ordered;
  }

  projects.forEach((project, index) => {
    project.accent = palette[index % palette.length];
  });

  archive.forEach((item, index) => {
    item.accent = palette[index % palette.length];
  });

  photography.forEach((item, index) => {
    item.accent = palette[index % palette.length];
  });

  const homeHtml = renderLayout({
    title: 'Jorne Scholiers — Visual & Graphic Designer, Ghent',
    description: defaultDescription,
    fileName: '',
    image: projects[0] ? previewImagePath(projects[0]) : defaultSocialImage,
    imageAlt: 'Selected visual design work by Jorne Scholiers',
    schema: {
      '@graph': [
        personSchema(),
        {
          '@type': 'WebSite',
          '@id': `${siteUrl}#website`,
          name: `${siteName} — Visual Design Portfolio`,
          url: siteUrl,
          description: defaultDescription,
          author: { '@id': `${siteUrl}#jorne-scholiers` },
          inLanguage: 'en',
        },
      ],
    },
    bodyClass: 'page-home',
    main: renderHome(projects),
  });

  const archiveHtml = renderLayout({
    title: 'Design Archive | Jorne Scholiers',
    description: 'An archive of experiments, drafts, visual studies, and side projects by Ghent-based visual designer Jorne Scholiers.',
    fileName: 'archive.html',
    schema: { '@type': 'CollectionPage', name: 'Design Archive by Jorne Scholiers', url: absoluteUrl('archive.html') },
    bodyClass: 'page-archive',
    main: renderArchiveIndex(archive),
  });

  const aboutHtml = renderLayout({
    title: 'About Jorne Scholiers | Visual Designer in Ghent',
    description: 'Meet Jorne Scholiers, a visual and graphic designer studying at LUCA School of Arts in Ghent, Belgium, with a bold and experimental practice.',
    fileName: 'about.html',
    image: profileImage,
    imageAlt: 'Portrait of visual designer Jorne Scholiers',
    schema: personSchema(),
    bodyClass: 'page-simple page-about',
    main: renderAboutPage(),
  });

  const photographyHtml = renderLayout({
    title: 'Experimental Photography | Jorne Scholiers',
    description: 'Selected experimental photography and ongoing photographic series by visual designer Jorne Scholiers in Ghent.',
    fileName: 'photography.html',
    image: photography[0]?.images[0] ? toUrlPath('photography', photography[0].dirName, photography[0].images[0]) : defaultSocialImage,
    schema: { '@type': 'CollectionPage', name: 'Photography by Jorne Scholiers', url: absoluteUrl('photography.html') },
    bodyClass: 'page-archive page-photography',
    main: renderPhotographyIndex(photography),
  });

  writeFile('index.html', homeHtml);
  fs.rmSync(path.join(root, 'projects.html'), { force: true });
  writeFile('archive.html', archiveHtml);
  writeFile('about.html', aboutHtml);
  writeFile('photography.html', photographyHtml);

  projects.forEach((project, index) => {
    const prevProject = projects[(index - 1 + projects.length) % projects.length];
    const nextProject = projects[(index + 1) % projects.length];
    const projectHtml = renderLayout({
      title: `${project.title} | Jorne Scholiers`,
      description: project.description || `${project.title}, a visual design project by Jorne Scholiers.`,
      fileName: `project-${project.slug}.html`,
      image: previewImagePath(project) || defaultSocialImage,
      imageAlt: `${project.title}, a project by Jorne Scholiers`,
      pageType: 'article',
      schema: {
        '@type': 'CreativeWork',
        name: project.title,
        url: absoluteUrl(`project-${project.slug}.html`),
        description: truncateDescription(project.description || `${project.title}, a visual design project by Jorne Scholiers.`, 300),
        image: absoluteUrl(previewImagePath(project) || defaultSocialImage),
        dateCreated: String(project.year || ''),
        creator: { '@id': `${siteUrl}#jorne-scholiers` },
        keywords: (projectKeywords[project.dirName] || ['visual design', 'graphic design']).join(', '),
      },
      bodyClass: 'page-detail',
      main: renderProjectPage(project, 'projects', {
        projects,
        prev: {
          href: `project-${prevProject.slug}.html`,
          title: prevProject.title,
          label: prevProject.pageConfig?.index_title || prevProject.title,
        },
        next: {
          href: `project-${nextProject.slug}.html`,
          title: nextProject.title,
          label: nextProject.pageConfig?.index_title || nextProject.title,
        },
      }),
    });
    writeFile(`project-${project.slug}.html`, projectHtml);
  });

  writeLegacyRedirect('project-poster-party.html', 'project-2024-0-poster-party.html', 'Poster Party');
  writeLegacyRedirect('project-yesyoucan.html', 'project-2024-0-yesyoucan.html', 'YesYouCan');

  writeSearchFiles([
    '',
    'about.html',
    'archive.html',
    'photography.html',
    ...projects.map((project) => `project-${project.slug}.html`),
  ]);
}

if (require.main === module) {
  buildSite();
}

module.exports = { buildSite };
