// pages/index.js
import Head from 'next/head';

export default function Home() {
  return (
    <>
      <Head>
        <title>Joel&nbsp;Joju &ndash; Profile</title>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />

        {/* Tailwind (CDN for quickest drop-in) */}
        <script src="https://cdn.tailwindcss.com" />

        {/* Custom Tailwind extension */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              tailwind.config = {
                theme: {
                  extend: {
                    animation: {
                      gradientMove: "gradientMove 8s ease infinite",
                      swing: "swing 3s ease-in-out infinite",
                    },
                    keyframes: {
                      gradientMove: {
                        "0%, 100%": { backgroundPosition: "0% 50%" },
                        "50%": { backgroundPosition: "100% 50%" }
                      },
                      swing: {
                        "0%, 100%": { transform: "rotate(3deg)" },
                        "50%": { transform: "rotate(-3deg)" }
                      }
                    },
                    backgroundSize: { 200: "200% 200%" },
                    colors: {
                      orphBg:    "#10141c",
                      orphCard:  "#1a1f2b",
                      orphBorder:"#2e3440",
                      orphText:  "#cbd5e1",
                      orphBlue:  "#7aa2f7",
                      orphColour:"#2b3137"
                    }
                  }
                }
              };
            `,
          }}
        />

        {/* Extra styles (optional) */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
              .zoomable{
                width:200px;
                height:150px;
                background-color:lightblue;
              }
            `,
          }}
        />
      </Head>

      {/* PAGE */}
      <div className="bg-orphBg text-orphText font-sans pt-20 px-4 sm:px-6 min-h-screen">
        {/* NAVBAR */}
        <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-orphCard/80 border-b border-orphBorder px-4 py-3 flex items-center justify-between shadow-md">
          <span className="text-white font-bold text-xl tracking-tight">Dashboard</span>
        </header>

        {/* BANNER */}
        <div className="h-40 sm:h-48 rounded-lg bg-gradient-to-r from-[#7aa2f7] via-[#bb9af7] to-[#f7768e] bg-[length:200%_200%] animate-gradientMove shadow-inner relative overflow-hidden flex items-center justify-start text-left px-4 sm:px-8">
          <h1 className="text-lg sm:text-2xl font-bold font-mono text-white z-10 drop-shadow-[0_1px_2px_rgba(0,0,0,0.7)] max-w-[70%] sm:max-w-[60%] leading-snug -mt-14 sm:-mt-14">
            <span className="block text-gray-100">Building Cool Things</span>
            <span className="text-[#8ab1f9]">With Orphy!</span>
          </h1>

          {/* Orphina image */}
          <img
            src="https://hackclub.com/arcade/o7.png"
            alt="Orphina"
            className="absolute top-4 right-2 sm:right-6 w-20 sm:w-28 pointer-events-none"
          />
        </div>

        {/* PROFILE CARD */}
        <section className="relative -mt-16 sm:-mt-20 bg-orphCard border border-orphBorder rounded-lg p-6 shadow-lg">
          <div className="flex flex-col sm:flex-row items-center sm:items-start sm:space-x-6">
            <img
              src="https://raw.githubusercontent.com/ThaGreatJoel/ThaGreatJoel/refs/heads/main/1000144905%20(2).jpg"
              alt="Profile"
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-orphBg shadow-md"
            />

            <div className="mt-4 sm:mt-0 text-center sm:text-left">
              <h2 className="text-xl font-semibold text-white">Joel Joju</h2>
              <p className="text-sm text-orphText">@ThaGreatJoel · he/him</p>
              <p className="mt-2 text-sm">
                Hey there! I'm a 16-year-old coder working on electronics and web
                projects like OrphOS.
              </p>

              {/* SOCIAL ICONS */}
              <div className="mt-4 flex justify-center sm:justify-start space-x-4">
                <a
                  href="https://github.com/ThaGreatJoel"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-orphBlue transition"
                >
                  <img
                    src="https://raw.githubusercontent.com/ThaGreatJoel/ThaGreatJoel/main/git.png"
                    className="w-6 h-6"
                    alt="GitHub"
                  />
                </a>
                <a
                  href="https://instagram.com/ThaGreatJoel"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-orphBlue transition"
                >
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png"
                    className="w-6 h-6"
                    alt="Instagram"
                  />
                </a>
                <a
                  href="mailto:joeljonah06@gmail.com"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-orphBlue transition"
                >
                  <img
                    src="https://static.vecteezy.com/system/resources/previews/016/716/465/non_2x/gmail-icon-free-png.png"
                    className="w-6 h-6"
                    alt="Email"
                  />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ABOUT ME */}
        <section className="max-w-4xl mx-auto mt-8">
          <h2 className="text-lg font-semibold mb-4 text-white">About Me</h2>
          <div className="bg-orphCard border border-orphBorder rounded-lg p-6 text-orphText text-sm leading-relaxed">
            <p className="mb-4">
              I'm a <strong className="text-orphBlue">16-year-old developer</strong> and full-time
              student passionate about building creative tools and solving real-world
              problems. I work across the stack, from web development with{' '}
              <strong className="text-orphBlue">Next.js</strong> to embedded hardware with{' '}
              <strong className="text-orphBlue">Arduino</strong> and{' '}
              <strong className="text-orphBlue">ESP8266</strong>.
            </p>
            <p className="mb-4">
              I've created tools like <strong className="text-orphBlue">OrphCli</strong>, built
              OS-style platforms like <strong className="text-orphBlue">OrphOS</strong>, and
              developed API-driven bots and utilities. I’m also exploring open
              communities like <strong className="text-orphBlue">Hack Club</strong>, and I love
              working with APIs, hardware, and UI design.
            </p>
            <p>
              Whether I'm deploying a site or building a gadget, I’m always creating
              &mdash; one project at a time.
            </p>
          </div>
        </section>

        {/* TOP PROJECTS */}
        <section className="max-w-4xl mx-auto mt-8">
          <h2 className="text-lg font-semibold mb-4 text-white">Top Projects</h2>
          <div className="bg-orphCard border border-orphBorder rounded-lg divide-y divide-orphBorder">
            {[
              { name: 'OrphCli', desc: 'A custom CLI tool to deploy web projects easily.' },
              { name: 'OrphOS', desc: 'An OS-style web interface designed to manage and document OrphCli usage.' },
              { name: 'SecurePi', desc: 'A secure API system for managing passwords and sensitive data.' },
            ].map((p) => (
              <div key={p.name} className="p-4 hover:bg-orphBorder/20 transition">
                <h3 className="font-semibold text-orphBlue">{p.name}</h3>
                <p className="text-sm">{p.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* COMMUNITY */}
        <section className="max-w-4xl mx-auto mt-8">
          <h2 className="text-lg font-semibold mb-4 text-white">
            Community &amp; Contributions
          </h2>
          <div className="bg-orphCard border border-orphBorder rounded-lg p-6 text-orphText text-sm leading-relaxed">
            <div className="flex items-center space-x-4 mb-4">
              <img
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTUqHKLdhVuwqtMtNWyP1AtbX2nnmW26QhpX7JxLB8puaFVMBV541YiQps&s=10"
                alt="Hack Club"
                className="w-16 h-16 rounded border-orphBorder shadow"
              />
              <div>
                <h3 className="text-base font-semibold text-orphBlue">
                  <a href="https://hackclub.com" target="_blank" rel="noreferrer">
                    Hack&nbsp;Club
                  </a>
                </h3>
                <p className="text-xs">
                  A worldwide community of high-school hackers. By the students, for the
                  students.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ORPHY */}
        <section className="max-w-4xl mx-auto mt-8">
          <h2 className="text-lg font-semibold mb-4 text-white">Meet&nbsp;Orphy</h2>
          <div className="bg-orphCard border border-orphBorder rounded-lg p-6 shadow-md flex flex-col sm:flex-row items-center sm:space-x-6">
            <img
              src="https://raw.githubusercontent.com/ThaGreatJoel/ThaGreatJoel/main/orph.png"
              alt="Orphy the Dino Agent"
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-orphBg shadow-md"
            />
            <div className="mt-4 sm:mt-0 text-center sm:text-left">
              <h3 className="text-xl font-semibold text-white">Orphy</h3>
              <p className="text-sm text-gray-300">
                Orphy isn’t just a mascot &mdash; he’s your silent dino agent, built into
                every part of this project. From deploying code to tracking stats and
                guarding workflows, Orphy is always there with charm and utility.
              </p>
              <p className="text-sm text-gray-400 mt-3 italic">
                You’ll spot Orphy in your terminal, hanging out in the docs, and helping
                you build smarter every day.
              </p>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="bg-orphCard text-center text-sm text-orphText py-9 border-t border-orphBorder mt-16">
          &copy;&nbsp;2025&nbsp;Joel&nbsp;&amp;&nbsp;Orph&nbsp;Dino. All rights reserved.
        </footer>
      </div>
    </>
  );
}
