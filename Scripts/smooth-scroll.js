// Smooth, gliding scroll ("as if on ice") for mouse wheels and trackpads, using Lenis.
// Phones keep their own native momentum scrolling. Skipped when the visitor prefers reduced motion.
(() => {
  if (typeof window.Lenis !== 'function') return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const lenis = new window.Lenis({
    lerp: 0.12, // lower = longer glide; 0.12 is a short, subtle glide
    wheelMultiplier: 1,
    smoothWheel: true,
    syncTouch: false,
    // Panels that scroll on their own (project information, project rail, image and PDF viewers)
    // keep normal scrolling.
    prevent: (node) => Boolean(node.closest?.('.image-lightbox, .pdf-lightbox, .project-information, .project-rail, .rail-preview, [data-lenis-prevent]')),
  });
  window.siteLenis = lenis;

  const raf = (time) => {
    lenis.raf(time);
    window.requestAnimationFrame(raf);
  };
  window.requestAnimationFrame(raf);

  // Image viewer and PDF viewer: stop the page from gliding underneath.
  const syncOverlay = () => {
    if (document.body.classList.contains('overlay-open')) lenis.stop();
    else lenis.start();
  };
  new MutationObserver(syncOverlay).observe(document.body, { attributes: true, attributeFilter: ['class'] });

  // Links to a place on the same page (e.g. the showreel arrow) glide there too.
  document.addEventListener('click', (event) => {
    const link = event.target.closest?.('a[href^="#"]');
    if (!link || event.defaultPrevented) return;
    const id = decodeURIComponent(link.getAttribute('href').slice(1));
    const target = id ? document.getElementById(id) : null;
    if (!target) return;
    event.preventDefault();
    lenis.scrollTo(target, { offset: 0 });
    history.replaceState(null, '', `#${id}`);
  });
})();
