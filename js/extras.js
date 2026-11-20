
(() => {
  'use strict';

  const paintCanvas = document.querySelector('#paintCanvas');
  const paintToggle = document.querySelector('#paintToggle');
  const logo = document.querySelector('.nav__brand');
  const logoImage = document.querySelector('.nav__logo');

  /* ========================================
     1. TOAST
  ======================================== */

  let toastRemovalTimer = null;
  let toastCleanupTimer = null;

  function toast(message) {
    const existingToast = document.querySelector('.toast');

    if (toastRemovalTimer !== null) window.clearTimeout(toastRemovalTimer);
    if (toastCleanupTimer !== null) window.clearTimeout(toastCleanupTimer);
    if (existingToast) existingToast.remove();

    const element = document.createElement('div');
    element.className = 'toast';
    element.textContent = message;
    element.setAttribute('role', 'status');
    element.setAttribute('aria-live', 'polite');
    document.body.appendChild(element);

    requestAnimationFrame(() => element.classList.add('toast--visible'));

    toastRemovalTimer = window.setTimeout(() => {
      element.classList.remove('toast--visible');
      toastCleanupTimer = window.setTimeout(() => {
        element.remove();
        toastRemovalTimer = null;
        toastCleanupTimer = null;
      }, 350);
    }, 2500);
  }

  /* ========================================
     2. SPLAT ENGINE
  ======================================== */

  let context = null;
  let canvasWidth = window.innerWidth;
  let canvasHeight = window.innerHeight;
  let fadeTimeout = null;

  const splatColors = ['#6B2FD9', '#8B5CF6', '#C9B8FF', '#D946EF', '#F2EEFF'];

  if (paintCanvas) context = paintCanvas.getContext('2d');

  function resizeCanvas() {
    if (!paintCanvas || !context) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvasWidth = window.innerWidth;
    canvasHeight = window.innerHeight;

    paintCanvas.width = Math.round(canvasWidth * dpr);
    paintCanvas.height = Math.round(canvasHeight * dpr);
    paintCanvas.style.width = `${canvasWidth}px`;
    paintCanvas.style.height = `${canvasHeight}px`;

    context.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  if (paintCanvas && context) {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
  }

  function splat(x, y, size) {
    if (!context || !paintCanvas) return;

    if (fadeTimeout !== null) {
      window.clearTimeout(fadeTimeout);
      fadeTimeout = null;
    }

    paintCanvas.style.opacity = '1';

    const color = splatColors[Math.floor(Math.random() * splatColors.length)];
    const radius = Math.max(1, size);
    const gradient = context.createRadialGradient(x, y, 0, x, y, radius);

    gradient.addColorStop(0, color);
    gradient.addColorStop(0.35, color);
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

    context.save();
    context.globalAlpha = 0.75;
    context.fillStyle = gradient;
    context.beginPath();
    context.arc(x, y, radius, 0, Math.PI * 2);
    context.fill();

    const dropletCount = 3 + Math.floor(Math.random() * 4);
    context.fillStyle = color;

    for (let i = 0; i < dropletCount; i += 1) {
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * 40;
      const dropletRadius = 1 + Math.random() * 3;

      context.beginPath();
      context.arc(
        x + Math.cos(angle) * distance,
        y + Math.sin(angle) * distance,
        dropletRadius,
        0,
        Math.PI * 2
      );
      context.fill();
    }

    context.restore();
  }

  function fadeOut() {
    if (!context || !paintCanvas) return;

    if (fadeTimeout !== null) window.clearTimeout(fadeTimeout);

    paintCanvas.style.opacity = '0';

    fadeTimeout = window.setTimeout(() => {
      context.clearRect(0, 0, canvasWidth, canvasHeight);
      paintCanvas.style.opacity = '1';
      fadeTimeout = null;
    }, 600);
  }

  /* ========================================
     3. PAINT MODE
  ======================================== */

  let paintMode = false;
  let previousPointer = null;

  if (paintToggle) {
    paintToggle.setAttribute('aria-pressed', 'false');

    paintToggle.addEventListener('click', () => {
      paintMode = !paintMode;
      document.body.classList.toggle('paint-mode', paintMode);
      paintToggle.setAttribute('aria-pressed', String(paintMode));

      if (paintMode) {
        previousPointer = null;
        toast('Paint mode on. Move to paint. Press the star again to wash it away.');
      } else {
        previousPointer = null;
        fadeOut();
      }
    });
  }

  document.addEventListener('pointermove', (event) => {
    if (!paintMode) return;

    const x = event.clientX;
    const y = event.clientY;
    let speed = 0;

    if (previousPointer) {
      const dx = x - previousPointer.x;
      const dy = y - previousPointer.y;
      speed = Math.sqrt(dx * dx + dy * dy);
    }

    splat(x, y, Math.min(26, Math.max(6, 6 + speed * 0.35)));
    previousPointer = { x, y };
  });

  /* ========================================
     4. KONAMI CODE
  ======================================== */

  const konamiSequence = [
    'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
    'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'
  ];

  let konamiPosition = 0;

  document.addEventListener('keydown', (event) => {
    const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;

    if (key === konamiSequence[konamiPosition]) {
      konamiPosition += 1;

      if (konamiPosition === konamiSequence.length) {
        document.documentElement.classList.toggle('theme-flip');
        toast('Light mode unlocked.');
        konamiPosition = 0;
      }
    } else {
      konamiPosition = key === konamiSequence[0] ? 1 : 0;
    }
  });

  /* ========================================
     5. LOGO SECRET
  ======================================== */

  if (logo) {
    let clickCount = 0;
    let clickWindowTimeout = null;

    function resetLogoClickCount() {
      clickCount = 0;
      clickWindowTimeout = null;
    }

    function runLogoSecret() {
      if (logoImage) {
        if (typeof gsap !== 'undefined') {
          gsap.to(logoImage, {
            rotation: '+=360',
            duration: 1,
            ease: 'power2.inOut',
            overwrite: true
          });
        } else {
          logoImage.classList.remove('logo-secret-spin');
          void logoImage.offsetWidth;
          logoImage.classList.add('logo-secret-spin');
        }
      }

      for (let i = 0; i < 25; i += 1) {
        splat(
          Math.random() * canvasWidth,
          Math.random() * canvasHeight,
          8 + Math.random() * 20
        );
      }

      window.setTimeout(fadeOut, 2500);
      toast("You found the studio's secret.");
    }

    logo.addEventListener('click', (event) => {
      clickCount += 1;

      if (clickCount === 1) {
        clickWindowTimeout = window.setTimeout(resetLogoClickCount, 3000);
      }

      if (clickCount === 5) {
        event.preventDefault();

        if (clickWindowTimeout !== null) {
          window.clearTimeout(clickWindowTimeout);
        }

        resetLogoClickCount();
        runLogoSecret();
      }
    });
  }

  /* ========================================
     6. COLLECTION EASTER EGGS
  ======================================== */

  const collection = document.querySelector('#collection');
  const eggCards = collection
    ? Array.from(collection.querySelectorAll('[data-egg]'))
    : [];

  const eggIds = ['liquid', 'dimension', 'geometry', 'bloom', 'spectrum', 'unknown'];
  const storageKey = 'bits-and-more-discoveries-v1';
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let discovered = new Set();

  try {
    const saved = JSON.parse(window.localStorage.getItem(storageKey) || '[]');

    if (Array.isArray(saved)) {
      discovered = new Set(saved.filter((id) => eggIds.includes(id)));
    }
  } catch (error) {
    discovered = new Set();
  }

  const eggCount = document.querySelector('#eggCount');
  const eggProgress = document.querySelector('#eggProgress');
  const eggProgressFill = document.querySelector('#eggProgressFill');
  const eggProgressHint = document.querySelector('#eggProgressHint');
  const secretArtwork = document.querySelector('#secretArtwork');

  /* ========================================
     DISCOVERY DISPLAY
  ======================================== */

  function updateDiscoveryUI() {
    const count = discovered.size;

    if (eggCount) eggCount.textContent = String(count);
    if (eggProgress) eggProgress.setAttribute('aria-valuenow', String(count));

    if (eggProgressFill) {
      eggProgressFill.style.transform = `scaleX(${count / 6})`;
    }

    if (eggProgressHint) {
      if (count === 0) {
        eggProgressHint.textContent = 'Some things reveal themselves when you play.';
      } else if (count < 6) {
        const remaining = 6 - count;
        eggProgressHint.textContent =
          `${remaining} ${remaining === 1 ? 'secret remains' : 'secrets remain'}. Keep exploring.`;
      } else {
        eggProgressHint.textContent = 'All six discovered. Something else has appeared.';
      }
    }

    eggCards.forEach((card) => {
      const id = card.dataset.egg;
      card.classList.toggle('is-discovered', discovered.has(id));

      const trigger = card.querySelector('.egg-trigger');

      if (trigger) {
        trigger.setAttribute('aria-pressed', String(discovered.has(id)));
      }
    });

    if (count === 6 && secretArtwork && secretArtwork.hidden) {
      secretArtwork.hidden = false;
      requestAnimationFrame(() => secretArtwork.classList.add('is-unlocked'));
      toast('All six found. The seventh piece is yours.');
    }
  }

  function discover(id, message) {
    if (!eggIds.includes(id) || discovered.has(id)) return;

    discovered.add(id);

    try {
      window.localStorage.setItem(
        storageKey,
        JSON.stringify(Array.from(discovered))
      );
    } catch (error) {
      // Discovery still works for this page view if storage is unavailable.
    }

    updateDiscoveryUI();

    if (message) toast(message);
  }

  /* ========================================
     VISUAL EFFECT HELPERS
  ======================================== */

  function burstFromElement(element, amount = 12) {
    if (!context || !element) return;

    const rect = element.getBoundingClientRect();

    for (let i = 0; i < amount; i += 1) {
      splat(
        rect.left + Math.random() * rect.width,
        rect.top + Math.random() * rect.height,
        3 + Math.random() * 9
      );
    }
  }

  function addRipple(element, event) {
    if (!element || reducedMotion) return;

    const rect = element.getBoundingClientRect();
    const ripple = document.createElement('span');

    ripple.className = 'egg-ripple';
    ripple.style.left = `${event.clientX - rect.left}px`;
    ripple.style.top = `${event.clientY - rect.top}px`;

    element.appendChild(ripple);

    window.setTimeout(() => ripple.remove(), 850);
  }

  /*
    Creates ten triangular fragments from the existing artwork.
    No image files or additional markup are required.
  */

  function fractureFromElement(element) {
    if (!element || reducedMotion) return;

    const artwork = element.querySelector('.artwork__art');

    if (!artwork) return;

    const previousLayer = element.querySelector('.egg-fracture-layer');

    if (previousLayer) previousLayer.remove();

    const rect = artwork.getBoundingClientRect();

    if (!rect.width || !rect.height) return;

    const computed = window.getComputedStyle(artwork);
    const layer = document.createElement('div');

    layer.className = 'egg-fracture-layer';
    layer.setAttribute('aria-hidden', 'true');

    const fragmentCount = 10;
    const centerX = 50;
    const centerY = 50;

    for (let i = 0; i < fragmentCount; i += 1) {
      const startAngle = (Math.PI * 2 * i) / fragmentCount;
      const endAngle = (Math.PI * 2 * (i + 1)) / fragmentCount;

      const startX = centerX + Math.cos(startAngle) * 52;
      const startY = centerY + Math.sin(startAngle) * 52;
      const endX = centerX + Math.cos(endAngle) * 52;
      const endY = centerY + Math.sin(endAngle) * 52;

      const shard = document.createElement('div');
      shard.className = 'egg-shard';

      shard.style.backgroundImage = computed.backgroundImage;
      shard.style.backgroundColor = computed.backgroundColor;
      shard.style.backgroundSize = '100% 100%';
      shard.style.backgroundPosition = 'center';
      shard.style.filter = computed.filter;

      shard.style.clipPath =
        `polygon(${centerX}% ${centerY}%, ${startX}% ${startY}%, ${endX}% ${endY}%)`;

      const angle = (startAngle + endAngle) / 2;
      const distance = 45 + Math.random() * 65;

      const moveX = Math.cos(angle) * distance;
      const moveY = Math.sin(angle) * distance;

      shard.style.setProperty('--shard-x', `${moveX}px`);
      shard.style.setProperty('--shard-y', `${moveY}px`);
      shard.style.setProperty(
        '--shard-r',
        `${(Math.random() - 0.5) * 100}deg`
      );

      shard.style.animationDelay = `${Math.random() * 90}ms`;

      layer.appendChild(shard);
    }

    element.appendChild(layer);
    element.classList.add('egg-fracturing');

    window.setTimeout(() => {
      layer.remove();
      element.classList.remove('egg-fracturing');
    }, 1050);
  }

  /* ========================================
     6A. VIOLET DRIFT — LIQUID
  ======================================== */

  const liquid = collection &&
    collection.querySelector('[data-egg="liquid"] .egg-trigger');

  if (liquid) {
    let clickCount = 0;
    let clickTimer = null;

    liquid.addEventListener('pointermove', (event) => {
      const rect = liquid.getBoundingClientRect();

      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;

      liquid.style.setProperty('--pointer-x', `${x * 100}%`);
      liquid.style.setProperty('--pointer-y', `${y * 100}%`);
    });

    liquid.addEventListener('click', (event) => {
      addRipple(liquid, event);

      clickCount += 1;

      if (clickTimer !== null) {
        window.clearTimeout(clickTimer);
      }

      if (clickCount >= 3) {
        clickCount = 0;
        discover('liquid', 'Violet Drift is flowing. Secret 1 of 6 found.');
      } else {
        clickTimer = window.setTimeout(() => {
          clickCount = 0;
        }, 1800);
      }
    });
  }

  /* ========================================
     6B. NOCTURNE — DIMENSION
  ======================================== */

  const dimension = collection &&
    collection.querySelector('[data-egg="dimension"] .egg-trigger');

  if (dimension) {
    let clicks = 0;

    dimension.addEventListener('click', () => {
      clicks += 1;

      dimension.classList.remove('dimension-flash');
      void dimension.offsetWidth;
      dimension.classList.add('dimension-flash');

      if (clicks >= 5) {
        clicks = 0;
        dimension.classList.add('dimension-open');

        discover(
          'dimension',
          'A hidden world revealed itself. Secret 2 of 6 found.'
        );
      }
    });
  }

  /* ========================================
     6C. SIGNAL & NOISE — FRACTURE
  ======================================== */

  const geometry = collection &&
    collection.querySelector('[data-egg="geometry"] .egg-trigger');

  if (geometry) {
    geometry.addEventListener('click', () => {
      const isScrambled = geometry.classList.contains('geometry-scrambled');

      if (!isScrambled) {
        geometry.classList.add('geometry-scrambled');
        fractureFromElement(geometry);
        burstFromElement(geometry, 18);
        toast('Pattern destabilised. Put the pieces back.');
        return;
      }

      geometry.classList.remove('geometry-scrambled');
      geometry.classList.remove('geometry-reassembling');

      void geometry.offsetWidth;
      geometry.classList.add('geometry-reassembling');

      window.setTimeout(() => {
        geometry.classList.remove('geometry-reassembling');
      }, 850);

      discover(
        'geometry',
        'Pattern restored. Secret 3 of 6 found.'
      );
    });
  }

  /* ========================================
     6D. AFTERGLOW — BLOOM
  ======================================== */

  const bloom = collection &&
    collection.querySelector('[data-egg="bloom"] .egg-trigger');

  if (bloom) {
    let hovered = false;

    bloom.addEventListener('pointerenter', () => {
      hovered = true;
      bloom.classList.add('bloom-open');
    });

    bloom.addEventListener('pointerleave', () => {
      hovered = false;
      bloom.classList.remove('bloom-open');
    });

    bloom.addEventListener('focus', () => {
      bloom.classList.add('bloom-open');
    });

    bloom.addEventListener('blur', () => {
      if (!hovered) bloom.classList.remove('bloom-open');
    });

    bloom.addEventListener('click', () => {
      bloom.classList.add('bloom-open');
      burstFromElement(bloom, 22);

      discover(
        'bloom',
        'A strange bloom has opened. Secret 4 of 6 found.'
      );
    });
  }

  /* ========================================
     6E. SLOW ORBIT — SPECTRUM
  ======================================== */

  const spectrum = collection &&
    collection.querySelector('[data-egg="spectrum"] .egg-trigger');

  if (spectrum) {
    let palette = 0;

    spectrum.addEventListener('click', () => {
      palette = (palette + 1) % 4;
      spectrum.dataset.palette = String(palette);

      if (palette === 3) {
        discover(
          'spectrum',
          'A new spectrum unlocked. Secret 5 of 6 found.'
        );
      } else {
        toast(`Spectrum ${palette + 1} of 4.`);
      }
    });
  }

  /* ========================================
     6F. STATIC BLOOM — UNKNOWN
  ======================================== */

  const unknown = collection &&
    collection.querySelector('[data-egg="unknown"] .egg-trigger');

  if (unknown) {
    unknown.addEventListener('click', () => {
      if (discovered.size < 5) {
        toast(
          `${6 - discovered.size} discoveries left before the unknown reveals itself.`
        );

        unknown.classList.remove('unknown-locked');
        void unknown.offsetWidth;
        unknown.classList.add('unknown-locked');

        window.setTimeout(() => {
          unknown.classList.remove('unknown-locked');
        }, 650);

        return;
      }

      discover(
        'unknown',
        'The unknown is no longer unknown. Secret 6 of 6 found.'
      );

      unknown.classList.add('unknown-revealed');
      burstFromElement(unknown, 28);
    });
  }

  updateDiscoveryUI();

  /* ========================================
     7. CONSOLE MESSAGE
  ======================================== */

  console.log(
    '%cHey, fellow developer. Poking around under the hood? If you like what you see, let\'s talk.',
    'color: #C9B8FF; background: #13111C; padding: 10px 14px; border-radius: 6px; font-size: 12px;'
  );
})();
