(() => {
  const nav = document.querySelector('[data-nav]');
  if (nav) {
    const legacyToggle = nav.querySelector('.menu-toggle');
    const menuPanel = nav.querySelector('.menu-panel');
    const titleLink = nav.querySelector('.site-title');
    const navLinks = Array.from(nav.querySelectorAll('.menu-panel a'));
    const normalizePath = (value) => {
      const file = (value || '').split('/').pop()?.toLowerCase() || '';
      return file || 'index.html';
    };

    if (legacyToggle) {
      legacyToggle.setAttribute('aria-hidden', 'true');
      legacyToggle.tabIndex = -1;
    }
    menuPanel?.removeAttribute('role');
    navLinks.forEach((link) => link.removeAttribute('role'));

    const currentPath = normalizePath(window.location.pathname);

    let currentNavPath = null;
    if (currentPath === 'about.html') {
      currentNavPath = 'about.html';
    } else if (currentPath.startsWith('project-') || currentPath === 'index.html') {
      currentNavPath = 'index.html';
    } else if (
      currentPath === 'archive.html' ||
      currentPath === 'photography.html' ||
      currentPath.startsWith('archive-')
    ) {
      currentNavPath = 'archive.html';
    }

    const currentLink = currentNavPath
      ? navLinks.find((link) => normalizePath(new URL(link.href, window.location.href).pathname) === currentNavPath)
      : null;

    if (currentLink) {
      currentLink.classList.add('is-current');
      currentLink.setAttribute('aria-current', 'page');
    }
  }

  const normalizeMediaSpan = (value) => {
    if (typeof value === 'number' && Number.isFinite(value)) {
      const rounded = Math.round(value);
      return rounded >= 1 && rounded <= 6 ? rounded : null;
    }
    if (typeof value !== 'string') return null;
    const normalized = value.trim().toLowerCase();
    return /^[1-6]$/.test(normalized) ? Number(normalized) : null;
  };

  const clearLegacyMediaClasses = (figure) => {
    Array.from(figure.classList)
      .filter((className) => className.startsWith('media-span-') || className.startsWith('media-size-'))
      .forEach((className) => figure.classList.remove(className));
    delete figure.dataset.size;
  };

  const applyMediaSpan = (figure, span) => {
    const safeSpan = normalizeMediaSpan(span);
    if (!safeSpan) return;
    clearLegacyMediaClasses(figure);
    figure.dataset.span = String(safeSpan);
  };

  const inlineMediaSpan = (figure) => {
    if (!figure) return null;
    const nestedAsset = figure.querySelector('[data-span]');
    return normalizeMediaSpan(
      figure.dataset.span
      ?? nestedAsset?.dataset?.span
    );
  };

  const configuredMediaSpan = (config, fileName, kind) => {
    if (!config || !fileName) return null;
    const fileSpanKey = kind === 'image' ? 'image_spans' : 'other_file_spans';
    const defaultSpanKey = kind === 'image' ? 'default_image_span' : 'default_other_file_span';
    return normalizeMediaSpan(
      config?.[fileSpanKey]?.[fileName]
      ?? config?.[defaultSpanKey],
    );
  };

  const configuredMediaOrder = (config, kind) => {
    if (!config) return [];
    const orderKey = kind === 'image' ? 'image_order' : 'other_file_order';
    return Array.isArray(config?.[orderKey]) ? config[orderKey] : [];
  };

  const figureAssetSource = (figure) => {
    const asset = figure.querySelector('img[src], iframe[src], video[src], video source[src]');
    return asset?.getAttribute('src') || '';
  };

  const figureAssetFileName = (figure) => {
    const src = figureAssetSource(figure);
    if (!src) return '';
    try {
      const url = new URL(src, window.location.href);
      const pathname = decodeURIComponent(url.pathname);
      return pathname.split('/').pop() || '';
    } catch {
      return '';
    }
  };

  const pageConfigCache = new Map();

  const loadConfigForSection = async (section) => {
    const firstFigure = section?.querySelector('figure');
    const src = firstFigure ? figureAssetSource(firstFigure) : '';
    if (!src) return null;

    let configUrl = '';
    try {
      configUrl = new URL('page.json', new URL(src, window.location.href)).toString();
    } catch {
      return null;
    }

    if (!pageConfigCache.has(configUrl)) {
      pageConfigCache.set(
        configUrl,
        fetch(configUrl)
          .then((response) => (response.ok ? response.json() : null))
          .catch(() => null),
      );
    }

    return pageConfigCache.get(configUrl);
  };

  const reorderSectionByConfig = (section, config, kind) => {
    if (!section || !config) return;
    const preferredOrder = configuredMediaOrder(config, kind);
    if (!preferredOrder.length) return;

    const directFigures = Array.from(section.children).filter((child) => child.tagName === 'FIGURE');
    if (directFigures.length < 2) return;

    const orderIndex = new Map(preferredOrder.map((file, index) => [file, index]));
    const sortedFigures = [...directFigures].sort((a, b) => {
      const aFile = figureAssetFileName(a);
      const bFile = figureAssetFileName(b);
      const aIndex = orderIndex.has(aFile) ? orderIndex.get(aFile) : Number.POSITIVE_INFINITY;
      const bIndex = orderIndex.has(bFile) ? orderIndex.get(bFile) : Number.POSITIVE_INFINITY;
      if (aIndex !== bIndex) return aIndex - bIndex;
      return aFile.localeCompare(bFile, undefined, { numeric: true, sensitivity: 'base' });
    });

    if (sortedFigures.every((figure, index) => figure === directFigures[index])) return;

    const fragment = document.createDocumentFragment();
    sortedFigures.forEach((figure) => fragment.appendChild(figure));
    section.appendChild(fragment);
  };

  const applyConfiguredSpans = async (section, kind) => {
    if (!section) return;
    const figures = Array.from(section.querySelectorAll('figure'));
    if (!figures.length) return;

    figures.forEach((figure) => {
      const span = inlineMediaSpan(figure);
      if (span) {
        applyMediaSpan(figure, span);
      }
    });

    const config = await loadConfigForSection(section);
    if (!config) return;

    reorderSectionByConfig(section, config, kind);

    const orderedFigures = Array.from(section.querySelectorAll('figure'));

    orderedFigures.forEach((figure) => {
      if (inlineMediaSpan(figure)) return;
      const fileName = figureAssetFileName(figure);
      const span = configuredMediaSpan(config, fileName, kind);
      if (span) {
        applyMediaSpan(figure, span);
      }
    });
  };

  const setupConfigurableMediaSpans = async () => {
    const tasks = [];
    if (document.body.classList.contains('page-detail')) {
      tasks.push(applyConfiguredSpans(document.querySelector('.detail-gallery'), 'image'));
      tasks.push(applyConfiguredSpans(document.querySelector('.detail-media'), 'other'));
    }

    document.querySelectorAll('.archive-entry').forEach((entry) => {
      tasks.push(applyConfiguredSpans(entry.querySelector('.archive-entry-gallery'), 'image'));
      tasks.push(applyConfiguredSpans(entry.querySelector('.detail-media'), 'other'));
    });

    await Promise.all(tasks);
  };

  const setupArchiveOrientationSpans = () => {
    const galleries = Array.from(document.querySelectorAll('.archive-entry-gallery'));
    if (!galleries.length) return;

    const figureSpan = (figure) => normalizeMediaSpan(figure.dataset.span) || 1;
    const figureOrientation = (figure) => (
      figure.dataset.orientation === 'landscape' ? 'landscape' : 'portrait'
    );
    const createSpacer = (span) => {
      const spacer = document.createElement('div');
      spacer.className = 'archive-grid-spacer';
      spacer.dataset.span = String(span);
      spacer.setAttribute('aria-hidden', 'true');
      return spacer;
    };

    const layoutGallery = (gallery) => {
      gallery.querySelectorAll('.archive-grid-spacer').forEach((spacer) => spacer.remove());
      const figures = Array.from(gallery.children).filter((child) => child.tagName === 'FIGURE');
      let rowSpan = 0;
      let rowOrientation = '';
      let rowItems = 0;

      figures.forEach((figure) => {
        const span = figureSpan(figure);
        const orientation = figureOrientation(figure);

        if (!rowSpan) {
          rowSpan = span;
          rowOrientation = orientation;
          rowItems = 1;
          if (rowSpan >= 4) rowSpan = 0;
          return;
        }

        if (rowOrientation === orientation && rowSpan + span <= 4) {
          rowSpan += span;
          rowItems += 1;
          if (rowSpan >= 4) rowSpan = 0;
          return;
        }

        if (rowItems === 1 && rowSpan + span <= 3) {
          const remaining = 4 - rowSpan - span;
          if (remaining > 0) {
            figure.after(createSpacer(remaining));
          }
          rowSpan = 0;
          rowOrientation = '';
          rowItems = 0;
          return;
        }

        const remaining = 4 - rowSpan;
        if (remaining > 0 && remaining < 4) {
          figure.before(createSpacer(remaining));
        }
        rowSpan = span >= 4 ? 0 : span;
        rowOrientation = orientation;
        rowItems = span >= 4 ? 0 : 1;
      });
    };

    galleries.forEach((gallery) => {
      const figures = Array.from(gallery.querySelectorAll('figure'));
      let layoutQueued = false;
      const queueLayout = () => {
        if (layoutQueued) return;
        layoutQueued = true;
        window.requestAnimationFrame(() => {
          layoutQueued = false;
          layoutGallery(gallery);
        });
      };

      figures.forEach((figure) => {
        const img = figure.querySelector('img');
        if (!img) return;

        const apply = () => {
          if (!img.naturalWidth || !img.naturalHeight) return;
          const orientation = img.naturalWidth > img.naturalHeight
            ? 'landscape'
            : img.naturalWidth < img.naturalHeight
              ? 'portrait'
              : 'square';
          figure.dataset.orientation = orientation;
          applyMediaSpan(figure, orientation === 'landscape' ? 2 : 1);
          queueLayout();
        };

        if (img.complete) {
          apply();
        } else {
          img.addEventListener('load', apply, { once: true });
        }
      });

      queueLayout();
    });
  };

  const titleEls = Array.from(document.querySelectorAll('.title-font:not(.site-title)'))
    .filter((el) => !el.closest('.page-home .project-sticky'));
  const baseWeight = 620;
  const baseAxes = {
    slnt: 0,
    crsv: 0.5,
    elsh: 0,
    elxp: 0,
    szp1: 0,
    szp2: 0,
    xpn1: 0,
    xpn2: 0,
    ypn1: 0,
    ypn2: 0,
  };

  const applyAxes = (el, weight, axes) => {
    el.style.setProperty('--title-weight', weight);
    el.style.setProperty('--axis-slnt', axes.slnt);
    el.style.setProperty('--axis-crsv', axes.crsv);
    el.style.setProperty('--axis-elsh', axes.elsh);
    el.style.setProperty('--axis-elxp', axes.elxp);
    el.style.setProperty('--axis-szp1', axes.szp1);
    el.style.setProperty('--axis-szp2', axes.szp2);
    el.style.setProperty('--axis-xpn1', axes.xpn1);
    el.style.setProperty('--axis-xpn2', axes.xpn2);
    el.style.setProperty('--axis-ypn1', axes.ypn1);
    el.style.setProperty('--axis-ypn2', axes.ypn2);
  };

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  titleEls.forEach((el) => {
    applyAxes(el, baseWeight, baseAxes);
  });

  const railTitleEls = Array.from(document.querySelectorAll('.project-rail .rail-block span'));
  const siteTitle = document.querySelector('.site-title');
  siteTitle?.style.setProperty('--title-weight', 650);
  railTitleEls.forEach((el) => el.style.setProperty('--rail-title-weight', 650));

  const rail = document.querySelector('.project-rail, .archive-rail');
  const preview = document.getElementById('rail-preview');

  if (rail && preview) {
    const previewTitle = preview.querySelector('.rail-preview-title');
    const previewImage = preview.querySelector('img');

    const showPreview = (block) => {
      const title = block.dataset.title || '';
      const image = block.dataset.image || '';
      previewTitle.textContent = title;
      if (rail.classList.contains('project-rail')) {
        const railColor = getComputedStyle(block).getPropertyValue('--rail-color').trim();
        preview.style.setProperty('--preview-color', railColor || 'var(--bg)');
        const positionPreview = () => {
          const blockRect = block.getBoundingClientRect();
          const maximumTop = Math.max(64, window.innerHeight - preview.offsetHeight - 12);
          preview.style.top = `${Math.round(clamp(blockRect.top, 64, maximumTop))}px`;
        };
        window.requestAnimationFrame(positionPreview);
        previewImage.addEventListener('load', positionPreview, { once: true });
      }
      if (image) {
        previewImage.src = image;
        previewImage.style.display = 'block';
      } else {
        previewImage.removeAttribute('src');
        previewImage.style.display = 'none';
      }
      preview.classList.add('visible');
    };

    const hidePreview = () => {
      preview.classList.remove('visible');
    };

    rail.querySelectorAll('[data-title], [data-image]').forEach((block) => {
      block.addEventListener('mouseenter', () => showPreview(block));
      block.addEventListener('focus', () => showPreview(block));
      block.addEventListener('mouseleave', hidePreview);
      block.addEventListener('blur', hidePreview);
    });

    rail.addEventListener('mouseleave', hidePreview);
  }

  const homeSections = Array.from(document.querySelectorAll('.page-home .project-section'));
  const homeRailBlocks = Array.from(document.querySelectorAll('.page-home .project-rail .rail-block'));

  if (homeSections.length && homeRailBlocks.length) {
    const railBlockBySection = new Map(homeRailBlocks.map((block) => [
      block.getAttribute('href')?.replace(/^#/, ''),
      block,
    ]));
    let homeScrollUpdateQueued = false;

    const updateHomeSectionState = () => {
      homeScrollUpdateQueued = false;
      const viewportAnchor = window.innerHeight * 0.52;
      let activeSection = null;

      homeSections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        if (rect.top <= viewportAnchor && rect.bottom > viewportAnchor) {
          activeSection = section;
        }
      });

      homeRailBlocks.forEach((block) => {
        const isActive = activeSection && railBlockBySection.get(activeSection.id) === block;
        block.classList.toggle('is-active', Boolean(isActive));
        if (isActive) {
          block.setAttribute('aria-current', 'location');
        } else {
          block.removeAttribute('aria-current');
        }
      });
    };

    const queueHomeSectionState = () => {
      if (homeScrollUpdateQueued) return;
      homeScrollUpdateQueued = true;
      window.requestAnimationFrame(updateHomeSectionState);
    };

    window.addEventListener('scroll', queueHomeSectionState, { passive: true });
    window.addEventListener('resize', queueHomeSectionState);
    queueHomeSectionState();
  }

  const archiveSections = Array.from(document.querySelectorAll('.page-archive .archive-entry'));
  const archiveRailBlocks = Array.from(document.querySelectorAll('.archive-rail .archive-rail-block'));

  if (archiveSections.length && archiveRailBlocks.length) {
    const railBlockBySection = new Map(archiveRailBlocks.map((block) => [
      block.getAttribute('href')?.replace(/^#/, ''),
      block,
    ]));
    let archiveScrollUpdateQueued = false;

    const updateArchiveSectionState = () => {
      archiveScrollUpdateQueued = false;
      const viewportAnchor = window.innerHeight * 0.45;
      let activeSection = archiveSections[0];

      archiveSections.forEach((section) => {
        if (section.getBoundingClientRect().top <= viewportAnchor) {
          activeSection = section;
        }
      });

      archiveRailBlocks.forEach((block) => {
        const isActive = railBlockBySection.get(activeSection.id) === block;
        block.classList.toggle('is-active', isActive);
        if (isActive) {
          block.setAttribute('aria-current', 'location');
        } else {
          block.removeAttribute('aria-current');
        }
      });
    };

    const queueArchiveSectionState = () => {
      if (archiveScrollUpdateQueued) return;
      archiveScrollUpdateQueued = true;
      window.requestAnimationFrame(updateArchiveSectionState);
    };

    window.addEventListener('scroll', queueArchiveSectionState, { passive: true });
    window.addEventListener('resize', queueArchiveSectionState);
    queueArchiveSectionState();
  }

  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
  const overlaps = (a, b, padding = 16) => {
    return !(
      a.x + a.w + padding < b.x ||
      a.x > b.x + b.w + padding ||
      a.y + a.h + padding < b.y ||
      a.y > b.y + b.h + padding
    );
  };

  const HOME_SCATTER_BREAKPOINT = 900;
  const HOME_SCATTER_VIEWPORT_MARGIN = 18;
  const HOME_SCATTER_PATTERNS = {
    1: [
      { xSide: 'left', ySide: 'bottom', xDepth: 0.42, yDepth: 0.38 },
    ],
    2: [
      { xSide: 'left', ySide: 'top', xDepth: 0.24, yDepth: 0.3 },
      { xSide: 'right', ySide: 'bottom', xDepth: 0.5, yDepth: 0.42 },
    ],
    3: [
      { xSide: 'left', ySide: 'top', xDepth: 0.18, yDepth: 0.2 },
      { xSide: 'right', ySide: 'top', xDepth: 0.58, yDepth: 0.68 },
      { xSide: 'left', ySide: 'bottom', xDepth: 0.7, yDepth: 0.32 },
    ],
    4: [
      { xSide: 'left', ySide: 'top', xDepth: 0.16, yDepth: 0.18 },
      { xSide: 'right', ySide: 'top', xDepth: 0.64, yDepth: 0.72 },
      { xSide: 'left', ySide: 'bottom', xDepth: 0.72, yDepth: 0.42 },
      { xSide: 'right', ySide: 'bottom', xDepth: 0.2, yDepth: 0.16 },
    ],
    5: [
      { xSide: 'left', ySide: 'top', xDepth: 0.12, yDepth: 0.12 },
      { xSide: 'right', ySide: 'top', xDepth: 0.62, yDepth: 0.74 },
      { xSide: 'left', ySide: 'bottom', xDepth: 0.68, yDepth: 0.48 },
      { xSide: 'right', ySide: 'bottom', xDepth: 0.16, yDepth: 0.14 },
      { xSide: 'left', ySide: 'top', xDepth: 0.86, yDepth: 0.9 },
    ],
  };

  const interpolate = (from, to, amount) => from + (to - from) * amount;

  const horizontalViewportBounds = (gallery, itemWidth, margin = HOME_SCATTER_VIEWPORT_MARGIN) => {
    const width = gallery.clientWidth;
    const rect = gallery.getBoundingClientRect();
    const viewportWidth = window.innerWidth || document.documentElement.clientWidth || width;
    const minX = margin - rect.left;
    const maxX = viewportWidth - margin - rect.left - itemWidth;

    if (maxX <= minX) {
      const fallback = (minX + maxX) / 2;
      return { minX: fallback, maxX: fallback };
    }

    return { minX, maxX };
  };

  const axisPositionWithinSafeLanes = ({
    nearEdge,
    nearSafe,
    depth,
    jitter,
    min,
    max,
  }) => {
    const target = interpolate(nearEdge, nearSafe, depth);
    return clamp(Math.round(target + jitter), min, max);
  };

  const setupScatterGallery = (gallery) => {
    const images = Array.from(gallery.querySelectorAll('img'));
    if (!images.length) return;

    const resetImagesToFlow = () => {
      gallery.style.removeProperty('height');
      images.forEach((img) => {
        img.draggable = false;
        img.style.removeProperty('width');
        img.style.removeProperty('height');
        img.style.removeProperty('left');
        img.style.removeProperty('top');
        img.style.removeProperty('transform');
        img.style.removeProperty('z-index');
        delete img.dataset.homeScatter;
      });
    };

    const placeImages = () => {
      if (window.innerWidth <= HOME_SCATTER_BREAKPOINT) {
        resetImagesToFlow();
        return;
      }

      const width = gallery.clientWidth;
      const count = images.length;
      const margin = 16;
      const galleryRect = gallery.getBoundingClientRect();
      const viewportWidth = window.innerWidth || document.documentElement.clientWidth || width;
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 800;
      const height = Math.max(560, Math.min(920, viewportHeight - 120));
      const safeZoneWidth = clamp(width * 0.24, 220, 360);
      const safeZoneHeight = clamp(height * 0.18, 140, 210);
      const maxBySide = (width - safeZoneWidth - margin * 4) / 2;
      const maxByRows = (height - safeZoneHeight - margin * 4) / 2;
      const sizeFromCount = count >= 5 ? 210 : count === 4 ? 225 : count === 3 ? 245 : 270;
      const baseSize = Math.max(160, Math.min(sizeFromCount, maxBySide * 1.04, maxByRows * 1.16));
      const pattern = HOME_SCATTER_PATTERNS[Math.min(count, 5)] || HOME_SCATTER_PATTERNS[5];
      const safeGapX = clamp(width * 0.012, 8, 18);
      const safeGapY = clamp(height * 0.018, 10, 18);
      const safeHalfWidth = Math.round(safeZoneWidth / 2);
      const safeCenterX = clamp(
        Math.round(viewportWidth * 0.46 - galleryRect.left),
        safeHalfWidth + margin,
        Math.max(safeHalfWidth + margin, width - safeHalfWidth - margin),
      );
      const safeLeft = safeCenterX - safeHalfWidth;
      const safeRight = safeLeft + safeZoneWidth;
      const safeCenterY = Math.round(height * 0.46);
      const safeTop = clamp(
        Math.round(safeCenterY - safeZoneHeight / 2),
        margin,
        Math.max(margin, height - safeZoneHeight - margin),
      );
      const safeBottom = safeTop + safeZoneHeight;

      gallery.style.height = `${height}px`;

      const placed = [];
      images.forEach((img, index) => {
        img.draggable = false;
        const requestedScale = Number.parseFloat(img.dataset.homeScale || '1');
        const imageScale = Number.isFinite(requestedScale) ? clamp(requestedScale, 0.45, 1.4) : 1;
        const imgW = Math.round(baseSize * imageScale);
        const imgH = imgW;
        const { minX, maxX } = horizontalViewportBounds(gallery, imgW, margin);
        const maxY = Math.max(margin, height - imgH - margin);
        const leftSafeX = clamp(safeLeft - imgW - safeGapX, minX, maxX);
        const rightSafeX = clamp(safeRight + safeGapX, minX, maxX);
        const topSafeY = clamp(safeTop - imgH - safeGapY, margin, maxY);
        const bottomSafeY = clamp(safeBottom + safeGapY, margin, maxY);
        const anchor = pattern[index] || pattern[pattern.length - 1];
        const xDepth = clamp(anchor.xDepth ?? 0.5, 0.08, 0.94);
        const yDepth = clamp(anchor.yDepth ?? 0.5, 0.08, 0.94);
        let x = axisPositionWithinSafeLanes({
          nearEdge: anchor.xSide === 'left' ? minX : maxX,
          nearSafe: anchor.xSide === 'left' ? leftSafeX : rightSafeX,
          depth: xDepth,
          jitter: 0,
          min: minX,
          max: maxX,
        });
        let y = axisPositionWithinSafeLanes({
          nearEdge: anchor.ySide === 'top' ? margin : maxY,
          nearSafe: anchor.ySide === 'top' ? topSafeY : bottomSafeY,
          depth: yDepth,
          jitter: 0,
          min: margin,
          max: maxY,
        });
        let candidate = { x, y, w: imgW, h: imgH };
        const overlapPadding = Math.max(14, Math.round(imgW * 0.08));
        const originX = x;
        const originY = y;

        for (let attempt = 0; attempt < 28 && placed.some((item) => overlaps(candidate, item, overlapPadding)); attempt += 1) {
          const shift = Math.max(18, Math.round(imgW * 0.12));
          const ring = Math.floor(attempt / 4) + 1;
          const directionX = attempt % 2 === 0 ? 1 : -1;
          const directionY = attempt % 4 < 2 ? 1 : -1;
          const nextX = clamp(originX + directionX * shift * ring, minX, maxX);
          const nextY = clamp(originY + directionY * Math.round(shift * 0.72) * ring, margin, Math.max(margin, height - imgH - margin));
          candidate = { x: nextX, y: nextY, w: imgW, h: imgH };
        }

        placed.push(candidate);

        img.style.width = `${Math.round(imgW)}px`;
        img.style.height = `${Math.round(imgH)}px`;
        img.style.left = `${Math.round(candidate.x)}px`;
        img.style.top = `${Math.round(candidate.y)}px`;
        img.style.transform = 'none';
        img.style.zIndex = String(index + 1);
        img.dataset.homeScatter = 'true';
      });

      gallery.dispatchEvent(new CustomEvent('home-scatter-placed'));
    };

    const ensurePlaced = () => {
      const unloaded = images.filter((img) => !img.complete);
      if (!unloaded.length) {
        placeImages();
        return;
      }
      let remaining = unloaded.length;
      const onLoad = () => {
        remaining -= 1;
        if (remaining <= 0) {
          placeImages();
        }
      };
      unloaded.forEach((img) => img.addEventListener('load', onLoad, { once: true }));
    };

    ensurePlaced();

    let resizeTimer = null;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(placeImages, 150);
    });
  };

  const setupBlueCursor = () => {
    const desktopPointer = window.matchMedia('(min-width: 901px) and (hover: hover) and (pointer: fine)');
    const pointer = { x: 0, y: 0, active: false, enabled: false };
    if (!desktopPointer.matches || prefersReducedMotion) return pointer;

    const cursor = document.createElement('div');
    cursor.className = 'home-cursor-ball';
    cursor.setAttribute('aria-hidden', 'true');
    document.body.appendChild(cursor);
    document.body.classList.add('has-home-cursor');
    pointer.enabled = true;

    window.addEventListener('pointermove', (event) => {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      pointer.active = true;
      cursor.style.left = `${event.clientX}px`;
      cursor.style.top = `${event.clientY}px`;
      cursor.classList.add('is-visible');
    }, { passive: true });

    document.documentElement.addEventListener('mouseleave', () => {
      pointer.active = false;
      cursor.classList.remove('is-visible');
    });

    window.addEventListener('blur', () => {
      pointer.active = false;
      cursor.classList.remove('is-visible');
    });

    return pointer;
  };

  const setupHomeCursorDrift = (pointer) => {
    const images = Array.from(document.querySelectorAll('.page-home .project-gallery img'));
    if (!images.length || !pointer?.enabled) return;

    const states = new Map(images.map((img) => [img, { x: 0, y: 0 }]));
    const influenceRadius = 420;
    const maximumShift = 130;
    const followAmount = 0.72;

    const resetImageDrift = (img) => {
      const state = states.get(img);
      if (!state) return;
      state.x = 0;
      state.y = 0;
      img.style.transform = 'none';
    };

    images.forEach((img) => {
      img.addEventListener('home-drift-reset', () => resetImageDrift(img));
      img.closest('.project-gallery')?.addEventListener('home-scatter-placed', () => resetImageDrift(img));
    });

    const animate = () => {
      images.forEach((img) => {
        const state = states.get(img);
        if (!state) return;

        let targetX = 0;
        let targetY = 0;
        if (pointer.active && img.dataset.homeScatter === 'true' && !img.classList.contains('is-dragging')) {
          const gallery = img.closest('.project-gallery');
          const galleryRect = gallery?.getBoundingClientRect();
          if (galleryRect) {
            const centerX = galleryRect.left + img.offsetLeft + img.offsetWidth / 2;
            const centerY = galleryRect.top + img.offsetTop + img.offsetHeight / 2;
            const deltaX = pointer.x - centerX;
            const deltaY = pointer.y - centerY;
            const distance = Math.hypot(deltaX, deltaY);
            if (distance > 0 && distance < influenceRadius) {
              const strength = 1 - distance / influenceRadius;
              targetX = clamp(deltaX * followAmount, -maximumShift, maximumShift) * strength;
              targetY = clamp(deltaY * followAmount, -maximumShift, maximumShift) * strength;
            }
          }
        }

        state.x += (targetX - state.x) * 0.065;
        state.y += (targetY - state.y) * 0.065;
        if (Math.abs(state.x) < 0.02 && Math.abs(state.y) < 0.02 && targetX === 0 && targetY === 0) {
          state.x = 0;
          state.y = 0;
          img.style.transform = 'none';
        } else if (!img.classList.contains('is-dragging')) {
          img.style.transform = `translate3d(${state.x.toFixed(2)}px, ${state.y.toFixed(2)}px, 0)`;
        }
      });
      window.requestAnimationFrame(animate);
    };

    window.requestAnimationFrame(animate);
  };

  const setupDrag = () => {
    const images = document.querySelectorAll('.page-home .project-gallery img');
    if (!images.length) return;

    let zCounter = 10;
    const clearDragging = () => {
      images.forEach((img) => {
        img.classList.remove('is-dragging');
      });
    };

    clearDragging();

    images.forEach((img) => {
      const projectUrl = img.dataset.projectUrl;
      let suppressClickUntil = 0;

      img.draggable = false;
      if (projectUrl) {
        img.tabIndex = 0;
        img.setAttribute('role', 'link');
        img.setAttribute('aria-label', `${img.alt}. Open project information.`);
        img.title = 'Click to view project information or drag to reposition';
        img.addEventListener('click', (event) => {
          if (Date.now() < suppressClickUntil) {
            event.preventDefault();
            return;
          }
          window.location.assign(projectUrl);
        });
        img.addEventListener('keydown', (event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            window.location.assign(projectUrl);
          }
        });
      }
      img.addEventListener('dragstart', (event) => event.preventDefault());
      img.addEventListener('pointerdown', (event) => {
        const gallery = img.closest('.project-gallery');
        if (!gallery) return;
        if (event.button !== 0) return;
        if (img.dataset.homeScatter !== 'true') return;

        img.setPointerCapture(event.pointerId);
        img.classList.add('is-dragging');
        img.style.zIndex = String(zCounter++);
        const galleryRect = gallery.getBoundingClientRect();
        const imgRect = img.getBoundingClientRect();
        img.style.left = `${Math.round(imgRect.left - galleryRect.left)}px`;
        img.style.top = `${Math.round(imgRect.top - galleryRect.top)}px`;
        img.style.transform = 'none';
        img.dispatchEvent(new CustomEvent('home-drift-reset'));
        const offsetX = event.clientX - imgRect.left;
        const offsetY = event.clientY - imgRect.top;
        const startX = event.clientX;
        const startY = event.clientY;
        let hasMoved = false;

        const onMove = (moveEvent) => {
          if (!hasMoved) {
            const dx = moveEvent.clientX - startX;
            const dy = moveEvent.clientY - startY;
            if (Math.hypot(dx, dy) < 5) {
              return;
            }
            hasMoved = true;
          }
          moveEvent.preventDefault();
          const width = img.offsetWidth;
          const height = img.offsetHeight;
          const { minX, maxX } = horizontalViewportBounds(gallery, width, 0);
          const maxY = Math.max(0, gallery.clientHeight - height);
          const nextX = clamp(moveEvent.clientX - galleryRect.left - offsetX, minX, maxX);
          const nextY = clamp(moveEvent.clientY - galleryRect.top - offsetY, 0, maxY);
          img.style.left = `${Math.round(nextX)}px`;
          img.style.top = `${Math.round(nextY)}px`;
        };

        const onUp = (upEvent) => {
          if (hasMoved && upEvent.type !== 'pointercancel') {
            suppressClickUntil = Date.now() + 400;
          }
          img.classList.remove('is-dragging');
          img.removeEventListener('pointermove', onMove);
          img.removeEventListener('pointerup', onUp);
          img.removeEventListener('pointercancel', onUp);
        };

        img.addEventListener('pointermove', onMove);
        img.addEventListener('pointerup', onUp);
        img.addEventListener('pointercancel', onUp);
      });
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        clearDragging();
      }
    });
  };

  const sitePointer = setupBlueCursor();
  const homeGalleries = document.querySelectorAll('.page-home .project-gallery');
  if (homeGalleries.length) {
    homeGalleries.forEach(setupScatterGallery);
    setupHomeCursorDrift(sitePointer);
    setupDrag();
  }

  const setupLightbox = () => {
    const isDetailPage = document.body.classList.contains('page-detail');
    const isArchivePage = document.body.classList.contains('page-archive');
    if (!isDetailPage && !isArchivePage) return;

    const selector = isDetailPage
      ? '.detail-gallery img'
      : '.archive-entry-gallery img';
    const images = Array.from(document.querySelectorAll(selector));
    if (!images.length) return;

    const lightbox = document.createElement('div');
    lightbox.className = 'image-lightbox';
    lightbox.setAttribute('role', 'dialog');
    lightbox.setAttribute('aria-modal', 'true');
    lightbox.setAttribute('aria-label', 'Project image viewer');
    lightbox.setAttribute('aria-hidden', 'true');
    lightbox.inert = true;
    lightbox.innerHTML = `
      <button class="lightbox-close" type="button" aria-label="Close image viewer"><span aria-hidden="true">×</span></button>
      <button class="lightbox-control lightbox-control--prev" type="button" aria-label="Previous image">
        <span aria-hidden="true">←</span>
      </button>
      <div class="lightbox-stage">
        <img alt="Enlarged project image">
        <div class="lightbox-lens" aria-hidden="true"></div>
      </div>
      <div class="lightbox-toolbar" aria-label="Image tools">
        <button class="lightbox-tool lightbox-tool--magnifier" type="button" aria-label="Toggle magnifier" aria-pressed="false">
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <circle cx="11" cy="11" r="6"></circle>
            <path d="m16 16 5 5"></path>
          </svg>
        </button>
        <label class="visually-hidden" for="lightbox-magnification">Magnification</label>
        <input class="lightbox-slider" id="lightbox-magnification" type="range" min="1.6" max="4" step="0.2" value="2.4" aria-label="Magnification">
      </div>
      <button class="lightbox-control lightbox-control--next" type="button" aria-label="Next image">
        <span aria-hidden="true">→</span>
      </button>
    `;
    document.body.appendChild(lightbox);
    const lightboxImg = lightbox.querySelector('img');
    const stage = lightbox.querySelector('.lightbox-stage');
    const lens = lightbox.querySelector('.lightbox-lens');
    const magnifierButton = lightbox.querySelector('.lightbox-tool--magnifier');
    const magnificationSlider = lightbox.querySelector('.lightbox-slider');
    const closeButton = lightbox.querySelector('.lightbox-close');
    const prevButton = lightbox.querySelector('.lightbox-control--prev');
    const nextButton = lightbox.querySelector('.lightbox-control--next');
    let currentIndex = 0;
    let magnifierActive = false;
    let pointerOverLightboxImage = false;
    let lastLensPoint = null;
    let lastFocusedElement = null;
    let swipeStart = null;
    let suppressImageClick = false;
    let mobileImageScale = 1;
    let mobileImageTranslate = { x: 0, y: 0 };
    let panStart = null;
    let pinchStart = null;
    const activeMobilePointers = new Map();
    const mobileLightboxQuery = window.matchMedia('(max-width: 700px), (hover: none) and (pointer: coarse)');

    const isOpen = () => lightbox.classList.contains('is-visible');
    const canUseMagnifier = () => !mobileLightboxQuery.matches;
    const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
    const pointerDistance = (first, second) => Math.hypot(first.x - second.x, first.y - second.y);
    const clampMobileImageTranslate = () => {
      if (mobileImageScale <= 1.01) {
        mobileImageTranslate = { x: 0, y: 0 };
        return;
      }
      const maxX = Math.max(0, (lightboxImg.offsetWidth * (mobileImageScale - 1)) / 2);
      const maxY = Math.max(0, (lightboxImg.offsetHeight * (mobileImageScale - 1)) / 2);
      mobileImageTranslate = {
        x: clamp(mobileImageTranslate.x, -maxX, maxX),
        y: clamp(mobileImageTranslate.y, -maxY, maxY),
      };
    };
    const applyMobileImageScale = () => {
      const isZoomed = mobileImageScale > 1.01;
      clampMobileImageTranslate();
      lightboxImg.style.transform = isZoomed
        ? `translate3d(${mobileImageTranslate.x}px, ${mobileImageTranslate.y}px, 0) scale(${mobileImageScale})`
        : '';
      lightbox.classList.toggle('is-image-zoomed', isZoomed);
    };
    const resetMobileImageScale = () => {
      mobileImageScale = 1;
      mobileImageTranslate = { x: 0, y: 0 };
      panStart = null;
      pinchStart = null;
      activeMobilePointers.clear();
      applyMobileImageScale();
    };
    const syncMagnifierCursor = () => {
      document.body.classList.toggle(
        'magnifier-cursor-hidden',
        magnifierActive && pointerOverLightboxImage,
      );
    };
    const setMagnifierActive = (active) => {
      const nextActive = Boolean(active && canUseMagnifier());
      magnifierActive = nextActive;
      lightbox.classList.toggle('magnifier-active', nextActive);
      syncMagnifierCursor();
      magnifierButton.setAttribute('aria-pressed', String(nextActive));
      if (!nextActive) {
        lens.classList.remove('is-visible');
      }
    };
    const syncLightboxViewport = () => {
      lightbox.classList.toggle('is-mobile-viewer', !canUseMagnifier());
      if (!canUseMagnifier()) {
        setMagnifierActive(false);
      }
    };

    const updateLens = (event) => {
      if (!magnifierActive || !lightboxImg.src) return;
      const rect = lightboxImg.getBoundingClientRect();
      const stageRect = stage.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      lastLensPoint = { clientX: event.clientX, clientY: event.clientY };

      if (x < 0 || y < 0 || x > rect.width || y > rect.height) {
        lens.classList.remove('is-visible');
        return;
      }

      const zoom = Number(magnificationSlider.value) || 2.4;
      const lensSize = lens.offsetWidth || 180;
      lens.style.left = `${Math.round(rect.left - stageRect.left + x - lensSize / 2)}px`;
      lens.style.top = `${Math.round(rect.top - stageRect.top + y - lensSize / 2)}px`;
      lens.style.backgroundImage = `url("${lightboxImg.src}")`;
      lens.style.backgroundSize = `${rect.width * zoom}px ${rect.height * zoom}px`;
      lens.style.backgroundPosition = `${Math.round(lensSize / 2 - x * zoom)}px ${Math.round(lensSize / 2 - y * zoom)}px`;
      lens.classList.add('is-visible');
    };

    const close = () => {
      lightbox.classList.remove('is-visible');
      lightbox.setAttribute('aria-hidden', 'true');
      lightbox.inert = true;
      pointerOverLightboxImage = false;
      setMagnifierActive(false);
      lastLensPoint = null;
      resetMobileImageScale();
      lightboxImg.removeAttribute('src');
      document.body.classList.remove('overlay-open');
      if (lastFocusedElement instanceof HTMLElement) {
        lastFocusedElement.focus();
      }
      lastFocusedElement = null;
    };

    const showAt = (index) => {
      if (!images.length) return;
      const wasOpen = isOpen();
      if (!wasOpen) {
        lastFocusedElement = document.activeElement;
      }
      currentIndex = (index + images.length) % images.length;
      const img = images[currentIndex];
      resetMobileImageScale();
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt || (isArchivePage ? 'Archive image' : 'Project image');
      lens.style.backgroundImage = `url("${img.src}")`;
      lens.classList.remove('is-visible');
      lightbox.classList.add('is-visible');
      lightbox.setAttribute('aria-hidden', 'false');
      lightbox.inert = false;
      document.body.classList.add('overlay-open');
      if (!wasOpen) {
        setMagnifierActive(canUseMagnifier());
        window.requestAnimationFrame(() => closeButton.focus());
      }
    };

    images.forEach((img, index) => {
      img.tabIndex = 0;
      img.setAttribute('role', 'button');
      img.setAttribute('aria-label', `${img.alt || 'Project image'}. Open larger image.`);
      img.addEventListener('click', () => {
        showAt(index);
      });
      img.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          showAt(index);
        }
      });
    });

    closeButton.addEventListener('click', (event) => {
      event.stopPropagation();
      close();
    });

    prevButton.addEventListener('click', (event) => {
      event.stopPropagation();
      showAt(currentIndex - 1);
    });

    nextButton.addEventListener('click', (event) => {
      event.stopPropagation();
      showAt(currentIndex + 1);
    });

    magnifierButton.addEventListener('click', (event) => {
      event.stopPropagation();
      if (!canUseMagnifier()) return;
      setMagnifierActive(!magnifierActive);
    });

    magnificationSlider.addEventListener('input', (event) => {
      event.stopPropagation();
      if (magnifierActive && lastLensPoint) {
        updateLens(lastLensPoint);
      }
    });

    stage.addEventListener('pointermove', updateLens);
    stage.addEventListener('pointerleave', () => {
      lastLensPoint = null;
      lens.classList.remove('is-visible');
    });

    stage.addEventListener('pointerdown', (event) => {
      if (!mobileLightboxQuery.matches) return;
      if (event.target.closest('button, input, label, a')) return;
      activeMobilePointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
      suppressImageClick = false;
      if (
        typeof stage.hasPointerCapture === 'function'
        && typeof stage.setPointerCapture === 'function'
        && !stage.hasPointerCapture(event.pointerId)
      ) {
        stage.setPointerCapture(event.pointerId);
      }
      if (activeMobilePointers.size === 1 && mobileImageScale <= 1.01) {
        swipeStart = {
          pointerId: event.pointerId,
          x: event.clientX,
          y: event.clientY,
        };
      } else if (activeMobilePointers.size === 1) {
        panStart = {
          pointerId: event.pointerId,
          x: event.clientX,
          y: event.clientY,
          translateX: mobileImageTranslate.x,
          translateY: mobileImageTranslate.y,
        };
      }
      if (activeMobilePointers.size === 2) {
        const points = Array.from(activeMobilePointers.values());
        pinchStart = {
          distance: pointerDistance(points[0], points[1]),
          scale: mobileImageScale,
        };
        panStart = null;
        swipeStart = null;
        suppressImageClick = true;
      }
    });

    stage.addEventListener('pointermove', (event) => {
      if (!activeMobilePointers.has(event.pointerId)) return;
      activeMobilePointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
      if (pinchStart && activeMobilePointers.size >= 2) {
        const points = Array.from(activeMobilePointers.values());
        const distance = pointerDistance(points[0], points[1]);
        if (pinchStart.distance > 0) {
          mobileImageScale = clamp(pinchStart.scale * (distance / pinchStart.distance), 1, 4);
          applyMobileImageScale();
          suppressImageClick = true;
          event.preventDefault();
        }
        return;
      }
      if (panStart && event.pointerId === panStart.pointerId && mobileImageScale > 1.01) {
        mobileImageTranslate = {
          x: panStart.translateX + event.clientX - panStart.x,
          y: panStart.translateY + event.clientY - panStart.y,
        };
        applyMobileImageScale();
        suppressImageClick = true;
        event.preventDefault();
        return;
      }
      if (!swipeStart || event.pointerId !== swipeStart.pointerId || mobileImageScale > 1.01) return;
      const deltaX = event.clientX - swipeStart.x;
      const deltaY = event.clientY - swipeStart.y;
      if (Math.abs(deltaX) > 12 && Math.abs(deltaX) > Math.abs(deltaY)) {
        event.preventDefault();
      }
    });

    const finishSwipe = (event) => {
      const wasPinching = Boolean(pinchStart);
      const wasPanning = Boolean(panStart && event.pointerId === panStart.pointerId);
      activeMobilePointers.delete(event.pointerId);
      if (wasPinching) {
        pinchStart = null;
        panStart = null;
        swipeStart = null;
        suppressImageClick = true;
        if (mobileImageScale < 1.04) {
          mobileImageScale = 1;
          applyMobileImageScale();
        }
        if (typeof stage.hasPointerCapture === 'function' && stage.hasPointerCapture(event.pointerId)) {
          stage.releasePointerCapture(event.pointerId);
        }
        window.setTimeout(() => {
          suppressImageClick = false;
        }, 350);
        return;
      }
      if (wasPanning) {
        panStart = null;
        suppressImageClick = true;
        if (typeof stage.hasPointerCapture === 'function' && stage.hasPointerCapture(event.pointerId)) {
          stage.releasePointerCapture(event.pointerId);
        }
        window.setTimeout(() => {
          suppressImageClick = false;
        }, 350);
        return;
      }
      if (!swipeStart || event.pointerId !== swipeStart.pointerId) {
        panStart = null;
        if (typeof stage.hasPointerCapture === 'function' && stage.hasPointerCapture(event.pointerId)) {
          stage.releasePointerCapture(event.pointerId);
        }
        return;
      }
      const deltaX = event.clientX - swipeStart.x;
      const deltaY = event.clientY - swipeStart.y;
      swipeStart = null;
      if (typeof stage.hasPointerCapture === 'function' && stage.hasPointerCapture(event.pointerId)) {
        stage.releasePointerCapture(event.pointerId);
      }
      if (mobileImageScale > 1.01) return;
      if (Math.abs(deltaX) < 48 || Math.abs(deltaX) < Math.abs(deltaY) * 1.15) return;
      suppressImageClick = true;
      showAt(currentIndex + (deltaX < 0 ? 1 : -1));
      window.setTimeout(() => {
        suppressImageClick = false;
      }, 350);
    };

    stage.addEventListener('pointerup', finishSwipe);
    stage.addEventListener('pointercancel', (event) => {
      activeMobilePointers.delete(event.pointerId);
      panStart = null;
      swipeStart = null;
      pinchStart = null;
    });

    lightboxImg.addEventListener('click', (event) => {
      event.stopPropagation();
      if (suppressImageClick) {
        suppressImageClick = false;
        return;
      }
      if (!magnifierActive) {
        close();
      }
    });

    lightboxImg.addEventListener('pointerenter', () => {
      pointerOverLightboxImage = true;
      syncMagnifierCursor();
    });

    lightboxImg.addEventListener('pointerleave', () => {
      pointerOverLightboxImage = false;
      syncMagnifierCursor();
    });

    lightbox.addEventListener('click', (event) => {
      if (event.target === lightbox) close();
    });
    document.addEventListener('keydown', (event) => {
      if (!isOpen()) return;
      if (event.key === 'Escape') {
        close();
      }
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        showAt(currentIndex - 1);
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        showAt(currentIndex + 1);
      }
      if (event.key === 'Tab') {
        const focusable = Array.from(lightbox.querySelectorAll('button, input')).filter((element) => !element.disabled);
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    });
    syncLightboxViewport();
    if (typeof mobileLightboxQuery.addEventListener === 'function') {
      mobileLightboxQuery.addEventListener('change', syncLightboxViewport);
    } else if (typeof mobileLightboxQuery.addListener === 'function') {
      mobileLightboxQuery.addListener(syncLightboxViewport);
    }
  };

  const setupPdfOverlay = () => {
    if (!document.body.classList.contains('page-detail')) return;
    const pdfLinks = Array.from(document.querySelectorAll('.detail-files a[href$=".pdf"], .detail-files a[href$=".PDF"]'));
    if (!pdfLinks.length) return;

    const overlay = document.createElement('div');
    overlay.className = 'pdf-lightbox';
    overlay.setAttribute('aria-hidden', 'true');
    overlay.inert = true;
    overlay.innerHTML = `
      <div class="pdf-lightbox__panel" role="dialog" aria-modal="true" aria-label="PDF preview">
        <button class="pdf-lightbox__close" type="button" aria-label="Close PDF">Close</button>
        <iframe class="pdf-lightbox__frame" title="PDF preview"></iframe>
      </div>
    `;
    document.body.appendChild(overlay);

    const frame = overlay.querySelector('.pdf-lightbox__frame');
    const closeButton = overlay.querySelector('.pdf-lightbox__close');
    let lastFocusedElement = null;

    const isOpen = () => overlay.classList.contains('is-visible');

    const open = (href, label) => {
      lastFocusedElement = document.activeElement;
      frame.src = href;
      frame.setAttribute('title', label || 'PDF preview');
      overlay.classList.add('is-visible');
      overlay.setAttribute('aria-hidden', 'false');
      overlay.inert = false;
      document.body.classList.add('overlay-open');
      window.requestAnimationFrame(() => closeButton.focus());
    };

    const close = () => {
      overlay.classList.remove('is-visible');
      overlay.setAttribute('aria-hidden', 'true');
      overlay.inert = true;
      frame.removeAttribute('src');
      document.body.classList.remove('overlay-open');
      if (lastFocusedElement instanceof HTMLElement) {
        lastFocusedElement.focus();
      }
      lastFocusedElement = null;
    };

    pdfLinks.forEach((link) => {
      link.addEventListener('click', (event) => {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        open(link.href, link.textContent.trim());
      });
    });

    closeButton.addEventListener('click', (event) => {
      event.stopPropagation();
      close();
    });

    overlay.addEventListener('click', (event) => {
      if (event.target === overlay) close();
    });

    document.addEventListener('keydown', (event) => {
      if (!isOpen()) return;
      if (event.key === 'Escape') {
        close();
      }
      if (event.key === 'Tab') {
        event.preventDefault();
        closeButton.focus();
      }
    });
  };

  const setupAboutPortraitReveal = () => {
    const portrait = document.querySelector('.page-about .about-portrait');
    if (!portrait) return;

    const updatePosition = (event) => {
      const rect = portrait.getBoundingClientRect();
      const x = clamp(event.clientX - rect.left, 0, rect.width);
      const y = clamp(event.clientY - rect.top, 0, rect.height);
      portrait.style.setProperty('--about-reveal-x', `${Math.round(x)}px`);
      portrait.style.setProperty('--about-reveal-y', `${Math.round(y)}px`);
      portrait.classList.add('is-revealing');
      document.body.classList.add('about-cursor-hidden');
    };

    const resetPosition = () => {
      portrait.classList.remove('is-revealing');
      document.body.classList.remove('about-cursor-hidden');
      portrait.style.setProperty('--about-reveal-x', '50%');
      portrait.style.setProperty('--about-reveal-y', '50%');
    };

    portrait.addEventListener('pointerenter', updatePosition);
    portrait.addEventListener('pointermove', updatePosition);
    portrait.addEventListener('pointerleave', resetPosition);
    portrait.addEventListener('blur', resetPosition);
    portrait.addEventListener('focus', () => {
      portrait.style.setProperty('--about-reveal-x', '50%');
      portrait.style.setProperty('--about-reveal-y', '50%');
    });

    resetPosition();
  };

  const setupFooterVisibility = () => {
    const footer = document.querySelector('.site-footer');
    if (!footer) return;
    footer.classList.add('is-visible');
    footer.inert = false;
    footer.setAttribute('aria-hidden', 'false');
  };

  const setupArchiveHeaderVisibility = () => {
    if (!document.body.classList.contains('page-archive')) return;
    const header = document.querySelector('.archive-intro');
    if (!header) return;

    let lastScrollY = Math.max(window.scrollY, 0);
    let framePending = false;

    const update = () => {
      const currentScrollY = Math.max(window.scrollY, 0);
      const delta = currentScrollY - lastScrollY;

      if (currentScrollY <= 12 || delta < -2) {
        document.body.classList.remove('archive-header-hidden');
      } else if (currentScrollY > 36 && delta > 2) {
        document.body.classList.add('archive-header-hidden');
      }

      lastScrollY = currentScrollY;
      framePending = false;
    };

    window.addEventListener('scroll', () => {
      if (framePending) return;
      framePending = true;
      window.requestAnimationFrame(update);
    }, { passive: true });
  };

  const setupProjectsViewToggle = () => {
    const projectsList = document.querySelector('[data-projects-list]');
    const buttons = Array.from(document.querySelectorAll('[data-projects-view]'));
    if (!projectsList || !buttons.length) return;

    const setView = (view) => {
      projectsList.dataset.view = view;
      buttons.forEach((button) => {
        const isActive = button.dataset.projectsView === view;
        button.classList.toggle('is-active', isActive);
        button.setAttribute('aria-pressed', String(isActive));
      });
      window.dispatchEvent(new Event('portfolio:layoutchange'));
    };

    buttons.forEach((button) => {
      button.addEventListener('click', () => setView(button.dataset.projectsView));
    });
  };

  const setupWidowPrevention = () => {
    const textBlocks = document.querySelectorAll('p, .project-summary, .site-footer-copy > div');
    textBlocks.forEach((block) => {
      const walker = document.createTreeWalker(block, NodeFilter.SHOW_TEXT);
      const textNodes = [];
      let currentNode = walker.nextNode();
      while (currentNode) {
        if (currentNode.nodeValue?.trim()) textNodes.push(currentNode);
        currentNode = walker.nextNode();
      }

      for (let index = textNodes.length - 1; index >= 0; index -= 1) {
        const node = textNodes[index];
        const value = node.nodeValue || '';
        const finalWords = value.match(/(\S+)(\s+)(\S+)(\s*)$/u);
        if (!finalWords) continue;
        const start = finalWords.index ?? 0;
        node.nodeValue = `${value.slice(0, start)}${finalWords[1]}\u00A0${finalWords[3]}${finalWords[4]}`;
        break;
      }
    });
  };

  const setupHomeProjectGrid = () => {
    const grid = document.getElementById('project-grid');
    const toggle = document.querySelector('.home-overview-toggle');
    if (!grid || !toggle) return;

    const setOpen = (open) => {
      grid.hidden = !open;
      toggle.setAttribute('aria-expanded', String(open));
      toggle.textContent = open ? 'Close overview' : 'Overview';

      window.dispatchEvent(new Event('portfolio:layoutchange'));
    };

    toggle.addEventListener('click', () => {
      const open = grid.hidden;
      setOpen(open);
      if (!open && window.location.hash === '#project-grid') {
        window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`);
      }
    });

    window.addEventListener('hashchange', () => {
      if (window.location.hash === '#project-grid') setOpen(true);
    });

    setOpen(window.location.hash === '#project-grid');
  };

  const setupHomeProjectPreviews = () => {
    const links = Array.from(document.querySelectorAll('[data-home-project]'));
    if (!links.length) return;
    const desktopPreview = window.matchMedia('(min-width: 901px) and (hover: hover) and (pointer: fine)');
    if (!desktopPreview.matches) return;

    let activeLink = null;
    let activePreview = null;
    let activeIndex = 0;
    let rotationTimer = null;

    const stopRotation = () => {
      if (rotationTimer) window.clearInterval(rotationTimer);
      rotationTimer = null;
    };

    const showImage = (index) => {
      if (!activePreview) return;
      const images = Array.from(activePreview.querySelectorAll('img'));
      if (!images.length) return;
      activeIndex = (index + images.length) % images.length;
      images.forEach((image, imageIndex) => {
        image.classList.toggle('is-current', imageIndex === activeIndex);
      });
    };

    const deactivate = () => {
      stopRotation();
      activeLink?.classList.remove('is-active');
      activePreview?.classList.remove('is-visible');
      activePreview?.querySelectorAll('img').forEach((image) => image.classList.remove('is-current'));
      activeLink = null;
      activePreview = null;
      document.body.classList.remove('home-preview-active');
    };

    const activate = (link) => {
      const projectId = link.dataset.homeProject;
      const preview = document.querySelector(`[data-home-preview="${CSS.escape(projectId)}"]`);
      if (!preview || activeLink === link) return;
      deactivate();
      activeLink = link;
      activePreview = preview;
      activeIndex = 0;
      link.classList.add('is-active');
      preview.classList.add('is-visible');
      document.body.classList.add('home-preview-active');
      showImage(0);
      if (preview.querySelectorAll('img').length > 1) {
        rotationTimer = window.setInterval(() => showImage(activeIndex + 1), 2000);
      }
    };

    links.forEach((link) => {
      link.addEventListener('pointerenter', () => activate(link));
      link.addEventListener('pointerleave', deactivate);
      link.addEventListener('focus', () => activate(link));
      link.addEventListener('blur', deactivate);
    });

    window.addEventListener('pagehide', stopRotation);
  };

  const setupHomePortraitPreview = () => {
    const trigger = document.querySelector('.home-about-primary') || document.querySelector('[data-home-portrait-trigger]');
    const preview = document.querySelector('[data-home-portrait]');
    if (!trigger || !preview) return;

    const show = () => preview.classList.add('is-visible');
    const hide = () => preview.classList.remove('is-visible');

    trigger.addEventListener('pointerenter', show);
    trigger.addEventListener('pointerleave', hide);
    trigger.addEventListener('focus', show);
    trigger.addEventListener('blur', hide);
  };

  const setupProjectInformation = () => {
    const panel = document.querySelector('[data-project-information]');
    const toggle = panel?.querySelector('.project-information-toggle');
    if (!panel || !toggle) return;

    const mark = toggle.querySelector('.project-information-toggle__mark');
    let manuallyExpanded = false;

    const setCollapsed = (collapsed) => {
      panel.classList.toggle('is-collapsed', collapsed);
      document.body.classList.toggle('has-collapsed-information', collapsed);
      toggle.setAttribute('aria-expanded', String(!collapsed));
      if (mark) mark.textContent = collapsed ? '+' : '−';
    };

    const syncWithScroll = () => {
      if (window.scrollY <= 2) manuallyExpanded = false;
      setCollapsed(window.scrollY > 8 && !manuallyExpanded);
    };

    toggle.addEventListener('click', () => {
      if (panel.classList.contains('is-collapsed')) {
        manuallyExpanded = true;
        setCollapsed(false);
      }
    });

    window.addEventListener('scroll', syncWithScroll, { passive: true });
    syncWithScroll();
  };

  setupConfigurableMediaSpans().finally(() => {
    setupArchiveOrientationSpans();
    setupLightbox();
  });
  setupPdfOverlay();
  setupAboutPortraitReveal();
  setupWidowPrevention();
  setupFooterVisibility();
  setupArchiveHeaderVisibility();
  setupProjectsViewToggle();
  setupHomeProjectGrid();
  setupHomeProjectPreviews();
  setupHomePortraitPreview();
  setupProjectInformation();
})();
