(() => {
  'use strict';

  /* ========================================
     HERO CANVAS SETUP
  ======================================== */

  const section = document.querySelector('#entrance');
  const canvas = document.querySelector('#heroCanvas');

  if (!section || !canvas) return;

  const ctx = canvas.getContext('2d');

  if (!ctx) return;

  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  );

  const COLORS = [
    [107, 47, 217],
    [139, 92, 246],
    [201, 184, 255]
  ];

  const POINT_SPACING = 12;
  const POINTER_RADIUS = 160;
  const POINTER_STRENGTH = 60;
  const LERP = 0.08;

  let width = 0;
  let height = 0;
  let dpr = 1;

  let lines = [];
  let animationId = null;
  let isVisible = false;
  let lastTime = 0;
  let time = 0;
  let resizeTimeout = null;

  const pointer = {
    x: -9999,
    y: -9999
  };

  /* ========================================
     LINE COLOUR
  ======================================== */

  function getLineColor(index, total) {
    const position = index / Math.max(total - 1, 1);

    const colorIndex = Math.min(
      COLORS.length - 1,
      Math.floor(position * COLORS.length)
    );

    const color = COLORS[colorIndex];

    return `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
  }

  /* ========================================
     BUILD WAVE LINES
  ======================================== */

  function buildLines() {
    const lineCount = width < 768 ? 40 : 70;

    lines = [];

    for (let i = 0; i < lineCount; i += 1) {
      const baseY = (height / (lineCount + 1)) * (i + 1);
      const points = [];

      for (
        let x = 0;
        x <= width + POINT_SPACING;
        x += POINT_SPACING
      ) {
        points.push({
          x,
          baseY,
          offset: 0,
          target: 0
        });
      }

      lines.push({
        points,
        color: getLineColor(i, lineCount),
        phase: Math.random() * Math.PI * 2,
        frequency: 0.004 + Math.random() * 0.002,
        speed: 0.0004 + Math.random() * 0.0005,
        amplitude: (30 + (i % 5) * 5) * (height / 800)
      });
    }
  }

  /* ========================================
     RESIZE CANVAS
  ======================================== */

  function resize() {
    width = section.clientWidth;
    height = section.clientHeight;

    if (!width || !height) return;

    dpr = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);

    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    buildLines();

    if (prefersReducedMotion.matches) {
      draw();
    }
  }

  /* ========================================
     UPDATE WAVE POINTS
  ======================================== */

  function update(currentTime) {
    const delta = lastTime ? currentTime - lastTime : 16;
    lastTime = currentTime;

    if (!prefersReducedMotion.matches) {
      time += delta;
    }

    lines.forEach((line) => {
      line.points.forEach((point) => {
        const waveOne = Math.sin(
          point.x * line.frequency +
          time * line.speed +
          line.phase
        );

        const waveTwo = Math.sin(
          point.x * line.frequency * 0.55 +
          time * line.speed * 0.7
        );

        const wave = (
          waveOne * 0.65 +
          waveTwo * 0.35
        ) * line.amplitude;

        let pointerOffset = 0;

        if (!prefersReducedMotion.matches) {
          const dx = point.x - pointer.x;
          const dy = point.baseY - pointer.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < POINTER_RADIUS) {
            const influence = 1 - distance / POINTER_RADIUS;
            const force = influence * influence * POINTER_STRENGTH;

            pointerOffset =
              (dy / Math.max(distance, 1)) * force;
          }
        }

        point.target = wave + pointerOffset;
        point.offset += (point.target - point.offset) * LERP;
      });
    });
  }

  /* ========================================
     DRAW WAVES
  ======================================== */

  function draw() {
    ctx.clearRect(0, 0, width, height);

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineWidth = 1.2;

    lines.forEach((line) => {
      const points = line.points;

      if (points.length < 2) return;

      ctx.beginPath();

      const first = points[0];

      ctx.moveTo(
        first.x,
        first.baseY + first.offset
      );

      for (let i = 1; i < points.length - 1; i += 1) {
        const current = points[i];
        const next = points[i + 1];

        const midX = (current.x + next.x) / 2;

        const midY = (
          current.baseY + current.offset +
          next.baseY + next.offset
        ) / 2;

        ctx.quadraticCurveTo(
          current.x,
          current.baseY + current.offset,
          midX,
          midY
        );
      }

      const last = points[points.length - 1];

      ctx.lineTo(
        last.x,
        last.baseY + last.offset
      );

      ctx.strokeStyle = line.color;
      ctx.globalAlpha = 0.35;
      ctx.stroke();
    });

    ctx.restore();
  }

  /* ========================================
     ANIMATION LOOP
  ======================================== */

  function loop(timestamp) {
    if (!isVisible || document.hidden) {
      animationId = null;
      return;
    }

    update(timestamp);
    draw();

    animationId = requestAnimationFrame(loop);
  }

  function start() {
    if (
      prefersReducedMotion.matches ||
      !isVisible ||
      document.hidden ||
      animationId !== null
    ) {
      return;
    }

    lastTime = 0;
    animationId = requestAnimationFrame(loop);
  }

  function stop() {
    if (animationId !== null) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }
  }

  /* ========================================
     POINTER INTERACTION
  ======================================== */

  function handlePointerMove(event) {
    if (prefersReducedMotion.matches) return;

    const bounds = canvas.getBoundingClientRect();

    pointer.x = event.clientX - bounds.left;
    pointer.y = event.clientY - bounds.top;
  }

  function handlePointerLeave() {
    pointer.x = -9999;
    pointer.y = -9999;
  }

  section.addEventListener('pointermove', handlePointerMove);
  section.addEventListener('pointerleave', handlePointerLeave);

  /* ========================================
     RESIZE HANDLING
  ======================================== */

  window.addEventListener('resize', () => {
    window.clearTimeout(resizeTimeout);

    resizeTimeout = window.setTimeout(resize, 150);
  });

  /* ========================================
     VISIBILITY HANDLING
  ======================================== */

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      isVisible = entry.isIntersecting;

      if (isVisible) {
        if (prefersReducedMotion.matches) {
          draw();
        } else {
          start();
        }
      } else {
        stop();
      }
    });
  });

  observer.observe(section);

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stop();
    } else if (isVisible && !prefersReducedMotion.matches) {
      start();
    }
  });

  /* ========================================
     REDUCED MOTION
  ======================================== */

  function handleMotionPreference() {
    if (prefersReducedMotion.matches) {
      stop();

      pointer.x = -9999;
      pointer.y = -9999;

      lines.forEach((line) => {
        line.points.forEach((point) => {
          point.offset = 0;
          point.target = 0;
        });
      });

      draw();
    } else {
      lastTime = 0;
      start();
    }
  }

  if (prefersReducedMotion.addEventListener) {
    prefersReducedMotion.addEventListener(
      'change',
      handleMotionPreference
    );
  } else {
    prefersReducedMotion.addListener(handleMotionPreference);
  }

  /* ========================================
     INITIALIZE
  ======================================== */

  resize();

  if (prefersReducedMotion.matches) {
    draw();
  }
})();
