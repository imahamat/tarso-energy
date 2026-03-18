/* ============================================================
   TARSO ENERGY — Main JavaScript
   CMS-powered vanilla JS — no frameworks
   ============================================================ */

(function () {
  'use strict';

  /* ==========================================================
     0. CONFIGURATION
     ========================================================== */
  const CONFIG = {
    whatsappNumber: '23566000000',      // Replace with actual number
    whatsappDefaultMsg: 'Bonjour TARSO ENERGY, je suis intéressé(e) par vos solutions solaires.',
    navScrollThreshold: 50,
    animationRootMargin: '0px 0px -80px 0px',
    counterDuration: 2000,
    contentBase: 'content/',
  };

  /* ==========================================================
     1. CONTENT LOADER — CMS Integration
     ========================================================== */

  /**
   * Load site-wide settings from content/settings.json
   */
  async function loadSettings() {
    try {
      const res = await fetch(CONFIG.contentBase + 'settings.json');
      if (!res.ok) return null;
      const settings = await res.json();
      window.TARSO_SETTINGS = settings;

      // Apply settings to page
      if (settings.site_title) {
        document.title = settings.site_title;
      }
      if (settings.whatsapp_number) {
        CONFIG.whatsappNumber = settings.whatsapp_number;
        updateWhatsAppLinks();
      }
      return settings;
    } catch (e) {
      console.warn('Settings not loaded:', e.message);
      return null;
    }
  }

  /**
   * Update all WhatsApp links on the page
   */
  function updateWhatsAppLinks() {
    const links = document.querySelectorAll('a[href*="wa.me"], .whatsapp-float__btn');
    links.forEach(link => {
      if (link.tagName === 'A') {
        const msg = link.dataset.waMessage || CONFIG.whatsappDefaultMsg;
        link.href = `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(msg)}`;
      }
    });
  }

  /**
   * Load product cards from JSON files.
   * Uses a file list approach — pass an array of filenames.
   *
   * @param {string}   folder       - Subfolder under content/ (e.g. 'products/panneaux-solaires')
   * @param {string[]} fileNames    - Array of JSON filenames
   * @param {string}   containerId  - DOM element ID for the grid
   * @param {string}   [category]   - Optional data-category to assign
   */
  async function loadProductCards(folder, fileNames, containerId, category) {
    const container = document.getElementById(containerId);
    if (!container) return [];

    try {
      const products = await Promise.all(
        fileNames.map(f =>
          fetch(`${CONFIG.contentBase}${folder}/${f}`)
            .then(r => {
              if (!r.ok) throw new Error(`HTTP ${r.status}`);
              return r.json();
            })
            .catch(err => {
              console.warn(`Failed to load ${folder}/${f}:`, err.message);
              return null;
            })
        )
      );

      const validProducts = products.filter(Boolean);

      // Sort by price ascending
      validProducts.sort((a, b) => (a.price || 0) - (b.price || 0));

      validProducts.forEach(product => {
        const card = renderProductCard(product, category);
        container.insertAdjacentHTML('beforeend', card);
      });

      // Re-init lazy loading for new images
      initLazyLoading();

      return validProducts;
    } catch (e) {
      console.error('Error loading products:', e);
      return [];
    }
  }

  /**
   * Render a single product card as HTML string.
   */
  function renderProductCard(product, category) {
    const cat = category || product.category || '';
    const availability = product.availability || 'en_stock';
    const badgeClass = availability === 'en_stock' ? 'badge-stock' : 'badge-order';
    const badgeText = availability === 'en_stock' ? 'En Stock' : 'Sur Commande';

    const priceFormatted = product.price
      ? new Intl.NumberFormat('fr-FR').format(product.price) + ' FCFA'
      : 'Sur devis';

    const specsHtml = (product.specs || [])
      .map(s => `<li>${escapeHtml(s)}</li>`)
      .join('');

    const imageUrl = product.image || '';
    const imageSrc = imageUrl
      ? `data-src="${escapeHtml(imageUrl)}" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='260'%3E%3Crect fill='%23F0F2F5' width='400' height='260'/%3E%3Ctext x='200' y='130' text-anchor='middle' fill='%239BA3AE' font-size='14'%3EChargement...%3C/text%3E%3C/svg%3E" class="lazy"`
      : `src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='260'%3E%3Crect fill='%23F0F2F5' width='400' height='260'/%3E%3Ctext x='200' y='130' text-anchor='middle' fill='%239BA3AE' font-size='14'%3EImage%3C/text%3E%3C/svg%3E"`;

    const whatsappMsg = `Bonjour, je suis intéressé(e) par: ${product.title || 'votre produit'} (${priceFormatted})`;
    const whatsappUrl = `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(whatsappMsg)}`;

    return `
      <div class="product-card animate-on-scroll" data-category="${escapeHtml(cat)}">
        <div class="product-card__image">
          <img ${imageSrc} alt="${escapeHtml(product.title || '')}">
          <div class="product-card__badge">
            <span class="badge ${badgeClass}">${badgeText}</span>
            ${product.promo ? '<span class="badge badge-promo" style="margin-left:6px">Promo</span>' : ''}
          </div>
        </div>
        <div class="product-card__body">
          <h3 class="product-card__title">${escapeHtml(product.title || 'Produit')}</h3>
          ${product.description ? `<p style="font-size:0.85rem;color:#6B7380;margin-bottom:12px">${escapeHtml(product.description)}</p>` : ''}
          ${specsHtml ? `<ul class="product-card__specs">${specsHtml}</ul>` : ''}
          <div class="product-card__footer">
            <div class="product-card__price">
              ${priceFormatted}
              ${product.old_price ? `<small><s>${new Intl.NumberFormat('fr-FR').format(product.old_price)} FCFA</s></small>` : ''}
            </div>
            <a href="${whatsappUrl}" target="_blank" rel="noopener" class="btn btn-whatsapp btn-sm">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 00.611.611l4.458-1.495A11.943 11.943 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.315 0-4.458-.767-6.185-2.059l-.432-.326-2.782.932.932-2.782-.326-.432A9.935 9.935 0 012 12C2 6.486 6.486 2 12 2s10 4.486 10 10-4.486 10-10 10z"/></svg>
              Commander
            </a>
          </div>
        </div>
      </div>`;
  }

  /**
   * Load FAQ items from content/faq.json
   */
  async function loadFAQ(containerId) {
    const container = document.getElementById(containerId || 'faq-list');
    if (!container) return;

    try {
      const res = await fetch(CONFIG.contentBase + 'faq.json');
      if (!res.ok) return;
      const data = await res.json();
      const items = data.questions || data;

      if (!Array.isArray(items)) return;

      items.forEach(item => {
        const faqHtml = `
          <details class="faq-item animate-on-scroll">
            <summary>${escapeHtml(item.question)}</summary>
            <div class="faq-item__answer">${escapeHtml(item.answer)}</div>
          </details>`;
        container.insertAdjacentHTML('beforeend', faqHtml);
      });

      initScrollAnimations();
    } catch (e) {
      console.warn('FAQ not loaded:', e.message);
    }
  }

  /**
   * Load testimonials from content/testimonials.json
   */
  async function loadTestimonials(containerId) {
    const container = document.getElementById(containerId || 'testimonials-grid');
    if (!container) return;

    try {
      const res = await fetch(CONFIG.contentBase + 'testimonials.json');
      if (!res.ok) return;
      const data = await res.json();
      const testimonials = data.testimonials || data;

      if (!Array.isArray(testimonials)) return;

      testimonials.forEach(t => {
        const initials = (t.name || 'A')
          .split(' ')
          .map(w => w.charAt(0).toUpperCase())
          .slice(0, 2)
          .join('');

        const stars = t.rating
          ? '<div class="testimonial-card__stars">' + Array(t.rating).fill('&#9733;').join('') + '</div>'
          : '';

        const avatarContent = t.avatar
          ? `<img src="${escapeHtml(t.avatar)}" alt="${escapeHtml(t.name)}">`
          : initials;

        const html = `
          <div class="testimonial-card animate-on-scroll">
            ${stars}
            <p class="testimonial-card__text">${escapeHtml(t.text || t.testimonial || '')}</p>
            <div class="testimonial-card__author">
              <div class="testimonial-card__avatar">${avatarContent}</div>
              <div>
                <div class="testimonial-card__name">${escapeHtml(t.name || 'Client')}</div>
                ${t.role ? `<div class="testimonial-card__role">${escapeHtml(t.role)}</div>` : ''}
                ${t.location ? `<div class="testimonial-card__role">${escapeHtml(t.location)}</div>` : ''}
              </div>
            </div>
          </div>`;
        container.insertAdjacentHTML('beforeend', html);
      });

      initScrollAnimations();
    } catch (e) {
      console.warn('Testimonials not loaded:', e.message);
    }
  }

  /**
   * Load and display active promotions from content/promotions.json
   */
  async function loadPromotions() {
    const banner = document.querySelector('.promo-banner');
    if (!banner) return;

    // Check if user closed banner this session
    const dismissed = localStorage.getItem('tarso_promo_dismissed');

    try {
      const res = await fetch(CONFIG.contentBase + 'promotions.json');
      if (!res.ok) return;
      const data = await res.json();
      const promos = data.promotions || data;

      if (!Array.isArray(promos) || promos.length === 0) return;

      const now = new Date();
      const activePromo = promos.find(p => {
        if (!p.active) return false;
        const start = p.start_date ? new Date(p.start_date) : new Date(0);
        const end = p.end_date ? new Date(p.end_date) : new Date('2099-12-31');
        return now >= start && now <= end;
      });

      if (!activePromo) return;

      // If dismissed and same promo, skip
      if (dismissed === activePromo.id || dismissed === activePromo.title) return;

      // Populate banner
      const bannerText = banner.querySelector('.promo-banner__text') || banner;
      if (bannerText !== banner) {
        bannerText.innerHTML = activePromo.message || activePromo.title || '';
      } else {
        // Insert text before close button
        const closeBtn = banner.querySelector('.promo-banner__close');
        if (closeBtn) {
          closeBtn.insertAdjacentHTML('beforebegin',
            `<span class="promo-banner__text">${activePromo.message || activePromo.title || ''}</span>`
          );
        }
      }

      // Show banner
      document.body.classList.add('has-promo');
      requestAnimationFrame(() => {
        banner.classList.add('visible');
      });

      // Close button
      const closeBtn = banner.querySelector('.promo-banner__close');
      if (closeBtn) {
        closeBtn.addEventListener('click', () => {
          banner.classList.remove('visible');
          document.body.classList.remove('has-promo');
          localStorage.setItem('tarso_promo_dismissed', activePromo.id || activePromo.title);
        });
      }
    } catch (e) {
      console.warn('Promotions not loaded:', e.message);
    }
  }


  /* ==========================================================
     2. MOBILE NAVIGATION
     ========================================================== */
  function initMobileNav() {
    const hamburger = document.querySelector('.nav-hamburger');
    const drawer = document.querySelector('.nav-drawer');
    const overlay = document.querySelector('.nav-overlay');

    if (!hamburger || !drawer) return;

    function openNav() {
      hamburger.classList.add('open');
      drawer.classList.add('open');
      if (overlay) overlay.classList.add('visible');
      document.body.style.overflow = 'hidden';
    }

    function closeNav() {
      hamburger.classList.remove('open');
      drawer.classList.remove('open');
      if (overlay) overlay.classList.remove('visible');
      document.body.style.overflow = '';
    }

    hamburger.addEventListener('click', () => {
      if (drawer.classList.contains('open')) {
        closeNav();
      } else {
        openNav();
      }
    });

    // Close on overlay click
    if (overlay) {
      overlay.addEventListener('click', closeNav);
    }

    // Close on link click
    drawer.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', closeNav);
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && drawer.classList.contains('open')) {
        closeNav();
      }
    });
  }


  /* ==========================================================
     3. STICKY NAVBAR
     ========================================================== */
  function initStickyNav() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;

    let ticking = false;

    function onScroll() {
      if (!ticking) {
        requestAnimationFrame(() => {
          if (window.scrollY > CONFIG.navScrollThreshold) {
            navbar.classList.add('scrolled');
          } else {
            navbar.classList.remove('scrolled');
          }
          ticking = false;
        });
        ticking = true;
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // initial check
  }


  /* ==========================================================
     4. FAQ ACCORDION
     ========================================================== */
  function initFAQAccordion() {
    // Optional: close other items when one opens
    document.addEventListener('toggle', (e) => {
      if (e.target.classList && e.target.classList.contains('faq-item') && e.target.open) {
        document.querySelectorAll('.faq-item[open]').forEach(item => {
          if (item !== e.target) {
            item.open = false;
          }
        });
      }
    }, true);
  }


  /* ==========================================================
     5. PRODUCT FILTERS
     ========================================================== */
  function initProductFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    if (!filterBtns.length) return;

    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const category = btn.dataset.filter;
        const container = btn.closest('.section')
          ? btn.closest('.section').querySelector('.products-grid')
          : document.querySelector('.products-grid');

        if (!container) return;

        // Update active state
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Filter cards
        const cards = container.querySelectorAll('.product-card');
        cards.forEach(card => {
          if (!category || category === 'all') {
            card.style.display = '';
            card.style.opacity = '1';
            card.style.transform = '';
          } else if (card.dataset.category === category) {
            card.style.display = '';
            card.style.opacity = '1';
            card.style.transform = '';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  }


  /* ==========================================================
     6. SMOOTH SCROLL
     ========================================================== */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        const targetId = anchor.getAttribute('href');
        if (targetId === '#' || targetId.length < 2) return;

        const target = document.querySelector(targetId);
        if (!target) return;

        e.preventDefault();

        const navHeight = parseInt(
          getComputedStyle(document.documentElement).getPropertyValue('--navbar-height') || '70'
        );
        const promoOffset = document.body.classList.contains('has-promo') ? 42 : 0;
        const offset = navHeight + promoOffset + 16;

        const top = target.getBoundingClientRect().top + window.scrollY - offset;

        window.scrollTo({
          top: top,
          behavior: 'smooth',
        });
      });
    });
  }


  /* ==========================================================
     7. SCROLL ANIMATIONS (IntersectionObserver)
     ========================================================== */
  function initScrollAnimations() {
    const elements = document.querySelectorAll(
      '.animate-on-scroll:not(.visible), .animate-slide-left:not(.visible), .animate-slide-right:not(.visible), .animate-scale:not(.visible)'
    );

    if (!elements.length || !('IntersectionObserver' in window)) {
      // Fallback: just show everything
      elements.forEach(el => el.classList.add('visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: CONFIG.animationRootMargin,
        threshold: 0.1,
      }
    );

    elements.forEach(el => observer.observe(el));
  }


  /* ==========================================================
     8. COUNTER ANIMATION
     ========================================================== */
  function initCounters() {
    const counters = document.querySelectorAll('[data-count]');
    if (!counters.length) return;

    if (!('IntersectionObserver' in window)) {
      counters.forEach(c => { c.textContent = c.dataset.count; });
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    counters.forEach(c => observer.observe(c));
  }

  function animateCounter(el) {
    const target = parseInt(el.dataset.count, 10);
    const suffix = el.dataset.suffix || '';
    const prefix = el.dataset.prefix || '';
    const duration = CONFIG.counterDuration;
    const start = performance.now();

    function step(now) {
      const progress = Math.min((now - start) / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(eased * target);
      el.textContent = prefix + new Intl.NumberFormat('fr-FR').format(current) + suffix;

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = prefix + new Intl.NumberFormat('fr-FR').format(target) + suffix;
      }
    }

    requestAnimationFrame(step);
  }


  /* ==========================================================
     9. CONTACT FORM — WhatsApp Message Builder
     ========================================================== */
  function initContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      // Gather values
      const name = form.querySelector('[name="name"]');
      const phone = form.querySelector('[name="phone"]');
      const email = form.querySelector('[name="email"]');
      const product = form.querySelector('[name="product"]');
      const message = form.querySelector('[name="message"]');

      // Basic validation
      const errors = [];
      if (name && !name.value.trim()) errors.push('Veuillez entrer votre nom.');
      if (phone && !phone.value.trim()) errors.push('Veuillez entrer votre numéro de téléphone.');
      if (message && !message.value.trim()) errors.push('Veuillez entrer votre message.');

      if (errors.length) {
        showFormError(form, errors.join(' '));
        return;
      }

      // Build WhatsApp message
      let waMsg = `Bonjour TARSO ENERGY,\n\n`;
      if (name) waMsg += `Nom: ${name.value.trim()}\n`;
      if (phone) waMsg += `Tél: ${phone.value.trim()}\n`;
      if (email && email.value.trim()) waMsg += `Email: ${email.value.trim()}\n`;
      if (product && product.value) waMsg += `Produit: ${product.value}\n`;
      waMsg += `\n`;
      if (message) waMsg += message.value.trim();

      const waUrl = `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(waMsg)}`;

      window.open(waUrl, '_blank', 'noopener');

      // Show success
      showFormSuccess(form, 'Message préparé ! WhatsApp va s\'ouvrir.');
      form.reset();
    });
  }

  function showFormError(form, msg) {
    removeFormAlert(form);
    const alert = document.createElement('div');
    alert.className = 'form-alert form-alert--error';
    alert.style.cssText = 'background:rgba(229,57,53,0.08);color:#E53935;padding:12px 16px;border-radius:8px;margin-bottom:16px;font-size:0.88rem;font-weight:500;';
    alert.textContent = msg;
    form.prepend(alert);
    setTimeout(() => removeFormAlert(form), 5000);
  }

  function showFormSuccess(form, msg) {
    removeFormAlert(form);
    const alert = document.createElement('div');
    alert.className = 'form-alert form-alert--success';
    alert.style.cssText = 'background:rgba(91,165,50,0.08);color:#5BA532;padding:12px 16px;border-radius:8px;margin-bottom:16px;font-size:0.88rem;font-weight:500;';
    alert.textContent = msg;
    form.prepend(alert);
    setTimeout(() => removeFormAlert(form), 5000);
  }

  function removeFormAlert(form) {
    const existing = form.querySelector('.form-alert');
    if (existing) existing.remove();
  }


  /* ==========================================================
     10. PROMO BANNER CLOSE
     ========================================================== */
  function initPromoBanner() {
    const banner = document.querySelector('.promo-banner');
    if (!banner) return;

    const closeBtn = banner.querySelector('.promo-banner__close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        banner.classList.remove('visible');
        document.body.classList.remove('has-promo');
        localStorage.setItem('tarso_promo_dismissed', 'true');
      });
    }
  }


  /* ==========================================================
     11. LAZY LOADING (data-src)
     ========================================================== */
  function initLazyLoading() {
    const lazyImages = document.querySelectorAll('img.lazy:not(.loaded)');
    if (!lazyImages.length) return;

    if (!('IntersectionObserver' in window)) {
      lazyImages.forEach(img => loadImage(img));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            loadImage(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '200px 0px' }
    );

    lazyImages.forEach(img => observer.observe(img));
  }

  function loadImage(img) {
    const src = img.dataset.src;
    if (!src) return;
    img.src = src;
    img.classList.add('loaded');
    img.classList.remove('lazy');
    img.removeAttribute('data-src');
  }


  /* ==========================================================
     12. GALLERY LIGHTBOX
     ========================================================== */
  function initGalleryLightbox() {
    const galleryItems = document.querySelectorAll('.gallery-item');
    if (!galleryItems.length) return;

    // Create lightbox if it doesn't exist
    let lightbox = document.querySelector('.lightbox');
    if (!lightbox) {
      lightbox = document.createElement('div');
      lightbox.className = 'lightbox';
      lightbox.innerHTML = `
        <button class="lightbox__close" aria-label="Fermer">&times;</button>
        <img src="" alt="Image agrandie">
      `;
      document.body.appendChild(lightbox);
    }

    const lightboxImg = lightbox.querySelector('img');
    const closeBtn = lightbox.querySelector('.lightbox__close');

    function openLightbox(src, alt) {
      lightboxImg.src = src;
      lightboxImg.alt = alt || '';
      lightbox.classList.add('active');
      document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
      lightbox.classList.remove('active');
      document.body.style.overflow = '';
      // Clear src after transition
      setTimeout(() => {
        if (!lightbox.classList.contains('active')) {
          lightboxImg.src = '';
        }
      }, 300);
    }

    galleryItems.forEach(item => {
      item.addEventListener('click', () => {
        const img = item.querySelector('img');
        if (!img) return;
        const fullSrc = img.dataset.full || img.src;
        openLightbox(fullSrc, img.alt);
      });
    });

    closeBtn.addEventListener('click', closeLightbox);

    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && lightbox.classList.contains('active')) {
        closeLightbox();
      }
    });
  }


  /* ==========================================================
     UTILITY FUNCTIONS
     ========================================================== */
  function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }


  /* ==========================================================
     INITIALIZE EVERYTHING
     ========================================================== */
  function init() {
    // Core UI
    initMobileNav();
    initStickyNav();
    initSmoothScroll();
    initFAQAccordion();
    initProductFilters();
    initPromoBanner();
    initContactForm();

    // Visual
    initScrollAnimations();
    initCounters();
    initLazyLoading();
    initGalleryLightbox();

    // CMS content
    loadSettings();
    loadPromotions();

    // Auto-load FAQ & testimonials if containers exist
    loadFAQ();
    loadTestimonials();

    // Set current year in footer
    const yearEl = document.getElementById('current-year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    // Active nav link
    setActiveNavLink();
  }

  /**
   * Highlight the current page link in the nav
   */
  function setActiveNavLink() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-links a, .nav-drawer a').forEach(link => {
      const href = link.getAttribute('href');
      if (href === currentPage || (currentPage === 'index.html' && href === './')) {
        link.classList.add('active');
      }
    });
  }


  /* ==========================================================
     EXPOSE API for inline scripts
     ========================================================== */
  window.TarsoEnergy = {
    loadProductCards,
    loadFAQ,
    loadTestimonials,
    loadPromotions,
    loadSettings,
    renderProductCard,
    CONFIG,
  };


  /* ==========================================================
     DOM READY
     ========================================================== */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
