import Head from 'next/head';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';

// ─── FALLBACK DATA ───
const getFallbackProjects = () => {
  return [
    {
      name: 'WebHost',
      description: 'hosting own free webpage through GitHub pages',
      language: 'JavaScript',
      stargazers_count: 0,
      forks_count: 0,
      html_url: 'https://github.com/thagreatjoel/WebHost',
      updated_at: '2026-07-17T20:34:37Z'
    },
    {
      name: 'Portfolio',
      description: 'Own personal website',
      language: 'JavaScript',
      stargazers_count: 1,
      forks_count: 0,
      html_url: 'https://github.com/thagreatjoel/Portfolio',
      updated_at: '2026-07-17T07:11:56Z'
    },
    {
      name: 'TRIVTOL',
      description: 'A Drone frame 3d model, tricopter with 3 motors',
      language: 'N/A',
      stargazers_count: 0,
      forks_count: 0,
      html_url: 'https://github.com/thagreatjoel/TRIVTOL',
      updated_at: '2026-07-12T14:40:36Z'
    },
    {
      name: 'runway',
      description: 'No description available',
      language: 'HTML',
      stargazers_count: 0,
      forks_count: 0,
      html_url: 'https://github.com/thagreatjoel/runway',
      updated_at: '2026-07-11T08:29:22Z'
    },
    {
      name: 'DualDesk',
      description: 'No description available',
      language: 'C++',
      stargazers_count: 0,
      forks_count: 0,
      html_url: 'https://github.com/thagreatjoel/DualDesk',
      updated_at: '2026-07-09T08:38:29Z'
    },
    {
      name: 'PowerStack-Zero',
      description: 'An UPS and RTC system for Micro-controllers',
      language: 'Python',
      stargazers_count: 1,
      forks_count: 0,
      html_url: 'https://github.com/thagreatjoel/PowerStack-Zero',
      updated_at: '2026-05-31T06:10:53Z'
    },
    {
      name: 'SeedPi',
      description: 'The RK3308B processor based Linux single-board computer',
      language: 'Objective-C++',
      stargazers_count: 1,
      forks_count: 0,
      html_url: 'https://github.com/thagreatjoel/SeedPi',
      updated_at: '2026-03-30T07:20:31Z'
    },
    {
      name: 'Build-Guild',
      description: 'Event website',
      language: 'HTML',
      stargazers_count: 0,
      forks_count: 1,
      html_url: 'https://github.com/thagreatjoel/Build-Guild',
      updated_at: '2026-06-23T19:02:52Z'
    }
  ];
};

// ─── SERVER-SIDE PROPS (Works on Vercel) ───
export async function getServerSideProps() {
  const username = 'thagreatjoel';
  let repos = [];
  let error = null;
  let usingFallback = false;

  try {
    const response = await fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=updated`, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Next.js-App'
      }
    });

    // Check if response is JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      usingFallback = true;
      repos = getFallbackProjects();
    } else if (!response.ok) {
      if (response.status === 403) {
        error = 'GitHub API rate limit exceeded. Showing sample projects.';
      } else if (response.status === 404) {
        error = 'GitHub user not found. Showing sample projects.';
      } else {
        error = `GitHub API error (${response.status}). Showing sample projects.`;
      }
      usingFallback = true;
      repos = getFallbackProjects();
    } else {
      try {
        const data = await response.json();
        repos = Array.isArray(data) ? data : [];
        
        if (repos.length === 0) {
          usingFallback = true;
          repos = getFallbackProjects();
        }
      } catch (jsonError) {
        console.error('Failed to parse GitHub response:', jsonError);
        usingFallback = true;
        repos = getFallbackProjects();
      }
    }
  } catch (fetchError) {
    console.error("Failed to fetch from GitHub:", fetchError);
    error = 'Could not connect to GitHub API. Showing sample projects.';
    usingFallback = true;
    repos = getFallbackProjects();
  }

  return {
    props: {
      repos: Array.isArray(repos) ? repos : getFallbackProjects(),
      error: error || null,
      usingFallback: usingFallback || false,
    },
  };
}

export default function Projects({ repos = [], error = null, usingFallback = false }) {
  const router = useRouter();
  const pageShellRef = useRef(null);
  const bgCanvasRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const [isLoaded, setIsLoaded] = useState(false);
  const [introComplete, setIntroComplete] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [showContent, setShowContent] = useState(false);

  // Ensure repos is always an array
  const safeRepos = Array.isArray(repos) ? repos : [];

  // ─── CLEAN UP OVERLAYS ───
  useEffect(() => {
    const overlays = document.querySelectorAll('.nav-overlay');
    overlays.forEach(el => el.remove());
  }, []);

  // ─── INTRO ANIMATION ───
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

  // ─── PROCESS REPOS DATA ───
  const sortedByStars = [...safeRepos].sort((a, b) => (b.stargazers_count || 0) - (a.stargazers_count || 0));
  const pinnedRepos = sortedByStars.slice(0, 4);

  const sortedByUpdated = [...safeRepos].sort((a, b) => {
    return new Date(b.updated_at || 0) - new Date(a.updated_at || 0);
  });
  const recentRepos = sortedByUpdated.slice(0, 4);

  const safeError = error || null;
  const safeUsingFallback = usingFallback || false;

  return (
    <>
      <Head>
        <title>Projects | Joel Joju</title>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <meta name="description" content="Projects - Joel Joju Portfolio" />
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
        html, body { 
          height: 100%; 
          width: 100%; 
          overflow: hidden !important;
          position: fixed;
        }
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
          position: fixed;
          inset: 0;
          background: #0F0F0F;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
          transform-origin: center center;
          width: 100vw;
          height: 100vh;
        }
        .page-shell.zoom-in-big {
          transform: scale(1.8);
          opacity: 0;
          filter: blur(34px);
        }

        .page-content {
          position: relative;
          z-index: 10;
          max-width: 95vw;
          width: 1200px;
          opacity: 0;
          transition: opacity 0.8s ease;
          padding: 70px 20px 30px;
          max-height: 100vh;
          overflow: hidden;
        }

        .page-content.visible {
          opacity: 1;
        }

        .projects-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          width: 100%;
          margin: 0 auto;
          max-height: calc(100vh - 140px);
          overflow: hidden;
        }

        .section-title {
          grid-column: 1 / -1;
          font-size: 0.65rem;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          color: rgba(255, 255, 255, 0.3);
          margin-top: 4px;
          margin-bottom: 2px;
          padding-bottom: 4px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.04);
          font-weight: 400;
        }

        .section-title:first-of-type {
          margin-top: 0;
        }

        .project-card {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 2mm;
          padding: 14px 16px;
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
          cursor: pointer;
          text-decoration: none;
          color: inherit;
          min-height: 80px;
        }

        .project-card:hover {
          background: rgba(255, 255, 255, 0.06);
          border-color: rgba(255, 255, 255, 0.15);
          transform: translateY(-2px);
        }

        .project-name {
          font-size: 0.85rem;
          font-weight: 600;
          color: #fff;
          letter-spacing: 0.02em;
          margin-bottom: 4px;
        }

        .project-description {
          font-size: 0.7rem;
          color: rgba(255, 255, 255, 0.5);
          letter-spacing: 0.03em;
          margin-bottom: 8px;
          flex: 1;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }

        .project-meta {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 0.6rem;
          color: rgba(255, 255, 255, 0.3);
          letter-spacing: 0.05em;
          flex-wrap: wrap;
        }

        .project-language {
          display: inline-block;
          padding: 2px 8px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 1mm;
          font-size: 0.55rem;
          color: rgba(255, 255, 255, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.04);
        }

        .project-stats {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-left: auto;
        }

        .project-stat {
          display: flex;
          align-items: center;
          gap: 3px;
        }

        .pinned-badge {
          font-size: 0.5rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #f59e0b;
          background: rgba(245, 158, 11, 0.1);
          padding: 2px 8px;
          border-radius: 1mm;
          border: 1px solid rgba(245, 158, 11, 0.15);
          margin-left: 8px;
        }

        .error-notice {
          grid-column: 1 / -1;
          font-size: 0.7rem;
          color: rgba(255, 255, 255, 0.3);
          text-align: center;
          padding: 8px;
        }

        .fallback-notice {
          grid-column: 1 / -1;
          font-size: 0.5rem;
          color: rgba(255, 255, 255, 0.15);
          text-align: center;
          margin-top: -4px;
        }

        .repo-count {
          font-size: 0.6rem;
          color: rgba(255, 255, 255, 0.2);
          margin-left: 8px;
          font-weight: 300;
        }

        .no-projects {
          grid-column: 1 / -1;
          text-align: center;
          color: rgba(255, 255, 255, 0.3);
          font-size: 0.8rem;
          padding: 20px;
        }

        @media (max-width: 1024px) {
          .projects-grid {
            gap: 10px;
          }
        }

        @media (max-width: 768px) {
          .projects-grid {
            grid-template-columns: 1fr;
            gap: 8px;
            max-height: calc(100vh - 120px);
          }
          .page-content {
            padding: 60px 12px 20px;
          }
          .project-card {
            padding: 12px 14px;
            min-height: 70px;
          }
          .project-name {
            font-size: 0.75rem;
          }
          .project-description {
            font-size: 0.65rem;
          }
        }

        @media (max-width: 480px) {
          .project-card {
            padding: 10px 12px;
            min-height: 60px;
          }
          .project-name {
            font-size: 0.7rem;
          }
          .project-description {
            font-size: 0.6rem;
            -webkit-line-clamp: 1;
          }
          .project-meta {
            font-size: 0.5rem;
          }
          .page-content {
            padding: 55px 10px 15px;
          }
        }

        /* Navigation */
        .top-nav {
          position: fixed;
          top: 16px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 10004;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Aeonik', 'General Sans', sans-serif;
          font-size: clamp(0.5rem, 0.7vw, 0.7rem);
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.6);
          background: rgba(255, 255, 255, 0.06);
          backdrop-filter: blur(16px);
          padding: 8px 20px;
          border-radius: 2mm;
          border: 1px solid rgba(255, 255, 255, 0.08);
          opacity: 0;
          pointer-events: none;
          width: auto;
          min-width: 260px;
          max-width: 90%;
          transition: opacity 0.5s ease;
          gap: 1.5rem;
        }
        .top-nav.visible {
          opacity: 1;
          pointer-events: all;
        }

        .top-nav .nav-group {
          display: flex;
          align-items: center;
          gap: 1.8rem;
        }

        .top-nav a {
          color: rgba(255, 255, 255, 0.5);
          text-decoration: none;
          transition: color 0.3s ease;
          cursor: pointer;
          font-weight: 400;
          padding: 4px 6px;
          letter-spacing: 0.15em;
          white-space: nowrap;
          font-size: clamp(0.5rem, 0.65vw, 0.7rem);
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
          height: 14px;
          background: rgba(255, 255, 255, 0.15);
        }

        .top-nav .nav-plus {
          font-size: 1rem;
          font-weight: 300;
          color: rgba(255, 255, 255, 0.4);
          padding: 0 4px;
          transition: all 0.3s ease;
        }

        .top-nav .nav-plus:hover {
          color: rgba(255, 255, 255, 0.9);
          transform: rotate(90deg);
        }

        .back-button {
          position: fixed;
          top: 16px;
          left: 16px;
          z-index: 10;
          color: rgba(255, 255, 255, 0.6);
          font-family: 'Aeonik', 'General Sans', sans-serif;
          font-size: 0.65rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          background: rgba(255, 255, 255, 0.06);
          backdrop-filter: blur(16px);
          padding: 8px 16px;
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

        @media (max-width: 768px) {
          .top-nav {
            padding: 6px 14px;
            min-width: 200px;
            gap: 1rem;
            top: 12px;
          }
          .top-nav .nav-group {
            gap: 1.2rem;
          }
          .top-nav a {
            font-size: clamp(0.4rem, 0.5vw, 0.55rem);
            letter-spacing: 0.1em;
            padding: 3px 4px;
          }
          .back-button {
            top: 12px;
            left: 12px;
            padding: 6px 12px;
            font-size: 0.55rem;
          }
        }

        @media (max-width: 480px) {
          .top-nav {
            padding: 4px 10px;
            min-width: 150px;
            gap: 0.6rem;
            top: 10px;
          }
          .top-nav .nav-group {
            gap: 0.8rem;
          }
          .top-nav a {
            font-size: clamp(0.35rem, 0.4vw, 0.45rem);
            letter-spacing: 0.08em;
            padding: 2px 3px;
          }
          .top-nav .nav-plus {
            font-size: 0.8rem;
          }
          .back-button {
            top: 10px;
            left: 10px;
            padding: 4px 10px;
            font-size: 0.45rem;
          }
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
      `}</style>

      <div className={`loading-overlay ${!showContent ? 'active' : ''}`} />

      <canvas ref={bgCanvasRef} className="bg-canvas" />
      <div className="grid-blueprint" />

      {/* Navigation */}
      <nav className={`top-nav ${showContent ? 'visible' : ''}`}>
        <div className="nav-group">
          <a href="/dashboard" onClick={handleNavigation('/dashboard')}>Dashboard</a>
          <a href="/projects" className="active" onClick={handleNavigation('/projects')}>Projects</a>
          <a href="/about" onClick={handleNavigation('/about')}>About</a>
        </div>
      </nav>

      <button className={`back-button ${showContent ? 'visible' : ''}`} onClick={handleBackToHome}>
        Back
      </button>
      
      <main ref={pageShellRef} className="page-shell">
        <div className={`page-content ${showContent ? 'visible' : ''}`}>
          
          <div className="projects-grid">
            {safeError && (
              <div className="error-notice">⚠️ {safeError}</div>
            )}
            
            {safeUsingFallback && !safeError && (
              <div className="fallback-notice">ℹ️ Using sample project data</div>
            )}

            {safeRepos.length === 0 ? (
              <div className="no-projects">No projects found</div>
            ) : (
              <>
                {/* Pinned Projects (Top Starred) */}
                <div className="section-title">
                  📌 Featured Projects
                  <span className="repo-count">({pinnedRepos.length} shown)</span>
                </div>
                {pinnedRepos.map((repo, index) => (
                  <a 
                    key={`pinned-${index}`} 
                    href={repo.html_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="project-card"
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span className="project-name">{repo.name}</span>
                      {repo.stargazers_count > 0 && (
                        <span className="pinned-badge">★ {repo.stargazers_count}</span>
                      )}
                    </div>
                    <p className="project-description">
                      {repo.description || 'No description available'}
                    </p>
                    <div className="project-meta">
                      <span className="project-language">
                        {repo.language || 'N/A'}
                      </span>
                      <div className="project-stats">
                        <span className="project-stat">⭐ {repo.stargazers_count || 0}</span>
                        <span className="project-stat">🔀 {repo.forks_count || 0}</span>
                      </div>
                    </div>
                  </a>
                ))}

                {/* Recent Projects */}
                <div className="section-title">
                  🕐 Recently Updated
                  <span className="repo-count">({recentRepos.length} shown)</span>
                </div>
                {recentRepos.map((repo, index) => (
                  <a 
                    key={`recent-${index}`} 
                    href={repo.html_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="project-card"
                  >
                    <span className="project-name">{repo.name}</span>
                    <p className="project-description">
                      {repo.description || 'No description available'}
                    </p>
                    <div className="project-meta">
                      <span className="project-language">
                        {repo.language || 'N/A'}
                      </span>
                      <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.55rem' }}>
                        {repo.updated_at ? new Date(repo.updated_at).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric',
                          year: 'numeric'
                        }) : 'N/A'}
                      </span>
                      <div className="project-stats">
                        <span className="project-stat">⭐ {repo.stargazers_count || 0}</span>
                        <span className="project-stat">🔀 {repo.forks_count || 0}</span>
                      </div>
                    </div>
                  </a>
                ))}
              </>
            )}
          </div>

        </div>
      </main>
    </>
  );
}