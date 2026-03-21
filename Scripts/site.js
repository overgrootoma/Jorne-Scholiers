(() => {
  const nav = document.querySelector('[data-nav]');
  const toggle = document.getElementById('menu-toggle');
  const panel = document.getElementById('menu-panel');

  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('menu-open');
      toggle.setAttribute('aria-expanded', String(isOpen));
    });

    document.addEventListener('click', (event) => {
      if (!nav.classList.contains('menu-open')) return;
      if (nav.contains(event.target)) return;
      nav.classList.remove('menu-open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  }

  const titleEls = document.querySelectorAll('.title-font:not(.site-title)');
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

  const randomWeight = () => Math.floor(Math.random() * 801) + 100;
  const randomFloat = (min, max) => Number((Math.random() * (max - min) + min).toFixed(2));
  const randomAxes = () => ({
    slnt: randomFloat(-10, 0),
    crsv: randomFloat(0, 1),
    elsh: randomFloat(0, 1),
    elxp: randomFloat(0, 1),
    szp1: randomFloat(0, 1),
    szp2: randomFloat(0, 1),
    xpn1: randomFloat(0, 1),
    xpn2: randomFloat(0, 1),
    ypn1: randomFloat(0, 1),
    ypn2: randomFloat(0, 1),
  });

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

  titleEls.forEach((el) => {
    applyAxes(el, baseWeight, baseAxes);
    const interval = 2800 + Math.random() * 2200;
    setInterval(() => {
      applyAxes(el, randomWeight(), randomAxes());
    }, interval);
  });

  const rail = document.querySelector('.project-rail, .archive-rail');
  const preview = document.getElementById('rail-preview');

  if (rail && preview) {
    const previewTitle = preview.querySelector('.rail-preview-title');
    const previewImage = preview.querySelector('img');

    const showPreview = (block) => {
      const title = block.dataset.title || '';
      const image = block.dataset.image || '';
      previewTitle.textContent = title;
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
      { xSide: 'left', ySide: 'top', xDepth: 0.86, yDepth: 0.76 },
    ],
    2: [
      { xSide: 'left', ySide: 'top', xDepth: 0.86, yDepth: 0.76 },
      { xSide: 'right', ySide: 'bottom', xDepth: 0.84, yDepth: 0.58 },
    ],
    3: [
      { xSide: 'left', ySide: 'top', xDepth: 0.86, yDepth: 0.76 },
      { xSide: 'right', ySide: 'top', xDepth: 0.82, yDepth: 0.62 },
      { xSide: 'left', ySide: 'bottom', xDepth: 0.88, yDepth: 0.56 },
    ],
    4: [
      { xSide: 'left', ySide: 'top', xDepth: 0.86, yDepth: 0.76 },
      { xSide: 'right', ySide: 'top', xDepth: 0.82, yDepth: 0.6 },
      { xSide: 'left', ySide: 'bottom', xDepth: 0.88, yDepth: 0.54 },
      { xSide: 'right', ySide: 'bottom', xDepth: 0.84, yDepth: 0.5 },
    ],
    5: [
      { xSide: 'left', ySide: 'top', xDepth: 0.86, yDepth: 0.78 },
      { xSide: 'right', ySide: 'top', xDepth: 0.82, yDepth: 0.6 },
      { xSide: 'left', ySide: 'bottom', xDepth: 0.9, yDepth: 0.52 },
      { xSide: 'right', ySide: 'bottom', xDepth: 0.84, yDepth: 0.48 },
      { xSide: 'left', ySide: 'top', xDepth: 0.66, yDepth: 0.24 },
    ],
  };

  const interpolate = (from, to, amount) => from + (to - from) * amount;

  const horizontalViewportBounds = (gallery, itemWidth, margin = HOME_SCATTER_VIEWPORT_MARGIN) => {
    const width = gallery.clientWidth;
    const rect = gallery.getBoundingClientRect();
    const viewportWidth = window.innerWidth || document.documentElement.clientWidth || width;
    const minX = Math.max(margin, margin - rect.left);
    const maxX = Math.min(
      Math.max(margin, width - itemWidth - margin),
      viewportWidth - margin - rect.left - itemWidth,
    );

    if (maxX <= minX) {
      const fallback = Math.max(margin, Math.min(width - itemWidth - margin, minX));
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
      const margin = 18;
      const galleryRect = gallery.getBoundingClientRect();
      const viewportWidth = window.innerWidth || document.documentElement.clientWidth || width;
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 800;
      const height = Math.max(460, Math.min(760, viewportHeight - 180));
      const safeZoneWidth = clamp(width * 0.38, 320, 520);
      const safeZoneHeight = clamp(height * 0.34, 220, 320);
      const maxBySide = (width - safeZoneWidth - margin * 4) / 2;
      const maxByRows = (height - safeZoneHeight - margin * 4) / 2;
      const sizeFromCount = count >= 5 ? 180 : count === 4 ? 195 : count === 3 ? 210 : 225;
      const baseSize = Math.max(140, Math.min(sizeFromCount, maxBySide, maxByRows * 1.1));
      const pattern = HOME_SCATTER_PATTERNS[Math.min(count, 5)] || HOME_SCATTER_PATTERNS[5];
      const safeGapX = clamp(width * 0.035, 24, 44);
      const safeGapY = clamp(height * 0.04, 18, 40);
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
        const imgW = baseSize;
        const imgH = baseSize;
        const { minX, maxX } = horizontalViewportBounds(gallery, imgW, margin);
        const maxY = Math.max(margin, height - imgH - margin);
        const leftSafeX = clamp(safeLeft - imgW - safeGapX, minX, maxX);
        const rightSafeX = clamp(safeRight + safeGapX, minX, maxX);
        const topSafeY = clamp(safeTop - imgH - safeGapY, margin, maxY);
        const bottomSafeY = clamp(safeBottom + safeGapY, margin, maxY);
        const anchor = pattern[index] || pattern[pattern.length - 1];
        const jitterRange = Math.min(20, Math.round(baseSize * 0.08));
        const jitterX = (Math.random() - 0.5) * jitterRange;
        const jitterY = (Math.random() - 0.5) * jitterRange;
        const xDepth = anchor.xDepth ?? 0.72;
        const yDepth = anchor.yDepth ?? 0.66;
        let x = axisPositionWithinSafeLanes({
          nearEdge: anchor.xSide === 'left' ? minX : maxX,
          nearSafe: anchor.xSide === 'left' ? leftSafeX : rightSafeX,
          depth: xDepth,
          jitter: jitterX,
          min: minX,
          max: maxX,
        });
        let y = axisPositionWithinSafeLanes({
          nearEdge: anchor.ySide === 'top' ? margin : maxY,
          nearSafe: anchor.ySide === 'top' ? topSafeY : bottomSafeY,
          depth: yDepth,
          jitter: jitterY,
          min: margin,
          max: maxY,
        });
        let candidate = { x, y, w: imgW, h: imgH };

        for (let attempt = 0; attempt < 18 && placed.some((item) => overlaps(candidate, item, 22)); attempt += 1) {
          const shift = Math.max(12, Math.round(baseSize * 0.12));
          const direction = attempt % 2 === 0 ? 1 : -1;
          const nextX = clamp(candidate.x + direction * shift, minX, maxX);
          const nextY = clamp(candidate.y + (attempt < 8 ? shift : -shift), margin, Math.max(margin, height - imgH - margin));
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

  const setupDrag = () => {
    const images = document.querySelectorAll('.page-home .project-gallery img');
    if (!images.length) return;

    let zCounter = 10;
    const clearGrabbed = () => {
      images.forEach((img) => {
        img.dataset.grabbed = 'false';
        img.classList.remove('is-grabbed');
        img.classList.remove('is-dragging');
        img.style.touchAction = 'pan-y';
      });
    };

    clearGrabbed();

    images.forEach((img) => {
      img.addEventListener('dragstart', (event) => event.preventDefault());
      img.addEventListener('pointerdown', (event) => {
        const gallery = img.closest('.project-gallery');
        if (!gallery) return;
        if (event.button !== 0) return;

        if (img.dataset.grabbed !== 'true') {
          clearGrabbed();
          img.dataset.grabbed = 'true';
          img.classList.add('is-grabbed');
          img.style.touchAction = 'none';
          img.style.zIndex = String(zCounter++);
          return;
        }

        img.setPointerCapture(event.pointerId);
        img.classList.add('is-dragging');
        img.style.zIndex = String(zCounter++);

        const galleryRect = gallery.getBoundingClientRect();
        const imgRect = img.getBoundingClientRect();
        const offsetX = event.clientX - imgRect.left;
        const offsetY = event.clientY - imgRect.top;
        const startX = event.clientX;
        const startY = event.clientY;
        let hasMoved = false;

        const onMove = (moveEvent) => {
          if (!hasMoved) {
            const dx = moveEvent.clientX - startX;
            const dy = moveEvent.clientY - startY;
            if (Math.hypot(dx, dy) < 1) {
              return;
            }
            hasMoved = true;
          }
          const width = img.offsetWidth;
          const height = img.offsetHeight;
          const { minX, maxX } = horizontalViewportBounds(gallery, width, 0);
          const maxY = Math.max(0, gallery.clientHeight - height);
          const nextX = clamp(moveEvent.clientX - galleryRect.left - offsetX, minX, maxX);
          const nextY = clamp(moveEvent.clientY - galleryRect.top - offsetY, 0, maxY);
          img.style.left = `${Math.round(nextX)}px`;
          img.style.top = `${Math.round(nextY)}px`;
        };

        const onUp = () => {
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
        clearGrabbed();
      }
    });
  };

  const homeGalleries = document.querySelectorAll('.page-home .project-gallery');
  if (homeGalleries.length) {
    homeGalleries.forEach(setupScatterGallery);
    setupDrag();
  }

  const insertGalleryGaps = () => {
    if (!document.body.classList.contains('page-detail')) return;
    document.querySelectorAll('.detail-gallery').forEach((gallery) => {
      if (gallery.querySelector('.detail-gap')) return;
      const figures = Array.from(gallery.querySelectorAll('figure'));
      if (figures.length < 6) return;
      const gapCount = Math.min(3, Math.floor(figures.length / 6));
      if (!gapCount) return;
      const step = Math.floor(figures.length / (gapCount + 1));
      const positions = [];
      for (let i = 1; i <= gapCount; i += 1) {
        positions.push(i * step);
      }
      positions.reverse().forEach((position) => {
        const gap = document.createElement('div');
        gap.className = 'detail-gap';
        gap.setAttribute('aria-hidden', 'true');
        gap.setAttribute('role', 'presentation');
        const anchor = figures[position - 1];
        if (anchor && anchor.parentNode === gallery) {
          anchor.insertAdjacentElement('afterend', gap);
        } else {
          gallery.appendChild(gap);
        }
      });
    });
  };

  const markWideGalleryImages = () => {
    if (!document.body.classList.contains('page-detail') && !document.body.classList.contains('page-archive')) return;
    document.querySelectorAll('.detail-gallery figure').forEach((figure) => {
      const img = figure.querySelector('img');
      if (!img) return;
      const apply = () => {
        if (!img.naturalWidth || !img.naturalHeight) return;
        const ratio = img.naturalWidth / img.naturalHeight;
        if (ratio >= 1.45) {
          figure.classList.add('is-wide');
        }
      };
      if (img.complete) {
        apply();
      } else {
        img.addEventListener('load', apply, { once: true });
      }
    });
  };

  const setupLightbox = () => {
    const isDetailPage = document.body.classList.contains('page-detail');
    const isArchivePage = document.body.classList.contains('page-archive');
    if (!isDetailPage && !isArchivePage) return;
    if (window.innerWidth <= 900) return;

    const selector = isDetailPage
      ? '.detail-gallery img'
      : '.archive-entry-gallery img';
    const images = Array.from(document.querySelectorAll(selector));
    if (!images.length) return;

    const lightbox = document.createElement('div');
    lightbox.className = 'image-lightbox';
    lightbox.innerHTML = `
      <button class="lightbox-control lightbox-control--prev" type="button" aria-label="Previous image">
        <span aria-hidden="true">&lt;</span>
      </button>
      <img alt="Enlarged project image">
      <button class="lightbox-control lightbox-control--next" type="button" aria-label="Next image">
        <span aria-hidden="true">&gt;</span>
      </button>
    `;
    document.body.appendChild(lightbox);
    const lightboxImg = lightbox.querySelector('img');
    const prevButton = lightbox.querySelector('.lightbox-control--prev');
    const nextButton = lightbox.querySelector('.lightbox-control--next');
    let currentIndex = 0;

    const isOpen = () => lightbox.classList.contains('is-visible');

    const close = () => {
      lightbox.classList.remove('is-visible');
      lightboxImg.removeAttribute('src');
      document.body.classList.remove('overlay-open');
    };

    const showAt = (index) => {
      if (!images.length) return;
      currentIndex = (index + images.length) % images.length;
      const img = images[currentIndex];
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt || (isArchivePage ? 'Archive image' : 'Project image');
      lightbox.classList.add('is-visible');
      document.body.classList.add('overlay-open');
    };

    images.forEach((img, index) => {
      img.addEventListener('click', () => {
        showAt(index);
      });
    });

    prevButton.addEventListener('click', (event) => {
      event.stopPropagation();
      showAt(currentIndex - 1);
    });

    nextButton.addEventListener('click', (event) => {
      event.stopPropagation();
      showAt(currentIndex + 1);
    });

    lightboxImg.addEventListener('click', (event) => {
      event.stopPropagation();
      close();
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
    });
  };

  const setupPdfOverlay = () => {
    if (!document.body.classList.contains('page-detail')) return;
    const pdfLinks = Array.from(document.querySelectorAll('.detail-files a[href$=".pdf"], .detail-files a[href$=".PDF"]'));
    if (!pdfLinks.length) return;

    const overlay = document.createElement('div');
    overlay.className = 'pdf-lightbox';
    overlay.setAttribute('aria-hidden', 'true');
    overlay.innerHTML = `
      <div class="pdf-lightbox__panel" role="dialog" aria-modal="true" aria-label="PDF preview">
        <button class="pdf-lightbox__close" type="button" aria-label="Close PDF">Close</button>
        <iframe class="pdf-lightbox__frame" title="PDF preview"></iframe>
      </div>
    `;
    document.body.appendChild(overlay);

    const frame = overlay.querySelector('.pdf-lightbox__frame');
    const closeButton = overlay.querySelector('.pdf-lightbox__close');

    const isOpen = () => overlay.classList.contains('is-visible');

    const open = (href, label) => {
      frame.src = href;
      frame.setAttribute('title', label || 'PDF preview');
      overlay.classList.add('is-visible');
      overlay.setAttribute('aria-hidden', 'false');
      document.body.classList.add('overlay-open');
    };

    const close = () => {
      overlay.classList.remove('is-visible');
      overlay.setAttribute('aria-hidden', 'true');
      frame.removeAttribute('src');
      document.body.classList.remove('overlay-open');
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
    };

    const resetPosition = () => {
      portrait.classList.remove('is-revealing');
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

  insertGalleryGaps();
  markWideGalleryImages();
  setupLightbox();
  setupPdfOverlay();
  setupAboutPortraitReveal();
})();
