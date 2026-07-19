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
        
        // Format the data for display
        const formattedData = {
          username: data.username || 'greatjoel',
          totalXp: data.total_xp || data.xp || 0,
          level: data.level || 1,
          streak: data.streak || 0,
          learningLanguage: data.learning_language || 'en',
          languages: data.languages || [],
          languageProgress: data.language_progress || {},
          source: data._source || 'unknown',
          fullData: data.full_data || null
        };
        
        setDuolingoData(formattedData);
        console.log('✅ Duolingo data loaded!');
        
      } catch (error) {
        console.error('❌ Error fetching Duolingo data:', error);
        // Set fallback data
        setDuolingoData({
          username: 'greatjoel',
          totalXp: 1819,
          level: 1,
          streak: 13,
          learningLanguage: 'en',
          languages: ['en', 'de'],
          languageProgress: {
            en: { level: 11, points: 1013, streak: 13, language_string: 'English' },
            de: { level: 9, points: 806, streak: 13, language_string: 'German' }
          },
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

  // Helper functions
  function getLanguageName(code) {
    const languages = {
      'en': 'English',
      'de': 'German',
      'fr': 'French',
      'es': 'Spanish',
      'it': 'Italian',
      'pt': 'Portuguese',
      'ru': 'Russian',
      'ja': 'Japanese',
      'ko': 'Korean',
      'zh': 'Chinese',
      'ar': 'Arabic',
      'hi': 'Hindi'
    };
    return languages[code] || code.toUpperCase();
  }

  function getFlagEmoji(code) {
    const flags = {
      'en': '🇬🇧',
      'de': '🇩🇪',
      'fr': '🇫🇷',
      'es': '🇪🇸',
      'it': '🇮🇹',
      'pt': '🇵🇹',
      'ru': '🇷🇺',
      'ja': '🇯🇵',
      'ko': '🇰🇷',
      'zh': '🇨🇳',
      'ar': '🇸🇦',
      'hi': '🇮🇳'
    };
    return flags[code] || '🌍';
  }

  // Flag SVG components
  const EnglishFlag = () => (
    <svg width="24" height="18" viewBox="0 0 70 54" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
      <g clipPath="url(#clip0_129_593)">
        <path fillRule="evenodd" clipRule="evenodd" d="M12.563 0H57.437C61.8054 0 63.3895 0.454846 64.9865 1.30895C66.5836 2.16305 67.8369 3.41642 68.691 5.01346C69.5452 6.61049 70 8.1946 70 12.563V41.437C70 45.8054 69.5452 47.3895 68.691 48.9865C67.8369 50.5836 66.5836 51.8369 64.9865 52.6911C63.3895 53.5452 61.8054 54 57.437 54H12.563C8.1946 54 6.61049 53.5452 5.01346 52.6911C3.41642 51.8369 2.16305 50.5836 1.30895 48.9865C0.454846 47.3895 0 45.8054 0 41.437V12.563C0 8.1946 0.454846 6.61049 1.30895 5.01346C2.16305 3.41642 3.41642 2.16305 5.01346 1.30895C6.61049 0.454846 8.1946 0 12.563 0Z" fill="#EEEEEE"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M12.563 0H57.437C61.8054 0 63.3895 0.454846 64.9865 1.30895C66.5836 2.16305 67.8369 3.41642 68.691 5.01346C68.8631 5.3352 69.019 5.65643 69.1582 6H0.841797C0.981005 5.65643 1.13687 5.3352 1.30895 5.01346C2.16305 3.41642 3.41641 2.16305 5.01345 1.30895C6.61049 0.454846 8.19459 0 12.563 0Z" fill="#FF4B4B"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M69.9973 12C69.9991 12.1824 70 12.37 70 12.563V18H0V12.563C0 12.37 0.000888148 12.1824 0.00265965 12H69.9973Z" fill="#FF4B4B"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M70 24V30H0V24H70Z" fill="#FF4B4B"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M70 41.437C70 41.63 69.9991 41.8176 69.9973 42H0.00265965C0.000888148 41.8176 0 41.63 0 41.437V36H70V41.437Z" fill="#FF4B4B"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M69.1582 48C69.019 48.3436 68.8631 48.6648 68.691 48.9865C67.8369 50.5836 66.5836 51.8369 64.9865 52.6911C63.3895 53.5452 61.8054 54 57.437 54H12.563C8.19459 54 6.61049 53.5452 5.01345 52.6911C3.41641 51.8369 2.16305 50.5836 1.30895 48.9865C1.13687 48.6648 0.981005 48.3436 0.841797 48H69.1582Z" fill="#FF4B4B"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M12.563 0H35V24H0V12.563C0 8.1946 0.454846 6.61049 1.30895 5.01346C2.16305 3.41642 3.41642 2.16305 5.01346 1.30895C6.61049 0.454846 8.1946 0 12.563 0Z" fill="#1CB0F6"/>
        <path d="M27.8065 9.60198L26.531 10.2726C26.1304 10.4832 25.635 10.3292 25.4245 9.92863C25.3406 9.76914 25.3117 9.58645 25.3421 9.40885L25.5857 7.98849C25.6089 7.85332 25.5641 7.71541 25.4659 7.61968L24.434 6.61377C24.1099 6.29791 24.1033 5.77918 24.4191 5.45514C24.5449 5.32611 24.7097 5.24214 24.888 5.21623L26.3142 5.009C26.4499 4.98928 26.5672 4.90404 26.6279 4.78107L27.2657 3.48877C27.4659 3.08299 27.9572 2.91639 28.363 3.11665C28.5246 3.1964 28.6554 3.32719 28.7351 3.48877L29.3729 4.78107C29.4336 4.90404 29.5509 4.98928 29.6867 5.009L31.1128 5.21623C31.5606 5.2813 31.8709 5.69707 31.8058 6.14487C31.7799 6.32319 31.6959 6.48799 31.5669 6.61377L30.5349 7.61968C30.4367 7.71541 30.3919 7.85332 30.4151 7.98849L30.6587 9.40885C30.7352 9.85485 30.4357 10.2784 29.9897 10.3549C29.8121 10.3854 29.6294 10.3564 29.4699 10.2726L28.1943 9.60198C28.0729 9.53816 27.9279 9.53816 27.8065 9.60198Z" fill="white"/>
        <path d="M27.8065 19.602L26.531 20.2726C26.1304 20.4832 25.635 20.3292 25.4245 19.9286C25.3406 19.7691 25.3117 19.5865 25.3421 19.4089L25.5857 17.9885C25.6089 17.8533 25.5641 17.7154 25.4659 17.6197L24.434 16.6138C24.1099 16.2979 24.1033 15.7792 24.4191 15.4551C24.5449 15.3261 24.7097 15.2421 24.888 15.2162L26.3142 15.009C26.4499 14.9893 26.5672 14.904 26.6279 14.7811L27.2657 13.4888C27.4659 13.083 27.9572 12.9164 28.363 13.1167C28.5246 13.1964 28.6554 13.3272 28.7351 13.4888L29.3729 14.7811C29.4336 14.904 29.5509 14.9893 29.6867 15.009L31.1128 15.2162C31.5606 15.2813 31.8709 15.6971 31.8058 16.1449C31.7799 16.3232 31.6959 16.488 31.5669 16.6138L30.5349 17.6197C30.4367 17.7154 30.3919 17.8533 30.4151 17.9885L30.6587 19.4089C30.7352 19.8549 30.4357 20.2784 29.9897 20.3549C29.8121 20.3854 29.6294 20.3564 29.4699 20.2726L28.1943 19.602C28.0729 19.5382 27.9279 19.5382 27.8065 19.602Z" fill="white"/>
        <path d="M17.8065 9.60198L16.531 10.2726C16.1304 10.4832 15.635 10.3292 15.4245 9.92863C15.3406 9.76914 15.3117 9.58645 15.3421 9.40885L15.5857 7.98849C15.6089 7.85332 15.5641 7.71541 15.4659 7.61968L14.434 6.61377C14.1099 6.29791 14.1033 5.77918 14.4191 5.45514C14.5449 5.32611 14.7097 5.24214 14.888 5.21623L16.3142 5.009C16.4499 4.98928 16.5672 4.90404 16.6279 4.78107L17.2657 3.48877C17.466 3.08299 17.9572 2.91639 18.363 3.11665C18.5246 3.1964 18.6554 3.32719 18.7351 3.48877L19.3729 4.78107C19.4336 4.90404 19.5509 4.98928 19.6867 5.009L21.1128 5.21623C21.5606 5.2813 21.8709 5.69707 21.8058 6.14487C21.7799 6.32319 21.6959 6.48799 21.5669 6.61377L20.5349 7.61968C20.4367 7.71541 20.3919 7.85332 20.4151 7.98849L20.6587 9.40885C20.7352 9.85485 20.4357 10.2784 19.9897 10.3549C19.8121 10.3854 19.6294 10.3564 19.4699 10.2726L18.1943 9.60198C18.0729 9.53816 17.9279 9.53816 17.8065 9.60198Z" fill="white"/>
        <path d="M17.8065 19.602L16.531 20.2726C16.1304 20.4832 15.635 20.3292 15.4245 19.9286C15.3406 19.7691 15.3117 19.5865 15.3421 19.4089L15.5857 17.9885C15.6089 17.8533 15.5641 17.7154 15.4659 17.6197L14.434 16.6138C14.1099 16.2979 14.1033 15.7792 14.4191 15.4551C14.5449 15.3261 14.7097 15.2421 14.888 15.2162L16.3142 15.009C16.4499 14.9893 16.5672 14.904 16.6279 14.7811L17.2657 13.4888C17.466 13.083 17.9572 12.9164 18.363 13.1167C18.5246 13.1964 18.6554 13.3272 18.7351 13.4888L19.3729 14.7811C19.4336 14.904 19.5509 14.9893 19.6867 15.009L21.1128 15.2162C21.5606 15.2813 21.8709 15.6971 21.8058 16.1449C21.7799 16.3232 21.6959 16.488 21.5669 16.6138L20.5349 17.6197C20.4367 17.7154 20.3919 17.8533 20.4151 17.9885L20.6587 19.4089C20.7352 19.8549 20.4357 20.2784 19.9897 20.3549C19.8121 20.3854 19.6294 20.3564 19.4699 20.2726L18.1943 19.602C18.0729 19.5382 17.9279 19.5382 17.8065 19.602Z" fill="white"/>
        <path d="M7.80652 9.60198L6.53095 10.2726C6.13042 10.4832 5.63503 10.3292 5.42446 9.92863C5.34061 9.76914 5.31167 9.58645 5.34213 9.40885L5.58575 7.98849C5.60893 7.85332 5.56412 7.71541 5.46591 7.61968L4.43395 6.61377C4.10992 6.29791 4.10329 5.77918 4.41915 5.45514C4.54492 5.32611 4.70973 5.24214 4.88804 5.21623L6.31418 5.009C6.44989 4.98928 6.56721 4.90404 6.6279 4.78107L7.26569 3.48877C7.46595 3.08299 7.95725 2.91639 8.36303 3.11665C8.52461 3.1964 8.6554 3.32719 8.73515 3.48877L9.37293 4.78107C9.43363 4.90404 9.55095 4.98928 9.68666 5.009L11.1128 5.21623C11.5606 5.2813 11.8709 5.69707 11.8058 6.14487C11.7799 6.32319 11.6959 6.48799 11.5669 6.61377L10.5349 7.61968C10.4367 7.71541 10.3919 7.85332 10.4151 7.98849L10.6587 9.40885C10.7352 9.85485 10.4357 10.2784 9.98966 10.3549C9.81206 10.3854 9.62937 10.3564 9.46988 10.2726L8.19431 9.60198C8.07292 9.53816 7.92791 9.53816 7.80652 9.60198Z" fill="white"/>
        <path d="M7.80652 19.602L6.53095 20.2726C6.13042 20.4832 5.63503 20.3292 5.42446 19.9286C5.34061 19.7691 5.31167 19.5865 5.34213 19.4089L5.58575 17.9885C5.60893 17.8533 5.56412 17.7154 5.46591 17.6197L4.43395 16.6138C4.10992 16.2979 4.10329 15.7792 4.41915 15.4551C4.54492 15.3261 4.70973 15.2421 4.88804 15.2162L6.31418 15.009C6.44989 14.9893 6.56721 14.904 6.6279 14.7811L7.26569 13.4888C7.46595 13.083 7.95725 12.9164 8.36303 13.1167C8.52461 13.1964 8.6554 13.3272 8.73515 13.4888L9.37293 14.7811C9.43363 14.904 9.55095 14.9893 9.68666 15.009L11.1128 15.2162C11.5606 15.2813 11.8709 15.6971 11.8058 16.1449C11.7799 16.3232 11.6959 16.488 11.5669 16.6138L10.5349 17.6197C10.4367 17.7154 10.3919 17.8533 10.4151 17.9885L10.6587 19.4089C10.7352 19.8549 10.4357 20.2784 9.98966 20.3549C9.81206 20.3854 9.62937 20.3564 9.46988 20.2726L8.19431 19.602C8.07292 19.5382 7.92791 19.5382 7.80652 19.602Z" fill="white"/>
      </g>
      <defs>
        <clipPath id="clip0_129_593">
          <rect width="70" height="54" fill="white"/>
        </clipPath>
      </defs>
    </svg>
  );

  const GermanFlag = () => (
    <svg width="24" height="18" viewBox="0 0 70 54" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
      <path d="M12.563 0H57.437C61.8054 0 63.3895 0.454846 64.9865 1.30895C66.5836 2.16305 67.8369 3.41642 68.691 5.01346C69.5452 6.61049 70 8.1946 70 12.563V41.437C70 45.8054 69.5452 47.3895 68.691 48.9865C67.8369 50.5836 66.5836 51.8369 64.9865 52.6911C63.3895 53.5452 61.8054 54 57.437 54H12.563C8.1946 54 6.61049 53.5452 5.01346 52.6911C3.41642 51.8369 2.16305 50.5836 1.30895 48.9865C0.454846 47.3895 0 45.8054 0 41.437L0 12.563C0 8.1946 0.454846 6.61049 1.30895 5.01346C2.16305 3.41642 3.41642 2.16305 5.01346 1.30895C6.61049 0.454846 8.1946 0 12.563 0Z" fill="#FF4B4B"/>
      <path d="M70 36V41.437C70 45.8054 69.5452 47.3895 68.691 48.9865C67.8369 50.5836 66.5836 51.8369 64.9865 52.691C63.3895 53.5452 61.8054 54 57.437 54H12.563C8.1946 54 6.61049 53.5452 5.01346 52.691C3.41642 51.8369 2.16305 50.5836 1.30895 48.9865C0.454846 47.3895 0 45.8054 0 41.437V36H70Z" fill="#FFC800"/>
      <path d="M12.563 0H57.437C61.8054 0 63.3895 0.454846 64.9865 1.30895C66.5836 2.16306 67.8369 3.41642 68.691 5.01346C69.5452 6.61049 70 8.1946 70 12.563V18H0V12.563C0 8.1946 0.454846 6.61049 1.30895 5.01346C2.16305 3.41642 3.41642 2.16306 5.01346 1.30895C6.61049 0.454846 8.1946 0 12.563 0Z" fill="#4C4C4C"/>
    </svg>
  );

  const XPIcon = () => (
    <svg width="22" height="30" viewBox="0 0 22 30" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path fillRule="evenodd" clipRule="evenodd" d="M14.0367 2.67272C13.8379 0.718003 11.3282 0.0455378 10.1787 1.63898L0.717665 14.7538C-0.157342 15.9667 0.452676 17.6801 1.89732 18.0672L7.2794 19.5093L8.07445 27.3273C8.27323 29.282 10.7829 29.9545 11.9324 28.361L21.3935 15.2462C22.2685 14.0333 21.6585 12.3199 20.2138 11.9328L14.8317 10.4907L14.0367 2.67272Z" fill="#FFD900"/>
      <path d="M2.574 16.4882C2.08457 16.3561 2.03731 15.6803 2.50359 15.4813L6.24415 13.8853C6.58188 13.7412 6.96093 13.973 6.98654 14.3393L7.17226 16.9952C7.19787 17.3615 6.85477 17.6438 6.50027 17.5481L2.574 16.4882Z" fill="#F7C100"/>
      <path d="M19.717 13.2505C20.2064 13.3826 20.2537 14.0584 19.7874 14.2573L16.0469 15.8533C15.7091 15.9974 15.3301 15.7656 15.3045 15.3993L15.1188 12.7435C15.0931 12.3772 15.4362 12.0949 15.7907 12.1906L19.717 13.2505Z" fill="#FFEF8F"/>
    </svg>
  );

  const StreakIcon = () => (
    <svg width="24" height="30" viewBox="0 0 16 20" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'inline-block', marginRight: '4px' }}>
      <path d="M6.77271 0.532617C7.336 -0.177539 8.414 -0.177539 8.97729 0.532616L14.0623 6.94342C15.1193 8.23421 15.75 9.86374 15.75 11.6351C15.75 15.8233 12.2242 19.2185 7.875 19.2185C3.52576 19.2185 0 15.8233 0 11.6351C0 11.3414 0.0173457 11.0515 0.0511046 10.7664L0.0333507 4.37841C0.0307386 3.43858 0.542464 2.74527 1.41725 2.89269C1.59157 2.92207 1.9601 3.0331 2.12522 3.12149L3.94611 4.09617L6.77271 0.532617Z" fill="#FF9600"/>
      <path d="M8.40677 8.24144C8.1299 7.86443 7.5667 7.86443 7.28982 8.24144L5.30202 10.9482C5.28343 10.9735 5.2689 11 5.25814 11.027C4.7842 11.5866 4.5 12.3011 4.5 13.0796C4.5 14.8745 6.01104 16.3296 7.875 16.3296C9.73896 16.3296 11.25 14.8745 11.25 13.0796C11.25 12.2008 10.8878 11.4035 10.2993 10.8185L8.40677 8.24144Z" fill="#FFC800"/>
    </svg>
  );

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

        /* ============================================ */
        /* DUOLINGO STATS CARD - UPDATED */
        /* ============================================ */
        .duolingo-stats-container {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .duolingo-main-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 16px;
          padding: 1.5rem;
          transition: all 0.3s ease;
        }

        .duolingo-main-card:hover {
          background: rgba(255,255,255,0.05);
          border-color: rgba(255,255,255,0.1);
        }

        .duolingo-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .duolingo-logo {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .duolingo-logo-img {
          height: 32px;
          width: auto;
          object-fit: contain;
          border-radius: 4px;
        }

        .duolingo-title {
          color: rgba(255,255,255,0.8);
          font-size: 1.1rem;
          font-weight: 600;
          letter-spacing: 0.05em;
        }

        .duolingo-profile-link {
          color: rgba(255,255,255,0.3);
          text-decoration: none;
          font-size: 0.7rem;
          transition: color 0.3s ease;
          padding: 4px 12px;
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 6px;
        }

        .duolingo-profile-link:hover {
          color: rgba(255,255,255,0.6);
          border-color: rgba(255,255,255,0.12);
        }

        .duolingo-stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .stat-item {
          text-align: center;
          padding: 0.5rem;
          background: rgba(255,255,255,0.02);
          border-radius: 8px;
        }

        .stat-value {
          color: #fff;
          font-size: clamp(1.2rem, 1.8vw, 1.8rem);
          font-weight: 700;
          margin-bottom: 0.2rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
        }

        .stat-value svg {
          display: inline-block;
        }

        .stat-label {
          color: rgba(255,255,255,0.3);
          font-size: clamp(0.5rem, 0.6vw, 0.6rem);
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        .stat-value.league {
          font-size: clamp(1.5rem, 2vw, 2rem);
        }

        /* Language Progress Bars */
        .duolingo-languages {
          display: flex;
          flex-direction: column;
          gap: 0.8rem;
          margin-top: 0.5rem;
        }

        .language-progress-bar {
          padding: 0.5rem 0;
          border-bottom: 1px solid rgba(255,255,255,0.03);
        }

        .language-progress-bar:last-child {
          border-bottom: none;
        }

        .language-bar-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.3rem;
          flex-wrap: wrap;
        }

        .language-flag {
          flex-shrink: 0;
        }

        .language-flag svg {
          width: 24px;
          height: 18px;
          border-radius: 2px;
          border: 1px solid rgba(255,255,255,0.1);
        }

        .language-name {
          color: rgba(255,255,255,0.7);
          font-size: clamp(0.8rem, 0.9vw, 0.85rem);
          font-weight: 500;
          flex: 1;
        }

        .language-xp {
          color: #58cc02;
          font-size: clamp(0.7rem, 0.8vw, 0.75rem);
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .language-xp svg {
          width: 16px;
          height: 22px;
        }

        .active-badge {
          font-size: 0.5rem;
          padding: 2px 8px;
          background: rgba(88, 204, 2, 0.15);
          color: #58cc02;
          border-radius: 10px;
          border: 1px solid rgba(88, 204, 2, 0.2);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .progress-bar-track {
          width: 100%;
          height: 4px;
          background: rgba(255,255,255,0.06);
          border-radius: 2px;
          overflow: hidden;
        }

        .progress-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, #58cc02, #7ce03a);
          border-radius: 2px;
          transition: width 0.8s ease;
        }

        .language-level-info {
          display: flex;
          gap: 1rem;
          margin-top: 0.2rem;
          font-size: clamp(0.5rem, 0.6vw, 0.55rem);
          color: rgba(255,255,255,0.25);
        }

        .source-tag {
          font-size: 0.5rem;
          padding: 2px 8px;
          border-radius: 10px;
          border: 1px solid;
          margin-left: 4px;
        }

        .duolingo-loading {
          color: rgba(255,255,255,0.3);
          font-size: 0.8rem;
          padding: 1rem;
          text-align: center;
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
          .duolingo-stats-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 0.5rem;
          }
          .duolingo-main-card {
            padding: 1rem;
          }
          .duolingo-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
          }
          .duolingo-profile-link {
            align-self: flex-start;
          }
          .duolingo-logo-img {
            height: 24px;
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
          .duolingo-stats-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 0.3rem;
          }
          .stat-item {
            padding: 0.3rem;
          }
          .stat-value {
            font-size: 1rem;
          }
          .language-bar-header {
            flex-wrap: wrap;
          }
          .duolingo-logo-img {
            height: 20px;
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
              <div className="duolingo-stats-container">
                {/* Main Duolingo Card */}
                <div className="duolingo-main-card">
                  <div className="duolingo-header">
                    <div className="duolingo-logo">
                      <img 
                        src="https://cdn.hackclub.com/019f7c14-d877-7ba2-93d5-791574249440/Untitled%20-%20July%2020,%202026%20at%2002.00.16.png" 
                        alt="Duolingo" 
                        className="duolingo-logo-img"
                      />
                      <span className="duolingo-title">Duolingo</span>
                      <span className="source-tag" style={{ 
                        background: 'rgba(88, 204, 2, 0.15)',
                        color: '#58cc02',
                        borderColor: 'rgba(88, 204, 2, 0.2)'
                      }}>
                        ● Live
                      </span>
                    </div>
                    <a 
                      href={`https://www.duolingo.com/profile/${duolingoData.username}`}
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="duolingo-profile-link"
                    >
                      View Profile →
                    </a>
                  </div>

                  {/* Stats Grid */}
                  <div className="duolingo-stats-grid">
                    <div className="stat-item">
                      <div className="stat-value">
                        <StreakIcon />
                        {duolingoData.streak || 0}
                      </div>
                      <div className="stat-label">Day Streak</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-value">{duolingoData.totalXp || 0}</div>
                      <div className="stat-label">Total XP</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-value">Week {Math.ceil(((duolingoData.totalXp || 0) / 500) + 1) || 1}</div>
                      <div className="stat-label">Week</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-value league">🏆</div>
                      <div className="stat-label">Current League</div>
                    </div>
                  </div>

                  {/* Language Progress Bars with Custom Flags */}
                  <div className="duolingo-languages">
                    {duolingoData.languages && duolingoData.languages.length > 0 ? (
                      duolingoData.languages.map((langCode) => {
                        const langData = duolingoData.languageProgress?.[langCode] || {};
                        const langName = langData.language_string || getLanguageName(langCode);
                        const progress = Math.min(((langData.points || 0) / 1000) * 100, 100);
                        
                        return (
                          <div key={langCode} className="language-progress-bar">
                            <div className="language-bar-header">
                              <span className="language-flag">
                                {langCode === 'en' ? <EnglishFlag /> : 
                                 langCode === 'de' ? <GermanFlag /> :
                                 <span>{getFlagEmoji(langCode)}</span>}
                              </span>
                              <span className="language-name">{langName}</span>
                              <span className="language-xp">
                                <XPIcon />
                                {langData.points || 0}
                              </span>
                              {langCode === duolingoData.learningLanguage && (
                                <span className="active-badge">Active</span>
                              )}
                            </div>
                            <div className="progress-bar-track">
                              <div 
                                className="progress-bar-fill" 
                                style={{ width: `${Math.min(progress, 100)}%` }}
                              />
                            </div>
                            <div className="language-level-info">
                              <span>Level {langData.level || 0}</span>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem', textAlign: 'center', padding: '0.5rem' }}>
                        No languages found
                      </div>
                    )}
                  </div>
                </div>
                
                <p style={{ 
                  color: 'rgba(255,255,255,0.12)', 
                  fontSize: '0.5rem', 
                  marginTop: '0.5rem',
                  textAlign: 'center',
                  letterSpacing: '0.05em'
                }}>
                  ⚡ Real-time data from Duolingo • Updated {new Date().toLocaleString()}
                </p>
              </div>
            ) : (
              <div className="duolingo-main-card">
                <div className="duolingo-header">
                  <div className="duolingo-logo">
                    <img 
                      src="https://cdn.hackclub.com/019f7c14-d877-7ba2-93d5-791574249440/Untitled%20-%20July%2020,%202026%20at%2002.00.16.png" 
                      alt="Duolingo" 
                      className="duolingo-logo-img"
                    />
                    <span className="duolingo-title">Duolingo</span>
                  </div>
                </div>
                <div style={{ padding: '1rem', textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>
                  Loading language data...
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}