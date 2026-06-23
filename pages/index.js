import Head from 'next/head';
import { useEffect, useState } from 'react';

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [flash, setFlash] = useState(false);
  const [showGrid, setShowGrid] = useState(false);

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

    const loadResources = async () => {
      try {
        await document.fonts.load('1em AeonikTRIAL-Regular');
        await document.fonts.load('700 1em AeonikTRIAL-Bold');
      } catch {}
      await new Promise((resolve) => {
        if (document.readyState === 'complete') resolve();
        else window.addEventListener('load', resolve);
      });

      // ─── FLASH (200ms total) ───
      setTimeout(() => {
        setFlash(true);
        // Keep flash visible for 200ms, then hide
        setTimeout(() => {
          setFlash(false);
          setShowGrid(true);
        }, 200);
      }, 500);

      const start = Date.now();
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, 4000 - elapsed);
      setTimeout(() => setIsLoading(false), remaining);
    };
    loadResources();

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
        `}</style>
      </Head>

      {/* ─── LOADING SCREEN ─── */}
      <div className={`loading-overlay ${!isLoading ? 'fade-out' : ''}`}>
        <div className="loading-content">
          <div className={`welcome-grid ${showGrid ? 'visible' : ''}`} />
          <h1 className="loading-title">Welcome</h1>
          <div className={`flash-overlay ${flash ? 'active' : ''}`} />
        </div>
      </div>

      {/* ─── MAIN PAGE ─── */}
      <main className={`page-shell ${!isLoading ? 'is-ready' : ''}`}>
        <div className="grid-blueprint" />
        <section className="page-content">
          <span className="page-eyebrow">Portfolio</span>
          <h1 className="main-title">
            {nameChars.map((char, idx) => (
              <span
                key={idx}
                className="char"
                style={{ animationDelay: `${0.1 + idx * 0.08}s` }}
              >
                {char === " " ? "\u00A0" : char}
              </span>
            ))}
          </h1>
          <p>
            <span className="word" style={{ animationDelay: '1.2s' }}>Hardware</span>
            <span className="word" style={{ animationDelay: '1.4s' }}>•</span>
            <span className="word" style={{ animationDelay: '1.6s' }}>Systems</span>
            <span className="word" style={{ animationDelay: '1.8s' }}>•</span>
            <span className="word" style={{ animationDelay: '2.0s' }}>UAV</span>
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
          background: #fffbf7;
          color: #1a1a1a;
          font-family: 'Aeonik', 'General Sans', Inter, 'Segoe UI', sans-serif;
          overflow: hidden;
          height: 100vh;
          width: 100vw;
        }

        .loading-overlay {
          position: fixed;
          inset: 0;
          display: grid;
          place-items: center;
          background: #000;
          z-index: 9999;
          transition: opacity 0.8s ease;
        }

        .loading-overlay.fade-out {
          opacity: 0;
          pointer-events: none;
        }

        .loading-content {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
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
            transform: translate(-4px, 8px) rotate(-0.15deg);
          }
          75% {
            transform: translate(2px, -4px) rotate(0.08deg);
          }
        }

        /* ─── WHITE GRID ─── */
        .welcome-grid {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 1;
          background-image:
            linear-gradient(rgba(255, 255, 255, 0.12) 1px, transparent 1px),
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

        /* ─── FLASH (200ms) ─── */
        .flash-overlay {
          position: fixed;
          inset: 0;
          background: #fff;
          z-index: 10000;
          pointer-events: none;
          opacity: 0;
        }

        .flash-overlay.active {
          animation: flashSnap 0.2s ease-out forwards;
        }

        @keyframes flashSnap {
          0% {
            opacity: 1;
            transform: scale(0.98);
          }
          30% {
            opacity: 1;
            transform: scale(1.02);
          }
          70% {
            opacity: 1;
            transform: scale(1);
          }
          100% {
            opacity: 0;
            transform: scale(1);
          }
        }

        /* ─── "Welcome" – BIG, 0° → 3° tilt ─── */
        .loading-title {
          position: relative;
          z-index: 10;
          font-family: 'Aeonik', 'General Sans', sans-serif;
          font-size: clamp(6rem, 16vw, 14rem);
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #fff;
          margin: 0;

          transform: scale(0) rotate(0deg);
          opacity: 0;
          filter: blur(10px);
          transform-origin: center center;

          animation: linearFastZoom 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          animation-delay: 0.7s; /* starts after flash ends (500+200=700ms) */
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

        /* ─── MAIN PAGE ─── */
        .page-shell {
          position: relative;
          min-height: 100vh;
          min-width: 100vw;
          display: grid;
          place-items: center;
          background: #fffbf7;
          overflow: hidden;
          opacity: 0;
          transition: opacity 0.6s ease;
        }

        .page-shell.is-ready {
          opacity: 1;
        }

        .grid-blueprint {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 0;
          background-image:
            linear-gradient(rgba(70, 130, 200, 0.10) 1px, transparent 1px),
            linear-gradient(90deg, rgba(70, 130, 200, 0.10) 1px, transparent 1px);
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
        }

        .page-eyebrow {
          display: block;
          color: #6c6c6c;
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
          color: #1a1a1a;
          margin-bottom: 10px;
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
        }

        .main-title .char {
          display: inline-block;
          opacity: 0;
          animation: slideUp 0.8s ease forwards;
        }

        .page-content p {
          color: #6c6c6c;
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
      `}</style>
    </>
  );
}