/**
 * IRONCREST ROOFING & RESTORATION - CORE CLIENT SCRIPT
 * Dallas, TX | Agency Motion Engine & Client Experience
 */

'use strict';

/* ==========================================================================
   1. GLOBAL CONSTANTS (SINGLE SOURCE OF TRUTH)
   ========================================================================== */
const BRAND = {
  name: 'Ironcrest Roofing & Restoration',
  phoneDisplay: '(214) 555-0187',
  phoneTel: '+12145550187',
  address: '4120 Commerce St, Suite 210, Dallas, TX 75226',
  serviceAreas: ['Dallas', 'Plano', 'Frisco', 'Irving', 'Arlington']
};

// When empty string, multi-step booking modal runs in self-contained demo mode.
// Set to your POST API endpoint for live production JSON dispatch.
const BOOKING_ENDPOINT = '';

// Single source of truth for roof calculator pricing brackets ($ per sq ft)
const ROOFING_MATERIALS = {
  asphalt: {
    id: 'asphalt',
    name: 'Architectural Asphalt Shingles',
    priceLow: 5.50,
    priceHigh: 7.50
  },
  metal: {
    id: 'metal',
    name: 'Standing Seam Metal Roofing',
    priceLow: 10.00,
    priceHigh: 14.00
  },
  tile: {
    id: 'tile',
    name: 'Concrete / Spanish Clay Tile',
    priceLow: 12.00,
    priceHigh: 18.00
  }
};

/* ==========================================================================
   2. MOTION ENGINE (LENIS INERTIA SCROLL + GSAP SCROLLTRIGGER)
   ========================================================================== */
let lenis = null;
const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

function initSmoothScroll() {
  if (isReducedMotion) return;

  // Preserve native responsive inertia scrolling on touch devices
  if (typeof Lenis !== 'undefined' && !isTouchDevice) {
    lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.0
    });

    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);
  }
}

/* ==========================================================================
   3. SCROLL PROGRESS & DIRECTIONAL NAVBAR
   ========================================================================== */
function initHeaderAndProgress() {
  const progressBar = document.getElementById('scroll-progress');
  const siteHeader = document.getElementById('site-header');
  let lastScrollY = window.scrollY;

  // Real-time top progress bar update
  window.addEventListener('scroll', () => {
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (totalHeight > 0 && progressBar) {
      const progress = Math.min(1, Math.max(0, window.scrollY / totalHeight));
      progressBar.style.transform = `scaleX(${progress})`;
    }

    const currentScrollY = window.scrollY;
    if (siteHeader) {
      if (currentScrollY > 120 && currentScrollY > lastScrollY) {
        // Scrolling down: conceal navbar
        siteHeader.classList.add('header-hidden');
      } else {
        // Scrolling up: reveal navbar
        siteHeader.classList.remove('header-hidden');
      }
    }
    lastScrollY = currentScrollY;
  }, { passive: true });

  // Mobile menu toggle
  const mobileToggle = document.getElementById('mobile-toggle');
  const navMenu = document.getElementById('nav-menu');

  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      const isExpanded = mobileToggle.getAttribute('aria-expanded') === 'true';
      mobileToggle.setAttribute('aria-expanded', String(!isExpanded));
      navMenu.classList.toggle('mobile-open', !isExpanded);
    });

    // Close menu when clicking link
    navMenu.querySelectorAll('.nav-link').forEach((link) => {
      link.addEventListener('click', () => {
        mobileToggle.setAttribute('aria-expanded', 'false');
        navMenu.classList.remove('mobile-open');
      });
    });
  }
}

/* ==========================================================================
   4. GSAP ENTRANCE ANIMATIONS & PARALLAX REVEALS
   ========================================================================== */
function initGsapAnimations() {
  if (isReducedMotion || typeof gsap === 'undefined') {
    // Immediate fallback for reduced motion: render target numbers
    document.querySelectorAll('.counter').forEach((counter) => {
      const target = counter.getAttribute('data-target') || '0';
      counter.textContent = target;
    });
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  // Hero Line-by-Line Masked Slide Up
  const heroWords = document.querySelectorAll('.hero-word');
  if (heroWords.length > 0) {
    gsap.from(heroWords, {
      yPercent: 110,
      opacity: 0,
      duration: 1.1,
      stagger: 0.08,
      ease: 'expo.out',
      delay: 0.15
    });
  }

  // Hero Subtext, CTA and Glass Quick Card
  gsap.from(['.hero-badge', '.hero-lead', '.hero-cta-group', '.hero-glass-card'], {
    y: 28,
    opacity: 0,
    duration: 0.9,
    stagger: 0.1,
    ease: 'expo.out',
    delay: 0.5
  });

  // Hero Image Subtle Parallax (Max 8%)
  const heroBg = document.querySelector('.hero-bg-img');
  if (heroBg) {
    gsap.to(heroBg, {
      yPercent: 8,
      ease: 'none',
      scrollTrigger: {
        trigger: '#hero',
        start: 'top top',
        end: 'bottom top',
        scrub: true
      }
    });
  }

  // Hero Stat Number Tweeners
  const counterElements = document.querySelectorAll('.counter');
  counterElements.forEach((el) => {
    const targetValue = parseInt(el.getAttribute('data-target') || '0', 10);
    const counterObj = { val: 0 };

    ScrollTrigger.create({
      trigger: el,
      start: 'top 90%',
      once: true,
      onEnter: () => {
        gsap.to(counterObj, {
          val: targetValue,
          duration: 1.8,
          ease: 'expo.out',
          onUpdate: () => {
            el.textContent = Math.floor(counterObj.val).toLocaleString('en-US');
          }
        });
      }
    });
  });

  // Section Headers Reveal
  gsap.utils.toArray('.section-header').forEach((header) => {
    gsap.from(header, {
      scrollTrigger: {
        trigger: header,
        start: 'top 85%',
        once: true
      },
      y: 35,
      opacity: 0,
      duration: 0.9,
      ease: 'expo.out'
    });
  });

  // Services Bento Cards Stagger
  const bentoCards = document.querySelectorAll('.bento-card');
  if (bentoCards.length > 0) {
    gsap.from(bentoCards, {
      scrollTrigger: {
        trigger: '.services-bento',
        start: 'top 80%',
        once: true
      },
      y: 45,
      opacity: 0,
      duration: 0.9,
      stagger: 0.08,
      ease: 'expo.out'
    });
  }

  // Storm Band Parallax Background (Transform Only)
  const stormBg = document.querySelector('.storm-bg-img');
  if (stormBg) {
    gsap.to(stormBg, {
      yPercent: 12,
      ease: 'none',
      scrollTrigger: {
        trigger: '.storm-band-section',
        start: 'top bottom',
        end: 'bottom top',
        scrub: true
      }
    });
  }

  // Process Steps Reveal
  const processSteps = document.querySelectorAll('.process-step');
  if (processSteps.length > 0) {
    gsap.from(processSteps, {
      scrollTrigger: {
        trigger: '.process-timeline',
        start: 'top 80%',
        once: true
      },
      y: 35,
      opacity: 0,
      duration: 0.85,
      stagger: 0.12,
      ease: 'expo.out'
    });
  }

  // Showcase Cards Stagger
  const projectCards = document.querySelectorAll('.project-card');
  if (projectCards.length > 0) {
    gsap.from(projectCards, {
      scrollTrigger: {
        trigger: '.showcase-grid',
        start: 'top 80%',
        once: true
      },
      y: 40,
      opacity: 0,
      duration: 0.9,
      stagger: 0.1,
      ease: 'expo.out'
    });
  }

  // Area Cards Stagger
  const areaCards = document.querySelectorAll('.area-card');
  if (areaCards.length > 0) {
    gsap.from(areaCards, {
      scrollTrigger: {
        trigger: '.areas-grid',
        start: 'top 82%',
        once: true
      },
      y: 30,
      opacity: 0,
      duration: 0.75,
      stagger: 0.07,
      ease: 'expo.out'
    });
  }

  // Reviews Cards Stagger
  const reviewCards = document.querySelectorAll('.review-card');
  if (reviewCards.length > 0) {
    gsap.from(reviewCards, {
      scrollTrigger: {
        trigger: '.reviews-grid',
        start: 'top 82%',
        once: true
      },
      y: 35,
      opacity: 0,
      duration: 0.8,
      stagger: 0.09,
      ease: 'expo.out'
    });
  }
}

/* ==========================================================================
   5. MAGNETIC BUTTONS (DESKTOP FINE-POINTER ONLY)
   ========================================================================== */
function initMagneticButtons() {
  const isFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (!isFinePointer || isReducedMotion) return;

  const magneticBtns = document.querySelectorAll('.magnetic-btn');
  magneticBtns.forEach((btn) => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - (rect.left + rect.width / 2);
      const y = e.clientY - (rect.top + rect.height / 2);
      gsap.to(btn, {
        x: x * 0.22,
        y: y * 0.22,
        duration: 0.35,
        ease: 'power2.out'
      });
    });

    btn.addEventListener('mouseleave', () => {
      gsap.to(btn, {
        x: 0,
        y: 0,
        duration: 0.5,
        ease: 'elastic.out(1, 0.4)'
      });
    });
  });
}

/* ==========================================================================
   6. INSTANT ESTIMATE CALCULATOR (SINGLE SOURCE OF TRUTH)
   ========================================================================== */
function initEstimateCalculator() {
  const slider = document.getElementById('roof-size-slider');
  const sizeDisplay = document.getElementById('roof-size-display');
  const materialSelect = document.getElementById('material-select');
  const priceLowEl = document.getElementById('price-low');
  const priceHighEl = document.getElementById('price-high');

  if (!slider || !materialSelect || !priceLowEl || !priceHighEl) return;

  let currentLow = 13200;
  let currentHigh = 18000;
  const tweenTarget = { low: currentLow, high: currentHigh };

  function updateEstimate(animate = true) {
    const sizeSqFt = parseInt(slider.value, 10);
    const selectedKey = materialSelect.value;
    const materialData = ROOFING_MATERIALS[selectedKey] || ROOFING_MATERIALS.asphalt;

    // Display formatted square footage
    if (sizeDisplay) {
      sizeDisplay.textContent = `${sizeSqFt.toLocaleString('en-US')} sq ft`;
    }

    const calculatedLow = Math.round(sizeSqFt * materialData.priceLow);
    const calculatedHigh = Math.round(sizeSqFt * materialData.priceHigh);

    if (!animate || isReducedMotion || typeof gsap === 'undefined') {
      priceLowEl.textContent = calculatedLow.toLocaleString('en-US');
      priceHighEl.textContent = calculatedHigh.toLocaleString('en-US');
      return;
    }

    gsap.killTweensOf(tweenTarget);
    gsap.to(tweenTarget, {
      low: calculatedLow,
      high: calculatedHigh,
      duration: 0.65,
      ease: 'expo.out',
      onUpdate: () => {
        priceLowEl.textContent = Math.round(tweenTarget.low).toLocaleString('en-US');
        priceHighEl.textContent = Math.round(tweenTarget.high).toLocaleString('en-US');
      }
    });
  }

  slider.addEventListener('input', () => updateEstimate(true));
  materialSelect.addEventListener('change', () => updateEstimate(true));
  updateEstimate(false);
}

/* ==========================================================================
   7. BEFORE/AFTER PROJECT COMPARISON SLIDERS (BUG 3 REBUILD)
   ========================================================================== */
function initComparisonSliders() {
  const sliders = document.querySelectorAll('.comparison-container');

  sliders.forEach((container) => {
    const afterImage = container.querySelector('.after-image');
    const divider = container.querySelector('.slider-divider');
    let isDragging = false;
    let rafId = null;

    function applyPosition(percentage) {
      const clamped = Math.max(0, Math.min(100, percentage));
      if (afterImage) {
        afterImage.style.clipPath = `inset(0 0 0 ${clamped}%)`;
      }
      if (divider) {
        divider.style.left = `${clamped}%`;
      }
      container.setAttribute('aria-valuenow', String(Math.round(clamped)));
    }

    function schedulePositionUpdate(clientX) {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const rect = container.getBoundingClientRect();
        const offsetX = clientX - rect.left;
        const percentage = (offsetX / rect.width) * 100;
        applyPosition(percentage);
      });
    }

    // Pointer events on container (handles click/tap jump & smooth dragging)
    container.addEventListener('pointerdown', (e) => {
      isDragging = true;
      try {
        container.setPointerCapture(e.pointerId);
      } catch (_) {}
      schedulePositionUpdate(e.clientX);
    });

    container.addEventListener('pointermove', (e) => {
      if (!isDragging) return;
      schedulePositionUpdate(e.clientX);
    });

    const stopDragging = (e) => {
      if (isDragging) {
        isDragging = false;
        try {
          container.releasePointerCapture(e.pointerId);
        } catch (_) {}
      }
    };

    container.addEventListener('pointerup', stopDragging);
    container.addEventListener('pointercancel', stopDragging);

    // Accessible keyboard control (ArrowLeft/ArrowRight in 5% increments, Home/End)
    container.addEventListener('keydown', (e) => {
      const current = parseFloat(container.getAttribute('aria-valuenow') || '50');
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        applyPosition(current - 5);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        applyPosition(current + 5);
      } else if (e.key === 'Home') {
        e.preventDefault();
        applyPosition(0);
      } else if (e.key === 'End') {
        e.preventDefault();
        applyPosition(100);
      }
    });

    // Start handle firmly at 50%
    applyPosition(50);
  });
}

/* ==========================================================================
   8. FAQ ACCORDION (BUG 2 REBUILD: ITEM 1 OPEN, KEYBOARD + CLICK HANDLERS)
   ========================================================================== */
function initFaqAccordion() {
  const accordionItems = document.querySelectorAll('.accordion-item');

  accordionItems.forEach((item) => {
    const trigger = item.querySelector('.accordion-trigger');
    if (!trigger) return;

    function toggleAccordion() {
      const isAlreadyOpen = item.classList.contains('open');

      // Close all accordion siblings (strict single open mode)
      accordionItems.forEach((sibling) => {
        sibling.classList.remove('open');
        const sibTrigger = sibling.querySelector('.accordion-trigger');
        if (sibTrigger) sibTrigger.setAttribute('aria-expanded', 'false');
      });

      // Toggle target item
      if (!isAlreadyOpen) {
        item.classList.add('open');
        trigger.setAttribute('aria-expanded', 'true');
      }
    }

    trigger.addEventListener('click', toggleAccordion);

    // Keyboard support: Enter and Spacebar
    trigger.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleAccordion();
      }
    });
  });
}

/* ==========================================================================
   9. BOOKING MODAL & MULTI-STEP VALIDATION LOGIC
   ========================================================================== */
function initBookingModal() {
  const modalBackdrop = document.getElementById('booking-modal');
  const modalDialog = document.getElementById('modal-dialog');
  const closeBtn = document.getElementById('modal-close-btn');
  const finishBtn = document.getElementById('modal-finish-btn');
  const bookingForm = document.getElementById('booking-form');
  const confirmationView = document.getElementById('modal-confirmation');
  const formStatus = document.getElementById('form-status');
  const submitBtn = document.getElementById('submit-booking-btn');

  let currentStep = 1;
  let previouslyFocusedElement = null;

  // Set minimum date selector to tomorrow
  const dateInput = document.getElementById('inspect-date');
  if (dateInput) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yyyy = tomorrow.getFullYear();
    const mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const dd = String(tomorrow.getDate()).padStart(2, '0');
    dateInput.min = `${yyyy}-${mm}-${dd}`;
  }

  // Open modal triggers
  const openTriggers = document.querySelectorAll('.open-modal-trigger');
  openTriggers.forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetService = btn.getAttribute('data-service');
      if (targetService) {
        const matchingRadio = document.querySelector(`input[name="selectedService"][value="${targetService}"]`);
        if (matchingRadio) matchingRadio.checked = true;
      }
      openModal();
    });
  });

  function openModal() {
    previouslyFocusedElement = document.activeElement;
    if (lenis) lenis.stop();
    document.body.style.overflow = 'hidden';

    // Reset views
    currentStep = 1;
    updateStepView(currentStep);
    if (bookingForm) bookingForm.hidden = false;
    if (confirmationView) {
      confirmationView.hidden = true;
      confirmationView.classList.remove('active-check');
    }
    if (formStatus) {
      formStatus.textContent = '';
      formStatus.className = 'form-status-area';
    }

    modalBackdrop.classList.add('modal-open');
    modalBackdrop.setAttribute('aria-hidden', 'false');

    // Focus first interactive control
    setTimeout(() => {
      const firstFocusable = modalDialog.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (firstFocusable) firstFocusable.focus();
    }, 100);
  }

  function closeModal() {
    modalBackdrop.classList.remove('modal-open');
    modalBackdrop.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lenis) lenis.start();

    if (previouslyFocusedElement) {
      previouslyFocusedElement.focus();
    }
  }

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (finishBtn) finishBtn.addEventListener('click', closeModal);

  // Close when clicking overlay backdrop
  modalBackdrop.addEventListener('click', (e) => {
    if (e.target === modalBackdrop) {
      closeModal();
    }
  });

  // Escape key listener & Focus Trap
  document.addEventListener('keydown', (e) => {
    if (!modalBackdrop.classList.contains('modal-open')) return;

    if (e.key === 'Escape') {
      closeModal();
      return;
    }

    if (e.key === 'Tab') {
      const focusables = modalDialog.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (focusables.length === 0) return;

      const firstEl = focusables[0];
      const lastEl = focusables[focusables.length - 1];

      if (e.shiftKey && document.activeElement === firstEl) {
        e.preventDefault();
        lastEl.focus();
      } else if (!e.shiftKey && document.activeElement === lastEl) {
        e.preventDefault();
        firstEl.focus();
      }
    }
  });

  // Step Tracker & Fieldset Switching
  function updateStepView(stepNumber) {
    const steps = [1, 2, 3];
    steps.forEach((num) => {
      const fieldset = document.getElementById(`step-${num}`);
      const tracker = document.querySelector(`.tracker-step[data-step="${num}"]`);
      if (fieldset) fieldset.classList.toggle('active', num === stepNumber);
      if (tracker) tracker.classList.toggle('active', num <= stepNumber);
    });
  }

  // Next / Previous navigation buttons
  const nextButtons = modalDialog.querySelectorAll('.next-step-btn');
  nextButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetStep = parseInt(btn.getAttribute('data-next') || '1', 10);
      if (validateCurrentStep(currentStep)) {
        currentStep = targetStep;
        updateStepView(currentStep);
      }
    });
  });

  const prevButtons = modalDialog.querySelectorAll('.prev-step-btn');
  prevButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetStep = parseInt(btn.getAttribute('data-prev') || '1', 10);
      currentStep = targetStep;
      updateStepView(currentStep);
    });
  });

  // Validation function
  function validateCurrentStep(step) {
    let isValid = true;

    if (step === 2) {
      const dateVal = dateInput.value.trim();
      const timeInput = document.getElementById('inspect-time');
      const timeVal = timeInput.value;

      const dateField = dateInput.closest('.form-field');
      const timeField = timeInput.closest('.form-field');

      if (!dateVal) {
        dateField.classList.add('has-error');
        isValid = false;
      } else {
        dateField.classList.remove('has-error');
      }

      if (!timeVal) {
        timeField.classList.add('has-error');
        isValid = false;
      } else {
        timeField.classList.remove('has-error');
      }
    }

    return isValid;
  }

  // Final Form Submission Handler
  if (bookingForm) {
    bookingForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const nameInput = document.getElementById('client-name');
      const phoneInput = document.getElementById('client-phone');
      const emailInput = document.getElementById('client-email');
      const zipInput = document.getElementById('property-zip');

      const nameField = nameInput.closest('.form-field');
      const phoneField = phoneInput.closest('.form-field');
      const emailField = emailInput.closest('.form-field');
      const zipField = zipInput.closest('.form-field');

      let isValid = true;

      // Full Name validation
      if (!nameInput.value.trim()) {
        nameField.classList.add('has-error');
        isValid = false;
      } else {
        nameField.classList.remove('has-error');
      }

      // Phone validation (10 digits clean)
      const cleanPhone = phoneInput.value.replace(/\D/g, '');
      if (cleanPhone.length < 10) {
        phoneField.classList.add('has-error');
        isValid = false;
      } else {
        phoneField.classList.remove('has-error');
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailInput.value.trim())) {
        emailField.classList.add('has-error');
        isValid = false;
      } else {
        emailField.classList.remove('has-error');
      }

      // ZIP code validation (5 digits)
      const zipRegex = /^\d{5}$/;
      if (!zipRegex.test(zipInput.value.trim())) {
        zipField.classList.add('has-error');
        isValid = false;
      } else {
        zipField.classList.remove('has-error');
      }

      if (!isValid) return;

      // Prepare Submission Payload
      const selectedRadio = document.querySelector('input[name="selectedService"]:checked');
      const timeSelect = document.getElementById('inspect-time');
      const urgencySelect = document.getElementById('inspect-urgency');

      const payload = {
        service: selectedRadio ? selectedRadio.value : 'Roof Replacement',
        date: dateInput.value,
        timeSlot: timeSelect ? timeSelect.value : '',
        urgency: urgencySelect ? urgencySelect.value : '',
        name: nameInput.value.trim(),
        phone: phoneInput.value.trim(),
        email: emailInput.value.trim(),
        zip: zipInput.value.trim()
      };

      // Loading state
      submitBtn.classList.add('btn-loading');
      submitBtn.disabled = true;
      formStatus.textContent = '';
      formStatus.className = 'form-status-area';

      try {
        if (BOOKING_ENDPOINT && BOOKING_ENDPOINT.trim() !== '') {
          const response = await fetch(BOOKING_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          if (!response.ok) {
            throw new Error(`HTTP error ${response.status}`);
          }
        } else {
          // Demo simulation delay
          await new Promise((resolve) => setTimeout(resolve, 850));
        }

        renderConfirmation(payload);
      } catch (err) {
        formStatus.textContent = 'Unable to send request right now. Please call our team at (214) 555-0187 or retry.';
        formStatus.className = 'form-status-area is-error';
      } finally {
        submitBtn.classList.remove('btn-loading');
        submitBtn.disabled = false;
      }
    });
  }

  // Render Confirmation Screen Safely (strictly textContent, no innerHTML)
  function renderConfirmation(data) {
    if (!confirmationView) return;

    const confirmName = document.getElementById('confirm-name');
    const confirmService = document.getElementById('confirm-service');
    const confirmSchedule = document.getElementById('confirm-schedule');
    const confirmZip = document.getElementById('confirm-zip');

    if (confirmName) confirmName.textContent = data.name;
    if (confirmService) confirmService.textContent = data.service;
    if (confirmZip) confirmZip.textContent = data.zip;

    // Clean Date Formatting e.g. "October 15, 2026 • Morning, 8:30 AM"
    if (confirmSchedule && data.date) {
      const parts = data.date.split('-');
      if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        const dateObj = new Date(year, month, day);
        const monthName = dateObj.toLocaleDateString('en-US', { month: 'long' });
        confirmSchedule.textContent = `${monthName} ${day}, ${year} • ${data.timeSlot}`;
      } else {
        confirmSchedule.textContent = `${data.date} • ${data.timeSlot}`;
      }
    }

    if (bookingForm) bookingForm.hidden = true;
    confirmationView.hidden = false;

    // Trigger SVG checkmark draw
    requestAnimationFrame(() => {
      confirmationView.classList.add('active-check');
    });
  }
}

/* ==========================================================================
   10. MOBILE SIDEWAYS OVERFLOW AUDIT CHECKER (BUG 1 FIX EVIDENCE)
   ========================================================================== */
function debugViewportOverflow() {
  const docWidth = document.documentElement.clientWidth;
  const overflowingElements = [];

  document.querySelectorAll('body *').forEach((el) => {
    const rect = el.getBoundingClientRect();
    if (rect.right > docWidth + 1 || rect.left < -1) {
      overflowingElements.push({
        element: el,
        tagName: el.tagName,
        className: el.className,
        right: Math.round(rect.right),
        docWidth: docWidth
      });
    }
  });

  if (overflowingElements.length > 0) {
    console.warn('[Ironcrest Debug] Viewport overflow detected on:', overflowingElements);
  } else {
    console.log('[Ironcrest Debug] Zero horizontal overflow detected. Exact viewport fit.');
  }
}

/* ==========================================================================
   11. FOOTER COPYRIGHT YEAR INITIALIZATION
   ========================================================================== */
function initFooterYear() {
  const yearEl = document.getElementById('current-year');
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }
}

/* ==========================================================================
   DOM READY BOOTSTRAP
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
  initSmoothScroll();
  initHeaderAndProgress();
  initGsapAnimations();
  initMagneticButtons();
  initEstimateCalculator();
  initComparisonSliders();
  initFaqAccordion();
  initBookingModal();
  initFooterYear();
  debugViewportOverflow();
  window.addEventListener('resize', debugViewportOverflow, { passive: true });
});
