import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import MusicPlayer from "@/components/MusicPlayer";
import { Home, Grid, Music, User } from "lucide-react";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "Shiriunika All Tools",
  description: "Kumpulan alat digital modern, musik, dan utilitas harian.",
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

const themeScript = `
  (function() {
    try {
      var theme = localStorage.getItem('theme');
      var supportDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches === true;
      if (!theme && supportDarkMode) theme = 'dark';
      if (theme === 'dark') document.documentElement.classList.add('dark');
    } catch (e) {}
  })();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      {/* pb-32 (Padding Bottom) memastikan konten tidak tertutup nav bar melayang */}
      <body className={`${poppins.variable} font-sans antialiased bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50 min-h-screen pb-32`}>
        <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-400/20 dark:bg-blue-900/20 blur-3xl" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-400/20 dark:bg-purple-900/20 blur-3xl" />
        </div>

        <main className="max-w-md mx-auto min-h-screen relative bg-white/30 dark:bg-slate-900/30 backdrop-blur-sm shadow-2xl border-x border-white/20 dark:border-slate-800/50">
          {children}
        </main>

        <MusicPlayer />
        
        {/* FLOATING BOTTOM NAVIGATION - Diperkecil & Melayang */}
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[85%] max-w-[360px] z-50">
          <nav className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-2xl border border-white/40 dark:border-slate-700/50 rounded-full px-2 py-1.5 shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex justify-around items-center">
            {[
              { name: "Beranda", icon: Home, href: "/" },
              { name: "Tools", icon: Grid, href: "/#tools" },
              { name: "Musik", icon: Music, href: "#musik" },
              { name: "Profil", icon: User, href: "#profil" },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <a key={item.name} href={item.href} className="flex flex-col items-center justify-center w-14 h-11 rounded-full text-slate-500 hover:text-blue-600 hover:bg-blue-50/50 dark:hover:bg-slate-700/50 dark:text-slate-400 dark:hover:text-blue-400 transition-all">
                  <Icon className="w-[18px] h-[18px]" />
                  <span className="text-[9px] font-semibold mt-0.5">{item.name}</span>
                </a>
              );
            })}
          </nav>
        </div>
      </body>
    </html>
  );
}
