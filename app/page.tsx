"use client";

import { useState } from "react";
import { Search, Sparkles, TrendingUp, ChevronRight, Video, Image as ImageIcon, Music, DownloadCloud, QrCode, Key, Type, FileText, Code, Instagram, Youtube } from "lucide-react";
import StatusCard from "@/components/StatusCard";
import ThemeToggle from "@/components/ThemeToggle";
import { tools } from "@/lib/tools";

// --- KUMPULAN IKON SVG KUSTOM (Brand Asli) ---
const BrandIcons: Record<string, React.ReactNode> = {
  TikTok: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
    </svg>
  ),
  YouTube: <Youtube className="w-5 h-5 text-red-500" />,
  Instagram: <Instagram className="w-5 h-5 text-pink-500" />,
  Pinterest: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-red-600">
      <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.951-7.252 4.183 0 7.433 2.979 7.433 6.961 0 4.161-2.628 7.513-6.265 7.513-1.221 0-2.371-.634-2.764-1.383l-.752 2.865c-.272 1.05-1.006 2.364-1.497 3.164 1.097.328 2.263.507 3.474.507 6.621 0 11.988-5.367 11.988-11.987C24.029 5.367 18.638 0 12.017 0z"/>
    </svg>
  ),
  Spotify: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-green-500">
      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.24 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
    </svg>
  ),
  Default: <DownloadCloud className="w-5 h-5" />,
  Video: <Video className="w-5 h-5" />,
  Image: <ImageIcon className="w-5 h-5" />,
  Music: <Music className="w-5 h-5" />,
  QrCode: <QrCode className="w-5 h-5" />,
  Key: <Key className="w-5 h-5" />,
  Type: <Type className="w-5 h-5" />,
  FileText: <FileText className="w-5 h-5" />,
  Code: <Code className="w-5 h-5" />
};

export default function Home() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Semua");

  const categories = ["Semua", ...Array.from(new Set(tools.map(t => t.category)))];
  
  const filteredTools = tools.filter(t => {
    const matchSearch = t.name.toLowerCase().includes(search.toLowerCase());
    const matchCategory = category === "Semua" || t.category === category;
    return matchSearch && matchCategory;
  });

  const popularTools = tools.filter(t => t.popular);

  // Helper untuk menampilkan ikon brand berdasarkan nama tool (slug)
  const renderIcon = (slug: string, iconName: string) => {
    if (slug.includes("tiktok")) return BrandIcons["TikTok"];
    if (slug.includes("youtube")) return BrandIcons["YouTube"];
    if (slug.includes("instagram")) return BrandIcons["Instagram"];
    if (slug.includes("pinterest")) return BrandIcons["Pinterest"];
    if (slug.includes("spotify")) return BrandIcons["Spotify"];
    return BrandIcons[iconName] || BrandIcons["Default"];
  };

  return (
    <div className="p-4 space-y-6">
      <header className="flex justify-between items-center pt-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <h1 className="font-bold text-xl tracking-tight">Shiriunika</h1>
        </div>
        <ThemeToggle />
      </header>

      <div className="relative w-full h-64 rounded-[2rem] overflow-hidden shadow-2xl shadow-blue-500/20 animate-fade-in-up">
        <img src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop" alt="Hero" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-6">
          <span className="px-2.5 py-1 bg-white/20 backdrop-blur-md text-white text-[10px] font-bold rounded-lg w-fit mb-2 shadow-sm border border-white/10">✨ Versi Terbaru</span>
          <h2 className="text-2xl font-bold text-white mb-1 leading-tight">Download Tanpa<br/>Batas.</h2>
          <p className="text-[11px] text-slate-300 font-medium">TikTok, YT, IG, Pinterest HD.</p>
        </div>
      </div>

      <StatusCard />

      <div className="relative group animate-fade-in-up">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
        <div className="relative flex items-center bg-white dark:bg-slate-800 rounded-2xl p-1.5 shadow-sm border border-slate-200 dark:border-slate-700">
          <Search className="w-5 h-5 text-slate-400 ml-3" />
          <input type="text" placeholder="Cari tools..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-transparent px-3 py-2 text-sm focus:outline-none" />
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {categories.map(cat => (
          <button key={cat} onClick={() => setCategory(cat)} className={`px-4 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${category === cat ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md' : 'bg-white/50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'}`}>
            {cat}
          </button>
        ))}
      </div>

      {!search && category === "Semua" && (
        <section>
          <div className="flex justify-between items-end mb-3">
            <div className="flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-orange-500" />
              <h2 className="text-sm font-bold">Paling Populer</h2>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {popularTools.map(tool => (
              <a href={`/tool/${tool.slug}`} key={tool.slug} className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-md border border-white/40 dark:border-slate-700/50 rounded-2xl p-3 flex flex-col items-center text-center hover:scale-105 transition-transform shadow-sm group">
                <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-700 flex items-center justify-center mb-2 shadow-sm group-hover:shadow-md transition-all">
                  {renderIcon(tool.slug, tool.icon)}
                </div>
                <span className="text-[11px] font-bold line-clamp-1">{tool.name}</span>
              </a>
            ))}
          </div>
        </section>
      )}

      <section id="tools" className="pb-10">
        <h2 className="text-sm font-bold mb-3">{search ? 'Hasil Pencarian' : 'Semua Tools'}</h2>
        <div className="grid grid-cols-3 gap-3">
          {filteredTools.map(tool => (
            <a href={`/tool/${tool.slug}`} key={tool.slug} className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-md border border-white/40 dark:border-slate-700/50 rounded-2xl p-3 flex flex-col items-center text-center hover:bg-white dark:hover:bg-slate-800 transition-colors shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center mb-2">
                {renderIcon(tool.slug, tool.icon)}
              </div>
              <span className="text-[11px] font-bold line-clamp-1">{tool.name}</span>
              <span className="text-[9px] text-slate-500 line-clamp-2 mt-0.5 leading-tight">{tool.desc}</span>
            </a>
          ))}
          {filteredTools.length === 0 && <div className="col-span-3 text-center py-10 text-sm text-slate-500">Tool tidak ditemukan.</div>}
        </div>
      </section>
    </div>
  );
}
