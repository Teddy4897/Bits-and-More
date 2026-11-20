(() => {
  'use strict';

  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  const hasGSAP = typeof gsap !== 'undefined';
  const hasScrollTrigger = typeof ScrollTrigger !== 'undefined';
  const hasLenis = typeof Lenis !== 'undefined';

  const nav = document.querySelector('header.nav');
  const navToggle = document.querySelector('.nav__toggle');
  const navLinks = document.querySelectorAll('.nav__link');

  const year = document.querySelector('#year');
  const form = document.querySelector('#commissionForm');
  const formStatus = document.querySelector('#formStatus');

  /* ========================================
     1. SETUP
  ======================================== */

  if (hasGSAP && hasScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
  }

  if (year) {
    year.textContent = new Date().getFullYear();
  }

  /* ========================================
     2. MOBILE NAV
  ======================================== */

  if (nav && navToggle) {
    const closeNav = () => {
      nav.classList.remove('nav--open');
      navToggle.setAttribute('aria-expanded', 'false');
    };

    navToggle.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('nav--open');

      navToggle.setAttribute(
        'aria-expanded',
        String(isOpen)
      );
    });

    navLinks.forEach((link) => {
      link.addEventListener('click', closeNav);
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        closeNav();
      }
    });
  }

  /* ========================================
     3. LENIS SMOOTH SCROLL
  ======================================== */

  if (
    !prefersReducedMotion &&
    hasLenis &&
    hasGSAP &&
    hasScrollTrigger
  ) {
    const lenis = new Lenis({
      lerp: 0.1
    });

    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);

    document.addEventListener('click', (event) => {
      const link = event.target.closest('a[href^="#"]');

      if (!link) return;

      const targetId = link.getAttribute('href');

      if (!targetId || targetId === '#') return;

      const target = document.querySelector(targetId);

      if (!target) return;

      event.preventDefault();

      lenis.scrollTo(target, {
        offset: -70
      });
    });
  }

  /* ========================================
     4. HERO INTRO TIMELINE
  ======================================== */

  if (!prefersReducedMotion && hasGSAP) {
    const hero = document.querySelector('.hero');

    if (hero) {
      const eyebrow = hero.querySelector('.section__eyebrow');
      const words = hero.querySelectorAll('.word__inner');
      const subtitle = hero.querySelector('.hero__sub');
      const actions = hero.querySelector('.hero__actions');
      const scroll = hero.querySelector('.hero__scroll');

      const intro = gsap.timeline({
        defaults: {
          ease: 'power3.out'
        }
      });

      if (eyebrow) {
        intro.from(eyebrow, {
          opacity: 0,
          y: 20,
          duration: 0.7
        });
      }

      if (words.length) {
        intro.fromTo(
          words,
          {
            yPercent: 110
          },
          {
            yPercent: 0,
            stagger: 0.08,
            duration: 1.1,
            ease: 'power4.out'
          },
          eyebrow ? '-=0.15' : 0
        );
      }

      if (subtitle) {
        intro.from(
          subtitle,
          {
            opacity: 0,
            y: 20,
            duration: 0.7
          },
          '-=0.35'
        );
      }

      if (actions) {
        intro.from(
          actions,
          {
            opacity: 0,
            y: 20,
            duration: 0.7
          },
          '-=0.4'
        );
      }

      if (scroll) {
        intro.from(
          scroll,
          {
            opacity: 0,
            y: 12,
            duration: 0.6
          },
          '-=0.3'
        );
      }
    }
  }

  /* ========================================
     5. SCROLL REVEALS
  ======================================== */

  if (
    !prefersReducedMotion &&
    hasGSAP &&
    hasScrollTrigger
  ) {
    const items = gsap.utils.toArray('.reveal');

    if (items.length) {
      gsap.set(items, {
        opacity: 0,
        y: 50
      });

      ScrollTrigger.batch(items, {
        start: 'top 88%',
        once: true,

        onEnter: (batch) => {
          gsap.to(batch, {
            opacity: 1,
            y: 0,
            duration: 1,
            stagger: 0.12,
            ease: 'power3.out',
            overwrite: true
          });
        }
      });
    }
  }

  /* ========================================
     6. MOOD SHIFT
  ======================================== */

  if (
    !prefersReducedMotion &&
    hasGSAP &&
    hasScrollTrigger
  ) {
    const moods = {
      entrance: ['#6B2FD9', '#8B5CF6', '#3B1C8C'],
      collection: ['#5B21B6', '#A855F7', '#1E1B4B'],
      services: ['#4C1D95', '#6366F1', '#7C3AED'],
      artist: ['#86198F', '#6B2FD9', '#4C1D95'],
      commission: ['#6B2FD9', '#8B5CF6', '#C9B8FF']
    };

    const blobs = [
      document.querySelector('.blob--1'),
      document.querySelector('.blob--2'),
      document.querySelector('.blob--3')
    ];

    Object.entries(moods).forEach(([sectionId, colors]) => {
      const section = document.getElementById(sectionId);

      if (!section || blobs.some((blob) => !blob)) return;

      const applyMood = () => {
        blobs.forEach((blob, index) => {
          gsap.to(blob, {
            backgroundColor: colors[index],
            duration: 1.5,
            overwrite: true
          });
        });
      };

      ScrollTrigger.create({
        trigger: section,
        start: 'top 55%',
        end: 'bottom 55%',
        onEnter: applyMood,
        onEnterBack: applyMood
      });
    });
  }

  /* ========================================
     7. CARD TILT
  ======================================== */

  if (
    !prefersReducedMotion &&
    hasGSAP &&
    window.matchMedia('(hover: hover)').matches
  ) {
    document.querySelectorAll('.artwork__frame').forEach((frame) => {
      frame.addEventListener('pointermove', (event) => {
        const bounds = frame.getBoundingClientRect();

        const x = event.clientX - bounds.left;
        const y = event.clientY - bounds.top;

        const centerX = bounds.width / 2;
        const centerY = bounds.height / 2;

        const rotationY = ((x - centerX) / centerX) * 8;
        const rotationX = ((centerY - y) / centerY) * 8;

        gsap.to(frame, {
          rotationX,
          rotationY,
          transformPerspective: 900,
          duration: 0.4,
          ease: 'power2.out',
          overwrite: true
        });
      });

      frame.addEventListener('pointerleave', () => {
        gsap.to(frame, {
          rotationX: 0,
          rotationY: 0,
          duration: 0.4,
          ease: 'power2.out',
          overwrite: true
        });
      });
    });
  }

  /* ========================================
     8. CUSTOM CURSOR
  ======================================== */

  if (
    !prefersReducedMotion &&
    hasGSAP &&
    window.matchMedia('(hover: hover) and (pointer: fine)').matches
  ) {
    const cursor = document.querySelector('.cursor');
    const dot = cursor?.querySelector('.cursor__dot');
    const ring = cursor?.querySelector('.cursor__ring');

    if (cursor && dot && ring) {
      let pointerX = 0;
      let pointerY = 0;

      let ringX = 0;
      let ringY = 0;

      let hasMoved = false;

      const setPosition = (element, x, y) => {
        element.style.transform =
          `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
      };

      document.addEventListener('mousemove', (event) => {
        pointerX = event.clientX;
        pointerY = event.clientY;

        if (!hasMoved) {
          hasMoved = true;

          ringX = pointerX;
          ringY = pointerY;

          cursor.classList.add('cursor--on');

          setPosition(ring, ringX, ringY);
        }

        setPosition(dot, pointerX, pointerY);
      });

      gsap.ticker.add(() => {
        if (!hasMoved) return;

        ringX += (pointerX - ringX) * 0.15;
        ringY += (pointerY - ringY) * 0.15;

        setPosition(ring, ringX, ringY);
      });

      document.addEventListener('pointerover', (event) => {
        const target = event.target.closest(
          'a, button, input, textarea, select, .artwork__frame'
        );

        if (target) {
          cursor.classList.add('cursor--hover');
        }
      });

      document.addEventListener('pointerout', (event) => {
        const from = event.target.closest(
          'a, button, input, textarea, select, .artwork__frame'
        );

        const to = event.relatedTarget?.closest(
          'a, button, input, textarea, select, .artwork__frame'
        );

        if (from && !to) {
          cursor.classList.remove('cursor--hover');
        }
      });
    }
  }

  /* ========================================
     9. COMMISSION FORM
  ======================================== */

  if (form && formStatus) {
    form.addEventListener('submit', (event) => {
      event.preventDefault();

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      formStatus.textContent =
        'Thank you. Your message has been noted. (Demo form: nothing is sent yet.)';

      form.reset();
    });
  }

  /* ========================================
     10. SCROLLTRIGGER REFRESH
  ======================================== */

  if (hasGSAP && hasScrollTrigger) {
    window.addEventListener('load', () => {
      ScrollTrigger.refresh();
    });
  }
})();
