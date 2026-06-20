const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const projectsDir = path.join(root, 'Projects');
const archiveDir = path.join(root, 'Archive');
const photographyDir = path.join(root, 'photography');

const siteUrl = (process.env.SITE_URL || 'https://overgrootoma.github.io/Jorne-Scholiers/').replace(/\/?$/, '/');
const siteName = 'Jorne Scholiers';
const defaultSocialImage = 'images/ME.webp';
const defaultDescription = 'Portfolio of Jorne Scholiers, a visual and graphic designer in Ghent working across identities, editorial design, typography, photography, and creative coding.';

const palette = ['#FF00D0', '#53FF45', '#1e2ede'];
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
    image: absoluteUrl('images/ME.webp'),
    jobTitle: 'Visual and Graphic Designer',
    description: defaultDescription,
    email: 'mailto:jorne.scholiers@icloud.com',
    sameAs: ['https://www.instagram.com/byjorne/'],
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
  if (preferred) return preferred;
  return project.images[0]
    ? toUrlPath('Projects', project.dirName, project.images[0])
    : '';
}

function rootImageDimensionAttributes(urlPath) {
  try {
    return imageDimensionAttributes(path.join(root, decodeURIComponent(urlPath)));
  } catch (err) {
    return '';
  }
}

function homepageImages(project) {
  const preferred = project.pageConfig?.homepage_images;
  if (!Array.isArray(preferred) || !preferred.length) {
    return project.images.slice(0, 5);
  }
  const available = new Set(project.images);
  const selected = preferred.filter((file) => available.has(file));
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
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Bitcount+Grid+Double+Ink:wght@100..900&amp;family=Open+Sans:ital,wght@0,300..800;1,300..800&amp;display=swap" rel="stylesheet">
  <link rel="stylesheet" href="Css/style.css">${structuredData}
</head>`;
}

function renderNav() {
  return `
<header class="site-header">
  <nav class="nav-bar" data-nav aria-label="Primary">
    <a class="site-title title-font" href="index.html">Jorne Scholiers</a>
    <div class="menu-panel">
      <a href="about.html">about</a>
      <a href="projects.html">index</a>
      <a href="archive.html">archive</a>
    </div>
  </nav>
</header>`;
}

function renderIntroCopy() {
  return `<p>
    Hello,<br>
    My name is <a href="about.html" class="intro-link">Jorne Scholiers</a>, a Visual Design student at LUCA School of Arts Ghent.<br><br>
    I have some <a href="projects.html">projects</a> you can look at, along with other work in my <a href="archive.html">archive</a> that shows what I've been experimenting with.<br>
    Or maybe you will like some of my <a href="photography.html">Photography</a>. Some of my projects appear on my <a href="https://www.instagram.com/byjorne/" target="_blank" rel="noopener">Instagram</a>.<br><br>
    Don't hesitate to <a href="mailto:jorne.scholiers@icloud.com">contact me</a>, I'd love to hear from you.<br>
    Oh and I am working on a little experimental <a href="https://accidentalgraphics.netlify.app/index.html" target="_blank" rel="noopener">site</a> as well :)
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

function renderProjectRows(projects) {
  return projects.map((project, index) => {
    const displayTitle = project.pageConfig?.index_title || project.title;
    const image = project.pageConfig?.index_image || previewImagePath(project);
    const dimensions = rootImageDimensionAttributes(image);
    const loading = index === 0 ? ' loading="eager" fetchpriority="high"' : ' loading="lazy"';
    const summary = firstSentence(project.description || `${project.title}, a visual design project by Jorne Scholiers.`);
    return `
      <a class="project-row" href="project-${project.slug}.html">
        <div class="project-info">
          <h2>${escapeHtml(displayTitle)}</h2>
          <div class="project-year">${escapeHtml(project.year)}</div>
          <p class="project-summary">${escapeHtml(summary)}</p>
        </div>
        <div class="project-thumb">
          <img src="${image}" alt="Preview of ${escapeHtml(displayTitle)} by Jorne Scholiers"${dimensions}${loading} decoding="async">
        </div>
      </a>`;
  }).join('');
}

function renderHome(projects) {
  const railBlocks = projects
    .map((project, index) => {
      const previewImage = previewImagePath(project);
      const title = escapeHtml(project.title);
      return `<a class="rail-block" href="#project-${project.slug}" style="--rail-color: ${project.accent}" data-title="${title}" data-image="${previewImage}" aria-label="${title}"></a>`;
    })
    .join('\n');

  const sections = projects
    .map((project) => {
      const page = `project-${project.slug}.html`;
      const images = homepageImages(project).map((file, idx) => {
        const src = toUrlPath('Projects', project.dirName, file);
        const dimensions = imageDimensionAttributes(path.join(projectsDir, project.dirName, file));
        return `<img src="${src}" alt="${escapeHtml(project.title)}, a visual design project by Jorne Scholiers — image ${idx + 1}" data-project-url="${page}"${dimensions} loading="lazy" decoding="async">`;
      });
      return `
      <article class="project-section" id="project-${project.slug}">
        <div class="project-sticky" style="--accent: ${project.accent}">
          <h2 class="title-font">${escapeHtml(project.title)}</h2>
          <div class="project-meta">${project.pageConfig?.meta || project.year || ''}</div>
          <a class="btn" href="${page}">View project</a>
        </div>
        <div class="project-gallery">
          ${images.join('\n') || '<div class="empty-state">No images yet.</div>'}
        </div>
      </article>`;
    })
    .join('\n');

  const emptyState = !projects.length
    ? '<div class="empty-state">Add folders inside the Projects directory to populate the onepager.</div>'
    : sections;

  return `
<main class="page-home">
  <div class="desktop-home-content">
    ${renderIntro()}
    <aside class="project-rail" aria-label="Project quick navigation">
      ${railBlocks || '<div class="rail-empty"></div>'}
    </aside>
    <div class="rail-preview" id="rail-preview">
      <div class="rail-preview-title"></div>
      <img alt="Preview" />
    </div>
    <section class="projects-onepager" id="projects">
      ${emptyState}
    </section>
    <a class="back-to-top" href="#intro">Back to top</a>
    <footer class="home-footer">
      <div>Thank you for viewing my portfolio :)</div>
      <div>&copy; 2026 Jorne Scholiers. All rights reserved.</div>
    </footer>
  </div>
  <section class="mobile-home-index" aria-labelledby="mobile-projects-title">
    ${renderMobileIntro()}
    <h1 class="visually-hidden" id="mobile-projects-title">Graphic design projects</h1>
    <div class="projects-list">
      ${renderProjectRows(projects) || '<div class="empty-state">Projects will be added here.</div>'}
    </div>
  </section>
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
  topLinkHref,
  topLinkLabel,
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
        <figcaption class="media-caption">${escapeHtml(file)}</figcaption>
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
      <div class="archive-sticky">
        <div class="archive-year-marker">${escapeHtml(String(yearLabel))}</div>
      </div>
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

  return `
<main class="page-archive" id="${sectionPrefix}-top">
  <aside class="archive-rail" aria-label="${escapeHtml(railAriaLabel)}">
    ${railLinks || '<div class="rail-empty"></div>'}
  </aside>
  <div class="rail-preview" id="rail-preview">
    <div class="rail-preview-title"></div>
    <img alt="Preview" />
  </div>
  <section class="archive-intro">
    <h1 class="title-font"><a class="archive-heading-link" href="#${sectionPrefix}-top">${escapeHtml(heading)}</a></h1>
    <div class="archive-intro-meta">
      <p>${escapeHtml(introText)}</p>
      <a class="archive-top-link btn" href="${topLinkHref}">${escapeHtml(topLinkLabel)}</a>
    </div>
  </section>
  <section class="archive-list">
    ${sections || `<div class="empty-state">${escapeHtml(emptyState)}</div>`}
  </section>
</main>`;
}

function renderArchiveIndex(items) {
  return renderCollectionIndex(items, {
    heading: 'Archive',
    introText: 'Experiments, drafts, and side quests.',
    topLinkHref: 'photography.html',
    topLinkLabel: 'Photography',
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
    heading: 'Photography',
    introText: 'Selected photography work and ongoing series.',
    topLinkHref: 'archive.html',
    topLinkLabel: 'Archive',
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
    <div class="projects-list">
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
      <span aria-hidden="true">&lt;</span>
    </a>
    <a class="project-step project-step--next" href="${nav.next.href}" aria-label="Next project: ${escapeHtml(nav.next.title)}">
      <span aria-hidden="true">&gt;</span>
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
  const captionFor = (file) => escapeHtml(pageConfig.captions?.[file] || file);
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
          <img src="${src}" alt="${title} by Jorne Scholiers — ${captionFor(file)}"${dimensions}${loading} decoding="async">
        </div>
        <figcaption>${type === 'projects' ? captionFor(file) : escapeHtml(file)}</figcaption>
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
        <figcaption class="media-caption">${captionFor(file)}</figcaption>
      </figure>`);
        return;
      }
      downloadLinks.push(`<li><a class="media-link" href="${href}" target="_blank" rel="noopener">Open ${escapeHtml(file)}</a></li>`);
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
        <figcaption class="media-caption">${escapeHtml(file)}</figcaption>
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

  const backLink = type === 'projects'
    ? '<a class="back-link" href="index.html#projects">&larr; Back to home</a>'
    : '';

  return `
<main class="page-detail">
  ${type === 'projects' ? renderProjectStepNav(nav) : ''}
  <section class="detail-header">
    ${backLink}
    <h1 class="title-font">${title}</h1>
    <div class="project-meta">${type === 'projects' ? (pageConfig.meta || item.year || '') : (item.year || '')}</div>
    ${descriptionBlock}
  </section>
  <section class="${galleryClass}">
    ${images || '<div class="empty-state">No images yet.</div>'}
  </section>
  ${mediaSection}
  ${showcaseBlock}
  ${thumbnailBlock}
  ${filesBlock}
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
    <img class="about-portrait-base" src="images/ME%20Blurred.jpg" alt="Blurred portrait of Jorne Scholiers"${imageDimensionAttributes(path.join(root, 'images', 'ME Blurred.jpg'))} loading="eager" fetchpriority="high" decoding="async">
    <img class="about-portrait-hover" src="images/ME.webp" alt="Portrait of Jorne Scholiers"${imageDimensionAttributes(path.join(root, 'images', 'ME.webp'))} loading="lazy" decoding="async">
  </div>
</main>`;
}

function renderLayout({ title, description, fileName, canonicalFile, image, imageAlt, pageType, schema, noIndex, bodyClass, main }) {
  const accessibleMain = main.replace('<main', '<main id="main-content"');
  return `${renderHead({ title, description, fileName, canonicalFile, image, imageAlt, pageType, schema, noIndex })}
<body class="${bodyClass}">
  <a class="skip-link" href="#main-content">Skip to content</a>
  ${renderNav()}
  ${accessibleMain}
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
  <main class="page-simple">
    <p>This page has moved to <a href="${destination}">${escapeHtml(label)}</a>.</p>
  </main>
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

  const projectsHtml = renderLayout({
    title: 'Graphic Design Projects | Jorne Scholiers',
    description: 'Explore graphic and visual design projects by Jorne Scholiers, including identities, editorial design, typography, packaging, photography, and creative coding.',
    fileName: 'projects.html',
    image: projects[0] ? previewImagePath(projects[0]) : defaultSocialImage,
    schema: {
      '@type': 'CollectionPage',
      name: 'Graphic Design Projects by Jorne Scholiers',
      url: absoluteUrl('projects.html'),
      author: { '@id': `${siteUrl}#jorne-scholiers` },
    },
    bodyClass: 'page-projects',
    main: renderProjectsIndex(projects),
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
    image: 'images/ME.webp',
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
  writeFile('projects.html', projectsHtml);
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
        prev: {
          href: `project-${prevProject.slug}.html`,
          title: prevProject.title,
        },
        next: {
          href: `project-${nextProject.slug}.html`,
          title: nextProject.title,
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
    'projects.html',
    'archive.html',
    'photography.html',
    ...projects.map((project) => `project-${project.slug}.html`),
  ]);
}

if (require.main === module) {
  buildSite();
}

module.exports = { buildSite };
