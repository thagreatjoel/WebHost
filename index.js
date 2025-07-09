import Head from 'next/head';

export default function Home() {
  return (
    <>
      <Head>
        <title>Joel's Profile</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <script src="https://cdn.tailwindcss.com"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              tailwind.config = {
                theme: {
                  extend: {
                    animation: {
                      swing: "swing 3s ease-in-out infinite",
                    },
                    keyframes: {
                      swing: {
                        "0%, 100%": { transform: "rotate(3deg)" },
                        "50%": { transform: "rotate(-3deg)" },
                      },
                    },
                    colors: {
                      orphBg: '#10141c',
                      orphCard: '#1a1f2b',
                      orphBorder: '#2e3440',
                      orphText: '#cbd5e1',
                      orphBlue: '#7aa2f7'
                    }
                  }
                }
              };
            `,
          }}
        />
      </Head>

      <main className="bg-orphBg text-orphText font-sans pt-20 px-4 sm:px-6">
        {/* Swinging Dino */}
        <div className="fixed top-9 right-0 z-40 origin-top-right animate-swing w-24 sm:w-32">
          <img
            src="https://raw.githubusercontent.com/ThaGreatJoel/ThaGreatJoel/refs/heads/main/Untitled10_20250708154228.png"
            className="rotate-0"
            alt="Orph Dino"
          />
        </div>

        {/* Navbar */}
        <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-orphCard/80 border-b border-orphBorder px-4 py-3 flex items-center justify-between shadow-md">
          <div className="flex items-center space-x-3">
            <span className="text-white font-bold text-xl tracking-tight">Dashboard</span>
          </div>
        </header>

        {/* Profile Section */}
        <section className="max-w-4xl mx-auto p-2">
          <div className="bg-orphCard border border-orphBorder rounded-lg p-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start sm:space-x-6">
              <img
                src="https://raw.githubusercontent.com/ThaGreatJoel/ThaGreatJoel/refs/heads/main/1000144905%20(2).jpg"
                className="w-24 h-24 rounded-full border border-orphBorder shadow-md"
                alt="Profile"
              />
              <div className="mt-4 sm:mt-0 text-center sm:text-left">
                <h2 className="text-xl font-semibold text-white">Joel Joju</h2>
                <p className="text-sm text-orphText">@ThaGreatJoel · he/him</p>
                <p className="mt-2">Hey there! I'm a 16-year-old coder working on electronics and web projects like OrphOS.</p>
                <div className="mt-4 flex justify-center sm:justify-start space-x-4">
                  <a href="https://github.com/ThaGreatJoel" target="_blank" rel="noreferrer">
                    <img
                      src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg"
                      className="w-5 h-5"
                      alt="GitHub"
                    />
                  </a>
                  <a href="https://instagram.com/ThaGreatJoel" target="_blank" rel="noreferrer">
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png"
                      className="w-5 h-5"
                      alt="Instagram"
                    />
                  </a>
                  <a href="mailto:joeljonah06@gmail.com">
                    <img
                      src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSIaMRGRXIcw7PLuQwrNT3owQpigxHG_LJNWQ&s"
                      className="w-5 h-5"
                      alt="Email"
                    />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Projects Section */}
        <section className="max-w-4xl mx-auto p-2">
          <h2 className="text-lg font-semibold mb-4 text-white">Top Projects</h2>
          <div className="bg-orphCard border border-orphBorder rounded-lg divide-y divide-orphBorder">
            <div className="p-4 hover:bg-orphBorder/20 rounded-md transition">
              <h3 className="font-semibold text-orphBlue">OrphCli</h3>
              <p className="text-sm">A custom CLI tool to deploy web projects easily.</p>
            </div>
            <div className="p-4 hover:bg-orphBorder/20 rounded-md transition">
              <h3 className="font-semibold text-orphBlue">OrphOS</h3>
              <p className="text-sm">An OS-style web interface designed to manage and document OrphCli usage.</p>
            </div>
            <div className="p-4 hover:bg-orphBorder/20 rounded-md transition">
              <h3 className="font-semibold text-orphBlue">SecurePi</h3>
              <p className="text-sm">A secure API system for managing passwords and sensitive data.</p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-orphCard text-center text-sm text-orphText py-6 border-t border-orphBorder mt-10">
          &copy; 2025 Joel & Orph Dino. All rights reserved.
        </footer>
      </main>
    </>
  );
}
