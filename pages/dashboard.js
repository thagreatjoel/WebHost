import Head from 'next/head';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';

export default function Dashboard() {
  const router = useRouter();
  const pageShellRef = useRef(null);
  const bgCanvasRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const [isLoaded, setIsLoaded] = useState(false);
  const [introComplete, setIntroComplete] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const [lastUpdate, setLastUpdate] = useState('Loading...');
  
  // ─── GITHUB DATA STATE ───
  const [githubData, setGithubData] = useState({
    repos: 0,
    commits: 0,
    languages: [],
    stars: 0,
    forks: 0,
    followers: 0,
    following: 0,
    lastCommit: '',
    recentActivity: [],
    contributions: 0,
    totalStars: 0,
    topLanguages: [],
    loading: true,
    error: null
  });

  // ─── FETCH GITHUB DATA ───
  useEffect(() => {
    const fetchGitHubData = async () => {
      try {
        // Replace with your GitHub username
        const username = 'joeljojudev';
        
        // Fetch user data
        const userRes = await fetch(`https://api.github.com/users/${username}`);
        const userData = await userRes.json();
        
        // Fetch repos
        const reposRes = await fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=updated`);
        const reposData = await reposRes.json();
        
        // Fetch events for recent activity
        const eventsRes = await fetch(`https://api.github.com/users/${username}/events?per_page=30`);
        const eventsData = await eventsRes.json();
        
        if (userData.message === 'Not Found') {
          throw new Error('GitHub user not found');
        }

        // Calculate stats
        const totalRepos = reposData.length || 0;
        let totalCommits = 0;
        const languages = {};
        let totalStars = 0;
        let totalForks = 0;
        
        // Process repos
        reposData.forEach(repo => {
          totalStars += repo.stargazers_count || 0;
          totalForks += repo.forks_count || 0;
          if (repo.language) {
            languages[repo.language] = (languages[repo.language] || 0) + 1;
          }
        });
        
        // Process events for recent activity - ONLY PushEvents (commits)
        const activities = [];
        const seenRepos = new Set();
        
        eventsData.forEach(event => {
          // Only show PushEvents (actual commits)
          if (event.type === 'PushEvent') {
            const date = new Date(event.created_at);
            const dateStr = date.toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric' 
            });
            const repoName = event.repo.name.split('/')[1];
            const commitCount = event.payload.size || 0;
            const commitMessage = event.payload.commits?.[0]?.message || '';
            const shortMessage = commitMessage.length > 40 
              ? commitMessage.substring(0, 40) + '...' 
              : commitMessage;
            
            // Create a unique key to avoid duplicates
            const key = `${dateStr}-${repoName}-${commitCount}`;
            if (!seenRepos.has(key)) {
              seenRepos.add(key);
              activities.push({
                date: dateStr,
                repo: repoName,
                commits: commitCount,
                message: shortMessage,
                timestamp: date.getTime(),
                type: 'commit'
              });
            }
          }
        });
        
        // Sort by timestamp (most recent first) and take only latest 4
        activities.sort((a, b) => b.timestamp - a.timestamp);
        const latestActivities = activities.slice(0, 4);
        
        // Get unique languages sorted by usage
        const sortedLanguages = Object.keys(languages)
          .sort((a, b) => languages[b] - languages[a])
          .slice(0, 5);
        
        // Get last commit date from the first activity
        const lastCommit = latestActivities.length > 0 
          ? latestActivities[0].date
          : (reposData.length > 0 && reposData[0].pushed_at 
              ? new Date(reposData[0].pushed_at).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric', 
                  year: 'numeric' 
                })
              : 'No commits');

        setLastUpdate(lastCommit);
        
        // Try to get commit count from repos
        let totalCommitsCount = 0;
        try {
          for (const repo of reposData.slice(0, 20)) {
            try {
              const commitsRes = await fetch(
                `https://api.github.com/repos/${username}/${repo.name}/commits?per_page=1`
              );
              const linkHeader = commitsRes.headers.get('link');
              if (linkHeader) {
                const matches = linkHeader.match(/page=(\d+)>; rel="last"/);
                if (matches && matches[1]) {
                  totalCommitsCount += parseInt(matches[1]);
                }
              }
            } catch (e) {
              continue;
            }
          }
        } catch (e) {
          console.log('Could not fetch total commit count');
        }
        
        setGithubData({
          repos: totalRepos,
          commits: totalCommitsCount || 0,
          languages: Object.keys(languages),
          stars: totalStars,
          forks: totalForks,
          followers: userData.followers || 0,
          following: userData.following || 0,
          lastCommit: lastCommit,
          recentActivity: latestActivities,
          contributions: totalCommitsCount || 0,
          totalStars: totalStars,
          topLanguages: sortedLanguages,
          loading: false,
          error: null
        });
        
      } catch (error) {
        console.error('Error fetching GitHub data:', error);
        setGithubData(prev => ({
          ...prev,
          loading: false,
          error: 'Could not load GitHub data'
        }));
        setLastUpdate('18 Jul 2026');
      }
    };
    
    if (isLoaded) {
      fetchGitHubData();
    }
  }, [isLoaded]);

  // ─── TIME UPDATER ───
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit'
      }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

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

  return (
    <>
      <Head>
        <title>Dashboard | Joel Joju</title>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <meta name="description" content="Dashboard - Joel Joju Portfolio" />
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
          padding: 80px 20px 40px;
          max-height: 100vh;
          overflow: hidden;
        }

        .page-content.visible {
          opacity: 1;
        }

        /* ─── DASHBOARD GRID ─── */
        .dashboard-grid {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 12px;
          width: 100%;
          margin: 0 auto;
          max-height: calc(100vh - 160px);
          overflow: hidden;
        }

        .card {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 2mm;
          padding: 16px 20px;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .card:hover {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(255, 255, 255, 0.12);
          transform: translateY(-2px);
        }

        .card-title {
          font-size: 0.6rem;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          color: rgba(255, 255, 255, 0.4);
          margin-bottom: 8px;
          font-weight: 400;
          flex-shrink: 0;
        }

        .card-value {
          font-size: 1.6rem;
          font-weight: 700;
          color: #fff;
          letter-spacing: 0.02em;
          line-height: 1.2;
        }

        .card-label {
          font-size: 0.7rem;
          color: rgba(255, 255, 255, 0.5);
          margin-top: 2px;
          letter-spacing: 0.05em;
        }

        .progress-bar {
          width: 100%;
          height: 3px;
          background: rgba(255, 255, 255, 0.06);
          border-radius: 2px;
          margin-top: 8px;
          overflow: hidden;
          flex-shrink: 0;
        }

        .progress-fill {
          height: 100%;
          border-radius: 2px;
          background: linear-gradient(90deg, #f59e0b, #f97316);
          transition: width 1s ease;
          width: 0%;
        }

        .progress-fill.animate {
          width: 72%;
        }

        .status-dot {
          display: inline-block;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          margin-right: 6px;
          flex-shrink: 0;
        }

        .status-dot.online { background: #22c55e; }
        .status-dot.healthy { background: #22c55e; }
        .status-dot.success { background: #22c55e; }
        .status-dot.active { background: #f59e0b; }

        .status-item {
          display: flex;
          align-items: center;
          padding: 3px 0;
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.7rem;
          letter-spacing: 0.05em;
        }

        .status-item span:last-child {
          margin-left: auto;
          color: rgba(255, 255, 255, 0.4);
          font-size: 0.65rem;
        }

        .tech-tag {
          display: inline-block;
          padding: 3px 10px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 1mm;
          font-size: 0.65rem;
          color: rgba(255, 255, 255, 0.7);
          margin: 0 3px 4px 0;
          letter-spacing: 0.05em;
          transition: all 0.3s ease;
        }

        .tech-tag:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.15);
        }

        .activity-item {
          display: flex;
          align-items: center;
          padding: 4px 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.04);
          min-height: 28px;
        }

        .activity-item:last-child {
          border-bottom: none;
        }

        .activity-date {
          font-size: 0.6rem;
          color: rgba(255, 255, 255, 0.3);
          min-width: 50px;
          letter-spacing: 0.05em;
          flex-shrink: 0;
        }

        .activity-text {
          font-size: 0.7rem;
          color: rgba(255, 255, 255, 0.7);
          letter-spacing: 0.03em;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .activity-repo {
          font-weight: 500;
          color: rgba(255, 255, 255, 0.5);
        }

        .roadmap-item {
          display: flex;
          align-items: center;
          padding: 4px 0;
          font-size: 0.7rem;
          color: rgba(255, 255, 255, 0.6);
          letter-spacing: 0.05em;
        }

        .roadmap-item .icon {
          margin-right: 8px;
          font-size: 0.8rem;
          flex-shrink: 0;
        }

        .roadmap-item.done { color: rgba(255, 255, 255, 0.8); }
        .roadmap-item.in-progress { color: #f59e0b; }

        .bottom-info {
          margin-top: 10px;
          padding-top: 10px;
          border-top: 1px solid rgba(255, 255, 255, 0.04);
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.6rem;
          color: rgba(255, 255, 255, 0.25);
          letter-spacing: 0.08em;
          flex-shrink: 0;
        }

        .card-full {
          grid-column: 1 / -1;
        }

        .card-half {
          grid-column: span 1;
        }

        .github-loading {
          color: rgba(255, 255, 255, 0.4);
          font-size: 0.7rem;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4px 12px;
          flex: 1;
        }

        .activity-list {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .languages-container {
          display: flex;
          flex-wrap: wrap;
          gap: 3px;
          flex: 1;
          align-content: flex-start;
        }

        .status-container {
          display: flex;
          gap: 20px;
          flex-wrap: wrap;
        }

        @media (max-width: 1024px) {
          .dashboard-grid {
            grid-template-columns: 1fr 1fr;
            gap: 10px;
          }
          .card-full {
            grid-column: 1 / -1;
          }
          .card {
            padding: 14px 16px;
          }
        }

        @media (max-width: 768px) {
          .dashboard-grid {
            grid-template-columns: 1fr;
            gap: 8px;
            max-height: calc(100vh - 140px);
          }
          .card {
            padding: 12px 14px;
          }
          .card-value {
            font-size: 1.3rem;
          }
          .page-content {
            padding: 70px 12px 20px;
            max-width: 100vw;
          }
          .status-container {
            gap: 12px;
          }
        }

        @media (max-width: 480px) {
          .card-value {
            font-size: 1.1rem;
          }
          .card {
            padding: 10px 12px;
          }
          .tech-tag {
            font-size: 0.55rem;
            padding: 2px 6px;
          }
          .activity-date {
            min-width: 40px;
            font-size: 0.55rem;
          }
          .activity-text {
            font-size: 0.6rem;
          }
          .status-item {
            font-size: 0.6rem;
          }
        }

        /* ─── NAVIGATION ─── */
        .top-nav {
          position: fixed;
          top: 20px;
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
          padding: 10px 24px;
          border-radius: 2mm;
          border: 1px solid rgba(255, 255, 255, 0.08);
          opacity: 0;
          pointer-events: none;
          width: auto;
          min-width: 280px;
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
          gap: 2rem;
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
          height: 16px;
          background: rgba(255, 255, 255, 0.15);
        }

        .top-nav .nav-plus {
          font-size: 1.1rem;
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
          top: 20px;
          left: 20px;
          z-index: 10;
          color: rgba(255, 255, 255, 0.6);
          font-family: 'Aeonik', 'General Sans', sans-serif;
          font-size: 0.7rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          background: rgba(255, 255, 255, 0.06);
          backdrop-filter: blur(16px);
          padding: 10px 20px;
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
            min-width: 220px;
            gap: 1rem;
            top: 14px;
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
            top: 14px;
            left: 14px;
            padding: 6px 14px;
            font-size: 0.55rem;
          }
        }

        @media (max-width: 480px) {
          .top-nav {
            padding: 4px 10px;
            min-width: 160px;
            gap: 0.6rem;
            top: 12px;
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
            top: 12px;
            left: 12px;
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

        .github-link {
          color: rgba(255, 255, 255, 0.4);
          text-decoration: none;
          transition: color 0.3s ease;
        }

        .github-link:hover {
          color: rgba(255, 255, 255, 0.8);
        }

        .commit-message {
          font-size: 0.65rem;
          color: rgba(255, 255, 255, 0.5);
          margin-left: 4px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .activity-commits {
          font-size: 0.6rem;
          color: rgba(255, 255, 255, 0.3);
          margin-left: 4px;
        }
      `}</style>

      <div className={`loading-overlay ${!showContent ? 'active' : ''}`} />

      <canvas ref={bgCanvasRef} className="bg-canvas" />
      <div className="grid-blueprint" />

      {/* Navigation */}
      <nav className={`top-nav ${showContent ? 'visible' : ''}`}>
        <div className="nav-group">
          <a href="/dashboard" className="active" onClick={handleNavigation('/dashboard')}>Dashboard</a>
          <a href="/projects" onClick={handleNavigation('/projects')}>Projects</a>
          <a href="/about" onClick={handleNavigation('/about')}>About</a>
        </div>
        <div className="nav-group">
          <div className="nav-divider" />
          <a href="#" className="nav-plus" onClick={handleNavigation('/contact')}>+</a>
        </div>
      </nav>

      <button className={`back-button ${showContent ? 'visible' : ''}`} onClick={handleBackToHome}>
        Back
      </button>
      
      <main ref={pageShellRef} className="page-shell">
        <div className={`page-content ${showContent ? 'visible' : ''}`}>
          
          <div className="dashboard-grid">
            {/* ─── SYSTEM STATUS ─── */}
            <div className="card card-full">
              <div className="card-title">System Status</div>
              <div className="status-container">
                <div>
                  <div className="status-item">
                    <span className="status-dot online" />
                    Server <span>● Online</span>
                  </div>
                  <div className="status-item">
                    <span className="status-dot healthy" />
                    API <span>● Healthy</span>
                  </div>
                  <div className="status-item">
                    <span className="status-dot success" />
                    Build <span>● Success</span>
                  </div>
                </div>
                <div>
                  <div className="status-item">
                    <span className="status-dot active" />
                    CDN <span>● Active</span>
                  </div>
                  <div className="status-item">
                    <span className="status-dot online" />
                    Database <span>● Connected</span>
                  </div>
                  <div className="status-item">
                    <span className="status-dot healthy" />
                    Cache <span>● Warmed</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ─── GITHUB STATS ─── */}
            <div className="card card-half">
              <div className="card-title">GitHub Analytics</div>
              {githubData.loading ? (
                <div className="github-loading">Loading GitHub data...</div>
              ) : githubData.error ? (
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem' }}>
                  {githubData.error}
                </div>
              ) : (
                <div className="stats-grid">
                  <div>
                    <div className="card-value" style={{ fontSize: '1.3rem' }}>{githubData.repos}</div>
                    <div className="card-label">Repositories</div>
                  </div>
                  <div>
                    <div className="card-value" style={{ fontSize: '1.3rem' }}>{githubData.commits.toLocaleString()}</div>
                    <div className="card-label">Total Commits</div>
                  </div>
                  <div>
                    <div className="card-value" style={{ fontSize: '1.3rem' }}>{githubData.stars}</div>
                    <div className="card-label">Stars Received</div>
                  </div>
                  <div>
                    <div className="card-value" style={{ fontSize: '1.3rem' }}>{githubData.followers}</div>
                    <div className="card-label">Followers</div>
                  </div>
                </div>
              )}
            </div>

            {/* ─── TOP LANGUAGES ─── */}
            <div className="card card-half">
              <div className="card-title">Top Languages</div>
              {githubData.loading ? (
                <div className="github-loading">Loading...</div>
              ) : githubData.error ? (
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem' }}>
                  No language data
                </div>
              ) : (
                <div className="languages-container">
                  {githubData.topLanguages.map(lang => (
                    <span key={lang} className="tech-tag">{lang}</span>
                  ))}
                  {githubData.topLanguages.length === 0 && (
                    <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.7rem' }}>
                      No languages detected
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* ─── RECENT ACTIVITY (ONLY COMMITS) ─── */}
            <div className="card card-half">
              <div className="card-title">Recent Commits</div>
              {githubData.loading ? (
                <div className="github-loading">Loading commits...</div>
              ) : githubData.error ? (
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem' }}>
                  No recent commits
                </div>
              ) : (
                <div className="activity-list">
                  {githubData.recentActivity.map((activity, index) => (
                    <div key={index} className="activity-item">
                      <span className="activity-date">{activity.date}</span>
                      <span className="activity-text">
                        <span className="activity-repo">{activity.repo}</span>
                        <span className="activity-commits">({activity.commits} commit{activity.commits > 1 ? 's' : ''})</span>
                        {activity.message && <span className="commit-message">- {activity.message}</span>}
                      </span>
                    </div>
                  ))}
                  {githubData.recentActivity.length === 0 && (
                    <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.7rem' }}>
                      No recent commits
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ─── CURRENT FOCUS ─── */}
            <div className="card card-half">
              <div className="card-title">Current Focus</div>
              <div style={{ fontSize: '1rem', fontWeight: '500', color: '#fff', marginBottom: '2px' }}>
                Dashboard Development
              </div>
              <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', marginBottom: '8px' }}>
                Progress 72%
              </div>
              <div className="progress-bar">
                <div className="progress-fill animate" />
              </div>
              <div style={{ marginTop: '8px', display: 'flex', gap: '12px', fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)' }}>
                <span>Next: Gallery Module</span>
                <span>•</span>
                <span>ETA: Aug 2026</span>
              </div>
            </div>

            {/* ─── ROADMAP ─── */}
            <div className="card card-half">
              <div className="card-title">Roadmap</div>
              <div className="roadmap-item done"><span className="icon">✔</span> Dashboard</div>
              <div className="roadmap-item done"><span className="icon">✔</span> Projects</div>
              <div className="roadmap-item in-progress"><span className="icon">◐</span> Gallery</div>
              <div className="roadmap-item"><span className="icon">○</span> Blog</div>
              <div className="roadmap-item"><span className="icon">○</span> Experiments</div>
            </div>

            {/* ─── QUOTE & TIME ─── */}
            <div className="card card-full" style={{ textAlign: 'center', padding: '16px 24px' }}>
              <div style={{ 
                fontSize: '0.95rem', 
                color: 'rgba(255,255,255,0.8)', 
                letterSpacing: '0.05em',
                fontStyle: 'italic',
                fontWeight: '300'
              }}>
                "Building thoughtful software, one project at a time."
              </div>
              <div style={{ 
                marginTop: '6px',
                fontSize: '0.6rem', 
                color: 'rgba(255,255,255,0.25)',
                letterSpacing: '0.1em'
              }}>
                {currentTime} • Last Commit: {githubData.lastCommit || 'N/A'}
              </div>
            </div>

            {/* ─── BOTTOM INFO ─── */}
            <div className="card card-full" style={{ padding: '12px 20px' }}>
              <div className="bottom-info">
                <span>Version 2.3</span>
                <span>Last Updated: {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                <span>Built with Next.js</span>
                <span>
                  <a 
                    href="https://github.com/joeljojudev" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="github-link"
                  >
                    GitHub ↗
                  </a>
                </span>
              </div>
            </div>
          </div>

        </div>
      </main>
    </>
  );
}