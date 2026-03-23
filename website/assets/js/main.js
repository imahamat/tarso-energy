/* ================================================================
   TARSO ENERGY — Premium JavaScript
   Production-ready, vanilla JS, zero dependencies
   ================================================================ */

const TarsoEnergy = {

  /* ==============================================================
     1. CONTENT LOADER SYSTEM (CMS Integration)
     ============================================================== */

  /**
   * Load and render product cards from JSON files.
   * @param {string}   folder      - Subfolder under content/ (e.g. 'kits-solaires')
   * @param {string[]} fileNames   - Array of JSON filenames to fetch
   * @param {string}   containerId - DOM element ID for the product grid
   */
  async loadProducts(folder, fileNames, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = '<div class="loading-skeleton"></div>';

    try {
      const products = await Promise.all(
        fileNames.map(f =>
          fetch(`content/${folder}/${f}`)
            .then(r => r.ok ? r.json() : null)
            .catch(() => null)
        )
      );

      const valid = products.filter(Boolean).sort((a, b) => (a.price || 0) - (b.price || 0));

      if (valid.length === 0) {
        container.innerHTML = '<p class="text-center" style="color:var(--color-gray-400)">Aucun produit disponible.</p>';
        return;
      }

      container.innerHTML = valid.map(p => this.renderProductCard(p)).join('');
      this.initFilters();
      this.initScrollAnimations();
    } catch (e) {
      container.innerHTML = '<p class="text-center" style="color:var(--color-gray-400)">Chargement des produits\u2026</p>';
    }
  },

  /**
   * Render a single product card as an HTML string.
   * @param {Object} product - Product data object from JSON
   * @returns {string} HTML string
   */
  renderProductCard(product) {
    const badge = product.in_stock
      ? '<span class="badge badge-stock">En Stock</span>'
      : '<span class="badge badge-order">Sur Commande</span>';

    const extraBadge = product.badge
      ? `<span class="badge badge-promo">${product.badge}</span>`
      : '';

    const specsHtml = product.powers
      ? product.powers.map(p => `<li>${p}</li>`).join('')
      : (product.features || []).map(f => `<li>${f}</li>`).join('');

    const imageHtml = product.image
      ? `<img src="${product.image}" alt="${product.name}" loading="lazy">`
      : '<div class="product-image-placeholder"></div>';

    const whatsappMsg = encodeURIComponent(
      `Bonjour TARSO ENERGY, je suis intéressé par : ${product.name} (${product.price_display})`
    );

    const category = product.category || '';

    return `
      <div class="product-card fade-in" data-category="${category}">
        <div class="product-image">
          ${imageHtml}
          <div class="product-badges">${badge}${extraBadge}</div>
        </div>
        <div class="product-body">
          <h3 class="product-name">${product.name}</h3>
          ${product.description ? `<p class="product-desc">${product.description}</p>` : ''}
          ${specsHtml ? `<ul class="product-specs">${specsHtml}</ul>` : ''}
          ${product.inverter ? `<div class="product-spec-detail"><strong>Onduleur:</strong> ${product.inverter}</div>` : ''}
          ${product.battery ? `<div class="product-spec-detail"><strong>Batterie:</strong> ${product.battery}</div>` : ''}
          ${product.panels ? `<div class="product-spec-detail"><strong>Panneaux:</strong> ${product.panels}</div>` : ''}
          <div class="product-footer">
            <div class="product-price">${product.price_display}</div>
            <a href="https://wa.me/23562390888?text=${whatsappMsg}" target="_blank" class="btn btn-whatsapp btn-sm">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 00.611.611l4.458-1.495A11.944 11.944 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.291 0-4.405-.763-6.103-2.048l-.427-.322-2.645.887.887-2.645-.322-.427A9.935 9.935 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>
              Commander
            </a>
          </div>
        </div>
      </div>`;
  },

  /**
   * Load FAQ items from a JSON file and render them as an accordion.
   * @param {string} containerId - DOM element ID for the FAQ list
   */
  async loadFAQ(containerId) {
    try {
      const res = await fetch('content/faq/faq.json');
      const data = await res.json();
      const container = document.getElementById(containerId);
      if (!container || !data.items) return;

      container.innerHTML = data.items.map((item, i) => `
        <details class="faq-item fade-in"${i === 0 ? ' open' : ''}>
          <summary>${item.question}</summary>
          <div class="faq-answer"><p>${item.answer}</p></div>
        </details>
      `).join('');

      this.initScrollAnimations();
    } catch (e) {
      /* FAQ data unavailable — fail silently */
    }
  },

  /**
   * Load testimonials from a JSON file and render cards.
   * If no testimonials exist, remove the parent section.
   * @param {string} containerId - DOM element ID for the testimonials grid
   */
  async loadTestimonials(containerId) {
    try {
      const res = await fetch('content/testimonials/testimonials.json');
      const data = await res.json();
      const container = document.getElementById(containerId);

      if (!container || !data.items || data.items.length === 0) {
        if (container) container.closest('section')?.remove();
        return;
      }

      container.innerHTML = data.items.map(t => `
        <div class="testimonial-card fade-in">
          <div class="testimonial-quote">"${t.text}"</div>
          <div class="testimonial-author">
            ${t.photo
              ? `<img src="${t.photo}" alt="${t.name}" class="testimonial-avatar">`
              : '<div class="testimonial-avatar-placeholder"></div>'}
            <div>
              <div class="testimonial-name">${t.name}</div>
              ${t.product ? `<div class="testimonial-product">${t.product}</div>` : ''}
            </div>
          </div>
        </div>
      `).join('');
    } catch (e) {
      /* Testimonials unavailable — fail silently */
    }
  },

  /**
   * Load and display a promotional banner.
   * Checks date range, dismissed state, and renders dynamically.
   * @param {string} bannerId - DOM element ID for the promo banner
   */
  async loadPromoBanner(bannerId) {
    try {
      const res = await fetch('content/promotions/promotions.json');
      const data = await res.json();
      const banner = document.getElementById(bannerId);
      if (!banner || !data.active || !data.banner_text) return;

      const now = new Date();
      if (data.start_date && new Date(data.start_date) > now) return;
      if (data.end_date && new Date(data.end_date) < now) return;
      if (localStorage.getItem('promo_dismissed') === data.banner_text) return;

      banner.innerHTML = `
        <div class="container" style="display:flex;align-items:center;justify-content:center;gap:12px;">
          <span>${data.banner_text}</span>
          ${data.link ? `<a href="${data.link}" style="color:white;text-decoration:underline;font-weight:600;">Voir l'offre</a>` : ''}
          <button class="promo-close" aria-label="Fermer">&times;</button>
        </div>`;
      banner.style.display = 'block';
      document.body.classList.add('has-promo');

      banner.querySelector('.promo-close')?.addEventListener('click', () => {
        banner.style.display = 'none';
        document.body.classList.remove('has-promo');
        localStorage.setItem('promo_dismissed', data.banner_text);
      });
    } catch (e) {
      /* Promotions unavailable — fail silently */
    }
  },


  /* ==============================================================
     2. MOBILE NAVIGATION
     ============================================================== */

  initNav() {
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('navLinks');
    const navOverlay = document.getElementById('navOverlay');

    if (!hamburger || !navLinks) return;

    const open = () => {
      hamburger.classList.add('open');
      navLinks.classList.add('open');
      if (navOverlay) navOverlay.classList.add('visible');
      document.body.style.overflow = 'hidden';
    };

    const close = () => {
      hamburger.classList.remove('open');
      navLinks.classList.remove('open');
      if (navOverlay) navOverlay.classList.remove('visible');
      document.body.style.overflow = '';
    };

    hamburger.addEventListener('click', () => {
      navLinks.classList.contains('open') ? close() : open();
    });

    if (navOverlay) {
      navOverlay.addEventListener('click', close);
    }

    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', close);
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navLinks.classList.contains('open')) {
        close();
      }
    });
  },


  /* ==============================================================
     3. STICKY NAVBAR
     ============================================================== */

  initStickyNav() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;

    let ticking = false;

    const onScroll = () => {
      if (ticking) return;
      ticking = true;

      requestAnimationFrame(() => {
        if (window.scrollY > 50) {
          navbar.classList.add('scrolled');
        } else {
          navbar.classList.remove('scrolled');
        }
        ticking = false;
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  },


  /* ==============================================================
     4. PRODUCT FILTERS
     ============================================================== */

  initFilters() {
    const buttons = document.querySelectorAll('.filter-btn, .category-tab');
    if (!buttons.length) return;

    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        const filter = btn.dataset.filter;

        // Toggle active state within the same group
        const parent = btn.parentElement;
        if (parent) {
          parent.querySelectorAll('.filter-btn, .category-tab').forEach(b => b.classList.remove('active'));
        }
        btn.classList.add('active');

        // Filter product cards
        const cards = document.querySelectorAll('.product-card');
        cards.forEach(card => {
          if (!filter || filter === 'tous' || filter === 'all') {
            card.style.opacity = '0';
            card.style.display = '';
            requestAnimationFrame(() => {
              card.style.transition = 'opacity 0.3s ease';
              card.style.opacity = '1';
            });
          } else if (card.dataset.category === filter) {
            card.style.opacity = '0';
            card.style.display = '';
            requestAnimationFrame(() => {
              card.style.transition = 'opacity 0.3s ease';
              card.style.opacity = '1';
            });
          } else {
            card.style.transition = 'opacity 0.3s ease';
            card.style.opacity = '0';
            setTimeout(() => { card.style.display = 'none'; }, 300);
          }
        });
      });
    });
  },


  /* ==============================================================
     5. FAQ ACCORDION
     ============================================================== */

  initFAQAccordion() {
    document.addEventListener('toggle', (e) => {
      const target = e.target;
      if (!target.classList || !target.classList.contains('faq-item')) return;
      if (!target.open) return;

      document.querySelectorAll('.faq-item[open]').forEach(item => {
        if (item !== target) {
          item.open = false;
        }
      });
    }, true);
  },


  /* ==============================================================
     6. SMOOTH SCROLL
     ============================================================== */

  initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        const href = anchor.getAttribute('href');
        if (href === '#' || href.length < 2) return;

        const target = document.querySelector(href);
        if (!target) return;

        e.preventDefault();

        const navbarOffset = 72;
        const top = target.getBoundingClientRect().top + window.scrollY - navbarOffset;

        window.scrollTo({
          top: top,
          behavior: 'smooth'
        });
      });
    });
  },


  /* ==============================================================
     7. SCROLL ANIMATIONS (IntersectionObserver)
     ============================================================== */

  initScrollAnimations() {
    const elements = document.querySelectorAll('.fade-in:not(.visible)');

    if (!elements.length) return;

    if (!('IntersectionObserver' in window)) {
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
      { threshold: 0.1 }
    );

    elements.forEach(el => observer.observe(el));
  },


  /* ==============================================================
     8. COUNTER ANIMATION
     ============================================================== */

  initCounters() {
    const counters = document.querySelectorAll('[data-count]');
    if (!counters.length) return;

    if (!('IntersectionObserver' in window)) {
      counters.forEach(el => {
        const suffix = el.dataset.suffix || '';
        el.textContent = el.dataset.count + suffix;
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this._animateCount(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    counters.forEach(el => observer.observe(el));
  },

  /**
   * Animate a single counter element from 0 to its data-count value.
   * @param {HTMLElement} el - Element with data-count attribute
   */
  _animateCount(el) {
    const target = parseInt(el.dataset.count, 10);
    if (isNaN(target)) return;

    const suffix = el.dataset.suffix || '';
    const duration = 2000;
    const startTime = performance.now();

    const step = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out cubic: 1 - (1 - t)^3
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(eased * target);

      el.textContent = current.toLocaleString('fr-FR') + suffix;

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = target.toLocaleString('fr-FR') + suffix;
      }
    };

    requestAnimationFrame(step);
  },


  /* ==============================================================
     9. CONTACT FORM -> WHATSAPP
     ============================================================== */

  initContactForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      // Clear previous errors
      form.querySelectorAll('.form-error').forEach(el => el.remove());

      const name = form.querySelector('[name="name"]');
      const phone = form.querySelector('[name="phone"]');
      const email = form.querySelector('[name="email"]');
      const subject = form.querySelector('[name="subject"]');
      const message = form.querySelector('[name="message"]');

      // Validate required fields
      let hasError = false;

      if (name && !name.value.trim()) {
        this._showFieldError(name, 'Veuillez entrer votre nom.');
        hasError = true;
      }

      if (phone && !phone.value.trim()) {
        this._showFieldError(phone, 'Veuillez entrer votre numéro de téléphone.');
        hasError = true;
      }

      if (hasError) {
        const firstError = form.querySelector('.form-error');
        if (firstError) {
          const field = firstError.parentElement.querySelector('input, textarea, select');
          if (field) field.focus();
        }
        return;
      }

      // Build formatted WhatsApp message
      let msg = 'Bonjour TARSO ENERGY,\n\n';
      if (name && name.value.trim()) msg += `Nom : ${name.value.trim()}\n`;
      if (phone && phone.value.trim()) msg += `Téléphone : ${phone.value.trim()}\n`;
      if (email && email.value.trim()) msg += `Email : ${email.value.trim()}\n`;
      if (subject && subject.value) msg += `Sujet : ${subject.value}\n`;
      if (message && message.value.trim()) msg += `\nMessage :\n${message.value.trim()}`;

      const waUrl = `https://wa.me/23562390888?text=${encodeURIComponent(msg)}`;
      window.open(waUrl, '_blank', 'noopener');

      // Show success feedback
      const successEl = document.createElement('div');
      successEl.className = 'form-success';
      successEl.textContent = 'Message préparé ! WhatsApp va s\'ouvrir.';
      successEl.style.cssText = 'background:rgba(91,165,50,0.1);color:#2e7d32;padding:12px 16px;border-radius:8px;margin-bottom:16px;font-size:0.9rem;font-weight:500;text-align:center;';
      form.prepend(successEl);

      form.reset();
      setTimeout(() => successEl.remove(), 5000);
    });
  },

  /**
   * Show an inline error message below a form field.
   * @param {HTMLElement} field - The form input element
   * @param {string}      msg   - Error message to display
   */
  _showFieldError(field, msg) {
    const error = document.createElement('div');
    error.className = 'form-error';
    error.textContent = msg;
    error.style.cssText = 'color:#e53935;font-size:0.82rem;margin-top:4px;margin-bottom:8px;font-weight:500;';
    field.parentElement.appendChild(error);
    field.style.borderColor = '#e53935';

    field.addEventListener('input', () => {
      error.remove();
      field.style.borderColor = '';
    }, { once: true });
  },


  /* ==============================================================
     10. LAZY LOADING IMAGES
     ============================================================== */

  initLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    if (!images.length) return;

    if (!('IntersectionObserver' in window)) {
      images.forEach(img => this._loadImage(img));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this._loadImage(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '200px 0px' }
    );

    images.forEach(img => observer.observe(img));
  },

  /**
   * Swap data-src to src and add loaded class.
   * @param {HTMLImageElement} img
   */
  _loadImage(img) {
    const src = img.dataset.src;
    if (!src) return;
    img.src = src;
    img.removeAttribute('data-src');
    img.classList.add('loaded');
  },


  /* ==============================================================
     11. GALLERY LIGHTBOX
     ============================================================== */

  initGalleryLightbox() {
    const items = document.querySelectorAll('.gallery-item img');
    if (!items.length) return;

    // Create lightbox overlay if it does not exist
    let lightbox = document.getElementById('lightbox');
    if (!lightbox) {
      lightbox = document.createElement('div');
      lightbox.id = 'lightbox';
      lightbox.className = 'lightbox-overlay';
      lightbox.innerHTML = `
        <button class="lightbox-close" aria-label="Fermer">&times;</button>
        <img class="lightbox-image" src="" alt="">
      `;
      document.body.appendChild(lightbox);
    }

    const lightboxImg = lightbox.querySelector('.lightbox-image');
    const closeBtn = lightbox.querySelector('.lightbox-close');

    const openLightbox = (src, alt) => {
      lightboxImg.src = src;
      lightboxImg.alt = alt || '';
      lightbox.classList.add('active');
      document.body.style.overflow = 'hidden';
    };

    const closeLightbox = () => {
      lightbox.classList.remove('active');
      document.body.style.overflow = '';
      setTimeout(() => {
        if (!lightbox.classList.contains('active')) {
          lightboxImg.src = '';
        }
      }, 300);
    };

    items.forEach(img => {
      img.style.cursor = 'pointer';
      img.addEventListener('click', () => {
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
};


/* ================================================================
   12. INITIALIZE ON DOM READY
   ================================================================ */

document.addEventListener('DOMContentLoaded', () => {
  TarsoEnergy.initNav();
  TarsoEnergy.initStickyNav();
  TarsoEnergy.initScrollAnimations();
  TarsoEnergy.initSmoothScroll();
  TarsoEnergy.initCounters();
  TarsoEnergy.initLazyLoading();
  TarsoEnergy.initGalleryLightbox();
  TarsoEnergy.initContactForm();
  TarsoEnergy.initFAQAccordion();
});

// Expose globally for inline page scripts
window.TarsoEnergy = TarsoEnergy;
