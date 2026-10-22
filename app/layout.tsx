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
  keywords: ["tools", "shiriunika", "utility", "generator", "converter"],
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

// Script anti-flicker untuk dark mode
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={`${poppins.variable} font-sans antialiased bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50 min-h-screen pb-32`}>
        {/* Background Gradient Blobs */}
        <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-400/20 dark:bg-blue-900/20 blur-3xl" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-400/20 dark:bg-purple-900/20 blur-3xl" />
        </div>

        <main className="max-w-md mx-auto min-h-screen relative shadow-2xl bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border-x border-white/20 dark:border-slate-800/50">
          {children}
        </main>

        <MusicPlayer />
        
        {/* Bottom Navigation */}
        <nav className="fixed bottom-0 w-full max-w-md left-1/2 -translate-x-1/2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 z-50">
          <div className="flex justify-around items-center h-16 px-2">
            {[
              { name: "Beranda", icon: Home, href: "/" },
              { name: "Tools", icon: Grid, href: "/#tools" },
              { name: "Musik", icon: Music, href: "#musik" },
              { name: "Profil", icon: User, href: "#profil" },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.name}
                  href={item.href}
                  className="flex flex-col items-center justify-center w-full h-full text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors"
                >
                  <Icon className="w-5 h-5 mb-1" />
                  <span className="text-[10px] font-medium">{item.name}</span>
                </a>
              );
            })}
          </div>
        </nav>
      </body>
    </html>
  );
}
