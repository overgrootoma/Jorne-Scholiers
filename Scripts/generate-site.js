const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const projectsDir = path.join(root, 'Projects');
const archiveDir = path.join(root, 'Archive');
const photographyDir = path.join(root, 'photography');

const palette = ['#FF00D0', '#53FF45', '#1e2ede'];
const projectOrder = [
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

const mediaSizeOverrides = {
  projects: {
    // '2025 BrilliantBooks': {
    //   'PortfolioFotos_Team6_1 groot.jpeg': 'large',
    //   'PortfolioFotos_Team6_10 groot.jpeg': 'small',
    // },
  },
  archive: {
    // '2026': {
    //   '63.png': 'large',
    // },
  },
  photography: {
    // 'Photo 2025': {
    //   'wildlife1.jpg': 'large',
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
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
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

function normalizeMediaSize(value) {
  return value === 'small' || value === 'medium' || value === 'large' ? value : 'medium';
}

function mediaSizeClass(type, dirName, fileName, configuredSize) {
  const requested = configuredSize || mediaSizeOverrides[type]?.[dirName]?.[fileName];
  const size = normalizeMediaSize(requested);
  return `media-size-${size}`;
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

function buildItems(baseDir, type) {
  const dirs = readDirSafe(baseDir).filter((entry) => entry.isDirectory());
  const items = [];
  for (const dirent of dirs) {
    const fullPath = path.join(baseDir, dirent.name);
    const parsed = parseFolderName(dirent.name);
    const pageConfig = type === 'projects' ? readPageConfig(fullPath) : {};
    const ignoredFiles = new Set(type === 'projects' && Array.isArray(pageConfig.ignored_files) ? pageConfig.ignored_files : []);
    const files = listFiles(fullPath)
      .filter((file) => file !== pageConfigFile && !ignoredFiles.has(file))
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
    const orderedFiles = type === 'archive' || type === 'photography' ? [...files].reverse() : files;
    const images = orderedFiles.filter(isImage);
    const otherFiles = orderedFiles.filter((file) => !isImage(file) && !descriptionFiles.includes(file));
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

function renderHead(pageTitle) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(pageTitle)}</title>
  <link rel="stylesheet" media="screen" href="https://fontlibrary.org//face/hk-grotesk" type="text/css" />
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Bitcount+Grid+Double+Ink:wght@100..900&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="Css/style.css">
</head>`;
}

function renderNav() {
  return `
<header class="site-header">
  <nav class="nav-bar" data-nav>
    <button class="menu-toggle" id="menu-toggle" aria-controls="menu-panel" aria-expanded="false" type="button">
      <span class="menu-icon"></span>
      <span class="visually-hidden">Menu</span>
    </button>
    <a class="site-title title-font" href="index.html">Jorne Scholiers</a>
    <div class="menu-spacer"></div>
    <div class="menu-panel" id="menu-panel" role="menu">
      <a role="menuitem" href="about.html">about</a>
      <a role="menuitem" href="projects.html">projects</a>
      <a role="menuitem" href="archive.html">archive</a>
    </div>
  </nav>
</header>`;
}

function renderIntro() {
  return `
<section class="intro" id="intro">
  <p>
    Hello,<br>
    My name is <a href="about.html" class="intro-link">Jorne Scholiers</a>, a Visual Design student at LUCA School of Arts Ghent.<br><br>
    I have some <a href="projects.html">projects</a> you can look at, along with other work in my <a href="archive.html">archive</a> that shows what I've been experimenting with.<br>
    Or maybe you will like some of my <a href="photography.html">Photography</a>. Some of my projects appear on my <a href="https://www.instagram.com/byjorne/" target="_blank" rel="noopener">Instagram</a>.<br><br>
    Don't hesitate to <a href="mailto:jorne.scholiers@icloud.com">contact me</a>, I'd love to hear from you.<br>
    Oh and I am working on a little experimental <a href="https://overgrootoma.github.io/Accidental-Graphics/index.html?utm_source=ig&utm_medium=social&utm_content=link_in_bio&fbclid=PAZXh0bgNhZW0CMTEAc3J0YwZhcHBfaWQMMjU2MjgxMDQwNTU4AAGn_xPN1gXGMxveV-2WBq2O8YHK8p9Uv3r8t5SqaQTupQLlJdervwptH_gk0B0_aem_uNEQtZRqNUCSIQz6gjrREw" target="_blank" rel="noopener">site</a> as well :)
  </p>
</section>`;
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
      const images = homepageImages(project).map((file, idx) => {
        const src = toUrlPath('Projects', project.dirName, file);
        return `<img src="${src}" alt="${escapeHtml(project.title)} image ${idx + 1}" loading="lazy" decoding="async">`;
      });
      const page = `project-${project.slug}.html`;
      return `
      <article class="project-section" id="project-${project.slug}">
        <div class="project-sticky" style="--accent: ${project.accent}">
          <h2 class="title-font">${escapeHtml(project.title)}</h2>
          <div class="project-meta">${project.pageConfig?.meta || project.year || ''}</div>
          <a class="btn" href="${page}">extra info</a>
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

const archiveSizePattern = ['large', 'small', 'medium', 'medium', 'small', 'large', 'medium'];

function collectionPreviewPath(baseDirName, item) {
  return item.images[0] ? toUrlPath(baseDirName, item.dirName, item.images[0]) : '';
}

function collectionMediaSizeClass(type, item, file, index) {
  const configured = mediaSizeOverrides[type]?.[item.dirName]?.[file];
  const fallback = archiveSizePattern[index % archiveSizePattern.length];
  return mediaSizeClass(type, item.dirName, file, configured || fallback);
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
      const gallery = item.images
        .map((file, idx) => {
          const src = toUrlPath(baseDirName, item.dirName, file);
          const sizeClass = collectionMediaSizeClass(collectionType, item, file, idx);
          return `
      <figure class="${sizeClass}">
        <div class="media-frame">
          <img src="${src}" alt="${escapeHtml(item.title)} image ${idx + 1}" loading="lazy" decoding="async">
        </div>
      </figure>`;
        })
        .join('\n');

      const mediaBlocks = [];
      const downloadLinks = [];

      item.otherFiles.forEach((file) => {
        const href = toUrlPath(baseDirName, item.dirName, file);
        const ext = path.extname(file).toLowerCase();
        const sizeClass = collectionMediaSizeClass(collectionType, item, file, item.images.length + mediaBlocks.length + downloadLinks.length);
        if (ext === '.pdf') {
          mediaBlocks.push(`
      <figure class="media-card ${sizeClass}">
        <div class="media-frame">
          <iframe class="media-embed media-embed--pdf" src="${href}" title="${escapeHtml(file)}" loading="lazy"></iframe>
        </div>
        <figcaption class="media-caption">${escapeHtml(file)}</figcaption>
      </figure>`);
          return;
        }
        if (videoExts.has(ext)) {
          mediaBlocks.push(`
      <figure class="media-card ${sizeClass}">
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
<main class="page-archive">
  <aside class="archive-rail" aria-label="${escapeHtml(railAriaLabel)}">
    ${railLinks || '<div class="rail-empty"></div>'}
  </aside>
  <div class="rail-preview" id="rail-preview">
    <div class="rail-preview-title"></div>
    <img alt="Preview" />
  </div>
  <section class="archive-intro">
    <h1 class="title-font">${escapeHtml(heading)}</h1>
    <p>${escapeHtml(introText)}</p>
    <a class="archive-top-link btn" href="${topLinkHref}">${escapeHtml(topLinkLabel)}</a>
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

function renderProjectPage(item, type) {
  const title = escapeHtml(item.title);
  const base = type === 'projects' ? 'Projects' : 'Archive';
  const pageConfig = item.pageConfig || {};
  const galleryClass = type === 'projects'
    ? (pageConfig.gallery_class || 'detail-gallery')
    : 'detail-gallery';
  const orderedImages = type === 'projects'
    ? orderFilesByPreference(item.images, pageConfig.image_order)
    : item.images;
  const orderedOtherFiles = type === 'projects'
    ? orderFilesByPreference(item.otherFiles, pageConfig.other_file_order)
    : item.otherFiles;
  const captionFor = (file) => escapeHtml(pageConfig.captions?.[file] || file);
  const images = orderedImages
    .map((file, idx) => {
      const src = toUrlPath(base, item.dirName, file);
      const sizeClass = mediaSizeClass(
        type,
        item.dirName,
        file,
        type === 'projects' ? pageConfig.image_sizes?.[file] : undefined,
      );
      return `
      <figure class="${sizeClass}">
        <div class="media-frame">
          <img src="${src}" alt="${title} image ${idx + 1}" loading="lazy" decoding="async">
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
    const sizeClass = mediaSizeClass(
      type,
      item.dirName,
      file,
      type === 'projects' ? pageConfig.other_file_sizes?.[file] : undefined,
    );
    if (type === 'projects') {
      if (videoExts.has(ext)) {
        mediaBlocks.push(`
      <figure class="media-card ${sizeClass}">
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
      <figure class="media-card ${sizeClass}">
        <div class="media-frame">
          <iframe class="media-embed media-embed--pdf" src="${href}" title="${escapeHtml(file)}" loading="lazy"></iframe>
        </div>
        <figcaption class="media-caption">${escapeHtml(file)}</figcaption>
      </figure>`);
      return;
    }
    if (videoExts.has(ext)) {
      mediaBlocks.push(`
      <figure class="media-card ${sizeClass}">
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
  <section class="simple-block">
    <h1 class="title-font">About</h1>
    <p>I&#39;m Jorne Scholiers, I am studying Visual Design at LUCA School of Arts in Ghent. My creative style is best described as abstract, experimental and bold. I&#39;ve always been drawn to visually dense work, the kind that invites you to look closer and keep discovering new details.</p>
    <p>I&#39;m always open to opportunities or collaborations. Feel free to contact me.</p>
    <p><a href="mailto:Jorne.Scholiers@icloud.com">Jorne.Scholiers@icloud.com</a></p>
  </section>
  <div class="about-portrait" tabindex="0" aria-label="Portrait of Jorne Scholiers">
    <img class="about-portrait-base" src="images/ME%20Blurred.jpg" alt="Blurred portrait of Jorne Scholiers" loading="lazy" decoding="async">
    <img class="about-portrait-hover" src="images/ME.jpg" alt="Portrait of Jorne Scholiers" loading="lazy" decoding="async">
  </div>
</main>`;
}

function renderLayout({ title, bodyClass, main }) {
  return `${renderHead(title)}
<body class="${bodyClass}">
  ${renderNav()}
  ${main}
  <script src="Scripts/site.js" defer></script>
</body>
</html>`;
}

function writeFile(fileName, content) {
  fs.writeFileSync(path.join(root, fileName), content, 'utf8');
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
    title: 'Jorne Scholiers',
    bodyClass: 'page-home',
    main: renderHome(projects),
  });

  const archiveHtml = renderLayout({
    title: 'Archive - Jorne Scholiers',
    bodyClass: 'page-archive',
    main: renderArchiveIndex(archive),
  });

  const aboutHtml = renderLayout({
    title: 'About - Jorne Scholiers',
    bodyClass: 'page-simple page-about',
    main: renderAboutPage(),
  });

  const photographyHtml = renderLayout({
    title: 'Photography - Jorne Scholiers',
    bodyClass: 'page-archive page-photography',
    main: renderPhotographyIndex(photography),
  });

  const contactHtml = renderLayout({
    title: 'Contact - Jorne Scholiers',
    bodyClass: 'page-simple',
    main: renderSimplePage({
      title: 'Contact',
      heading: 'Contact',
      content: '<p>Email: <a href="mailto:hello@jornescholiers.com">hello@jornescholiers.com</a></p>',
    }),
  });

  writeFile('index.html', homeHtml);
  writeFile('archive.html', archiveHtml);
  writeFile('about.html', aboutHtml);
  writeFile('photography.html', photographyHtml);
  writeFile('contact.html', contactHtml);

  projects.forEach((project) => {
    const projectHtml = renderLayout({
      title: `${project.title} - Jorne Scholiers`,
      bodyClass: 'page-detail',
      main: renderProjectPage(project, 'projects'),
    });
    writeFile(`project-${project.slug}.html`, projectHtml);
  });

  archive.forEach((item) => {
    const archivePage = renderLayout({
      title: `${item.title} - Archive`,
      bodyClass: 'page-detail',
      main: renderProjectPage(item, 'archive'),
    });
    writeFile(`archive-${item.slug}.html`, archivePage);
  });
}

if (require.main === module) {
  buildSite();
}

module.exports = { buildSite };
