/* Nav scroll shadow */
window.addEventListener('scroll', () => {
  document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 20);
  closeMobileMenu();
});

/* Back to top button */
const backToTopBtn = document.getElementById('backToTop');
if (backToTopBtn) {
  window.addEventListener('scroll', () => {
    backToTopBtn.classList.toggle('visible', window.scrollY > window.innerHeight * 0.6);
  });
}

/* Active nav link highlighting (only matters on pages with matching section ids) */
const navSections = Array.from(document.querySelectorAll('section[id]'));
const navLinkEls = Array.from(document.querySelectorAll('.nav-links a, .mobile-menu a'));
function setActiveNav(id) {
  navLinkEls.forEach(a => {
    const href = a.getAttribute('href') || '';
    a.classList.toggle('active', href === '#' + id || href.endsWith('#' + id));
  });
}
if (navSections.length) {
  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) setActiveNav(entry.target.id);
    });
  }, { rootMargin: '-40% 0px -55% 0px', threshold: 0 });
  navSections.forEach(section => navObserver.observe(section));
}

/* Mobile menu */
function toggleMobileMenu() {
  document.getElementById('mobileMenu').classList.toggle('open');
}
function closeMobileMenu() {
  document.getElementById('mobileMenu').classList.remove('open');
}

/* Apply default gallery sort on load (no-op if no .gallery on the page) */
document.addEventListener('DOMContentLoaded', applyGallerySort);

/* Tabs (gallery page only) */
function switchTab(tab, el) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  document.getElementById('sfw-panel').style.display  = tab === 'sfw'  ? 'block' : 'none';
  document.getElementById('nsfw-panel').style.display = tab === 'nsfw' ? 'block' : 'none';
  applyGalleryFilter();
  applyGallerySort();
}

/* NSFW unlock (gallery page only) */
function unlockNSFW() {
  document.getElementById('nsfw-gate').style.display    = 'none';
  document.getElementById('nsfw-gallery').style.display = 'block';
  applyGalleryFilter();
  applyGallerySort();
}

/* Gallery filter (search by title) */
function applyGalleryFilter() {
  const searchEl = document.getElementById('gallery-search');
  if (!searchEl) return;
  const query = searchEl.value.trim().toLowerCase();
  document.querySelectorAll('.gallery').forEach(gallery => {
    let anyVisible = false;
    gallery.querySelectorAll('.gallery-item').forEach(item => {
      const title = item.querySelector('.caption-title')?.textContent.toLowerCase() || '';
      const match = title.includes(query);
      item.style.display = match ? '' : 'none';
      if (match) anyVisible = true;
    });
    const emptyMsg = gallery.parentElement.querySelector('.gallery-empty');
    if (emptyMsg) emptyMsg.style.display = anyVisible ? 'none' : 'block';
  });
}

/* Gallery sort (newest / oldest / title A–Z) */
function applyGallerySort() {
  const sortEl = document.getElementById('gallery-sort');
  const mode = sortEl ? sortEl.value : 'newest';
  document.querySelectorAll('.gallery').forEach(gallery => {
    const items = Array.from(gallery.children).filter(el => el.classList.contains('gallery-item'));
    items.sort((a, b) => {
      const dateA = a.dataset.date ? new Date(a.dataset.date).getTime() : (parseInt(a.querySelector('.caption-year')?.textContent) || 0) * 10000;
      const dateB = b.dataset.date ? new Date(b.dataset.date).getTime() : (parseInt(b.querySelector('.caption-year')?.textContent) || 0) * 10000;
      const titleA = a.querySelector('.caption-title')?.textContent.toLowerCase() || '';
      const titleB = b.querySelector('.caption-title')?.textContent.toLowerCase() || '';
      if (mode === 'newest') return dateB - dateA;
      if (mode === 'oldest') return dateA - dateB;
      if (mode === 'az') return titleA.localeCompare(titleB);
      return 0;
    });
    items.forEach(item => gallery.appendChild(item));
  });
}

/* Accordion */
function toggleAccordion(btn) {
  const item = btn.parentElement;
  const isOpen = item.classList.contains('open');
  document.querySelectorAll('.accordion-item').forEach(i => i.classList.remove('open'));
  if (!isOpen) item.classList.add('open');
}

/* Lightbox Open */
function openLightbox(el) {
  const img = el.querySelector('img');
  const svg = el.querySelector('svg');
  const titleEl = el.querySelector('.caption-title');
  const yearEl = el.querySelector('.caption-year');

  const box = document.getElementById('lightbox-content');
  const title = titleEl?.textContent || '';
  const year = yearEl?.textContent || '';

  box.innerHTML = '';

  const clone = (img || svg)?.cloneNode(true);
  if (clone) {
    clone.removeAttribute('style');
    clone.className = '';

    clone.style.position = 'relative';
    clone.style.width = 'auto';
    clone.style.height = 'auto';
    clone.style.maxWidth = '70vw';
    clone.style.maxHeight = '55vh';
    clone.style.display = 'block';
    clone.style.objectFit = 'contain';

    box.appendChild(clone);
  }

  document.getElementById('lightbox-title').textContent = title;
  document.getElementById('lightbox-year').textContent = year;

  document.getElementById('lightbox').classList.add('open');
  document.body.style.overflow = 'hidden';
}

/* Lightbox Close */
function closeLightbox(e) {
  if (!e || e.target === document.getElementById('lightbox') || e.target.classList.contains('lightbox-close')) {
    document.getElementById('lightbox').classList.remove('open');
    document.body.style.overflow = '';
  }
}

/* Escape Key Listener for Lightbox */
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    closeLightbox();
  }
});
