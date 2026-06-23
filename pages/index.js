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
  BLACK_TRANSITION_DURATION: 1500,
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
  const [showBlackOverlay, setShowBlackOverlay] = useState(false);
  const [bulgeEnabled, setBulgeEnabled] = useState(false);

  const canvasRef = useRef(null);
  const audioRef = useRef(null);
  const charRefs = useRef([]);

  // ─── Mouse move for bulge effect ───
  useEffect(() => {
    if (!bulgeEnabled) return;

    const handleMouseMove = (e) => {
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
        const intensity = (scale - 1) * 8;
        const tx = (dx / (dist + 1)) * intensity;
        const ty = (dy / (dist + 1)) * intensity;
        el.style.transform = `translateY(0px) scale(${scale}) translate(${tx}px, ${ty}px)`;
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [bulgeEnabled]);

  // ─── Left‑to‑right wave every 5 seconds ───
  useEffect(() => {
    if (!bulgeEnabled) return;

    const wave = () => {
      const chars = charRefs.current;
      if (!chars || chars.length === 0) return;

      // Reset all characters
      chars.forEach((el) => {
        if (el) {
          el.style.transition = 'transform 0.25s ease-out';
          el.style.transform = 'translateY(0px) scale(1) translate(0px, 0px)';
        }
      });

      // Apply bulge with a left‑to‑right delay
      chars.forEach((el, index) => {
        if (!el || el.textContent === '\u00A0' || el.textContent === ' ') return;

        const delay = index * 100; // 100ms per character (smoother)

        setTimeout(() => {
          if (el) {
            el.style.transition = 'transform 0.25s ease-out';
            el.style.transform = 'translateY(0px) scale(1.12) translate(0px, 0px)';
          }
        }, delay);

        // Reset after a short hold
        setTimeout(() => {
          if (el) {
            el.style.transition = 'transform 0.25s ease-out';
            el.style.transform = 'translateY(0px) scale(1) translate(0px, 0px)';
          }
        }, delay + 250);
      });
    };

    const interval = setInterval(wave, 5000);
    // Run once immediately after the page loads
    setTimeout(wave, 100);

    return () => clearInterval(interval);
  }, [bulgeEnabled]);

  // ─── Audio load ───
  useEffect(() => {
    const audio = new Audio('/audio.mp3');
    audioRef.current = audio;

    const handleCanPlay = () => setAudioLoaded(true);
    audio.addEventListener('canplaythrough', handleCanPlay);
    audio.load();

    return () => {
      audio.removeEventListener('canplaythrough', handleCanPlay);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // ─── Start sequence ───
  const handleStart = () => {
    if (audioStarted || !audioLoaded) return;

    if (TIMINGS.AUDIO_START === 0) {
      audioRef.current.play().catch(() => {});
    } else {
      setTimeout(() => {
        audioRef.current.play().catch(() => {});
      }, TIMINGS.AUDIO_START);
    }

    setIsZooming(true);

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
      setIsZooming(false);
    }, TIMINGS.SEQUENCE_START_DELAY + TIMINGS.FLASH_DURATION + 30);

    setTimeout(() => {
      setIsLoading(false);
      setTimeout(() => {
        setShowBlackOverlay(true);
      }, 100);
      setTimeout(() => {
        setShowBlackOverlay(false);
        setShowContent(true);
        // Enable bulge after all slide-up animations complete
        setTimeout(() => {
          charRefs.current.forEach((el) => {
            if (el) {
              el.style.animation = 'none';
              el.style.opacity = '1';
              el.style.transform = 'translateY(0px)';
            }
          });
          setBulgeEnabled(true);
        }, 2000);
      }, TIMINGS.BLACK_TRANSITION_DURATION + 100);
    }, TIMINGS.LOADING_DURATION);
  };

  // ─── Confetti render ───
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
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
      '#FFEAA7', '#DDA0DD', '#FF8A5C', '#A29BFE',
      '#FD79A8', '#00CEC9',
    ];

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
    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [pop]);

  // ─── Disable zoom ───
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

  const nameChars = 'JOEL JOJU'.split('');

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
        `}</style>
      </Head>

      {/* ─── LOADING SCREEN ─── */}
      <div
        className={`loading-overlay ${!isLoading ? 'fade-out' : ''}`}
        onClick={handleStart}
      >
        <div className={`camera-scene ${isZooming ? 'zooming' : ''}`}>
          <div className={`loading-content ${floatActive ? 'float' : ''}`}>
            <div className={`shake-wrapper ${shake ? 'shake' : ''}`}>
              <div className={`welcome-grid ${showGrid ? 'visible' : ''}`} />
              <div className="logo-container">
                <img
                  src="/logo.png"
                  alt="Logo"
                  className={`loading-image ${audioStarted ? 'animate' : ''}`}
                />
              </div>
              <canvas ref={canvasRef} className="confetti-canvas" />
              {!audioStarted && audioLoaded && (
                <div className="prompt-center">
                  <img src="/pfp.jpg" alt="Profile" className="pfp-image" />
                  <p className="prompt-text">Click anywhere to begin</p>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className={`flash-overlay ${flash ? 'active' : ''}`} />
      </div>

      {/* ─── BLACK TRANSITION ─── */}
      <div className={`black-overlay ${showBlackOverlay ? 'active' : ''}`} />

      {/* ─── MAIN PAGE ─── */}
      <main className="page-shell">
        <div className="grid-blueprint" />
        <section className={`page-content ${showContent ? 'is-ready' : ''}`}>
          <span className="page-eyebrow">Portfolio</span>
          <h1 className="main-title">
            {nameChars.map((char, idx) => (
              <span
                key={idx}
                className="char"
                ref={(el) => (charRefs.current[idx] = el)}
                style={{ animationDelay: `${0.1 + idx * 0.08}s` }}
              >
                {char === ' ' ? '\u00A0' : char}
              </span>
            ))}
          </h1>
          <p>
            <span className="word" style={{ animationDelay: '1.2s' }}>
              Hardware
            </span>
            <span className="word" style={{ animationDelay: '1.4s' }}>
              •
            </span>
            <span className="word" style={{ animationDelay: '1.6s' }}>
              Systems
            </span>
            <span className="word" style={{ animationDelay: '1.8s' }}>
              •
            </span>
            <span className="word" style={{ animationDelay: '2.0s' }}>
              UAV
            </span>
          </p>
        </section>
      </main>

      <style jsx global>{`
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        html {
          zoom: 1;
        }

        body {
          background: #0f0f0f;
          color: #fff;
          font-family: 'Aeonik', 'General Sans', Inter, 'Segoe UI', sans-serif;
          overflow: hidden;
          height: 100vh;
          width: 100vw;
          cursor: crosshair;
        }

        .loading-overlay {
          position: fixed;
          inset: 0;
          display: grid;
          place-items: center;
          background: #0f0f0f;
          z-index: 9999;
          transition: opacity 0.8s ease;
          cursor: pointer;
          overflow: hidden;
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
          animation: cameraZoom ${TIMINGS.ZOOM_DURATION}ms
            cubic-bezier(0.1, 0.9, 1.2, 1) forwards;
        }
        @keyframes cameraZoom {
          0% {
            transform: scale(1);
          }
          60% {
            transform: scale(22);
          }
          100% {
            transform: scale(18);
          }
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
          0%,
          100% {
            transform: translate(0, 0) rotate(0deg);
          }
          25% {
            transform: translate(4px, -6px) rotate(0.1deg);
          }
          50% {
            transform: translate(-4px, 10px) rotate(-0.5deg);
          }
          75% {
            transform: translate(5px, -4px) rotate(1deg);
          }
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
          0% {
            transform: translate(0, 0) rotate(0deg);
          }
          20% {
            transform: translate(-8px, 5px) rotate(-0.4deg);
          }
          40% {
            transform: translate(6px, -4px) rotate(0.3deg);
          }
          60% {
            transform: translate(-4px, 3px) rotate(-0.2deg);
          }
          80% {
            transform: translate(2px, -1px) rotate(0.1deg);
          }
          100% {
            transform: translate(0, 0) rotate(0deg);
          }
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
          background-image: linear-gradient(
              rgba(255, 255, 255, 0.12) 1px,
              transparent 1px
            ),
            linear-gradient(90deg, rgba(255, 255, 255, 0.12) 1px, transparent 1px);
          background-size: 60px 60px;
          background-position: 0 0, 0 0;
          mask-image: radial-gradient(
            circle at center,
            rgba(0, 0, 0, 1) 15%,
            rgba(0, 0, 0, 0.8) 30%,
            rgba(0, 0, 0, 0) 55%
          );
          -webkit-mask-image: radial-gradient(
            circle at center,
            rgba(0, 0, 0, 1) 15%,
            rgba(0, 0, 0, 0.8) 30%,
            rgba(0, 0, 0, 0) 55%
          );
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        .welcome-grid.visible {
          opacity: 1;
        }

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
          0% {
            transform: scale(0.8);
            opacity: 1;
          }
          30% {
            transform: scale(1.15);
            opacity: 1;
          }
          70% {
            transform: scale(1.05);
            opacity: 0.9;
          }
          100% {
            transform: scale(1);
            opacity: 0;
          }
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
          animation: linearFastZoom 0.25s cubic-bezier(0.16, 1, 0.3, 1)
            forwards;
          animation-delay: ${TIMINGS.LOGO_ZOOM_START}ms;
        }
        @keyframes linearFastZoom {
          0% {
            transform: scale(0) rotate(0deg);
            opacity: 0;
            filter: blur(10px);
          }
          30% {
            opacity: 1;
          }
          100% {
            transform: scale(1) rotate(3deg);
            opacity: 1;
            filter: blur(0px);
          }
        }

        .prompt-center {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 20;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 20px;
          pointer-events: none;
        }
        .pfp-image {
          width: 140px;
          height: 140px;
          border-radius: 8px;
          object-fit: cover;
          border: 2px solid rgba(255, 255, 255, 0.15);
          box-shadow: 0 0 40px rgba(255, 255, 255, 0.04);
          flex-shrink: 0;
        }
        .prompt-text {
          font-size: 1.6rem;
          font-weight: 400;
          letter-spacing: 0.12em;
          opacity: 0.85;
          margin: 0;
          color: #fff;
          font-family: 'Aeonik', 'General Sans', sans-serif;
        }

        .spinner {
          width: 44px;
          height: 44px;
          border: 3px solid rgba(255, 255, 255, 0.1);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .black-overlay {
          position: fixed;
          inset: 0;
          background: #0f0f0f;
          z-index: 10001;
          pointer-events: none;
          opacity: 0;
          transition: none;
        }
        .black-overlay.active {
          animation: blackPulse ${TIMINGS.BLACK_TRANSITION_DURATION}ms
            ease-in-out forwards;
        }
        @keyframes blackPulse {
          0% {
            opacity: 0;
          }
          25% {
            opacity: 1;
          }
          75% {
            opacity: 1;
          }
          100% {
            opacity: 0;
          }
        }

        /* ─── MAIN PAGE ─── */
        .page-shell {
          position: relative;
          min-height: 100vh;
          min-width: 100vw;
          background: #0f0f0f;
          overflow: hidden;
        }

        .grid-blueprint {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 0;
          background-image: linear-gradient(
              rgba(255, 255, 255, 0.06) 1px,
              transparent 1px
            ),
            linear-gradient(90deg, rgba(255, 255, 255, 0.06) 1px, transparent 1px);
          background-size: 60px 60px;
          background-position: 0 0, 0 0;
          mask-image: radial-gradient(
            circle at center,
            rgba(0, 0, 0, 1) 15%,
            rgba(0, 0, 0, 0.8) 30%,
            rgba(0, 0, 0, 0) 55%
          );
          -webkit-mask-image: radial-gradient(
            circle at center,
            rgba(0, 0, 0, 1) 15%,
            rgba(0, 0, 0, 0.8) 30%,
            rgba(0, 0, 0, 0) 55%
          );
        }

        .page-content {
          position: relative;
          z-index: 1;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        .page-content.is-ready {
          opacity: 1;
        }

        .page-eyebrow {
          display: block;
          color: #aaa;
          font-size: 0.9rem;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          margin-bottom: 12px;
          opacity: 0;
          animation: slideUp 0.8s ease forwards;
          animation-delay: 0.05s;
        }

        .main-title {
          font-family: 'Aeonik', 'General Sans', Inter, 'Segoe UI', sans-serif;
          font-size: clamp(4.5rem, 10vw, 8rem);
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #fff;
          margin-bottom: 10px;
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
        }

        /* ─── CHARACTER STYLES ─── */
        .char {
          display: inline-block;
          opacity: 0;
          transform: translateY(30px);
          animation: slideUp 0.8s ease forwards;
          transition: transform 0.25s ease-out, opacity 0.1s ease;
          will-change: transform;
          transform-origin: center center;
        }

        .page-content p .word {
          display: inline-block;
          opacity: 0;
          animation: slideUp 0.8s ease forwards;
        }

        @keyframes slideUp {
          0% {
            opacity: 0;
            transform: translateY(30px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .page-content p {
          color: #aaa;
          font-size: 1.4rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 0.5em;
          margin-top: 0.5rem;
          font-weight: 400;
        }
      `}</style>
    </>
  );
}