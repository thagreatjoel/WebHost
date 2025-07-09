export default function Home() {
  return (

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Joel's Profile</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
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
    }
  </script>
</head>

<body class="bg-orphBg text-orphText font-sans pt-20 px-4 sm:px-6">

<!-- Swinging Orph Dino in top right -->
<div class="fixed top-9 right-0 z-40 origin-top-right animate-swing w-24 sm:w-32">
  <img src="https://raw.githubusercontent.com/ThaGreatJoel/ThaGreatJoel/refs/heads/main/Untitled10_20250708154228.png" class="rotate-0" alt="Orph Dino" />
</div>

<!-- NAVBAR -->
<header class="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-orphCard/80 border-b border-orphBorder px-4 py-3 flex items-center justify-between shadow-md">
  <div class="flex items-center space-x-3">
    
  <span class="text-white font-bold text-xl tracking-tight">Dashboard</span>
  </div>

</header>

<!-- PROFILE SECTION -->
<section class="max-w-4xl mx-auto p-2">
  <div class="bg-orphCard border border-orphBorder rounded-lg p-6">
    <div class="flex flex-col sm:flex-row items-center sm:items-start sm:space-x-6">
      <img src="https://raw.githubusercontent.com/ThaGreatJoel/ThaGreatJoel/refs/heads/main/1000144905%20(2).jpg" class="w-24 h-24 rounded-full border border-orphBorder shadow-md" alt="Profile">
      
      <div class="mt-4 sm:mt-0 text-center sm:text-left">
        <h2 class="text-xl font-semibold text-white">Joel Joju</h2>
        <p class="text-sm text-orphText">@ThaGreatJoel · he/him</p>
        <p class="mt-2">Hey there! I'm a 16-year-old coder working on electronics and web projects like OrphOS.</p>
        
        <!-- Social Links -->
        <div class="mt-4 flex justify-center sm:justify-start space-x-4">
          <!-- GitHub -->
          <a href="https://github.com/ThaGreatJoel" target="_blank" class="hover:text-orphBlue transition">
            <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg" class="w-5 h-5" alt="GitHub" />
          </a>
          <!-- Instagram -->
          <a href="https://instagram.com/ThaGreatJoel" target="_blank" class="hover:text-orphBlue transition">
            <img src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png" class="w-5 h-5" alt="Instagram" />
          </a>
          <!-- Email -->
          <a href="mailto:joeljonah06@gmail.com" target="_blank" class="hover:text-orphBlue transition">
            <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSIaMRGRXIcw7PLuQwrNT3owQpigxHG_LJNWQ&s" class="w-5 h-5" alt="email" />
          </a>
          
        </div>
        <!-- End Socials -->
        
      </div>
    </div>
  </div>
</section>

<!-- PROJECTS SECTION -->
<section class="max-w-4xl mx-auto p-2">
  <h2 class="text-lg font-semibold mb-4 text-white">Top Projects</h2>
  <div class="bg-orphCard border border-orphBorder rounded-lg divide-y divide-orphBorder">
    <div class="p-4 hover:bg-orphBorder/20 rounded-md transition">
      <h3 class="font-semibold text-orphBlue">OrphCli</h3>
      <p class="text-sm">A custom CLI tool to deploy web projects easily.</p>
    </div>
    <div class="p-4 hover:bg-orphBorder/20 rounded-md transition">
      <h3 class="font-semibold text-orphBlue">OrphOS</h3>
      <p class="text-sm">An OS-style web interface designed to manage and document OrphCli usage.</p>
    </div>
    <div class="p-4 hover:bg-orphBorder/20 rounded-md transition">
      <h3 class="font-semibold text-orphBlue">SecurePi</h3>
      <p class="text-sm">A secure API system for managing passwords and sensitive data.</p>
    </div>
  </div>
</section>


<!-- COMMUNITY & CONTRIBUTIONS SECTION -->
<section class="max-w-4xl mx-auto p-2">
  <h2 class="text-lg font-semibold mb-4 text-white">Community & Contributions</h2>


  <!-- Hack Club Card -->
  <div class="bg-orphCard border border-orphBorder rounded-lg p-6 text-orphText text-sm leading-relaxed">
    <div class="flex items-center space-x-4 mb-4">
      <img src="https://assets.hackclub.com/icon-rounded.svg" alt="Hack Club Logo" class="w-16 h-16 squircle-full border-orphBorder shadow" />
      <div>
        <h3 class="text-base font-semibold text-orphBlue">
  <a href="https://hackclub.com">Hack Club</a>
</h3>
 <p class="text-xs text-orphText">A worldwide community of high school hackers. By the students, for the students.</p>
      </div>
    </div>

    
  </div>
</section>



<!-- ORPHY SECTION -->
<section class="max-w-4xl mx-auto p-2">
  <h2 class="text-lg font-semibold mb-4 text-white">Meet Orphy</h2>
  <div class="bg-orphCard border border-orphBorder rounded-lg p-4">
    <img src="https://raw.githubusercontent.com/ThaGreatJoel/ThaGreatJoel/main/orph.png" alt="Orphy the Dino Agent" class="w-20 h-20 mb-4 rounded-full shadow mx-auto" />
    <p class="text-sm text-gray-300">
      Orphy isn’t just a mascot — he’s your silent dino agent, built into every part of this project.
      From deploying code to tracking stats and guarding workflows, Orphy is always there with charm and utility.
    </p>
    <p class="text-sm text-gray-400 mt-3 italic">
      You’ll spot Orphy in your terminal, hanging out in the docs, and helping you build smarter every day.
    </p>
  </div>
</section>

<!-- ABOUT ME SECTION -->
<section class="max-w-4xl mx-auto p-2">
  <h2 class="text-lg font-semibold mb-4 text-white">About Me</h2>
  <div class="bg-orphCard border border-orphBorder rounded-lg p-6 text-orphText text-sm leading-relaxed">
    <p class="mb-4">
      I'm a <strong class="text-orphBlue">16-year-old developer</strong> and full-time student passionate about building creative tools and solving real-world problems. I work across the stack, from web development using <strong class="text-orphBlue">Next.js</strong> to embedded hardware with <strong class="text-orphBlue">Arduino</strong> and <strong class="text-orphBlue">ESP8266</strong>.
    </p>
    <p class="mb-4">
      I've created tools like <strong class="text-orphBlue">OrphCli</strong>, built OS-style platforms like <strong class="text-orphBlue">OrphOS</strong>, and developed API-driven bots and utilities. I’m also exploring open communities like <strong class="text-orphBlue">Hack Club</strong>, and I love working with APIs, hardware, and UI design.
    </p>
    <p>
      Whether I'm deploying a site or building a gadget, I’m always creating — one project at a time.
    </p>
  </div>
</section>






<!-- FOOTER -->
<footer class="bg-orphCard text-center text-sm text-orphText py-6 border-t border-orphBorder">
  &copy; 2025 Joel & Orph Dino. All rights reserved.
</footer>

</body>
</html>
 );
}
