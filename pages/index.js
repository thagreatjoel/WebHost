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
      imageUrl: 'https://user-cdn.hackclub-assets.com/019d730b-237a-7aed-89c3-e60a9f562ae6/47QlTJFkr25F8SM6jxi0ek0aWavxHqHZYRA26PLvgag'
    },
    { 
      id: 2, 
      name: 'Orphymoji',
      imageUrl: 'https://cdn.hackclub.com/019d730b-a55e-7f0f-b67f-18684ad6c4d3/zGbCIuBBdvq17MYY5vU-NPj9Cwx7-EPQ_fWifN47AZc'
    },
    { 
      id: 3, 
      name: 'Holiday', 
      imageUrl: 'https://cdn.hackclub.com/019d730c-1755-7a0c-9e6f-d9b08e0affd5/YDTGVqKSv30zwAf8kuudy8vr3dV_v2Q2gU4A01CZP7o'
    },
    { 
      id: 4, 
      name: 'Anxious', 
      imageUrl: 'https://cdn.hackclub.com/019d730c-b4a4-7c77-80a6-ab4995f8813e/QgVBcCZOPZP_ZeWoD2-AhBIIG71jUiyn_rwnCbEA2vA'
    },
    { 
      id: 5, 
      name: 'Hedie & Orphous', 
      imageUrl: 'https://cdn.hackclub.com/019e1513-68f6-7140-ba8f-ad5991bbe395/archive-26sticker-2.PNG'
    },
    { 
      id: 6, 
      name: 'Star',
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
      
      // Handle dragging - update positions in real-time with percentage
      if (isDragging && dragData) {
        const dx = (e.clientX - dragData.startX) / dragData.viewportWidth * 100;
        const dy = (e.clientY - dragData.startY) / dragData.viewportHeight * 100;
        const newX = Math.max(0, Math.min(100, dragData.originalX + dx));
        const newY = Math.max(0, Math.min(100, dragData.originalY + dy));
        
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
          const dx = (mouseRef.current.x - dragData.startX) / dragData.viewportWidth * 100;
          const dy = (mouseRef.current.y - dragData.startY) / dragData.viewportHeight * 100;
          const newX = Math.max(0, Math.min(100, dragData.originalX + dx));
          const newY = Math.max(0, Math.min(100, dragData.originalY + dy));
          
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

  // ─── TOUCH HANDLERS ───
  const handleStickerTouchStart = (e, sticker) => {
    if (sticker.userId !== userId) return;
    e.preventDefault();
    
    const touch = e.touches[0];
    const stickerId = sticker.id || sticker._id;
    
    setIsDragging(true);
    setDragData({
      stickerId: stickerId,
      startX: touch.clientX,
      startY: touch.clientY,
      originalX: sticker.x,
      originalY: sticker.y,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      isTouch: true,
    });
    
    document.body.style.cursor = 'grabbing';
  };

  const handleTouchMove = (e) => {
    if (!isDragging || !dragData) return;
    e.preventDefault();
    
    const touch = e.touches[0];
    const dx = (touch.clientX - dragData.startX) / dragData.viewportWidth * 100;
    const dy = (touch.clientY - dragData.startY) / dragData.viewportHeight * 100;
    const newX = Math.max(0, Math.min(100, dragData.originalX + dx));
    const newY = Math.max(0, Math.min(100, dragData.originalY + dy));
    
    setPlacedStickers(prev => prev.map(s => {
      const id = s.id || s._id;
      if (id === dragData.stickerId) {
        return { ...s, x: newX, y: newY };
      }
      return s;
    }));
    
    setAllStickers(prev => prev.map(s => {
      if (s._id === dragData.stickerId) {
        return { ...s, x: newX, y: newY };
      }
      return s;
    }));
  };

  const handleTouchEnd = async () => {
    if (isDragging && dragData) {
      try {
        const dx = (mouseRef.current.x - dragData.startX) / dragData.viewportWidth * 100;
        const dy = (mouseRef.current.y - dragData.startY) / dragData.viewportHeight * 100;
        const newX = Math.max(0, Math.min(100, dragData.originalX + dx));
        const newY = Math.max(0, Math.min(100, dragData.originalY + dy));
        
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
          x: s.x || 50,
          y: s.y || 50,
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

    // ✅ Convert click position to percentage of viewport
    const xPercent = (stickerClickPosition.x / window.innerWidth) * 100;
    const yPercent = (stickerClickPosition.y / window.innerHeight) * 100;

    const stickerData = {
      userId: userId,
      userName: data.userName,
      userEmail: data.userEmail,
      emoji: pendingSticker.emoji,
      name: pendingSticker.name,
      imageUrl: pendingSticker.imageUrl || '',
      x: Math.max(0, Math.min(100, xPercent)),  // ✅ Store as percentage (0-100)
      y: Math.max(0, Math.min(100, yPercent)),  // ✅ Store as percentage (0-100)
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
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      isTouch: false,
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
        
        body.sticker-placement-mode {
          cursor: crosshair !important;
        }
        body.sticker-placement-mode * {
          cursor: crosshair !important;
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
          border: none;
          border-radius: 30px;
          background: transparent;
          transition: opacity 0.8s ease, transform 0.8s ease;
          animation: blinkPulse 2s ease-in-out infinite;
        }
        .click-prompt:focus {
          outline: none;
        }
        .click-prompt:hover {
          color: rgba(255, 255, 255, 1);
          transform: translateX(-50%) scale(1.03);
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
          cursor: pointer;
          user-select: none;
          display: inline-block;
          position: relative;
        }

        .top-nav .nav-plus:hover {
          color: rgba(255, 255, 255, 0.9);
          transform: rotate(90deg);
        }

        .sticker-count {
          position: absolute;
          top: -6px;
          right: -12px;
          background: #fbbf24;
          color: #0F0F0F;
          font-size: 0.5rem;
          padding: 2px 6px;
          border-radius: 10px;
          font-weight: 700;
          min-width: 18px;
          text-align: center;
        }

        .sticker-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(12px);
          z-index: 99998;
          display: none;
          align-items: center;
          justify-content: center;
          animation: overlayFadeIn 0.3s ease;
        }
        .sticker-overlay.open {
          display: flex;
        }

        @keyframes overlayFadeIn {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }

        .sticker-modal {
          background: rgba(20, 20, 20, 0.95);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 30px;
          min-width: 320px;
          max-width: 500px;
          width: 90%;
          max-height: 80vh;
          overflow-y: auto;
          box-shadow: 0 30px 80px rgba(0, 0, 0, 0.8);
          animation: modalPopIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
          position: relative;
        }

        @keyframes modalPopIn {
          0% { opacity: 0; transform: scale(0.8) translateY(20px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }

        .sticker-modal .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
          padding-bottom: 12px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }

        .sticker-modal .modal-title {
          color: rgba(255, 255, 255, 0.8);
          font-size: 0.9rem;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          font-weight: 400;
        }

        .sticker-modal .modal-close {
          color: rgba(255, 255, 255, 0.4);
          font-size: 1.2rem;
          cursor: pointer;
          transition: all 0.3s ease;
          background: none;
          border: none;
          padding: 4px 8px;
          border-radius: 4px;
        }
        .sticker-modal .modal-close:hover {
          color: rgba(255, 255, 255, 0.8);
          background: rgba(255, 255, 255, 0.05);
        }

        .sticker-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }

        .sticker-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 14px 8px;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid transparent;
        }
        .sticker-item:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.15);
          transform: scale(1.05);
        }
        .sticker-item:active {
          transform: scale(0.95);
        }

        .sticker-item .sticker-emoji {
          font-size: 2.5rem;
          line-height: 1.2;
        }
        
        .sticker-item .sticker-image {
          width: 60px;
          height: 60px;
          object-fit: contain;
          border-radius: 8px;
        }
        
        .sticker-item .sticker-name {
          color: rgba(255, 255, 255, 0.4);
          font-size: 0.55rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-top: 6px;
          font-weight: 400;
          text-align: center;
        }

        .placement-instructions {
          position: fixed;
          bottom: 120px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 99997;
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(10px);
          padding: 12px 24px;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.8);
          font-size: 0.9rem;
          text-align: center;
          animation: pulseGlow 2s ease-in-out infinite;
          pointer-events: none;
        }

        .placement-instructions .key {
          display: inline-block;
          background: rgba(255, 255, 255, 0.1);
          padding: 2px 10px;
          border-radius: 4px;
          font-size: 0.7rem;
          margin: 0 4px;
          color: #fbbf24;
        }

        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 20px rgba(251, 191, 36, 0.1); }
          50% { box-shadow: 0 0 40px rgba(251, 191, 36, 0.2); }
        }

        .cursor-sticker {
          position: fixed;
          pointer-events: none;
          z-index: 99997;
          font-size: 2.5rem;
          transform: translate(-50%, -50%) scale(1);
          transition: none;
          opacity: 0.9;
          filter: drop-shadow(0 4px 20px rgba(0,0,0,0.6));
          animation: stickerFloat 1.5s ease-in-out infinite;
        }

        .cursor-sticker img {
          width: 60px;
          height: 60px;
          object-fit: contain;
        }

        @keyframes stickerFloat {
          0%, 100% { transform: translate(-50%, -50%) scale(1) rotate(0deg); }
          50% { transform: translate(-50%, -60%) scale(1.1) rotate(5deg); }
        }

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

        .placed-sticker.dragging {
          cursor: grabbing !important;
          transform: scale(1.2) !important;
          filter: drop-shadow(0 8px 30px rgba(255,255,255,0.3));
          z-index: 99997 !important;
        }

        .placed-sticker .sticker-owner-indicator {
          position: absolute;
          top: -8px;
          left: -8px;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #4ade80;
          border: 2px solid rgba(0,0,0,0.5);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .placed-sticker:hover .sticker-owner-indicator {
          opacity: 1;
        }

        .server-sticker {
          cursor: pointer;
        }

        .sticker-tooltip {
          position: absolute;
          bottom: calc(100% + 8px);
          left: 50%;
          transform: translateX(-50%);
          background: rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(8px);
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 0.6rem;
          color: rgba(255, 255, 255, 0.9);
          white-space: nowrap;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.3s ease;
          border: 1px solid rgba(255, 255, 255, 0.05);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
          max-width: 180px;
        }

        .server-sticker:hover .sticker-tooltip {
          opacity: 1;
        }

        .tooltip-name {
          color: #fbbf24;
          font-weight: 500;
          font-size: 0.6rem;
        }

        .tooltip-note {
          color: rgba(255, 255, 255, 0.6);
          font-size: 0.5rem;
          max-width: 160px;
          white-space: normal;
          word-wrap: break-word;
          text-align: center;
          line-height: 1.3;
        }

        .context-menu {
          position: fixed;
          background: rgba(20, 20, 20, 0.95);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 8px;
          min-width: 160px;
          z-index: 99999;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8);
          animation: contextMenuIn 0.15s ease;
        }

        @keyframes contextMenuIn {
          0% { opacity: 0; transform: scale(0.9); }
          100% { opacity: 1; transform: scale(1); }
        }

        .context-menu-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 14px;
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.8rem;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          border: none;
          background: none;
          width: 100%;
          font-family: inherit;
        }

        .context-menu-item:hover {
          background: rgba(255, 255, 255, 0.08);
          color: white;
        }

        .context-menu-item.danger:hover {
          background: rgba(255, 0, 0, 0.15);
          color: #ff6b6b;
        }

        .context-menu-divider {
          height: 1px;
          background: rgba(255, 255, 255, 0.06);
          margin: 4px 8px;
        }

        @keyframes stickerDrop {
          0% { opacity: 0; transform: scale(0) rotate(-20deg); }
          100% { opacity: 1; transform: scale(1) rotate(0deg); }
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
          transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
          transform-origin: center center;
        }
        .page-shell.zoom-in-big {
          transform: scale(1.8);
          opacity: 0;
          filter: blur(34px);
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
          .sticker-modal {
            padding: 20px;
            min-width: 280px;
          }
          .sticker-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 8px;
          }
          .sticker-item .sticker-emoji {
            font-size: 2rem;
          }
          .sticker-item .sticker-image {
            width: 50px;
            height: 50px;
          }
          .cursor-sticker {
            font-size: 2rem;
          }
          .cursor-sticker img {
            width: 50px;
            height: 50px;
          }
          .placed-sticker {
            font-size: 2rem;
          }
          .placed-sticker img {
            width: 40px;
            height: 40px;
          }
          .placement-instructions {
            bottom: 100px;
            font-size: 0.8rem;
            padding: 10px 20px;
          }
          .context-menu {
            min-width: 140px;
          }
          .sticker-tooltip {
            font-size: 0.5rem;
            padding: 3px 8px;
          }
          .tooltip-note {
            font-size: 0.45rem;
            max-width: 120px;
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
          .sticker-modal {
            padding: 16px;
            min-width: 200px;
          }
          .sticker-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 6px;
          }
          .sticker-item .sticker-emoji {
            font-size: 1.6rem;
          }
          .sticker-item .sticker-image {
            width: 40px;
            height: 40px;
          }
          .sticker-item .sticker-name {
            font-size: 0.45rem;
          }
          .cursor-sticker {
            font-size: 1.6rem;
          }
          .cursor-sticker img {
            width: 40px;
            height: 40px;
          }
          .placed-sticker {
            font-size: 1.6rem;
          }
          .placed-sticker img {
            width: 35px;
            height: 35px;
          }
          .placement-instructions {
            bottom: 80px;
            font-size: 0.7rem;
            padding: 8px 16px;
          }
          .context-menu {
            min-width: 120px;
            padding: 6px;
          }
          .context-menu-item {
            font-size: 0.7rem;
            padding: 6px 10px;
          }
          .sticker-tooltip {
            font-size: 0.45rem;
            padding: 2px 6px;
            max-width: 100px;
          }
          .tooltip-note {
            font-size: 0.4rem;
            max-width: 80px;
          }
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

      {/* Stickers - Only shown when stickersVisible is true */}
      {stickersVisible && (
        <>
          {/* Render placed stickers from placedStickers state */}
          {placedStickers.map((sticker) => (
            <div 
              key={sticker.id}
              className={`placed-sticker ${isDragging && dragData?.stickerId === sticker.id ? 'dragging' : ''}`}
              style={{
                left: sticker.x + '%',
                top: sticker.y + '%',
                transform: `scale(${sticker.scale || 1}) rotate(${sticker.rotation || 0}deg)`,
                cursor: sticker.userId === userId ? 'grab' : 'pointer',
                position: 'fixed',
                zIndex: isDragging && dragData?.stickerId === sticker.id ? 99998 : 99996,
              }}
              onMouseDown={(e) => handleStickerMouseDown(e, sticker)}
              onTouchStart={(e) => handleStickerTouchStart(e, sticker)}
              onTouchMove={(e) => handleTouchMove(e)}
              onTouchEnd={handleTouchEnd}
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

          {/* Render stickers from allStickers (from database) */}
          {allStickers.map((sticker) => {
            const isPlaced = placedStickers.some(s => s.id === sticker._id);
            if (isPlaced) return null;

            return (
              <div
                key={sticker._id}
                className={`placed-sticker server-sticker ${isDragging && dragData?.stickerId === sticker._id ? 'dragging' : ''}`}
                style={{
                  left: sticker.x + '%',
                  top: sticker.y + '%',
                  transform: `scale(${sticker.scale || 1}) rotate(${sticker.rotation || 0}deg)`,
                  cursor: sticker.userId === userId ? 'grab' : 'pointer',
                  position: 'fixed',
                  zIndex: isDragging && dragData?.stickerId === sticker._id ? 99998 : 99996,
                }}
                onMouseDown={(e) => handleStickerMouseDown(e, { ...sticker, id: sticker._id })}
                onTouchStart={(e) => handleStickerTouchStart(e, { ...sticker, id: sticker._id })}
                onTouchMove={(e) => handleTouchMove(e)}
                onTouchEnd={handleTouchEnd}
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