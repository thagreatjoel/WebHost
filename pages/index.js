import Head from 'next/head';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import StickerPlacementModal from '../components/StickerPlacementModal';

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
  STICKERS_APPEAR: 7200,
};

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [flash, setFlash] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const [shake, setShake] = useState(false);
  const [pop, setPop] = useState(false);
  const [audioStarted, setAudioStarted] = useState(false);
  const [floatActive, setFloatActive] = useState(false);
  const [isZooming, setIsZooming] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [bulgeEnabled, setBulgeEnabled] = useState(false);
  const [cursorVisible, setCursorVisible] = useState(true);
  const [showClickPrompt, setShowClickPrompt] = useState(false);
  const [clickPromptVisible, setClickPromptVisible] = useState(true);
  const [showNav, setShowNav] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [skipOpening, setSkipOpening] = useState(false);
  const [showIntroFade, setShowIntroFade] = useState(false);
  const [showStickers, setShowStickers] = useState(false);
  const [selectedSticker, setSelectedSticker] = useState(null);
  const [stickerPosition, setStickerPosition] = useState({ x: 0, y: 0 });
  const [isPlacingSticker, setIsPlacingSticker] = useState(false);
  const [placedStickers, setPlacedStickers] = useState([]);
  const [showPlacementModal, setShowPlacementModal] = useState(false);
  const [pendingSticker, setPendingSticker] = useState(null);
  const [allStickers, setAllStickers] = useState([]);
  const [userStickers, setUserStickers] = useState([]);
  const [userId, setUserId] = useState(null);
  const [stickerClickPosition, setStickerClickPosition] = useState({ x: 0, y: 0 });
  const [stickersVisible, setStickersVisible] = useState(false);
  const [contextMenu, setContextMenu] = useState(null);
  const [selectedStickerForEdit, setSelectedStickerForEdit] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragData, setDragData] = useState(null);
  const [showBlackTop, setShowBlackTop] = useState(false);

  const canvasRef = useRef(null);
  const bgCanvasRef = useRef(null);
  const charRefs = useRef([]);
  const sequenceStarted = useRef(false);
  const mouseRef = useRef({ x: 0, y: 0 });
  const pageShellRef = useRef(null);
  const stickerModalRef = useRef(null);

  // ─── STICKER DATA ───
  const stickers = [
    { 
      id: 1, 
      name: 'Hedie Shy', 
      emoji: '😊',
      imageUrl: 'https://user-cdn.hackclub-assets.com/019d730b-237a-7aed-89c3-e60a9f562ae6/47QlTJFkr25F8SM6jxi0ek0aWavxHqHZYRA26PLvgag'
    },
    { 
      id: 2, 
      name: 'Orphymoji', 
      emoji: '👾',
      imageUrl: 'https://cdn.hackclub.com/019d730b-a55e-7f0f-b67f-18684ad6c4d3/zGbCIuBBdvq17MYY5vU-NPj9Cwx7-EPQ_fWifN47AZc'
    },
    { 
      id: 3, 
      name: 'Holiday', 
      emoji: '🎄',
      imageUrl: 'https://cdn.hackclub.com/019d730c-1755-7a0c-9e6f-d9b08e0affd5/YDTGVqKSv30zwAf8kuudy8vr3dV_v2Q2gU4A01CZP7o'
    },
    { 
      id: 4, 
      name: 'Anxious', 
      emoji: '😰',
      imageUrl: 'https://cdn.hackclub.com/019d730c-b4a4-7c77-80a6-ab4995f8813e/QgVBcCZOPZP_ZeWoD2-AhBIIG71jUiyn_rwnCbEA2vA'
    },
    { 
      id: 5, 
      name: 'Hedie & Orphous', 
      emoji: '💕',
      imageUrl: 'https://cdn.hackclub.com/019e1513-68f6-7140-ba8f-ad5991bbe395/archive-26sticker-2.PNG'
    },
    { 
      id: 6, 
      name: 'Star', 
      emoji: '⭐',
      imageUrl: ''
    },
  ];

  // ─── HOOKS ───
  
  useEffect(() => {
    let uid = localStorage.getItem('stickerUserId');
    if (!uid) {
      uid = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('stickerUserId', uid);
    }
    setUserId(uid);
  }, []);

  useEffect(() => {
    if (userId && stickersVisible) {
      fetchAllStickers();
      fetchUserStickers();
    }
  }, [userId, stickersVisible]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (stickerModalRef.current && !stickerModalRef.current.contains(e.target)) {
        setShowStickers(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const isRedirect = sessionStorage.getItem('redirectedToHome');
    
    if (isRedirect === 'true') {
      setSkipOpening(true);
      setShowIntroFade(true);
      sessionStorage.removeItem('redirectedToHome');
      setIsLoading(false);
      setIsReady(true);
      setStickersVisible(true);
    } else {
      setSkipOpening(false);
      setShowIntroFade(false);
      setIsReady(true);
    }
  }, []);

  useEffect(() => {
    if (pageShellRef.current && showIntroFade && !showContent) {
      pageShellRef.current.classList.add('zoom-in-big');
      
      setTimeout(() => {
        if (pageShellRef.current) {
          pageShellRef.current.classList.remove('zoom-in-big');
          
          setTimeout(() => {
            setShowContent(true);
            setShowNav(true);
            setShowClickPrompt(true);
            setCursorVisible(true);
            setBulgeEnabled(true);
            setStickersVisible(true);
            
            charRefs.current.forEach((el) => {
              if (el) {
                el.style.animation = 'none';
                el.style.opacity = '1';
                el.style.transform = 'translateY(0px) scale(1)';
              }
            });
          }, 100);
        }
      }, 800);
    }
  }, [showIntroFade, showContent]);

  useEffect(() => {
    if (!skipOpening && isReady && !showIntroFade) {
      startSequence();
    }
  }, [skipOpening, isReady, showIntroFade]);

  useEffect(() => {
    if (skipOpening || !isReady || showIntroFade) return;
    
    const fadeInTimer = setTimeout(() => {
      setShowBlackTop(true);
    }, TIMINGS.BLACK_OVERLAY_START);

    const fadeOutTimer = setTimeout(() => {
      setShowBlackTop(false);
    }, TIMINGS.BLACK_OVERLAY_END);

    const navTimer = setTimeout(() => {
      setShowNav(true);
    }, TIMINGS.NAV_APPEAR);

    const stickersTimer = setTimeout(() => {
      setStickersVisible(true);
    }, TIMINGS.STICKERS_APPEAR);

    return () => {
      clearTimeout(fadeInTimer);
      clearTimeout(fadeOutTimer);
      clearTimeout(navTimer);
      clearTimeout(stickersTimer);
    };
  }, [skipOpening, isReady, showIntroFade]);

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
    if (isPlacingSticker) {
      document.body.classList.add('sticker-placement-mode');
    } else {
      document.body.classList.remove('sticker-placement-mode');
    }
    return () => document.body.classList.remove('sticker-placement-mode');
  }, [isPlacingSticker]);

  // ─── MOUSE MOVE HANDLER ───
  useEffect(() => {
    const handleMouseMove = (e) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
      
      if (isPlacingSticker && selectedSticker) {
        setStickerPosition({ x: e.clientX, y: e.clientY });
      }
      
      // Handle dragging - update positions in real-time
      if (isDragging && dragData) {
        const dx = e.clientX - dragData.startX;
        const dy = e.clientY - dragData.startY;
        const newX = dragData.originalX + dx;
        const newY = dragData.originalY + dy;
        
        // Update placedStickers
        setPlacedStickers(prev => prev.map(s => {
          const id = s.id || s._id;
          if (id === dragData.stickerId) {
            return { ...s, x: newX, y: newY };
          }
          return s;
        }));
        
        // Update allStickers
        setAllStickers(prev => prev.map(s => {
          if (s._id === dragData.stickerId) {
            return { ...s, x: newX, y: newY };
          }
          return s;
        }));
      }
      
      // Bulge effect
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
  }, [bulgeEnabled, isPlacingSticker, selectedSticker, isDragging, dragData]);

  // ─── MOUSE UP HANDLER ───
  useEffect(() => {
    const handleMouseUp = async () => {
      if (isDragging && dragData) {
        try {
          const dx = mouseRef.current.x - dragData.startX;
          const dy = mouseRef.current.y - dragData.startY;
          const newX = dragData.originalX + dx;
          const newY = dragData.originalY + dy;
          
          const res = await fetch('/api/stickers/update', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              stickerId: dragData.stickerId,
              userId: userId,
              x: newX,
              y: newY,
            }),
          });
          
          if (!res.ok) {
            console.error('Failed to update sticker position');
          }
        } catch (error) {
          console.error('Error updating sticker position:', error);
        }
        
        setIsDragging(false);
        setDragData(null);
        document.body.style.cursor = 'default';
      }
    };
    
    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, [isDragging, dragData, userId]);

  // ─── CLICK HANDLER FOR STICKER PLACEMENT ───
  useEffect(() => {
    const handleClick = (e) => {
      if (isPlacingSticker && selectedSticker) {
        if (stickerModalRef.current && stickerModalRef.current.contains(e.target)) return;
        if (e.target.closest('.top-nav')) return;
        if (e.target.closest('.click-prompt')) return;
        if (e.target.closest('.sticker-placement-overlay')) return;
        
        setStickerClickPosition({ x: e.clientX, y: e.clientY });
        setPendingSticker(selectedSticker);
        setShowPlacementModal(true);
        setIsPlacingSticker(false);
        setSelectedSticker(null);
        document.body.style.cursor = 'default';
        document.body.classList.remove('sticker-placement-mode');
      }
    };
    
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [isPlacingSticker, selectedSticker]);

  // ─── ESC KEY HANDLER ───
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        if (isPlacingSticker) {
          setIsPlacingSticker(false);
          setSelectedSticker(null);
          document.body.style.cursor = 'default';
          document.body.classList.remove('sticker-placement-mode');
        }
        if (showPlacementModal) {
          setShowPlacementModal(false);
          setPendingSticker(null);
        }
        if (contextMenu) {
          setContextMenu(null);
        }
      }
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isPlacingSticker, showPlacementModal, contextMenu]);

  // ─── CONTEXT MENU CLOSE ───
  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  // ─── BULGE WAVE EFFECT ───
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

  // ─── STAR BACKGROUND ───
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

  // ─── CONFETTI EFFECT ───
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

  // ─── PREVENT ZOOM ───
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

  // ─── FUNCTIONS ───

  const fetchAllStickers = async () => {
    try {
      const res = await fetch('/api/stickers/all');
      const data = await res.json();
      
      if (data.success && data.stickers) {
        setAllStickers(data.stickers);
      }
    } catch (error) {
      console.error('Error fetching stickers:', error);
    }
  };

  const fetchUserStickers = async () => {
    try {
      if (!userId) return;
      
      const res = await fetch(`/api/stickers/user?userId=${userId}`);
      const data = await res.json();
      
      if (data.success && data.stickers) {
        const formattedStickers = data.stickers.map(s => ({
          id: s._id,
          _id: s._id,
          emoji: s.emoji,
          name: s.name,
          imageUrl: s.imageUrl || '',
          x: s.x || 100,
          y: s.y || 100,
          scale: s.scale || 1,
          rotation: s.rotation || 0,
          userName: s.userName,
          publicNote: s.publicNote,
          userId: s.userId,
        }));
        
        setUserStickers(formattedStickers);
        setPlacedStickers(prev => {
          const existingIds = new Set(prev.map(s => s.id));
          const newStickers = formattedStickers.filter(s => !existingIds.has(s.id));
          return [...prev, ...newStickers];
        });
      }
    } catch (error) {
      console.error('Error fetching user stickers:', error);
    }
  };

  const handleStickerSelect = (sticker) => {
    setSelectedSticker(sticker);
    setIsPlacingSticker(true);
    setShowStickers(false);
    setStickerPosition({ 
      x: window.innerWidth / 2, 
      y: window.innerHeight / 2 
    });
    document.body.style.cursor = 'crosshair';
    document.body.classList.add('sticker-placement-mode');
  };

  const handlePlaceSticker = async (data) => {
    if (!pendingSticker) return;

    const stickerData = {
      userId: userId,
      userName: data.userName,
      userEmail: data.userEmail,
      emoji: pendingSticker.emoji,
      name: pendingSticker.name,
      imageUrl: pendingSticker.imageUrl || '',
      x: stickerClickPosition.x - 30,
      y: stickerClickPosition.y - 30,
      scale: 1 + Math.random() * 0.3,
      rotation: (Math.random() - 0.5) * 30,
      publicNote: data.publicNote,
      privateNote: data.privateNote,
    };

    try {
      const res = await fetch('/api/stickers/place', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(stickerData),
      });

      const result = await res.json();

      if (result.success) {
        const newSticker = {
          id: result.sticker._id,
          emoji: result.sticker.emoji,
          name: result.sticker.name,
          imageUrl: result.sticker.imageUrl || pendingSticker.imageUrl || '',
          x: result.sticker.x,
          y: result.sticker.y,
          scale: result.sticker.scale,
          rotation: result.sticker.rotation,
          userName: result.sticker.userName,
          publicNote: result.sticker.publicNote,
          userId: result.sticker.userId,
        };
        
        setPlacedStickers(prev => [...prev, newSticker]);
        setAllStickers(prev => [...prev, result.sticker]);
        setUserStickers(result.userStickers || []);
        
        await fetchAllStickers();
        await fetchUserStickers();
        
        setShowPlacementModal(false);
        setPendingSticker(null);
        setShowStickers(false);
        setIsPlacingSticker(false);
        setSelectedSticker(null);
        document.body.style.cursor = 'default';
        document.body.classList.remove('sticker-placement-mode');
      } else {
        alert(result.error || 'Failed to place sticker');
        setIsPlacingSticker(true);
        setSelectedSticker(pendingSticker);
        document.body.style.cursor = 'crosshair';
        document.body.classList.add('sticker-placement-mode');
      }
    } catch (error) {
      console.error('Error placing sticker:', error);
      alert('Failed to place sticker. Please try again.');
      setIsPlacingSticker(true);
      setSelectedSticker(pendingSticker);
      document.body.style.cursor = 'crosshair';
      document.body.classList.add('sticker-placement-mode');
    }
  };

  const removeSticker = async (id) => {
    const isServerSticker = allStickers.some(s => s._id === id);
    
    if (isServerSticker && userId) {
      try {
        const res = await fetch('/api/stickers/delete', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ stickerId: id, userId }),
        });

        if (!res.ok) {
          const error = await res.json();
          alert(error.error || 'Failed to delete sticker');
          return;
        }
      } catch (error) {
        console.error('Error deleting sticker:', error);
        alert('Failed to delete sticker. Please try again.');
        return;
      }
    }

    setPlacedStickers(placedStickers.filter(s => s.id !== id));
    setAllStickers(allStickers.filter(s => s._id !== id));
    setUserStickers(userStickers.filter(s => s._id !== id));
    setContextMenu(null);
  };

  const handleStickerMouseDown = (e, sticker) => {
    if (sticker.userId !== userId) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const stickerId = sticker.id || sticker._id;
    
    setIsDragging(true);
    setDragData({
      stickerId: stickerId,
      startX: e.clientX,
      startY: e.clientY,
      originalX: sticker.x,
      originalY: sticker.y,
    });
    
    document.body.style.cursor = 'grabbing';
  };

  const handleStickerRightClick = (e, sticker) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (sticker.userId !== userId) return;
    
    setSelectedStickerForEdit(sticker);
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      stickerId: sticker.id || sticker._id,
    });
  };

  const handleEditSticker = () => {
    if (!selectedStickerForEdit) return;
    
    const newNote = prompt('Edit your public note:', selectedStickerForEdit.publicNote || '');
    if (newNote !== null) {
      updateStickerNote(selectedStickerForEdit.id || selectedStickerForEdit._id, newNote);
    }
    setContextMenu(null);
  };

  const updateStickerNote = async (stickerId, newNote) => {
    try {
      const res = await fetch('/api/stickers/update-note', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stickerId,
          userId,
          publicNote: newNote,
        }),
      });

      if (res.ok) {
        const updatedPlaced = placedStickers.map(s => {
          if (s.id === stickerId) {
            return { ...s, publicNote: newNote };
          }
          return s;
        });
        setPlacedStickers(updatedPlaced);
        
        const updatedAll = allStickers.map(s => {
          if (s._id === stickerId) {
            return { ...s, publicNote: newNote };
          }
          return s;
        });
        setAllStickers(updatedAll);
      } else {
        alert('Failed to update note');
      }
    } catch (error) {
      console.error('Error updating note:', error);
      alert('Failed to update note');
    }
  };

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

  const handleNavigation = (path) => (e) => {
    if (e) e.preventDefault();
    if (isRedirecting || !path) return;
    setIsRedirecting(true);
    setShowStickers(false);
    setIsPlacingSticker(false);
    setSelectedSticker(null);
    document.body.style.cursor = 'default';
    document.body.classList.remove('sticker-placement-mode');
    
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

  const handleClickEnter = () => {
    if (isRedirecting) return;
    setIsRedirecting(true);
    setClickPromptVisible(false);
    setShowClickPrompt(false);
    
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
      router.push('/dashboard');
    }, 800);
  };

  const toggleStickers = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isPlacingSticker) {
      setIsPlacingSticker(false);
      setSelectedSticker(null);
      document.body.style.cursor = 'default';
      document.body.classList.remove('sticker-placement-mode');
    }
    setShowStickers(!showStickers);
  };

  const nameChars = "JOEL JOJU".split("");

  if (!isReady) {
    return null;
  }

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
      </Head>
      <style>{`
        /* ... all your existing styles ... */
        /* Make sure these styles are included: */
        .placed-sticker {
          position: fixed;
          pointer-events: auto;
          z-index: 99996;
          font-size: 2.5rem;
          cursor: pointer;
          transition: transform 0.3s ease, opacity 0.3s ease;
          filter: drop-shadow(0 2px 10px rgba(0,0,0,0.4));
          animation: stickerDrop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
          opacity: 0;
          animation-fill-mode: forwards;
          user-select: none;
          -webkit-user-select: none;
          touch-action: none;
        }
        
        .placed-sticker.dragging {
          cursor: grabbing !important;
          transform: scale(1.2) !important;
          filter: drop-shadow(0 8px 30px rgba(255,255,255,0.3));
          z-index: 99998 !important;
        }
        
        .placed-sticker img {
          width: 50px;
          height: 50px;
          object-fit: contain;
          pointer-events: none;
        }
        
        .placed-sticker:hover {
          transform: scale(1.15) !important;
          filter: drop-shadow(0 4px 20px rgba(255,255,255,0.2));
        }
      `}</style>

      <div className={`black-top ${showBlackTop ? 'active' : ''}`} />

      <nav className={`top-nav ${showNav ? 'visible' : ''}`}>
        <div className="nav-group">
          <a href="/dashboard" onClick={handleNavigation('/dashboard')}>Dashboard</a>
          <a href="/projects" onClick={handleNavigation('/projects')}>Projects</a>
          <a href="/about" onClick={handleNavigation('/about')}>About</a>
        </div>
        <div className="nav-group">
          <div className="nav-divider" />
          <a 
            href="#" 
            className={`nav-plus ${showStickers ? 'active' : ''}`} 
            onClick={toggleStickers}
            style={{ position: 'relative' }}
          >
            +
            {userStickers.length > 0 && (
              <span className="sticker-count">{userStickers.length}/2</span>
            )}
          </a>
        </div>
      </nav>

      <div className={`sticker-overlay ${showStickers ? 'open' : ''}`}>
        <div className="sticker-modal" ref={stickerModalRef}>
          <div className="modal-header">
            <span className="modal-title">✨ Choose a Sticker</span>
            <button className="modal-close" onClick={() => setShowStickers(false)}>✕</button>
          </div>
          <div className="sticker-grid">
            {stickers.map((sticker) => (
              <div 
                key={sticker.id} 
                className="sticker-item"
                onClick={() => handleStickerSelect(sticker)}
              >
                {sticker.imageUrl ? (
                  <img src={sticker.imageUrl} alt={sticker.name} className="sticker-image" />
                ) : (
                  <span className="sticker-emoji">{sticker.emoji}</span>
                )}
                <span className="sticker-name">{sticker.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {isPlacingSticker && selectedSticker && (
        <div className="placement-instructions">
          Click anywhere to place your {selectedSticker.name} sticker<br />
          Press <span className="key">Esc</span> to cancel
        </div>
      )}

      {isPlacingSticker && selectedSticker && (
        <div 
          className="cursor-sticker"
          style={{
            left: stickerPosition.x + 'px',
            top: stickerPosition.y + 'px',
          }}
        >
          {selectedSticker.imageUrl ? (
            <img src={selectedSticker.imageUrl} alt={selectedSticker.name} />
          ) : (
            selectedSticker.emoji
          )}
        </div>
      )}

      {showPlacementModal && pendingSticker && (
        <StickerPlacementModal
          sticker={pendingSticker}
          existingStickers={userStickers || []}
          onConfirm={handlePlaceSticker}
          onCancel={() => {
            setShowPlacementModal(false);
            setPendingSticker(null);
            setShowStickers(true);
          }}
        />
      )}

      {/* Stickers Rendering */}
      {stickersVisible && (
        <>
          {placedStickers.map((sticker) => (
            <div 
              key={sticker.id}
              className={`placed-sticker ${isDragging && dragData?.stickerId === sticker.id ? 'dragging' : ''}`}
              style={{
                left: sticker.x + 'px',
                top: sticker.y + 'px',
                transform: `scale(${sticker.scale || 1}) rotate(${sticker.rotation || 0}deg)`,
                cursor: sticker.userId === userId ? 'grab' : 'pointer',
                position: 'fixed',
                zIndex: isDragging && dragData?.stickerId === sticker.id ? 99998 : 99996,
              }}
              onMouseDown={(e) => handleStickerMouseDown(e, sticker)}
              onContextMenu={(e) => handleStickerRightClick(e, sticker)}
            >
              {sticker.imageUrl ? (
                <img 
                  src={sticker.imageUrl} 
                  alt={sticker.name} 
                  style={{ 
                    width: '50px', 
                    height: '50px', 
                    objectFit: 'contain',
                    pointerEvents: 'none',
                    display: 'block'
                  }}
                />
              ) : (
                <span style={{ fontSize: '2.5rem' }}>{sticker.emoji || '📌'}</span>
              )}
              {sticker.userId === userId && (
                <div className="sticker-owner-indicator" title="You own this sticker" />
              )}
              <div className="sticker-tooltip">
                <span className="tooltip-name">@{sticker.userName}</span>
                {sticker.publicNote && (
                  <span className="tooltip-note">{sticker.publicNote}</span>
                )}
              </div>
            </div>
          ))}

          {allStickers.map((sticker) => {
            const isPlaced = placedStickers.some(s => s.id === sticker._id);
            if (isPlaced) return null;

            return (
              <div
                key={sticker._id}
                className={`placed-sticker server-sticker ${isDragging && dragData?.stickerId === sticker._id ? 'dragging' : ''}`}
                style={{
                  left: sticker.x + 'px',
                  top: sticker.y + 'px',
                  transform: `scale(${sticker.scale || 1}) rotate(${sticker.rotation || 0}deg)`,
                  cursor: sticker.userId === userId ? 'grab' : 'pointer',
                  position: 'fixed',
                  zIndex: isDragging && dragData?.stickerId === sticker._id ? 99998 : 99996,
                }}
                onMouseDown={(e) => handleStickerMouseDown(e, { ...sticker, id: sticker._id })}
                onContextMenu={(e) => handleStickerRightClick(e, { ...sticker, id: sticker._id })}
              >
                {sticker.imageUrl ? (
                  <img 
                    src={sticker.imageUrl} 
                    alt={sticker.name} 
                    style={{ 
                      width: '50px', 
                      height: '50px', 
                      objectFit: 'contain',
                      pointerEvents: 'none',
                      display: 'block'
                    }}
                  />
                ) : (
                  <span style={{ fontSize: '2.5rem' }}>{sticker.emoji || '📌'}</span>
                )}
                {sticker.userId === userId && (
                  <div className="sticker-owner-indicator" title="You own this sticker" />
                )}
                <div className="sticker-tooltip">
                  <span className="tooltip-name">@{sticker.userName}</span>
                  {sticker.publicNote && (
                    <span className="tooltip-note">{sticker.publicNote}</span>
                  )}
                </div>
              </div>
            );
          })}
        </>
      )}

      {/* Context Menu */}
      {contextMenu && (
        <div 
          className="context-menu"
          style={{ left: contextMenu.x + 'px', top: contextMenu.y + 'px' }}
          onClick={(e) => e.stopPropagation()}
        >
          <button className="context-menu-item" onClick={handleEditSticker}>
            ✏️ Edit Note
          </button>
          <div className="context-menu-divider" />
          <button className="context-menu-item danger" onClick={() => removeSticker(contextMenu.stickerId)}>
            🗑️ Delete Sticker
          </button>
        </div>
      )}

      {showClickPrompt && (
        <div
          className={`click-prompt ${!clickPromptVisible ? 'hidden' : ''}`}
          onClick={handleClickEnter}
        >
          Click to Enter
        </div>
      )}

      {!showIntroFade && (
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
      )}

      <main ref={pageShellRef} className="page-shell">
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