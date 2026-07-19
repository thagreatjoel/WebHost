// pages/about.js (or wherever your About component is)

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
          xp: data.xp || data.total_xp || 0,
          level: data.level || 1,
          streak: data.streak || 0,
          languages: data.languages || ['fr'],
          source: data._source || 'unknown'
        };
        
        // If there's language progress data
        if (data.language_progress) {
          const frProgress = data.language_progress.fr || {};
          formattedData = {
            ...formattedData,
            level: frProgress.level || formattedData.level,
            xp: frProgress.points || formattedData.xp,
            streak: frProgress.streak || formattedData.streak,
            levelPercent: frProgress.level_percent || 0,
            skillsLearned: frProgress.num_skills_learned || 0,
            languageDetails: data.language_progress
          };
        }
        
        setDuolingoData(formattedData);
        
        if (data._source === 'python-api') {
          console.log('🎉 Using REAL data from Python API!');
        } else if (data._source === 'public-proxy') {
          console.log('🌐 Using data from public proxy');
        } else {
          console.log('📦 Using mock data (Python server not available)');
        }
        
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

  // ─── STAR BACKGROUND ─── (Keep your existing star background code)
  // ... (your star background code here)

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
        /* ... (your existing styles) ... */
        
        /* Add live indicator styles */
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
        
        .duolingo-badge .source-tag {
          font-size: 0.55rem;
          padding: 2px 8px;
          border-radius: 10px;
          background: rgba(88, 204, 2, 0.15);
          color: #58cc02;
          border: 1px solid rgba(88, 204, 2, 0.2);
        }
        
        .duolingo-badge .source-tag.mock {
          background: rgba(255, 255, 255, 0.05);
          color: rgba(255, 255, 255, 0.3);
          border-color: rgba(255, 255, 255, 0.05);
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
                  {duolingoData.source === 'python-api' && (
                    <>
                      <span className="live-indicator"></span>
                      <span className="source-tag">● Live</span>
                    </>
                  )}
                  {duolingoData.source === 'public-proxy' && (
                    <span className="source-tag" style={{ background: 'rgba(255,165,0,0.15)', color: '#ffa500', borderColor: 'rgba(255,165,0,0.2)' }}>
                      ● Proxy
                    </span>
                  )}
                  {duolingoData.source === 'fallback' && (
                    <span className="source-tag mock">● Mock</span>
                  )}
                </span>
                <span className="score">{duolingoData.xp || 0} XP</span>
                <span className="level">Level {duolingoData.level || 1}</span>
                {duolingoData.streak > 0 && (
                  <span className="streak">🔥 {duolingoData.streak} day streak</span>
                )}
                {duolingoData.skillsLearned && (
                  <span className="level" style={{ color: 'rgba(255,255,255,0.3)' }}>
                    {duolingoData.skillsLearned} skills
                  </span>
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
            
            {duolingoData?.source === 'fallback' && (
              <p style={{ 
                color: 'rgba(255,255,255,0.2)', 
                fontSize: '0.6rem', 
                marginTop: '0.5rem',
                fontStyle: 'italic'
              }}>
                💡 Run "py duolingo-api-server.py" for real-time data
              </p>
            )}
          </div>
        </div>
      </main>
    </>
  );
}