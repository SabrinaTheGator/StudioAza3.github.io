/* Nav scroll shadow */
window.addEventListener('scroll', () => {
  document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 20);
  closeMobileMenu();
});

/* ─── Scroll-reveal for cards & section intros ─── */
document.addEventListener('DOMContentLoaded', () => {
  const revealTargets = document.querySelectorAll(
    '.gallery-item, .contact-card, .footer-link-pill, .accordion-item, .comm-image, .patreon-box, .comm-left, .terms-left, .portfolio-header, .tier-card, .addons-box, .estimate-box, .terms-mini, .rates-preview, .rates-info, .review-image, .review-text-card, .about-content, .about-media'
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
  bust:  { price: { sketch: 10,   flat: 15,    rendered: 20 }, plus: false },
  waist: { price: { sketch: 12.5, flat: 18.75, rendered: 25 }, plus: false },
  thigh: { price: { sketch: 15,   flat: 22.5,  rendered: 30 }, plus: false },
  full:  { price: { sketch: 25,   flat: 37.5,  rendered: 50 }, plus: true  },
  chibi: { price: { sketch: 8,    flat: 12,    rendered: 16 }, plus: false }
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

/* ─── Commission Rates tabs (commission.html only — no-ops elsewhere) ─── */
const RATE_DATA = {
  sketch:   { tag: 'Full Body Sketch Sample',         title: 'Sketch',      desc: 'Clean linework, no rendering' },
  flat:     { tag: 'Flat Color Thigh Up Sample',     title: 'Flat Color',  desc: 'Flat, even color — no shading or lighting' },
  rendered: { tag: 'Fully Rendered Bust Sample', title: 'Fully Rendered', desc: 'Full colour, lighting and polish' }
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
  // Tracks the true minimum this stack could cost using each addon's
  // advertised floor (e.g. Simple Alterations' "+$3"), so rounding below
  // can't ever undercut what was promised on the pill itself.
  let minTotal = basePrice;
  let hasQuote = false;
  let hasAddonAdjustment = false;

  document.querySelectorAll('.addon-pill.active').forEach(pill => {
    const addon = ADDON_DATA[pill.dataset.addon];
    if (!addon) return;
    if (addon.quote) { hasQuote = true; return; }
    hasAddonAdjustment = true;
    if (addon.pct !== undefined) {
      const pctRange = Array.isArray(addon.pct) ? addon.pct : [addon.pct, addon.pct];
      total += basePrice * ((pctRange[0] + pctRange[1]) / 2);
      minTotal += basePrice * pctRange[0];
    }
    if (addon.flat) {
      total += (addon.flat[0] + addon.flat[1]) / 2;
      minTotal += addon.flat[0];
    }
  });

  // Only round to the nearest $5 once add-ons actually move the price —
  // otherwise this was clobbering exact base prices (e.g. $12.50 sketch).
  if (hasAddonAdjustment) {
    total = Math.round(total / 5) * 5;
    // Bug fix: rounding to the nearest $5 could land BELOW an addon's
    // advertised minimum (e.g. Waist Up + Sketch + Simple Alterations
    // rounded down to a +$2.50 surcharge, undercutting the stated +$3
    // floor). Never let the rounded total dip under that floor.
    if (total < minTotal) total = minTotal;
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
  const ctypeIds = { sketch: 'ctype-sketch', flat: 'ctype-flat', rendered: 'ctype-rendered' };
  const matchingPill = document.getElementById(ctypeIds[selectedRateType] || 'ctype-rendered');
  if (matchingPill) matchingPill.checked = true;
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.querySelector('.tier-grid')) {
    updateTierPrices();
    updateEstimate();
  }
});

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

  // Replay the info panel's staggered fade-in every time the tab changes
  const infoBox = document.querySelector('.rates-info');
  if (infoBox) {
    infoBox.classList.remove('rates-info-flash');
    void infoBox.offsetWidth; // force reflow so the animation restarts
    infoBox.classList.add('rates-info-flash');
  }

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

/* ─── Auto-compress reference images so multi-image inquiries fit under
   FormSubmit's 10MB-combined attachment cap (it's a total across every
   file input on the form, not 10MB per file) ─── */

// Leave a safety margin under FormSubmit's real 10MB combined cap.
const MAX_TOTAL_UPLOAD_BYTES = 9 * 1024 * 1024;
let uploadProcessing = false;

function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return Math.round(bytes / 1024) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function fileListFrom(files) {
  const dt = new DataTransfer();
  files.forEach(f => dt.items.add(f));
  return dt.files;
}

function loadImageEl(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => resolve({ img, url });
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('decode failed')); };
    img.src = url;
  });
}

// Resize/re-encode a single image toward a target byte budget. Falls back
// to the original file untouched if it can't be decoded (e.g. HEIC in
// browsers without native support) or if it's already small enough.
async function compressImageFile(file, targetBytes) {
  if (!file.type || !file.type.startsWith('image/')) return file;
  if (file.size <= targetBytes) return file;

  let loaded;
  try {
    loaded = await loadImageEl(file);
  } catch (e) {
    return file;
  }
  const { img, url } = loaded;

  let width = img.naturalWidth;
  let height = img.naturalHeight;
  const maxDim = 2400;
  const scale = Math.min(1, maxDim / Math.max(width, height));
  width = Math.round(width * scale);
  height = Math.round(height * scale);

  let quality = 0.85;
  let blob = null;

  for (let attempt = 0; attempt < 8; attempt++) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, width, height);
    // eslint-disable-next-line no-await-in-loop
    blob = await new Promise(res => canvas.toBlob(res, 'image/jpeg', quality));
    if (!blob || blob.size <= targetBytes) break;
    if (quality > 0.45) {
      quality -= 0.12;
    } else {
      width = Math.round(width * 0.82);
      height = Math.round(height * 0.82);
    }
    if (width < 500 || height < 500) break; // keep it usable as a reference
  }

  URL.revokeObjectURL(url);
  if (!blob || blob.size >= file.size) return file;

  const newName = file.name.replace(/\.[^.]+$/, '') + '.jpg';
  return new File([blob], newName, { type: 'image/jpeg', lastModified: Date.now() });
}

// Re-checks both file inputs together, compresses anything oversized, and
// updates the on-page size readout — this is what actually keeps the whole
// submission under FormSubmit's combined 10MB limit.
async function processAllFiles() {
  const refsInput = document.getElementById('inquiry-refs');
  const poseInput = document.getElementById('inquiry-pose');
  const refsList = document.getElementById('inquiry-refs-files');
  const poseList = document.getElementById('inquiry-pose-files');
  const statusEl = document.getElementById('inquiry-upload-status');
  if (!refsInput) return;

  const refFiles = refsInput.files ? Array.from(refsInput.files) : [];
  const poseFiles = poseInput && poseInput.files ? Array.from(poseInput.files) : [];
  const totalCount = refFiles.length + poseFiles.length;

  if (totalCount === 0) {
    if (refsList) refsList.textContent = '';
    if (poseList) poseList.textContent = '';
    if (statusEl) { statusEl.textContent = ''; statusEl.className = 'inq-upload-status'; }
    return;
  }

  uploadProcessing = true;
  if (statusEl) {
    statusEl.textContent = 'Optimizing images…';
    statusEl.className = 'inq-upload-status compressing';
  }

  const perFileTarget = Math.max(
    400 * 1024,
    Math.min(4 * 1024 * 1024, MAX_TOTAL_UPLOAD_BYTES / totalCount)
  );

  const [compressedRefs, compressedPose] = await Promise.all([
    Promise.all(refFiles.map(f => compressImageFile(f, perFileTarget))),
    Promise.all(poseFiles.map(f => compressImageFile(f, perFileTarget)))
  ]);

  refsInput.files = fileListFrom(compressedRefs);
  if (poseInput) poseInput.files = fileListFrom(compressedPose);

  function renderList(list, files) {
    if (!list) return;
    if (!files.length) { list.textContent = ''; return; }
    const parts = files.map(f => f.name + ' (' + formatBytes(f.size) + ')');
    list.textContent = files.length + (files.length === 1 ? ' file: ' : ' files: ') + parts.join(', ');
  }
  renderList(refsList, compressedRefs);
  renderList(poseList, compressedPose);

  const totalBytes = compressedRefs.reduce((s, f) => s + f.size, 0) +
                      compressedPose.reduce((s, f) => s + f.size, 0);

  if (statusEl) {
    if (totalBytes > MAX_TOTAL_UPLOAD_BYTES) {
      statusEl.textContent = 'Combined size ' + formatBytes(totalBytes) + ' is still too big for email — remove an image or two.';
      statusEl.className = 'inq-upload-status error';
    } else {
      statusEl.textContent = 'Combined upload size: ' + formatBytes(totalBytes) + ' (auto-optimized to fit)';
      statusEl.className = 'inq-upload-status valid';
    }
  }

  uploadProcessing = false;
}

/* Drag-and-drop reference image dropzones — visual handling plus triggering
   the auto-compression pass above whenever files are picked or dropped */
function initDropzone(zoneId, inputId) {
  const zone = document.getElementById(zoneId);
  const input = document.getElementById(inputId);
  if (!zone || !input) return;

  input.addEventListener('change', () => { processAllFiles(); });

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
      processAllFiles();
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initDropzone('inquiry-refs-zone', 'inquiry-refs');
  initDropzone('inquiry-pose-zone', 'inquiry-pose');
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

  inquiryForm.addEventListener('submit', function (e) {
    const submitBtn = document.getElementById('inquiry-submit');
    const statusEl = document.getElementById('inquiry-status');

    // If a compression pass is still running, don't let a stale/oversized
    // file slip through — ask the user to try again in a moment.
    if (uploadProcessing) {
      e.preventDefault();
      if (statusEl) {
        statusEl.textContent = 'Still optimizing your images — hit send again in a second.';
        statusEl.classList.add('inquiry-status-error');
      }
      return;
    }

    // Final safety check across both file inputs combined.
    const refsInput = document.getElementById('inquiry-refs');
    const poseInput = document.getElementById('inquiry-pose');
    const refFiles = refsInput && refsInput.files ? Array.from(refsInput.files) : [];
    const poseFiles = poseInput && poseInput.files ? Array.from(poseInput.files) : [];
    const totalBytes = refFiles.reduce((s, f) => s + f.size, 0) + poseFiles.reduce((s, f) => s + f.size, 0);

    if (totalBytes > MAX_TOTAL_UPLOAD_BYTES) {
      e.preventDefault();
      if (statusEl) {
        statusEl.textContent = 'Your images total ' + formatBytes(totalBytes) + ' — please remove one or two before sending.';
        statusEl.classList.add('inquiry-status-error');
      }
      return;
    }

    // FormSubmit only forwards ONE file per field name — if several files
    // share a name (which is what the "multiple" attribute naturally does),
    // every file after the first gets silently dropped. So instead of
    // submitting the visible multi-file inputs directly, give every image
    // its own uniquely-named hidden field right before the real POST.
    e.preventDefault();

    inquiryForm.querySelectorAll('.inq-generated-file-input').forEach(el => el.remove());

    function attachIndividually(files, baseName) {
      files.forEach((file, i) => {
        const hidden = document.createElement('input');
        hidden.type = 'file';
        hidden.name = files.length > 1 ? baseName + '_' + (i + 1) : baseName;
        hidden.style.display = 'none';
        hidden.className = 'inq-generated-file-input';
        const dt = new DataTransfer();
        dt.items.add(file);
        hidden.files = dt.files;
        inquiryForm.appendChild(hidden);
      });
    }

    attachIndividually(refFiles, 'character_reference');
    attachIndividually(poseFiles, 'pose_reference');

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending…';
    }

    // Bypass this same 'submit' listener (native .submit() doesn't re-fire
    // the 'submit' event) and perform the real POST with the newly built,
    // uniquely-named file fields in place.
    HTMLFormElement.prototype.submit.call(inquiryForm);
  });
});
