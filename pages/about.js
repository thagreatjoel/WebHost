import Head from 'next/head';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';

export default function About() {
  const router = useRouter();
  const pageShellRef = useRef(null);
  const bgCanvasRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const [isLoaded, setIsLoaded] = useState(false);
  const [introComplete, setIntroComplete] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [showContent, setShowContent] = useState(false);

  // ─── HOOKS ───
  useEffect(() => {
    const overlays = document.querySelectorAll('.nav-overlay');
    overlays.forEach(el => el.remove());
  }, []);

  useEffect(() => {
    if (pageShellRef.current && !introComplete) {
      pageShellRef.current.classList.add('zoom-in-big');
      setTimeout(() => {
        if (pageShellRef.current) {
          pageShellRef.current.classList.remove('zoom-in-big');
          setIntroComplete(true);
          setIsLoaded(true);
          setTimeout(() => setShowContent(true), 100);
        }
      }, 800);
    }
  }, [introComplete]);

  // ─── NAVIGATION ───
  const handleNavigation = (path) => (e) => {
    if (e) e.preventDefault();
    if (isRedirecting || !path) return;
    setIsRedirecting(true);
    setShowContent(false);
    if (pageShellRef.current) pageShellRef.current.classList.add('zoom-in-big');
    const overlay = document.createElement('div');
    overlay.className = 'nav-overlay';
    overlay.style.cssText = `position:fixed;inset:0;background:#0F0F0F;z-index:99999;opacity:0;transition:opacity 0.6s ease;pointer-events:none;`;
    document.body.appendChild(overlay);
    setTimeout(() => { overlay.style.opacity = '1'; }, 100);
    setTimeout(() => {
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
      router.push(path);
    }, 800);
  };

  const handleBackToHome = () => {
    if (isRedirecting) return;
    setIsRedirecting(true);
    sessionStorage.setItem('redirectedToHome', 'true');
    setShowContent(false);
    if (pageShellRef.current) pageShellRef.current.classList.add('zoom-in-big');
    const overlay = document.createElement('div');
    overlay.className = 'nav-overlay';
    overlay.style.cssText = `position:fixed;inset:0;background:#0F0F0F;z-index:99999;opacity:0;transition:opacity 0.6s ease;pointer-events:none;`;
    document.body.appendChild(overlay);
    setTimeout(() => { overlay.style.opacity = '1'; }, 100);
    setTimeout(() => {
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
      window.location.href = '/';
    }, 800);
  };

  // ─── STAR BACKGROUND ───
  useEffect(() => {
    if (!isLoaded) return;
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
      resizeTimeout = setTimeout(() => { resize(); }, 100);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      if (animId) cancelAnimationFrame(animId);
      if (resizeTimeout) clearTimeout(resizeTimeout);
      window.removeEventListener('resize', handleResize);
    };
  }, [isLoaded]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <>
      <Head>
        <title>About | Joel Joju</title>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <meta name="description" content="About - Joel Joju Portfolio" />
      </Head>

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

        * { margin: 0; padding: 0; box-sizing: border-box; }
        html, body { height: 100%; width: 100%; overflow: hidden; }
        body { 
          background: #0F0F0F; 
          color: #fff; 
          font-family: 'Aeonik', 'General Sans', Inter, 'Segoe UI', sans-serif;
          cursor: crosshair;
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

        .loading-overlay {
          position: fixed;
          inset: 0;
          background: #0F0F0F;
          z-index: 99998;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.3s ease;
        }
        .loading-overlay.active {
          opacity: 1;
        }

        .page-shell {
          position: relative;
          min-height: 100vh;
          min-width: 100vw;
          background: #0F0F0F;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
          transform-origin: center center;
        }
        .page-shell.zoom-in-big {
          transform: scale(1.8);
          opacity: 0;
          filter: blur(34px);
        }

        .page-content {
          position: relative;
          z-index: 10;
          max-width: 90vw;
          width: 900px;
          opacity: 0;
          transition: opacity 0.8s ease;
          padding: 40px 20px;
          max-height: 90vh;
          overflow-y: auto;
          text-align: left;
        }
        .page-content.visible { opacity: 1; }

        .page-content::-webkit-scrollbar { width: 4px; }
        .page-content::-webkit-scrollbar-track { background: rgba(255,255,255,0.02); }
        .page-content::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }

        /* ─── HERO ─── */
        .hero-section {
          text-align: center;
          margin-bottom: 2.5rem;
          padding-bottom: 2rem;
          border-bottom: 1px solid rgba(255,255,255,0.04);
        }

        .hero-name {
          font-size: clamp(2.8rem, 7vw, 4.5rem);
          font-weight: 700;
          color: #fff;
          letter-spacing: 0.04em;
          line-height: 1.1;
        }

        .hero-name .highlight {
          background: linear-gradient(135deg, #fbbf24, #f59e0b);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero-tagline {
          color: rgba(255,255,255,0.4);
          font-size: clamp(0.85rem, 1.2vw, 1.1rem);
          letter-spacing: 0.08em;
          margin-top: 0.5rem;
          font-weight: 300;
        }

        .hero-badge {
          display: inline-block;
          margin-top: 0.75rem;
          padding: 0.3rem 1.2rem;
          background: rgba(251, 191, 36, 0.08);
          border: 1px solid rgba(251, 191, 36, 0.12);
          border-radius: 20px;
          color: #fbbf24;
          font-size: clamp(0.6rem, 0.7vw, 0.7rem);
          letter-spacing: 0.08em;
        }

        /* ─── STATS BAR ─── */
        .stats-bar {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0.5rem;
          margin-bottom: 2.5rem;
          padding: 1rem 0;
          border-bottom: 1px solid rgba(255,255,255,0.04);
        }

        .stat-item {
          text-align: center;
          padding: 0.5rem;
          transition: all 0.3s ease;
          border-radius: 8px;
        }

        .stat-item:hover {
          background: rgba(255,255,255,0.02);
        }

        .stat-number {
          display: block;
          font-size: clamp(1.4rem, 2.5vw, 2rem);
          font-weight: 600;
          color: #fff;
          letter-spacing: 0.02em;
        }

        .stat-label {
          display: block;
          font-size: clamp(0.5rem, 0.6vw, 0.6rem);
          color: rgba(255,255,255,0.25);
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-top: 0.15rem;
        }

        .stat-number .accent {
          color: #fbbf24;
        }

        /* ─── SECTION HEADERS ─── */
        .section-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 0.75rem;
        }

        .section-header h2 {
          color: rgba(255,255,255,0.8);
          font-size: clamp(0.9rem, 1.2vw, 1.1rem);
          font-weight: 500;
          letter-spacing: 0.08em;
        }

        .section-header .line {
          flex: 1;
          height: 1px;
          background: rgba(255,255,255,0.04);
        }

        .about-section {
          margin-bottom: 2rem;
        }

        .about-section p {
          color: rgba(255,255,255,0.55);
          font-size: clamp(0.85rem, 1.05vw, 0.95rem);
          line-height: 1.9;
          letter-spacing: 0.02em;
          margin-bottom: 0.5rem;
        }

        .about-section .highlight {
          color: rgba(255,255,255,0.85);
        }

        /* ─── SKILLS GRID ─── */
        .skills-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
          gap: 0.5rem;
          margin-top: 0.5rem;
        }

        .skill-item {
          padding: 0.5rem 0.75rem;
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.04);
          border-radius: 8px;
          text-align: center;
          font-size: clamp(0.6rem, 0.7vw, 0.7rem);
          color: rgba(255,255,255,0.5);
          letter-spacing: 0.04em;
          transition: all 0.3s ease;
        }

        .skill-item:hover {
          background: rgba(255,255,255,0.05);
          border-color: rgba(255,255,255,0.08);
          color: rgba(255,255,255,0.8);
          transform: translateY(-2px);
        }

        .skill-item .icon {
          display: block;
          font-size: 1.2rem;
          margin-bottom: 0.2rem;
        }

        /* ─── EXPERIENCE CARDS ─── */
        .exp-card {
          padding: 1rem 1.2rem;
          margin-bottom: 0.75rem;
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.04);
          border-radius: 10px;
          transition: all 0.3s ease;
        }

        .exp-card:hover {
          background: rgba(255,255,255,0.03);
          border-color: rgba(255,255,255,0.08);
        }

        .exp-card .role {
          color: rgba(255,255,255,0.85);
          font-weight: 500;
          font-size: clamp(0.9rem, 1.1vw, 1rem);
        }

        .exp-card .org {
          color: rgba(255,255,255,0.25);
          font-size: clamp(0.7rem, 0.8vw, 0.75rem);
          letter-spacing: 0.05em;
          margin-left: 0.5rem;
        }

        .exp-card ul {
          list-style: none;
          margin-top: 0.3rem;
        }

        .exp-card ul li {
          color: rgba(255,255,255,0.45);
          font-size: clamp(0.8rem, 0.9vw, 0.85rem);
          line-height: 1.7;
          padding-left: 1.2rem;
          position: relative;
        }

        .exp-card ul li::before {
          content: '▸';
          position: absolute;
          left: 0;
          color: rgba(255,255,255,0.1);
        }

        /* ─── ROLE TAGS ─── */
        .role-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.4rem;
          margin-top: 0.5rem;
        }

        .role-tag {
          padding: 0.2rem 0.8rem;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 12px;
          font-size: clamp(0.55rem, 0.65vw, 0.6rem);
          color: rgba(255,255,255,0.3);
          letter-spacing: 0.05em;
          transition: all 0.3s ease;
        }

        .role-tag:hover {
          background: rgba(255,255,255,0.06);
          border-color: rgba(255,255,255,0.08);
          color: rgba(255,255,255,0.5);
        }

        /* ─── DUOLINGO ─── */
        .duolingo-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.75rem 1.2rem;
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.04);
          border-radius: 10px;
          margin-top: 0.3rem;
          transition: all 0.3s ease;
        }

        .duolingo-card:hover {
          background: rgba(255,255,255,0.03);
          border-color: rgba(255,255,255,0.08);
        }

        .duolingo-card .flag { font-size: 1.5rem; }
        .duolingo-card .lang { color: rgba(255,255,255,0.8); font-weight: 500; font-size: clamp(0.9rem, 1vw, 1rem); }
        .duolingo-card .score { color: #58cc02; font-weight: 600; font-size: clamp(0.85rem, 1vw, 0.95rem); }
        .duolingo-card .link { color: rgba(255,255,255,0.2); text-decoration: none; font-size: clamp(0.6rem, 0.7vw, 0.65rem); transition: color 0.3s ease; margin-left: auto; }
        .duolingo-card .link:hover { color: rgba(255,255,255,0.5); }

        /* ─── NAV ─── */
        .top-nav {
          position: fixed;
          top: 30px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 10004;
          display: flex;
          align-items: center;
          justify-content: center;
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
        .top-nav.visible { opacity: 1; pointer-events: all; }

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
        .top-nav a:hover::after { width: 80%; }
        .top-nav a:hover { color: rgba(255, 255, 255, 0.9); }
        .top-nav a.active { color: #ffffff; }
        .top-nav a.active::after { width: 80%; }

        .back-button {
          position: fixed;
          top: 30px;
          left: 30px;
          z-index: 10;
          color: rgba(255, 255, 255, 0.6);
          font-family: 'Aeonik', 'General Sans', sans-serif;
          font-size: 0.8rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          background: rgba(255, 255, 255, 0.06);
          backdrop-filter: blur(16px);
          padding: 12px 24px;
          border-radius: 2mm;
          border: 1px solid rgba(255, 255, 255, 0.08);
          cursor: pointer;
          transition: opacity 0.8s ease;
          opacity: 0;
        }
        .back-button.visible { opacity: 1; }
        .back-button:hover { color: rgba(255, 255, 255, 0.9); }

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
          background-image: linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), 
                           linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px);
          background-size: 60px 60px;
          background-position: 0 0, 0 0;
          mask-image: radial-gradient(circle at center, rgba(0,0,0,1) 15%, rgba(0,0,0,0.8) 30%, rgba(0,0,0,0) 55%);
          -webkit-mask-image: radial-gradient(circle at center, rgba(0,0,0,1) 15%, rgba(0,0,0,0.8) 30%, rgba(0,0,0,0) 55%);
        }

        @media (max-width: 768px) {
          .top-nav { padding: 8px 16px; min-width: 280px; gap: 1rem; top: 20px; }
          .top-nav .nav-group { gap: 1.5rem; }
          .top-nav a { font-size: clamp(0.5rem, 0.6vw, 0.6rem); letter-spacing: 0.1em; padding: 4px 6px; }
          .back-button { top: 20px; left: 20px; padding: 8px 16px; font-size: 0.6rem; }
          .page-content { padding: 30px 16px; }
          .stats-bar { grid-template-columns: repeat(2, 1fr); gap: 0.5rem; }
          .skills-grid { grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); }
        }

        @media (max-width: 480px) {
          .top-nav { padding: 6px 12px; min-width: 200px; gap: 0.8rem; top: 16px; }
          .top-nav .nav-group { gap: 1rem; }
          .top-nav a { font-size: clamp(0.4rem, 0.5vw, 0.5rem); letter-spacing: 0.08em; padding: 3px 4px; }
          .back-button { top: 16px; left: 16px; padding: 6px 12px; font-size: 0.5rem; }
          .page-content { padding: 20px 12px; }
          .stats-bar { grid-template-columns: 1fr 1fr; gap: 0.3rem; }
          .skills-grid { grid-template-columns: repeat(auto-fill, minmax(80px, 1fr)); }
          .duolingo-card { flex-wrap: wrap; gap: 0.5rem; }
          .duolingo-card .link { margin-left: 0; }
        }
      `}</style>

      <div className={`loading-overlay ${!showContent ? 'active' : ''}`} />

      <canvas ref={bgCanvasRef} className="bg-canvas" />
      <div className="grid-blueprint" />

      <nav className={`top-nav ${showContent ? 'visible' : ''}`}>
        <div className="nav-group">
          <a href="/dashboard" onClick={handleNavigation('/dashboard')}>Dashboard</a>
          <a href="/projects" onClick={handleNavigation('/projects')}>Projects</a>
          <a href="/about" className="active" onClick={handleNavigation('/about')}>About</a>
        </div>
      </nav>

      <button className={`back-button ${showContent ? 'visible' : ''}`} onClick={handleBackToHome}>
        Back
      </button>
      
      <main ref={pageShellRef} className="page-shell">
        <div className={`page-content ${showContent ? 'visible' : ''}`}>
          
          {/* ─── HERO ─── */}
          <div className="hero-section">
            <h1 className="hero-name">
              Joel <span className="highlight">Joju</span>
            </h1>
            <p className="hero-tagline">
              Embedded Systems · Hardware · Firmware · PCB Design
            </p>
            <span className="hero-badge">✦ Hack Club · Project Reviewer &amp; Event Manager</span>
          </div>

          {/* ─── STATS BAR ─── */}
          <div className="stats-bar">
            <div className="stat-item">
              <span className="stat-number">17</span>
              <span className="stat-label">Age</span>
            </div>
            <div className="stat-item">
              <span className="stat-number"><span className="accent">∞</span></span>
              <span className="stat-label">Projects Built</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">📍</span>
              <span className="stat-label">Kerala, India</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">⚡</span>
              <span className="stat-label">Embedded Systems</span>
            </div>
          </div>

          {/* ─── ABOUT ─── */}
          <div className="about-section">
            <div className="section-header">
              <h2>About</h2>
              <span className="line" />
            </div>
            <p>
              I'm an embedded systems and hardware developer with a passion for building practical technology that combines <span className="highlight">electronics and software</span>.
            </p>
            <p>
              I design <span className="highlight">PCBs</span>, develop firmware for <span className="highlight">ESP32</span> and <span className="highlight">Arduino</span>, build robotics and UAV prototypes, and create full-stack web applications. I take ideas from concept to working prototype—designing circuits, writing firmware, debugging hardware, and refining systems through hands-on experimentation.
            </p>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.85rem', marginTop: '0.3rem' }}>
              <span className="highlight" style={{ color: 'rgba(255,255,255,0.6)' }}>Open to:</span> Embedded Systems · Hardware Engineering · PCB Design · Robotics · IoT · Firmware
            </p>
            <div className="role-tags">
              <span className="role-tag">Embedded Systems Intern</span>
              <span className="role-tag">Hardware Engineer</span>
              <span className="role-tag">PCB Design</span>
              <span className="role-tag">Robotics Engineer</span>
              <span className="role-tag">IoT Developer</span>
              <span className="role-tag">Firmware Engineer</span>
              <span className="role-tag">Mechatronics</span>
            </div>
          </div>

          {/* ─── EXPERIENCE ─── */}
          <div className="about-section">
            <div className="section-header">
              <h2>Experience</h2>
              <span className="line" />
            </div>
            
            <div className="exp-card">
              <span className="role">Project Reviewer</span>
              <span className="org">Hack Club</span>
              <ul>
                <li>Reviewed hardware and embedded systems projects submitted by Hack Club members worldwide</li>
                <li>Provided constructive technical feedback on PCB design, electronics, firmware, and hardware implementation</li>
                <li>Helped improve project quality through engineering reviews and troubleshooting guidance</li>
              </ul>
            </div>

            <div className="exp-card">
              <span className="role">Event Manager</span>
              <span className="org">Hack Club · Blueprint Build Guild</span>
              <ul>
                <li>Helped organize Hack Club Blueprint Build Guild events in Kochi</li>
                <li>Coordinated event logistics and supported participant engagement</li>
                <li>Assisted in planning hardware-focused workshops and community activities</li>
              </ul>
            </div>
          </div>

          {/* ─── SKILLS ─── */}
          <div className="about-section">
            <div className="section-header">
              <h2>Skills</h2>
              <span className="line" />
            </div>
            <div className="skills-grid">
              <div className="skill-item"><span className="icon">⚡</span>Embedded</div>
              <div className="skill-item"><span className="icon">🔧</span>ESP32</div>
              <div className="skill-item"><span className="icon">📟</span>Arduino</div>
              <div className="skill-item"><span className="icon">📐</span>PCB Design</div>
              <div className="skill-item"><span className="icon">🔌</span>Electronics</div>
              <div className="skill-item"><span className="icon">🧠</span>Firmware</div>
              <div className="skill-item"><span className="icon">💻</span>C++</div>
              <div className="skill-item"><span className="icon">⚙️</span>Node.js</div>
              <div className="skill-item"><span className="icon">🤖</span>Robotics</div>
              <div className="skill-item"><span className="icon">🌐</span>IoT</div>
              <div className="skill-item"><span className="icon">🔬</span>Debugging</div>
              <div className="skill-item"><span className="icon">🛠️</span>Soldering</div>
              <div className="skill-item"><span className="icon">📊</span>EasyEDA</div>
              <div className="skill-item"><span className="icon">🖥️</span>Git</div>
              <div className="skill-item"><span className="icon">📡</span>Raspberry Pi</div>
            </div>
          </div>

          {/* ─── DUOLINGO ─── */}
          <div className="about-section" style={{ marginBottom: 0 }}>
            <div className="section-header">
              <h2>Language Learning</h2>
              <span className="line" />
            </div>
            <div className="duolingo-card">
              <span className="flag">🇫🇷</span>
              <span className="lang">French</span>
              <span className="score">● Learning</span>
              <a href="https://www.duolingo.com/profile/joeljoju06" target="_blank" rel="noopener noreferrer" className="link">
                View Progress →
              </a>
            </div>
          </div>

        </div>
      </main>
    </>
  );
}