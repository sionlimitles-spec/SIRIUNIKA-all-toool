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
      <body className={`${poppins.variable} font-sans antialiased bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50 min-h-screen pb-28`}>
        {/* Background Blobs */}
        <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-400/20 dark:bg-blue-900/20 blur-3xl" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-400/20 dark:bg-purple-900/20 blur-3xl" />
        </div>

        <main className="max-w-md mx-auto min-h-screen relative bg-white/30 dark:bg-slate-900/30 backdrop-blur-sm shadow-2xl border-x border-white/20 dark:border-slate-800/50">
          {children}
        </main>

        <MusicPlayer />
        
        {/* Floating Bottom Navigation */}
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[90%] max-w-sm z-50">
          <nav className="glass-card bg-white/80 dark:bg-slate-800/80 rounded-full px-2 py-1.5 shadow-2xl flex justify-between items-center">
            {[
              { name: "Beranda", icon: Home, href: "/" },
              { name: "Tools", icon: Grid, href: "/#tools" },
              { name: "Musik", icon: Music, href: "#musik" },
              { name: "Profil", icon: User, href: "#profil" },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <a key={item.name} href={item.href} className="flex flex-col items-center justify-center w-16 h-12 rounded-full text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-700/50 dark:text-slate-400 dark:hover:text-blue-400 transition-all">
                  <Icon className="w-5 h-5" />
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
