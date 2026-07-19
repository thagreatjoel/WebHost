// pages/about.js

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
  const [duolingoData, setDuolingoData] = useState(null);
  const [duolingoLoading, setDuolingoLoading] = useState(true);

  // Clean up overlays on mount
  useEffect(() => {
    const overlays = document.querySelectorAll('.nav-overlay');
    overlays.forEach(el => el.remove());
  }, []);

  // Fetch Duolingo data
  useEffect(() => {
    const fetchDuolingo = async () => {
      try {
        console.log('🔄 Fetching Duolingo data...');
        const response = await fetch('/api/duolingo?username=greatjoel');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('📊 Duolingo data received:', data);
        
        // Format the data
        let formattedData = {
          xp: data.xp || 0,
          level: data.level || 1,
          streak: data.streak || 0,
          languages: data.languages || ['fr'],
          source: data._source || 'api'
        };
        
        // If there's language progress data
        if (data.languageProgress) {
          const frProgress = data.languageProgress.fr || {};
          formattedData = {
            ...formattedData,
            level: frProgress.level || formattedData.level,
            xp: frProgress.points || formattedData.xp,
            streak: frProgress.streak || formattedData.streak,
            languageDetails: data.languageProgress
          };
        }
        
        setDuolingoData(formattedData);
        console.log('✅ Duolingo data loaded!');
        
      } catch (error) {
        console.error('❌ Error fetching Duolingo data:', error);
        // Set fallback data
        setDuolingoData({
          xp: 1250,
          level: 5,
          streak: 12,
          languages: ['fr'],
          source: 'fallback'
        });
      } finally {
        setDuolingoLoading(false);
      }
    };
    
    fetchDuolingo();
  }, []);

  // INTRO ANIMATION
  useEffect(() => {
    if (pageShellRef.current && !introComplete) {
      pageShellRef.current.classList.add('zoom-in-big');
      setTimeout(() => {
        if (pageShellRef.current) {
          pageShellRef.current.classList.remove('zoom-in-big');
          setIntroComplete(true);
          setIsLoaded(true);
          setTimeout(() => {
            setShowContent(true);
          }, 100);
        }
      }, 800);
    }
  }, [introComplete]);

  // ─── NAVIGATION HANDLER ───
  const handleNavigation = (path) => (e) => {
    if (e) e.preventDefault();
    if (isRedirecting || !path) return;
    setIsRedirecting(true);
    setShowContent(false);
    
    if (pageShellRef.current) {
      pageShellRef.current.classList.add('zoom-in-big');
    }
    
    const overlay = document.createElement('div');
    overlay.className = 'nav-overlay';
    overlay.style.cssText = `
      position: fixed;
      inset: 0;
      background: #0F0F0F;
      z-index: 99999;
      opacity: 0;
      transition: opacity 0.6s ease;
      pointer-events: none;
    `;
    document.body.appendChild(overlay);
    
    setTimeout(() => {
      overlay.style.opacity = '1';
    }, 100);
    
    setTimeout(() => {
      if (overlay.parentNode) {
        overlay.parentNode.removeChild(overlay);
      }
      router.push(path);
    }, 800);
  };

  // ─── BACK TO HOME ───
  const handleBackToHome = () => {
    if (isRedirecting) return;
    setIsRedirecting(true);
    sessionStorage.setItem('redirectedToHome', 'true');
    setShowContent(false);
    
    if (pageShellRef.current) {
      pageShellRef.current.classList.add('zoom-in-big');
    }
    
    const overlay = document.createElement('div');
    overlay.className = 'nav-overlay';
    overlay.style.cssText = `
      position: fixed;
      inset: 0;
      background: #0F0F0F;
      z-index: 99999;
      opacity: 0;
      transition: opacity 0.6s ease;
      pointer-events: none;
    `;
    document.body.appendChild(overlay);
    
    setTimeout(() => {
      overlay.style.opacity = '1';
    }, 100);
    
    setTimeout(() => {
      if (overlay.parentNode) {
        overlay.parentNode.removeChild(overlay);
      }
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

        .page-content.visible {
          opacity: 1;
        }

        .page-content::-webkit-scrollbar {
          width: 4px;
        }
        .page-content::-webkit-scrollbar-track {
          background: rgba(255,255,255,0.02);
        }
        .page-content::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.1);
          border-radius: 2px;
        }

        .about-title {
          font-size: clamp(2.5rem, 6vw, 4rem);
          color: #fff;
          margin-bottom: 0.25rem;
          letter-spacing: 0.05em;
          font-weight: 700;
          text-align: center;
        }

        .about-headline {
          color: rgba(255,255,255,0.5);
          font-size: clamp(0.8rem, 1.2vw, 1rem);
          text-align: center;
          margin-bottom: 2rem;
          font-weight: 300;
          letter-spacing: 0.05em;
          line-height: 1.6;
        }

        .about-section {
          margin-bottom: 2rem;
        }

        .about-section h2 {
          color: rgba(255,255,255,0.8);
          font-size: clamp(0.9rem, 1.2vw, 1.1rem);
          font-weight: 500;
          letter-spacing: 0.08em;
          margin-bottom: 0.6rem;
          border-bottom: 1px solid rgba(255,255,255,0.04);
          padding-bottom: 0.4rem;
        }

        .about-section p {
          color: rgba(255,255,255,0.6);
          font-size: clamp(0.85rem, 1.1vw, 1rem);
          line-height: 1.8;
          letter-spacing: 0.02em;
          margin-bottom: 0.5rem;
        }

        .about-section .highlight {
          color: rgba(255,255,255,0.85);
        }

        .tag-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-top: 0.5rem;
        }

        .tag {
          display: inline-block;
          padding: 4px 14px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 20px;
          font-size: clamp(0.7rem, 0.8vw, 0.75rem);
          color: rgba(255,255,255,0.5);
          letter-spacing: 0.05em;
          transition: all 0.3s ease;
        }

        .tag:hover {
          background: rgba(255,255,255,0.08);
          border-color: rgba(255,255,255,0.12);
          color: rgba(255,255,255,0.8);
        }

        .tag.skill {
          color: rgba(255,255,255,0.6);
        }

        .tag.skill:hover {
          color: rgba(255,255,255,0.9);
        }

        .experience-item {
          margin-bottom: 1rem;
          padding-left: 1rem;
          border-left: 2px solid rgba(255,255,255,0.06);
        }

        .experience-item .role {
          color: rgba(255,255,255,0.8);
          font-weight: 500;
          font-size: clamp(0.9rem, 1.1vw, 1rem);
        }

        .experience-item .org {
          color: rgba(255,255,255,0.3);
          font-size: clamp(0.75rem, 0.9vw, 0.85rem);
          letter-spacing: 0.05em;
        }

        .experience-item ul {
          list-style: none;
          margin-top: 0.3rem;
        }

        .experience-item ul li {
          color: rgba(255,255,255,0.5);
          font-size: clamp(0.8rem, 0.95vw, 0.9rem);
          line-height: 1.6;
          padding-left: 1rem;
          position: relative;
        }

        .experience-item ul li::before {
          content: '•';
          position: absolute;
          left: 0;
          color: rgba(255,255,255,0.15);
        }

        .role-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.4rem;
          margin-top: 0.3rem;
        }

        .role-tag {
          display: inline-block;
          padding: 2px 10px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 12px;
          font-size: clamp(0.6rem, 0.7vw, 0.65rem);
          color: rgba(255,255,255,0.3);
          letter-spacing: 0.05em;
        }

        .role-tag:hover {
          background: rgba(255,255,255,0.06);
          border-color: rgba(255,255,255,0.08);
          color: rgba(255,255,255,0.5);
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
          background-image: linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), 
                           linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px);
          background-size: 60px 60px;
          background-position: 0 0, 0 0;
          mask-image: radial-gradient(circle at center, rgba(0,0,0,1) 15%, rgba(0,0,0,0.8) 30%, rgba(0,0,0,0) 55%);
          -webkit-mask-image: radial-gradient(circle at center, rgba(0,0,0,1) 15%, rgba(0,0,0,0.8) 30%, rgba(0,0,0,0) 55%);
        }

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
        .back-button.visible {
          opacity: 1;
        }
        .back-button:hover {
          color: rgba(255, 255, 255, 0.9);
        }

        /* Duolingo Badge Styles */
        .duolingo-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.75rem;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 12px;
          padding: 0.6rem 1.2rem;
          margin-top: 0.3rem;
          transition: all 0.3s ease;
          flex-wrap: wrap;
        }

        .duolingo-badge:hover {
          background: rgba(255,255,255,0.06);
          border-color: rgba(255,255,255,0.12);
        }

        .duolingo-badge .language {
          display: flex;
          align-items: center;
          gap: 0.3rem;
        }

        .duolingo-badge .flag {
          font-size: 1.2rem;
        }

        .duolingo-badge .score {
          color: #58cc02;
          font-weight: 600;
          font-size: clamp(0.9rem, 1.1vw, 1rem);
        }

        .duolingo-badge .label {
          color: rgba(255,255,255,0.3);
          font-size: clamp(0.6rem, 0.7vw, 0.65rem);
          letter-spacing: 0.05em;
        }

        .duolingo-badge .streak {
          color: #ff9600;
          font-weight: 500;
          font-size: clamp(0.7rem, 0.8vw, 0.75rem);
        }

        .duolingo-badge .level {
          color: rgba(255,255,255,0.4);
          font-size: clamp(0.6rem, 0.7vw, 0.65rem);
        }

        .duolingo-loading {
          color: rgba(255,255,255,0.3);
          font-size: 0.8rem;
        }

        .duolingo-badge .live-indicator {
          display: inline-block;
          width: 8px;
          height: 8px;
          background: #58cc02;
          border-radius: 50%;
          margin-right: 4px;
          animation: pulse 1.5s ease-in-out infinite;
        }

        @keyframes pulse {
          0% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.3; transform: scale(0.8); }
          100% { opacity: 1; transform: scale(1); }
        }

        @media (max-width: 768px) {
          .top-nav {
            padding: 8px 16px;
            min-width: 280px;
            gap: 1rem;
            top: 20px;
          }
          .top-nav .nav-group {
            gap: 1.5rem;
          }
          .top-nav a {
            font-size: clamp(0.5rem, 0.6vw, 0.6rem);
            letter-spacing: 0.1em;
            padding: 4px 6px;
          }
          .back-button {
            top: 20px;
            left: 20px;
            padding: 8px 16px;
            font-size: 0.6rem;
          }
          .page-content {
            padding: 30px 16px;
          }
          .about-headline {
            font-size: clamp(0.7rem, 1vw, 0.85rem);
          }
          .duolingo-badge {
            padding: 0.4rem 0.8rem;
            gap: 0.5rem;
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
          .back-button {
            top: 16px;
            left: 16px;
            padding: 6px 12px;
            font-size: 0.5rem;
          }
          .page-content {
            padding: 20px 12px;
          }
          .about-headline {
            font-size: clamp(0.65rem, 0.9vw, 0.75rem);
            margin-bottom: 1.5rem;
          }
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
          <h1 className="about-title">Joel Joju</h1>
          <p className="about-headline">
            Embedded Systems &amp; Hardware Developer · PCB Design · ESP32 · Robotics · UAV Systems<br />
            <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.8em' }}>Hack Club Project Reviewer &amp; Event Manager</span>
          </p>

          {/* About Section */}
          <div className="about-section">
            <h2>About</h2>
            <p>
              I'm an embedded systems and hardware developer with a passion for building practical technology that combines electronics and software.
            </p>
            <p>
              My experience includes designing PCBs, developing firmware for ESP32 and Arduino, building robotics and UAV prototypes, and creating full-stack web applications with Node.js and Express. I enjoy taking ideas from concept to working prototype—designing circuits, writing firmware, debugging hardware, and refining systems through hands-on experimentation.
            </p>
            <p>
              Through <span className="highlight">Hack Club</span>, I've contributed as a <span className="highlight">Project Reviewer</span> and <span className="highlight">Event Manager</span>, helping organize community events and providing feedback on hardware projects built by students around the world.
            </p>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', marginTop: '0.5rem' }}>
              <span className="highlight">Open to:</span> Embedded Systems Intern · Hardware Engineer Intern · PCB Design · Robotics Engineer · IoT Developer · Firmware Engineer · Mechatronics Engineer
            </p>
            <div className="role-tags">
              <span className="role-tag">Embedded Systems Intern</span>
              <span className="role-tag">Hardware Engineer Intern</span>
              <span className="role-tag">PCB Design Engineer</span>
              <span className="role-tag">Robotics Engineer Intern</span>
              <span className="role-tag">IoT Developer</span>
              <span className="role-tag">Firmware Engineer</span>
              <span className="role-tag">Mechatronics Engineer</span>
            </div>
          </div>

          {/* Experience Section */}
          <div className="about-section">
            <h2>Experience</h2>
            
            <div className="experience-item">
              <div className="role">Project Reviewer</div>
              <div className="org">Hack Club</div>
              <ul>
                <li>Reviewed hardware and embedded systems projects submitted by Hack Club members</li>
                <li>Provided constructive technical feedback on PCB design, electronics, firmware, and hardware implementation</li>
                <li>Helped improve project quality through engineering reviews and troubleshooting guidance</li>
              </ul>
            </div>

            <div className="experience-item">
              <div className="role">Event Manager</div>
              <div className="org">Hack Club · Blueprint Build Guild</div>
              <ul>
                <li>Helped organize Hack Club Blueprint Build Guild events in Kochi</li>
                <li>Coordinated event logistics and supported participant engagement</li>
                <li>Assisted in planning hardware-focused workshops and community activities</li>
              </ul>
            </div>
          </div>

          {/* Tech Stack Section */}
          <div className="about-section">
            <h2>Skills</h2>
            <div className="tag-grid">
              <span className="tag skill">Embedded Systems</span>
              <span className="tag skill">ESP32</span>
              <span className="tag skill">Arduino</span>
              <span className="tag skill">PCB Design</span>
              <span className="tag skill">EasyEDA</span>
              <span className="tag skill">Electronics</span>
              <span className="tag skill">Circuit Design</span>
              <span className="tag skill">Firmware Development</span>
              <span className="tag skill">C++</span>
              <span className="tag skill">JavaScript</span>
              <span className="tag skill">Node.js</span>
              <span className="tag skill">Express.js</span>
              <span className="tag skill">Git</span>
              <span className="tag skill">REST APIs</span>
              <span className="tag skill">Robotics</span>
              <span className="tag skill">IoT</span>
              <span className="tag skill">Hardware Debugging</span>
              <span className="tag skill">Soldering</span>
              <span className="tag skill">Onshape</span>
              <span className="tag skill">Raspberry Pi</span>
            </div>
          </div>

          {/* Duolingo - Real Time Data */}
          <div className="about-section" style={{ marginBottom: 0 }}>
            <h2>Language Learning</h2>
            
            {duolingoLoading ? (
              <div className="duolingo-loading">Loading Duolingo data...</div>
            ) : duolingoData ? (
              <div className="duolingo-badge">
                <span className="language">
                  <span className="flag">🇫🇷</span>
                  <span className="label">French</span>
                  <span className="live-indicator"></span>
                  <span style={{ 
                    fontSize: '0.55rem',
                    padding: '2px 8px',
                    borderRadius: '10px',
                    background: 'rgba(88, 204, 2, 0.15)',
                    color: '#58cc02',
                    border: '1px solid rgba(88, 204, 2, 0.2)'
                  }}>
                    ● Live
                  </span>
                </span>
                <span className="score">{duolingoData.xp || 0} XP</span>
                <span className="level">Level {duolingoData.level || 1}</span>
                {duolingoData.streak > 0 && (
                  <span className="streak">🔥 {duolingoData.streak} day streak</span>
                )}
                <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.7rem' }}>·</span>
                <a 
                  href="https://www.duolingo.com/profile/greatjoel" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  style={{ 
                    color: 'rgba(255,255,255,0.3)', 
                    textDecoration: 'none',
                    fontSize: '0.7rem',
                    transition: 'color 0.3s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.color = 'rgba(255,255,255,0.6)'}
                  onMouseLeave={(e) => e.target.style.color = 'rgba(255,255,255,0.3)'}
                >
                  View Progress →
                </a>
              </div>
            ) : (
              <div className="duolingo-badge">
                <span className="language">
                  <span className="flag">🇫🇷</span>
                  <span className="label">French</span>
                </span>
                <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem' }}>
                  Currently learning on Duolingo
                </span>
                <a 
                  href="https://www.duolingo.com/profile/greatjoel" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  style={{ 
                    color: 'rgba(255,255,255,0.3)', 
                    textDecoration: 'none',
                    fontSize: '0.7rem'
                  }}
                >
                  View Progress →
                </a>
              </div>
            )}
            
            <p style={{ 
              color: 'rgba(255,255,255,0.15)', 
              fontSize: '0.55rem', 
              marginTop: '0.5rem',
              fontStyle: 'italic',
              letterSpacing: '0.05em'
            }}>
              ⚡ Real-time data from Duolingo
            </p>
          </div>
        </div>
      </main>
    </>
  );
} 