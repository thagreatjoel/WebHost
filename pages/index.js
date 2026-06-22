import Head from 'next/head';
import { useEffect, useMemo, useState } from 'react';

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const timer = window.setTimeout(() => setIsLoading(false), 2400);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleMove = (event) => {
      setMouse({
        x: event.clientX / window.innerWidth - 0.5,
        y: event.clientY / window.innerHeight - 0.5,
      });
    };

    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);

  const gridStyle = useMemo(() => ({
    '--mouse-x': `${mouse.x * 12}px`,
    '--mouse-y': `${mouse.y * 12}px`,
  }), [mouse]);

  return (
    <>
      <Head>
        <title>Joel Joju | Portfolio</title>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta
          name="description"
          content="Joel Joju is an Embedded Systems, UAV, PCB Design, and IoT enthusiast."
        />
      </Head>

      {isLoading && (
        <div className="intro-overlay">
          <div className="intro-content">
            <div className="intro-text-wrap">
              <svg className="intro-image" viewBox="0 0 620 140" aria-label="Joel Joju">
                <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle">
                  JOEL JOJU
                </text>
              </svg>
            </div>
            <div className="intro-line" />
            <span className="intro-meta">Hardware • Systems • UAV</span>
          </div>
        </div>
      )}

      <main
        className={`page-shell ${isLoading ? 'page-shell-hidden' : 'page-shell-visible'}`}
        style={gridStyle}
      >
        <div className="grid-overlay" />
        <div className="grid-fade" />
        <div className="page-glow" />
        <section className="page-content">
          <span className="page-eyebrow">Portfolio</span>
          <h1>Joel Joju</h1>
          <p>Hardware • Systems • UAV</p>
        </section>
      </main>

      <style jsx global>{`
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        html {
          scroll-behavior: smooth;
        }

        body {
          background: #dcd8c0;
          color: #2f2a1f;
          font-family: 'General Sans', Inter, 'Segoe UI', sans-serif;
          overflow-x: hidden;
        }

        body::before {
          content: '';
          position: fixed;
          inset: 0;
          background:
            radial-gradient(rgba(255, 255, 255, 0.06) 1px, transparent 1px),
            radial-gradient(rgba(47, 42, 31, 0.03) 1px, transparent 1px);
          background-size: 18px 18px, 36px 36px;
          background-position: 0 0, 9px 9px;
          pointer-events: none;
          opacity: 0.45;
        }

        body::after {
          content: '';
          position: fixed;
          inset: 0;
          background:
            radial-gradient(circle at 50% 15%, rgba(255, 255, 255, 0.08), transparent 9%),
            radial-gradient(circle at 75% 25%, rgba(255, 255, 255, 0.04), transparent 10%);
          pointer-events: none;
        }

        a {
          color: inherit;
          text-decoration: none;
        }

        .intro-overlay {
          position: fixed;
          inset: 0;
          display: grid;
          place-items: center;
          background: #dcd8c0;
          z-index: 9999;
        }

        .intro-content {
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
        }

        .page-shell {
          position: relative;
          min-height: 100vh;
          overflow: hidden;
          display: grid;
          place-items: center;
          opacity: 0;
          background:
            radial-gradient(circle at 50% 18%, rgba(255, 255, 255, 0.06), transparent 10%),
            #dcd8c0;
        }

        .page-shell-visible {
          opacity: 1;
        }

        .page-shell-hidden {
          pointer-events: none;
        }

        .grid-overlay {
          position: absolute;
          inset: -8%;
          background-image:
            linear-gradient(rgba(47, 42, 31, 0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(47, 42, 31, 0.06) 1px, transparent 1px);
          background-size: 52px 52px;
          transform:
            perspective(1000px)
            rotateX(62deg)
            translateY(18%)
            translateX(calc(var(--mouse-x, 0) * 0.25))
            translateZ(0);
          transform-origin: center;
          pointer-events: none;
          will-change: transform;
          animation: idleCamera 8s ease-in-out infinite;
        }

        .grid-fade {
          position: absolute;
          inset: 0;
          background:
            linear-gradient(to top, rgba(220, 216, 192, 0.92), rgba(220, 216, 192, 0.18) 48%, rgba(220, 216, 192, 0));
          pointer-events: none;
          z-index: 2;
        }

        .page-glow {
          position: absolute;
          width: 460px;
          height: 460px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(255, 255, 255, 0.16), transparent 68%);
          top: 50%;
          left: 50%;
          transform: translate(calc(-50% + var(--mouse-x, 0) * 0.45), calc(-50% + var(--mouse-y, 0) * 0.45));
          pointer-events: none;
          transition: transform 0.18s ease-out;
        }

        .page-content {
          position: relative;
          z-index: 1;
          text-align: center;
        }

        .page-eyebrow {
          display: block;
          color: #6c654f;
          font-size: 0.72rem;
          letter-spacing: 0.42em;
          text-transform: uppercase;
          margin-bottom: 12px;
        }

        .page-content h1 {
          font-size: clamp(3rem, 6vw, 5rem);
          letter-spacing: 0.5em;
          text-transform: uppercase;
          color: #2f2a1f;
          margin-bottom: 10px;
        }

        .page-content p {
          color: #6c654f;
          font-size: 0.8rem;
          letter-spacing: 0.38em;
          text-transform: uppercase;
        }

        .intro-text-wrap,
        .intro-line,
        .intro-meta {
          opacity: 0;
          transform: translateY(18px);
        }

        .intro-text-wrap {
          width: min(460px, 82vw);
          display: flex;
          justify-content: center;
          animation: fadeUp 1s ease 0.15s forwards;
        }

        .intro-image {
          width: 100%;
          height: auto;
          display: block;
          overflow: visible;
          filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.08));
          animation: imageFloat 3.6s ease-in-out 1s infinite;
        }

        .intro-image text {
          fill: #2f2a1f;
          font-family: 'General Sans', Inter, 'Segoe UI', sans-serif;
          font-size: 58px;
          font-weight: 500;
          letter-spacing: 0.44em;
          text-transform: uppercase;
        }

        .intro-line {
          width: 170px;
          height: 1px;
          background: linear-gradient(90deg, transparent, #8f876c, transparent);
          opacity: 0.8;
          animation: fadeUp 0.9s ease 0.45s forwards, linePulse 1.8s ease 1.2s infinite;
        }

        .intro-meta {
          color: #6c654f;
          font-size: 0.7rem;
          letter-spacing: 0.36em;
          text-transform: uppercase;
          animation: fadeUp 0.9s ease 0.75s forwards;
        }

        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(18px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes imageFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
        }

        @keyframes idleCamera {
          0%, 100% {
            transform:
              perspective(1000px)
              rotateX(62deg)
              translateY(18%)
              translateX(0);
          }
          50% {
            transform:
              perspective(1000px)
              rotateX(61.5deg)
              translateY(17%)
              translateX(2px);
          }
        }

        @keyframes linePulse {
          0%, 100% { opacity: 0.4; transform: scaleX(0.9); }
          50% { opacity: 1; transform: scaleX(1); }
        }
      `}</style>
    </>
  );
}
