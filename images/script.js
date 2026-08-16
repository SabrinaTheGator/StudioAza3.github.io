/* Nav scroll shadow */
window.addEventListener('scroll', () => {
  document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 20);
  closeMobileMenu();
});

/* ─── Scroll-reveal for cards & section intros ─── */
document.addEventListener('DOMContentLoaded', () => {
  const revealTargets = document.querySelectorAll(
    '.gallery-item, .contact-card, .social-card, .accordion-item, .comm-image, .patreon-box, .comm-left, .terms-left, .portfolio-header, .tier-card, .addons-box, .estimate-box, .terms-mini, .rates-preview, .rates-info, .review-image, .review-text-card'
  );

  // Stagger items that share a parent grid/row so they cascade in rather than popping at once
  const groups = new Map();
  revealTargets.forEach(el => {
    el.classList.add('reveal');
    const parent = el.parentElement;
    if (!groups.has(parent)) groups.set(parent, []);
    groups.get(parent).push(el);
  });
  groups.forEach(siblings => {
    siblings.forEach((el, i) => {
      el.style.animationDelay = Math.min(i * 70, 350) + 'ms';
    });
  });

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
    revealTargets.forEach(el => revealObserver.observe(el));
  } else {
    revealTargets.forEach(el => el.classList.add('in-view'));
  }
});

/* ─── Magnetic hover for primary buttons ─── */
document.querySelectorAll('.btn-primary').forEach(btn => {
  btn.addEventListener('mousemove', (e) => {
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    btn.style.transform = `translate(${x * 0.12}px, ${y * 0.25}px)`;
  });
  btn.addEventListener('mouseleave', () => {
    btn.style.transform = '';
  });
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

/* ─── Commission Builder (commission.html only — no-ops elsewhere) ───
   Tier prices now depend on which rate type (Sketch / Fully Rendered) is
   selected up in the Commission Rates tabs — Sketch is cheaper. */
const TIER_DATA = {
  bust:  { price: { sketch: 10,   rendered: 20 }, plus: false },
  waist: { price: { sketch: 12.5, rendered: 25 }, plus: false },
  thigh: { price: { sketch: 15,   rendered: 30 }, plus: false },
  full:  { price: { sketch: 25,   rendered: 50 }, plus: true  }
};

/* Format a price for display — whole numbers show plain, anything with
   cents shows two decimal places (e.g. 12.5 -> "12.50") */
function formatPrice(n) {
  return Number.isInteger(n) ? String(n) : n.toFixed(2);
}
const ADDON_DATA = {
  newpose:  { quote: true },
  complex:  { flat: [10, 15] },
  extra:    { pct: 0.5 },
  rush:     { pct: [0.3, 0.5] } ,
  simple:  { flat: [3, 5] } ,
  major:  { flat: [10, 15] } ,
};

let selectedRateType = 'rendered'; // matches the tab marked "active" in the HTML

function selectTier(card) {
  document.querySelectorAll('.tier-card').forEach(c => {
    c.classList.remove('selected');
    c.querySelector('.tier-pick').firstChild.textContent = 'Pick this ';
  });
  card.classList.add('selected');
  card.querySelector('.tier-pick').firstChild.textContent = 'Selected ';
  updateEstimate();
}

function toggleAddon(pill) {
  pill.classList.toggle('active');
  updateEstimate();
}

/* Refresh every tier card's displayed price for the currently selected rate type */
function updateTierPrices() {
  document.querySelectorAll('.tier-card').forEach(card => {
    const tier = TIER_DATA[card.dataset.tier];
    if (!tier) return;
    const priceEl = card.querySelector('.tier-price');
    if (priceEl) priceEl.textContent = '$' + formatPrice(tier.price[selectedRateType]) + (tier.plus ? '+' : '');
  });
}

function updateEstimate() {
  const tierEl = document.querySelector('.tier-card.selected');
  if (!tierEl) return;
  const tier = TIER_DATA[tierEl.dataset.tier];
  const tierName = tierEl.querySelector('.tier-title').textContent;
  const basePrice = tier.price[selectedRateType];
  let total = basePrice;
  let hasQuote = false;
  let hasAddonAdjustment = false;

  document.querySelectorAll('.addon-pill.active').forEach(pill => {
    const addon = ADDON_DATA[pill.dataset.addon];
    if (!addon) return;
    if (addon.quote) { hasQuote = true; return; }
    hasAddonAdjustment = true;
    if (addon.pct !== undefined) {
      const pct = Array.isArray(addon.pct) ? (addon.pct[0] + addon.pct[1]) / 2 : addon.pct;
      total += basePrice * pct;
    }
    if (addon.flat) {
      total += (addon.flat[0] + addon.flat[1]) / 2;
    }
  });

  // Only round to the nearest $5 once add-ons actually move the price —
  // otherwise this was clobbering exact base prices (e.g. $12.50 sketch).
  if (hasAddonAdjustment) {
    total = Math.round(total / 5) * 5;
  }
  const plus = tier.plus || hasQuote;

  const priceEl = document.getElementById('estimate-price');
  const subEl = document.getElementById('estimate-sub-tier');
  const typeEl = document.getElementById('estimate-sub-type');
  const displayPrice = '$' + formatPrice(total) + (plus ? '+' : '');
  const rateTitle = RATE_DATA[selectedRateType]?.title || '';
  if (priceEl) priceEl.textContent = displayPrice;
  if (subEl) subEl.textContent = tierName;
  if (typeEl) typeEl.textContent = rateTitle;

  const cta = document.getElementById('estimate-cta');
  if (cta) {
    cta.href = '#inquiry';
  }

  // Keep the inquiry form's live summary card in sync with the price board
  const sumType = document.getElementById('inquiry-summary-type');
  const sumTier = document.getElementById('inquiry-summary-tier');
  const sumPrice = document.getElementById('inquiry-summary-price');
  const sumInput = document.getElementById('inquiry-summary-input');
  if (sumType) sumType.textContent = rateTitle;
  if (sumTier) sumTier.textContent = tierName;
  if (sumPrice) sumPrice.textContent = displayPrice;
  if (sumInput) sumInput.value = rateTitle + ' · ' + tierName + ' · est. ' + displayPrice;

  // Keep the "Commission type" pill in the inquiry form aligned with the active rate tab
  const matchingPill = document.getElementById(selectedRateType === 'sketch' ? 'ctype-sketch' : 'ctype-rendered');
  if (matchingPill) matchingPill.checked = true;
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.querySelector('.tier-grid')) {
    updateTierPrices();
    updateEstimate();
  }
});

/* ─── Commission Rates tabs (commission.html only — no-ops elsewhere) ─── */
const RATE_DATA = {
  sketch:   { tag: 'Sketch Sample',         title: 'Sketch',         desc: 'Clean linework, no rendering' },
  rendered: { tag: 'Fully Rendered Sample', title: 'Fully Rendered', desc: 'Full colour, lighting and polish' }
};

function selectRateTab(btn) {
  document.querySelectorAll('.rates-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');

  selectedRateType = btn.dataset.rate;

  const data = RATE_DATA[btn.dataset.rate];
  if (data) {
    document.getElementById('rates-preview-tag').textContent = data.tag;
    document.getElementById('rates-info-title').textContent = data.title;
    document.getElementById('rates-info-desc').textContent = data.desc;
  }

  document.querySelectorAll('.rates-preview-slot').forEach(slot => {
    slot.classList.toggle('active', slot.dataset.rateSlot === btn.dataset.rate);
  });

  updateTierPrices();
  updateEstimate();
}

/* ─── Inquiry form (any page with #inquiry-form — commission.html, inquiry.html) ─── */

/* Deadline pills — reveal a text field when "Custom" is picked */
function toggleDeadlineCustom() {
  const custom = document.querySelector('input[name="deadline"]:checked');
  const field = document.getElementById('inquiry-deadline-custom');
  if (!custom || !field) return;
  field.style.display = custom.value === 'Custom' ? 'block' : 'none';
  if (custom.value !== 'Custom') field.value = '';
}

/* NSFW pills — reveal the 18+ confirmation checkbox when "Yes" is picked */
function toggleNsfwConfirm() {
  const picked = document.querySelector('input[name="nsfw"]:checked');
  const wrap = document.getElementById('nsfw-confirm');
  const checkbox = document.getElementById('nsfw-age-confirm');
  if (!picked || !wrap || !checkbox) return;
  const isYes = picked.value === 'Yes';
  wrap.style.display = isYes ? 'block' : 'none';
  checkbox.required = isYes;
  if (!isYes) checkbox.checked = false;
}

/* Brief textarea — live "x / 50 minimum" counter */
function updateBriefCount() {
  const textarea = document.getElementById('inquiry-desc');
  const counter = document.getElementById('inquiry-desc-count');
  if (!textarea || !counter) return;
  const len = textarea.value.length;
  const min = 50;
  counter.textContent = len + ' / ' + min + ' minimum';
  counter.classList.toggle('valid', len >= min);
}

/* Drag-and-drop reference image dropzones (visual only — the underlying
   <input type="file"> still drives the actual form submission) */
function initDropzone(zoneId, inputId, listId) {
  const zone = document.getElementById(zoneId);
  const input = document.getElementById(inputId);
  const list = document.getElementById(listId);
  if (!zone || !input) return;

  function renderFiles() {
    if (!list) return;
    if (!input.files || input.files.length === 0) {
      list.textContent = '';
      return;
    }
    const names = Array.from(input.files).map(f => f.name);
    list.textContent = names.length + (names.length === 1 ? ' file: ' : ' files: ') + names.join(', ');
  }

  input.addEventListener('change', renderFiles);

  ['dragenter', 'dragover'].forEach(evt => {
    zone.addEventListener(evt, e => {
      e.preventDefault();
      zone.classList.add('dragover');
    });
  });
  ['dragleave', 'drop'].forEach(evt => {
    zone.addEventListener(evt, e => {
      e.preventDefault();
      zone.classList.remove('dragover');
    });
  });
  zone.addEventListener('drop', e => {
    if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length) {
      input.files = e.dataTransfer.files;
      renderFiles();
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initDropzone('inquiry-refs-zone', 'inquiry-refs', 'inquiry-refs-files');
  initDropzone('inquiry-pose-zone', 'inquiry-pose', 'inquiry-pose-files');
  updateBriefCount();
  toggleNsfwConfirm();
});

document.addEventListener('DOMContentLoaded', () => {
  const inquiryForm = document.getElementById('inquiry-form');
  if (!inquiryForm) return;

  // Show a "sent" confirmation if we've just bounced back from FormSubmit
  const params = new URLSearchParams(window.location.search);
  if (params.get('sent') === 'true') {
    const statusEl = document.getElementById('inquiry-status');
    if (statusEl) {
      statusEl.textContent = "Sent! I'll get back to you soon.";
      statusEl.classList.add('inquiry-status-success');
    }
    // clean the URL so refreshing doesn't re-show the message
    window.history.replaceState({}, document.title, window.location.pathname);
  }

  inquiryForm.addEventListener('submit', function () {
    const submitBtn = document.getElementById('inquiry-submit');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending…';
    }
  });
});
