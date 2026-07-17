import Head from 'next/head';
import { useEffect, useState, useRef } from 'react';

// ─── TIMING CONFIG ───
const TIMINGS = {
  AUDIO_START: 20,
  ZOOM_DURATION: 50,
  SEQUENCE_START_DELAY: 50,
  FLASH_DURATION: 250,
  SHAKE_START: 330,
  SHAKE_DURATION: 400,
  LOADING_DURATION: 7000,
  LOGO_ZOOM_START: 250,
  BLACK_OVERLAY_START: 6850,
  BLACK_OVERLAY_END: 7550,
  BLACK_OVERLAY_DURATION: 350,
  NAV_APPEAR: 6900,
};

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [flash, setFlash] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const [shake, setShake] = useState(false);
  const [pop, setPop] = useState(false);
  const [audioLoaded, setAudioLoaded] = useState(false);
  const [audioStarted, setAudioStarted] = useState(false);
  const [floatActive, setFloatActive] = useState(false);
  const [isZooming, setIsZooming] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [bulgeEnabled, setBulgeEnabled] = useState(false);
  const [cursorVisible, setCursorVisible] = useState(true);
  const [showClickPrompt, setShowClickPrompt] = useState(false);
  const [clickPromptVisible, setClickPromptVisible] = useState(true);
  const [showNav, setShowNav] = useState(false);

  const canvasRef = useRef(null);
  const bgCanvasRef = useRef(null);
  const audioRef = useRef(null);
  const charRefs = useRef([]);
  const sequenceStarted = useRef(false);
  const mouseRef = useRef({ x: 0, y: 0 });

  const [showBlackTop, setShowBlackTop] = useState(false);

  useEffect(() => {
    const fadeInTimer = setTimeout(() => {
      setShowBlackTop(true);
    }, TIMINGS.BLACK_OVERLAY_START);

    const fadeOutTimer = setTimeout(() => {
      setShowBlackTop(false);
    }, TIMINGS.BLACK_OVERLAY_END);

    const navTimer = setTimeout(() => {
      setShowNav(true);
    }, TIMINGS.NAV_APPEAR);

    return () => {
      clearTimeout(fadeInTimer);
      clearTimeout(fadeOutTimer);
      clearTimeout(navTimer);
    };
  }, []);

  useEffect(() => {
    if (cursorVisible) {
      document.body.classList.remove('cursor-hidden');
    } else {
      document.body.classList.add('cursor-hidden');
    }
    return () => {
      document.body.classList.remove('cursor-hidden');
    };
  }, [cursorVisible]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
      if (bulgeEnabled) {
        const mouseX = e.clientX;
        const mouseY = e.clientY;
        const threshold = 120;
        const maxScale = 1.35;
        charRefs.current.forEach((el) => {
          if (!el) return;
          const rect = el.getBoundingClientRect();
          const cx = rect.left + rect.width / 2;
          const cy = rect.top + rect.height / 2;
          const dx = mouseX - cx;
          const dy = mouseY - cy;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const scale = 1 + (maxScale - 1) * Math.exp(-dist / threshold);
          el.style.transform = `translateY(0px) scale(${scale})`;
        });
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [bulgeEnabled]);

  useEffect(() => {
    if (!bulgeEnabled) return;
    const wave = () => {
      const chars = charRefs.current;
      if (!chars || chars.length === 0) return;
      chars.forEach((el) => {
        if (el) {
          el.style.transition = 'transform 0.25s ease-out';
          el.style.transform = 'translateY(0px) scale(1)';
        }
      });
      chars.forEach((el, index) => {
        if (!el || el.textContent === '\u00A0' || el.textContent === ' ') return;
        const delay = index * 100;
        setTimeout(() => {
          if (el) {
            el.style.transition = 'transform 0.25s ease-out';
            el.style.transform = 'translateY(0px) scale(1.12)';
          }
        }, delay);
        setTimeout(() => {
          if (el) {
            el.style.transition = 'transform 0.25s ease-out';
            el.style.transform = 'translateY(0px) scale(1)';
          }
        }, delay + 250);
      });
    };
    const interval = setInterval(wave, 5000);
    setTimeout(wave, 100);
    return () => clearInterval(interval);
  }, [bulgeEnabled]);

  const startSequence = () => {
    if (sequenceStarted.current) return;
    sequenceStarted.current = true;

    setCursorVisible(false);

    setIsZooming(true);
    setTimeout(() => {
      setIsZooming(false);
    }, TIMINGS.ZOOM_DURATION + 30);

    setTimeout(() => {
      setAudioStarted(true);
      setFloatActive(true);
      setFlash(true);
      setTimeout(() => {
        setFlash(false);
        setShowGrid(true);
      }, TIMINGS.FLASH_DURATION);
      setPop(true);
      setTimeout(() => {
        setShake(true);
        setTimeout(() => setShake(false), TIMINGS.SHAKE_DURATION);
      }, TIMINGS.SHAKE_START - TIMINGS.SEQUENCE_START_DELAY);
    }, TIMINGS.SEQUENCE_START_DELAY);

    setTimeout(() => {
      setIsLoading(false);
    }, TIMINGS.LOADING_DURATION);

    const titleAppearTime = TIMINGS.LOADING_DURATION + 400;
    setTimeout(() => {
      charRefs.current.forEach((el) => {
        if (el) {
          el.style.animation = 'none';
          el.style.opacity = '1';
          el.style.transform = 'translateY(0px) scale(1)';
        }
      });
      setBulgeEnabled(true);
      setShowContent(true);
      setCursorVisible(true);
    }, titleAppearTime);

    setTimeout(() => {
      setShowClickPrompt(true);
    }, titleAppearTime + 500);
  };

  useEffect(() => {
    startSequence();
  }, []);

  const handleClickEnter = () => {
    setClickPromptVisible(false);
    setShowClickPrompt(false);
  };

  // ─── STAR BACKGROUND – Fixed positioning ───
  useEffect(() => {
    if (!showContent) return;

    const canvas = bgCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let W, H;
    const mouse = mouseRef;
    let animId = null;
    let stars = [];
    let constellationEdges = [];
    let shooting = [];
    let lastShoot = 0;
    let nextShoot = 3000;

    function resize() {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W;
      canvas.height = H;
      canvas.style.width = W + 'px';
      canvas.style.height = H + 'px';
      
      regenerateStars();
    }

    function regenerateStars() {
      const WARM = [
        [234, 88, 12],
        [249, 115, 22],
        [245, 158, 11],
        [194, 65, 12],
        [220, 38, 38],
        [251, 191, 36],
        [180, 83, 9],
        [253, 186, 116],
      ];

      function rnd(a, b) { return a + Math.random() * (b - a); }
      function pick() { return WARM[Math.floor(Math.random() * WARM.length)]; }

      const area = W * H;
      const pixelRatio = window.devicePixelRatio || 1;
      
      let starMultiplier = 1;
      if (pixelRatio > 2) starMultiplier = 0.7;
      if (pixelRatio < 1.5) starMultiplier = 1.3;
      
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      if (isMobile) starMultiplier *= 0.6;
      
      const STAR_COUNT = Math.max(60, Math.floor(area / 5000 * starMultiplier));

      stars = Array.from({ length: STAR_COUNT }, () => {
        const c = Math.random() < 0.3 ? pick() : [253, 232, 200];
        const maxR = isMobile ? 1.6 : 2.2;
        return {
          x: rnd(0, W),
          y: rnd(0, H),
          r: rnd(0.3, maxR),
          alpha: rnd(0.3, 1),
          twinkleSpeed: rnd(0.0005, 0.0015),
          phase: rnd(0, Math.PI * 2),
          isStar4: Math.random() < 0.12,
          color: c,
          vx: rnd(-0.015, 0.015),
          vy: rnd(-0.015, 0.015),
        };
      });

      constellationEdges = [];
      for (let i = 0; i < stars.length; i++) {
        for (let j = i + 1; j < stars.length; j++) {
          const dx = stars[i].x - stars[j].x;
          const dy = stars[i].y - stars[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 90 && Math.random() < 0.35) {
            constellationEdges.push([i, j, d]);
          }
        }
      }

      shooting = [];
      lastShoot = 0;
      nextShoot = 3000;
    }

    function drawStar4(x, y, r, color, alpha) {
      ctx.save();
      ctx.translate(x, y);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = `rgb(${color[0]},${color[1]},${color[2]})`;
      ctx.beginPath();
      for (let i = 0; i < 4; i++) {
        const a = (i / 4) * Math.PI * 2 - Math.PI / 4;
        ctx.lineTo(Math.cos(a) * r * 3.2, Math.sin(a) * r * 3.2);
        ctx.lineTo(Math.cos(a + Math.PI / 4) * r * 0.7, Math.sin(a + Math.PI / 4) * r * 0.7);
      }
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    function updateStars() {
      stars.forEach(s => {
        s.x += s.vx;
        s.y += s.vy;
        if (s.x < 0) s.x = W;
        if (s.x > W) s.x = 0;
        if (s.y < 0) s.y = H;
        if (s.y > H) s.y = 0;
        const dx = s.x - mouse.x;
        const dy = s.y - mouse.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < 120 && d > 0) {
          const force = (120 - d) / 120 * 0.4;
          s.x += (dx / d) * force;
          s.y += (dy / d) * force;
        }
      });
    }

    function spawnShoot() {
      const WARM = [
        [234, 88, 12],
        [249, 115, 22],
        [245, 158, 11],
        [194, 65, 12],
        [220, 38, 38],
        [251, 191, 36],
        [180, 83, 9],
        [253, 186, 116],
      ];
      function pick() { return WARM[Math.floor(Math.random() * WARM.length)]; }
      function rnd(a, b) { return a + Math.random() * (b - a); }
      
      const c = pick();
      shooting.push({
        x: rnd(0, W),
        y: rnd(0, H * 0.5),
        len: rnd(100, 240),
        speed: rnd(5, 11),
        angle: rnd(18, 40) * Math.PI / 180,
        life: 1,
        color: c,
      });
    }

    function drawShooting() {
      shooting.forEach((ss, i) => {
        ss.life -= 0.02;
        if (ss.life <= 0) { shooting.splice(i, 1); return; }
        const x2 = ss.x - Math.cos(ss.angle) * ss.len;
        const y2 = ss.y - Math.sin(ss.angle) * ss.len;
        const g = ctx.createLinearGradient(ss.x, ss.y, x2, y2);
        g.addColorStop(0, `rgba(${ss.color[0]},${ss.color[1]},${ss.color[2]},${ss.life})`);
        g.addColorStop(1, 'transparent');
        ctx.globalAlpha = ss.life;
        ctx.strokeStyle = g;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(ss.x, ss.y);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        ss.x += Math.cos(ss.angle) * ss.speed;
        ss.y += Math.sin(ss.angle) * ss.speed;
      });
    }

    function tick(t) {
      ctx.clearRect(0, 0, W, H);

      const WARM = [
        [234, 88, 12],
        [249, 115, 22],
        [245, 158, 11],
        [194, 65, 12],
        [220, 38, 38],
        [251, 191, 36],
        [180, 83, 9],
        [253, 186, 116],
      ];
      
      ctx.globalAlpha = 0.06;
      ctx.strokeStyle = `rgb(${WARM[6][0]},${WARM[6][1]},${WARM[6][2]})`;
      ctx.lineWidth = 0.5;
      constellationEdges.forEach(([i, j, d]) => {
        const opac = Math.max(0, 1 - d / 90);
        ctx.globalAlpha = opac * 0.07;
        ctx.beginPath();
        ctx.moveTo(stars[i].x, stars[i].y);
        ctx.lineTo(stars[j].x, stars[j].y);
        ctx.stroke();
      });

      updateStars();
      stars.forEach(s => {
        const a = s.alpha * (0.55 + 0.45 * Math.sin(t * s.twinkleSpeed * 1000 + s.phase));
        if (s.isStar4) {
          drawStar4(s.x, s.y, s.r, s.color, a);
        } else {
          ctx.globalAlpha = a;
          ctx.fillStyle = `rgb(${s.color[0]},${s.color[1]},${s.color[2]})`;
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      if (t - lastShoot > nextShoot) {
        spawnShoot();
        lastShoot = t;
        nextShoot = 3000 + Math.random() * 2500;
      }
      drawShooting();

      ctx.globalAlpha = 1;
      animId = requestAnimationFrame(tick);
    }

    resize();
    animId = requestAnimationFrame(tick);

    let resizeTimeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        resize();
      }, 100);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      if (animId) cancelAnimationFrame(animId);
      if (resizeTimeout) clearTimeout(resizeTimeout);
      window.removeEventListener('resize', handleResize);
    };
  }, [showContent]);

  useEffect(() => {
    if (!pop) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    let w = window.innerWidth;
    let h = window.innerHeight;

    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.scale(dpr, dpr);

    const particles = [];
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#FF8A5C', '#A29BFE', '#FD79A8', '#00CEC9'];

    for (let i = 0; i < 250; i++) {
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.8;
      const speed = 600 + Math.random() * 1400;
      particles.push({
        x: w / 2 + (Math.random() - 0.5) * 100,
        y: h / 2 + (Math.random() - 0.5) * 80,
        vx: Math.cos(angle) * speed * (0.6 + Math.random() * 0.6),
        vy: Math.sin(angle) * speed * (0.6 + Math.random() * 0.6),
        size: 4 + Math.random() * 10,
        color: colors[Math.floor(Math.random() * colors.length)],
        gravity: 600 + Math.random() * 400,
        life: 1.5 + Math.random() * 2,
        maxLife: 1.5 + Math.random() * 2,
        rot: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 800,
        shape: Math.random() > 0.5 ? 'rect' : 'circle',
      });
    }

    let animId;

    const render = () => {
      const dt = 0.016;
      w = window.innerWidth;
      h = window.innerHeight;

      ctx.clearRect(0, 0, w, h);

      let alive = false;
      for (let p of particles) {
        p.vx *= 0.995;
        p.vy += p.gravity * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.life -= dt;
        p.rot += p.rotSpeed * dt;

        if (p.life > 0) {
          alive = true;
          const alpha = Math.min(1, p.life / p.maxLife * 1.5);
          ctx.save();
          ctx.globalAlpha = alpha;
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot * Math.PI / 180);
          ctx.fillStyle = p.color;

          if (p.shape === 'rect') {
            ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
          } else {
            ctx.beginPath();
            ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
        }
      }

      if (alive) animId = requestAnimationFrame(render);
    };

    render();
    return () => { if (animId) cancelAnimationFrame(animId); };
  }, [pop]);

  useEffect(() => {
    const preventZoom = (e) => {
      if (e.ctrlKey && (e.type === 'wheel' || e.type === 'keydown')) {
        e.preventDefault();
        return false;
      }
    };
    const preventKeyZoom = (e) => {
      if (e.ctrlKey && (e.key === '+' || e.key === '-' || e.key === '0')) {
        e.preventDefault();
        return false;
      }
    };
    window.addEventListener('wheel', preventZoom, { passive: false });
    window.addEventListener('keydown', preventKeyZoom);
    document.addEventListener('gesturestart', (e) => e.preventDefault());
    return () => {
      window.removeEventListener('wheel', preventZoom);
      window.removeEventListener('keydown', preventKeyZoom);
      document.removeEventListener('gesturestart', preventZoom);
    };
  }, []);

  const nameChars = "JOEL JOJU".split("");

  return (
    <>
      <Head>
        <title>Joel Joju | Portfolio</title>
        <meta charSet="UTF-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
        <meta
          name="description"
          content="Joel Joju is an Embedded Systems, UAV, PCB Design, and IoT enthusiast."
        />
        <style>{`
          @font-face {
            font-family: 'Aeonik';
            src: url('/fonts/AeonikTRIAL-Regular.otf') format('opentype');
            font-weight: 400;
            font-style: normal;
            font-display: swap;
          }
          @font-face {
            font-family: 'Aeonik';
            src: url('/fonts/AeonikTRIAL-Bold.otf') format('opentype');
            font-weight: 700;
            font-style: normal;
            font-display: swap;
          }

          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          html,
          body {
            height: 100%;
            width: 100%;
            overflow: hidden;
          }

          body {
            background: #0F0F0F;
            color: #fff;
            font-family: 'Aeonik', 'General Sans', Inter, 'Segoe UI', sans-serif;
            cursor: crosshair;
          }
          body.cursor-hidden {
            cursor: none !important;
          }
          body.cursor-hidden * {
            cursor: none !important;
          }

          * {
            -webkit-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
            user-select: none;
          }
          img {
            -webkit-user-drag: none;
            user-drag: none;
            -khtml-user-drag: none;
            pointer-events: none;
          }

          .black-top {
            position: fixed;
            inset: 0;
            background: #0F0F0F;
            z-index: 10002;
            pointer-events: none;
            opacity: 0;
            transition: opacity ${TIMINGS.BLACK_OVERLAY_DURATION}ms ease-in-out;
          }
          .black-top.active {
            opacity: 1;
          }

          .click-prompt {
            position: fixed;
            bottom: 60px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 10003;
            color: rgba(255, 255, 255, 0.7);
            font-family: 'Aeonik', 'General Sans', sans-serif;
            font-size: 1rem;
            letter-spacing: 0.15em;
            text-transform: uppercase;
            cursor: pointer;
            padding: 12px 32px;
            border: 1px solid rgba(255, 255, 255, 0.15);
            border-radius: 30px;
            background: rgba(255, 255, 255, 0.03);
            backdrop-filter: blur(8px);
            transition: opacity 0.8s ease, transform 0.8s ease;
            animation: blinkPulse 2s ease-in-out infinite;
          }
          .click-prompt:hover {
            background: rgba(255, 255, 255, 0.08);
            border-color: rgba(255, 255, 255, 0.3);
          }
          .click-prompt.hidden {
            opacity: 0 !important;
            transform: translateX(-50%) translateY(20px);
            pointer-events: none;
          }

          @keyframes blinkPulse {
            0%, 100% { opacity: 0.4; transform: translateX(-50%) scale(1); }
            50% { opacity: 1; transform: translateX(-50%) scale(1.03); }
          }

          .top-nav {
            position: fixed;
            top: 30px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 10004;
            display: flex;
            align-items: center;
            justify-content: space-between;
            font-family: 'Aeonik', 'General Sans', sans-serif;
            font-size: clamp(0.6rem, 0.8vw, 0.75rem);
            letter-spacing: 0.12em;
            text-transform: uppercase;
            color: rgba(255, 255, 255, 0.6);
            background: rgba(255, 255, 255, 0.06);
            backdrop-filter: blur(16px);
            padding: 12px 28px;
            border-radius: 2mm;
            border: 1px solid rgba(255, 255, 255, 0.08);
            opacity: 0;
            pointer-events: none;
            width: auto;
            min-width: 320px;
            max-width: 90%;
            transition: opacity 0.5s ease;
            gap: 2rem;
          }
          .top-nav.visible {
            opacity: 1;
            pointer-events: all;
          }

          .top-nav .nav-group {
            display: flex;
            align-items: center;
            gap: 2.5rem;
          }

          .top-nav a {
            color: rgba(255, 255, 255, 0.5);
            text-decoration: none;
            transition: color 0.3s ease;
            cursor: pointer;
            font-weight: 400;
            padding: 6px 8px;
            letter-spacing: 0.15em;
            white-space: nowrap;
            font-size: clamp(0.6rem, 0.75vw, 0.75rem);
            position: relative;
          }

          .top-nav a::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 50%;
            width: 0;
            height: 2px;
            background: #ffffff;
            transition: all 0.3s ease;
            transform: translateX(-50%);
          }

          .top-nav a:hover::after {
            width: 80%;
          }

          .top-nav a:hover {
            color: rgba(255, 255, 255, 0.9);
          }

          .top-nav a.active {
            color: #ffffff;
          }

          .top-nav a.active::after {
            width: 80%;
          }

          .top-nav .nav-divider {
            width: 1px;
            height: 20px;
            background: rgba(255, 255, 255, 0.15);
          }

          .top-nav .nav-plus {
            font-size: 1.2rem;
            font-weight: 300;
            color: rgba(255, 255, 255, 0.4);
            padding: 0 4px;
            transition: all 0.3s ease;
          }

          .top-nav .nav-plus:hover {
            color: rgba(255, 255, 255, 0.9);
            transform: rotate(90deg);
          }

          .hero-section {
            position: relative;
            z-index: 10 !important;
            min-height: 100dvh;
            width: 100vw;
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 1;
          }
          .hero-section.is-ready {
            opacity: 1;
          }

          .hero-wrapper {
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 80px 20px 40px;
          }

          .page-content {
            text-align: center;
            max-width: 90vw;
          }

          .page-eyebrow {
            display: block;
            color: #aaa;
            font-size: clamp(0.7rem, 1.2vw, 0.9rem);
            letter-spacing: 0.3em;
            text-transform: uppercase;
            margin-bottom: 12px;
            opacity: 0;
            animation: slideUp 0.8s ease forwards;
            animation-delay: 0.05s;
          }

          .main-title {
            font-family: 'Aeonik', 'General Sans', Inter, 'Segoe UI', sans-serif;
            font-size: clamp(3rem, 10vw, 7rem);
            letter-spacing: 0.08em;
            text-transform: uppercase;
            color: #fff;
            margin-bottom: 10px;
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            line-height: 1.1;
          }

          .char {
            display: inline-block;
            opacity: 0;
            transform: translateY(30px);
            transition: transform 0.25s ease-out, opacity 0.1s ease;
            will-change: transform;
            transform-origin: center center;
          }
          .hero-section.is-ready .char {
            opacity: 1;
            transform: translateY(0px);
          }

          .subtitle {
            color: #aaa;
            font-size: clamp(0.8rem, 1.4vw, 1.4rem);
            letter-spacing: 0.1em;
            text-transform: uppercase;
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            gap: clamp(0.3em, 0.8vw, 0.5em);
            margin-top: 0.5rem;
            font-weight: 400;
            line-height: 1.6;
          }

          .subtitle .word {
            display: inline-block;
            opacity: 0;
            animation: slideUp 0.8s ease forwards;
          }

          @keyframes slideUp {
            0% { opacity: 0; transform: translateY(30px); }
            100% { opacity: 1; transform: translateY(0); }
          }

          .loading-overlay {
            position: fixed;
            inset: 0;
            display: grid;
            place-items: center;
            background: #0F0F0F;
            z-index: 9999;
            transition: opacity 0.8s ease;
            overflow: hidden;
            cursor: default;
          }
          .loading-overlay.fade-out {
            opacity: 0;
            pointer-events: none;
          }

          .camera-scene {
            width: 100%;
            height: 100%;
            transform-origin: center center;
            transform: scale(1);
            will-change: transform;
          }
          .camera-scene.zooming {
            animation: cameraZoom ${TIMINGS.ZOOM_DURATION}ms cubic-bezier(0.1, 0.9, 1.2, 1) forwards;
          }
          @keyframes cameraZoom {
            0% { transform: scale(1); }
            60% { transform: scale(22); }
            100% { transform: scale(18); }
          }

          .loading-content {
            position: relative;
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .loading-content.float {
            animation: floatScreen 6s ease-in-out infinite;
          }
          @keyframes floatScreen {
            0%, 100% { transform: translate(0,0) rotate(0deg); }
            25% { transform: translate(4px, -6px) rotate(0.1deg); }
            50% { transform: translate(-4px, 10px) rotate(-0.5deg); }
            75% { transform: translate(5px, -4px) rotate(1deg); }
          }

          .shake-wrapper {
            position: relative;
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
          }
          .shake-wrapper.shake {
            animation: screenShake ${TIMINGS.SHAKE_DURATION}ms ease-out forwards;
          }
          @keyframes screenShake {
            0%   { transform: translate(0,0) rotate(0deg); }
            20%  { transform: translate(-8px,5px) rotate(-0.4deg); }
            40%  { transform: translate(6px,-4px) rotate(0.3deg); }
            60%  { transform: translate(-4px,3px) rotate(-0.2deg); }
            80%  { transform: translate(2px,-1px) rotate(0.1deg); }
            100% { transform: translate(0,0) rotate(0deg); }
          }

          .confetti-canvas {
            position: absolute;
            inset: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 5;
          }

          .welcome-grid {
            position: absolute;
            inset: 0;
            pointer-events: none;
            z-index: 1;
            background-image: linear-gradient(rgba(255,255,255,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.12) 1px, transparent 1px);
            background-size: 60px 60px;
            background-position: 0 0, 0 0;
            mask-image: radial-gradient(circle at center, rgba(0,0,0,1) 15%, rgba(0,0,0,0.8) 30%, rgba(0,0,0,0) 55%);
            -webkit-mask-image: radial-gradient(circle at center, rgba(0,0,0,1) 15%, rgba(0,0,0,0.8) 30%, rgba(0,0,0,0) 55%);
            opacity: 0;
            transition: opacity 0.3s ease;
          }
          .welcome-grid.visible { opacity: 1; }

          .flash-overlay {
            position: fixed;
            inset: 0;
            background: #fff;
            z-index: 10000;
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.2s ease-out;
          }
          .flash-overlay.active {
            opacity: 1;
            transition: none;
            animation: bigFlash ${TIMINGS.FLASH_DURATION}ms ease-out forwards;
          }
          @keyframes bigFlash {
            0% { transform: scale(0.8); opacity: 1; }
            30% { transform: scale(1.15); opacity: 1; }
            70% { transform: scale(1.05); opacity: 0.9; }
            100% { transform: scale(1); opacity: 0; }
          }

          .logo-container {
            position: relative;
            z-index: 10;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            pointer-events: none;
          }

          .loading-image {
            max-width: 70vw;
            max-height: 60vh;
            object-fit: contain;
            display: block;
            transform: scale(0) rotate(0deg);
            opacity: 0;
            filter: blur(10px);
            transform-origin: center center;
            transition: none;
          }
          .loading-image.animate {
            animation: linearFastZoom 0.25s cubic-bezier(0.16,1,0.3,1) forwards;
            animation-delay: ${TIMINGS.LOGO_ZOOM_START}ms;
          }
          @keyframes linearFastZoom {
            0% { transform: scale(0) rotate(0deg); opacity: 0; filter: blur(10px); }
            30% { opacity: 1; }
            100% { transform: scale(1) rotate(3deg); opacity: 1; filter: blur(0); }
          }

          .bg-canvas {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            z-index: 0;
            pointer-events: none;
            display: block;
          }

          .grid-blueprint {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            pointer-events: none;
            z-index: 1;
            background-image: linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px);
            background-size: 60px 60px;
            background-position: 0 0, 0 0;
            mask-image: radial-gradient(circle at center, rgba(0,0,0,1) 15%, rgba(0,0,0,0.8) 30%, rgba(0,0,0,0) 55%);
            -webkit-mask-image: radial-gradient(circle at center, rgba(0,0,0,1) 15%, rgba(0,0,0,0.8) 30%, rgba(0,0,0,0) 55%);
          }

          .page-shell {
            position: relative;
            min-height: 100vh;
            min-width: 100vw;
            background: transparent;
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          @media (max-width: 768px) {
            .top-nav {
              padding: 8px 16px;
              min-width: 280px;
              gap: 1rem;
            }
            .top-nav .nav-group {
              gap: 1.5rem;
            }
            .top-nav a {
              font-size: clamp(0.5rem, 0.6vw, 0.6rem);
              letter-spacing: 0.1em;
              padding: 4px 6px;
            }
            .click-prompt {
              bottom: 30px;
              font-size: 0.8rem;
              padding: 10px 24px;
            }
            .hero-wrapper {
              padding: 70px 16px 30px;
            }
          }

          @media (max-width: 480px) {
            .top-nav {
              padding: 6px 12px;
              min-width: 200px;
              gap: 0.8rem;
              top: 16px;
            }
            .top-nav .nav-group {
              gap: 1rem;
            }
            .top-nav a {
              font-size: clamp(0.4rem, 0.5vw, 0.5rem);
              letter-spacing: 0.08em;
              padding: 3px 4px;
            }
            .top-nav .nav-plus {
              font-size: 0.9rem;
            }
            .click-prompt {
              bottom: 20px;
              font-size: 0.7rem;
              padding: 8px 18px;
            }
          }
        `}</style>
      </Head>

      <div className={`black-top ${showBlackTop ? 'active' : ''}`} />

      <nav className={`top-nav ${showNav ? 'visible' : ''}`}>
        <div className="nav-group">
          <a href="#" className="active">Dashboard</a>
          <a href="#">Projects</a>
          <a href="#">About</a>
        </div>
        <div className="nav-group">
          <div className="nav-divider" />
          <a href="#" className="nav-plus">+</a>
        </div>
      </nav>

      {showClickPrompt && (
        <div
          className={`click-prompt ${!clickPromptVisible ? 'hidden' : ''}`}
          onClick={handleClickEnter}
        >
          Click to Enter
        </div>
      )}

      <div className={`loading-overlay ${!isLoading ? 'fade-out' : ''}`}>
        <div className={`camera-scene ${isZooming ? 'zooming' : ''}`}>
          <div className={`loading-content ${floatActive ? 'float' : ''}`}>
            <div className={`shake-wrapper ${shake ? 'shake' : ''}`}>
              <div className={`welcome-grid ${showGrid ? 'visible' : ''}`} />
              <div className="logo-container">
                <img
                  src="/logo.png"
                  alt="Logo"
                  draggable={false}
                  className={`loading-image ${audioStarted ? 'animate' : ''}`}
                />
              </div>
              <canvas ref={canvasRef} className="confetti-canvas" />
            </div>
          </div>
        </div>
        <div className={`flash-overlay ${flash ? 'active' : ''}`} />
      </div>

      <main className="page-shell">
        <canvas ref={bgCanvasRef} className="bg-canvas" />
        <div className="grid-blueprint" />

        <section className={`hero-section ${showContent ? 'is-ready' : ''}`}>
          <div className="hero-wrapper">
            <div className="page-content">
              <span className="page-eyebrow">Portfolio</span>
              <h1 className="main-title">
                {nameChars.map((char, idx) => (
                  <span
                    key={idx}
                    className="char"
                    ref={(el) => (charRefs.current[idx] = el)}
                    style={{ animationDelay: `${0.1 + idx * 0.08}s` }}
                  >
                    {char === " " ? "\u00A0" : char}
                  </span>
                ))}
              </h1>
              <p className="subtitle">
                <span className="word" style={{ animationDelay: '1.2s' }}>Embedded</span>
                <span className="word" style={{ animationDelay: '1.4s' }}>Systems</span>
                <span className="word" style={{ animationDelay: '1.6s' }}>•</span>
                <span className="word" style={{ animationDelay: '1.8s' }}>PCB</span>
                <span className="word" style={{ animationDelay: '2.0s' }}>Design</span>
                <span className="word" style={{ animationDelay: '2.2s' }}>•</span>
                <span className="word" style={{ animationDelay: '2.4s' }}>IoT</span>
                <span className="word" style={{ animationDelay: '2.6s' }}>•</span>
                <span className="word" style={{ animationDelay: '2.8s' }}>Firmware</span>
              </p>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}