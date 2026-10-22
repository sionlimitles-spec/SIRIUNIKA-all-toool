"use client";

import { useState, useEffect } from "react";
import { Search, Sparkles, TrendingUp, Clock, Trash2, DownloadCloud } from "lucide-react";
import StatusCard from "@/components/StatusCard";
import ThemeToggle from "@/components/ThemeToggle";
import { tools } from "@/lib/tools";

// ==========================================
// IKON BRAND ASLI (SVG KUSTOM)
// ==========================================
const BrandIcons: Record<string, React.ReactNode> = {
  TikTok: (
    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none">
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 2.21-1.15 4.37-2.94 5.75-1.76 1.33-4.14 1.8-6.25 1.23-2.14-.54-3.96-2.06-4.9-4.04-.95-1.94-.88-4.32.22-6.21 1.1-1.91 3.15-3.21 5.33-3.41.35-.03.71-.04 1.06-.02v4.06c-1.12-.09-2.29.23-3.15 1.01-.87.79-1.25 2.01-1.03 3.12.23 1.12 1.08 2.07 2.18 2.41 1.08.32 2.34.14 3.25-.53.94-.68 1.48-1.81 1.46-2.97-.05-4.94-.01-9.88-.04-14.82.42.01.85 0 1.28.01z" fill="url(#tiktok-gradient)"/>
      <defs>
        <linearGradient id="tiktok-gradient" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
          <stop stopColor="#25F4EE" />
          <stop offset="0.5" stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#FE2C55" />
        </linearGradient>
      </defs>
    </svg>
  ),
  YouTube: (
    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" fill="#FF0000"/>
    </svg>
  ),
  Instagram: (
    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="url(#ig-gradient)">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
      <defs>
        <linearGradient id="ig-gradient" x1="0" y1="24" x2="24" y2="0" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FEDA77" />
          <stop offset="0.5" stopColor="#F58529" />
          <stop offset="1" stopColor="#DD2A7B" />
        </linearGradient>
      </defs>
    </svg>
  ),
  Pinterest: (
    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="#E60023">
       <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.951-7.252 4.183 0 7.433 2.979 7.433 6.961 0 4.161-2.628 7.513-6.265 7.513-1.221 0-2.371-.634-2.764-1.383l-.752 2.865c-.272 1.05-1.006 2.364-1.497 3.164 1.097.328 2.263.507 3.474.507 6.621 0 11.988-5.367 11.988-11.987C24.029 5.367 18.638 0 12.017 0z"/>
    </svg>
  ),
  Spotify: (
    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="#1DB954">
      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.24 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
    </svg>
  ),
  Default: <DownloadCloud className="w-6 h-6 text-blue-500" />
};

export default function Home() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Semua");
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => { setHistory(JSON.parse(localStorage.getItem('shiriunika_history') || '[]')); }, []);
  const clearHistory = () => { localStorage.removeItem('shiriunika_history'); setHistory([]); };

  const categories = ["Semua", ...Array.from(new Set(tools.map(t => t.category)))];
  const filteredTools = tools.filter(t => t.name.toLowerCase().includes(search.toLowerCase()) && (category === "Semua" || t.category === category));
  const popularTools = tools.filter(t => t.popular);

  // Mapping Ikon Brand berdasarkan slug tool
  const renderIcon = (slug: string) => {
    if (slug.includes("tiktok")) return BrandIcons.TikTok;
    if (slug.includes("youtube")) return BrandIcons.YouTube;
    if (slug.includes("instagram")) return BrandIcons.Instagram;
    if (slug.includes("pinterest")) return BrandIcons.Pinterest;
    if (slug.includes("spotify")) return BrandIcons.Spotify;
    return BrandIcons.Default;
  };

  return (
    <div className="p-4 space-y-6">
      <header className="flex justify-between items-center pt-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/30 animate-float">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <h1 className="font-bold text-xl tracking-tight">Shiriunika</h1>
        </div>
        <ThemeToggle />
      </header>

      {/* Hero Section Animasi */}
      <div className="relative w-full h-64 rounded-[2rem] overflow-hidden shadow-2xl shadow-blue-500/20 animate-fade-in-up">
        <img src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop" alt="Hero" className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 hover:scale-110" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-6">
          <span className="px-2.5 py-1 bg-white/20 backdrop-blur-md text-white text-[10px] font-bold rounded-lg w-fit mb-2 shadow-sm border border-white/10 animate-pulse">✨ Versi Maksimal</span>
          <h2 className="text-2xl font-bold text-white mb-1 leading-tight">Download Tanpa<br/>Batas.</h2>
        </div>
      </div>

      <StatusCard />

      <div className="relative group animate-fade-in-up" style={{ animationDelay: '100ms' }}>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
        <div className="relative flex items-center bg-white dark:bg-slate-800 rounded-2xl p-1.5 shadow-sm border border-slate-200 dark:border-slate-700">
          <Search className="w-5 h-5 text-slate-400 ml-3" />
          <input type="text" placeholder="Cari tools..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-transparent px-3 py-2 text-sm focus:outline-none" />
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide animate-fade-in-up" style={{ animationDelay: '200ms' }}>
        {categories.map(cat => (
          <button key={cat} onClick={() => setCategory(cat)} className={`px-4 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-300 ${category === cat ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md scale-105' : 'bg-white/50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'}`}>{cat}</button>
        ))}
      </div>

      {/* Riwayat Unduhan */}
      {history.length > 0 && !search && (
        <section className="animate-fade-in-up" style={{ animationDelay: '300ms' }}>
          <div className="flex justify-between items-end mb-3">
            <div className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-blue-500" /><h2 className="text-sm font-bold">Riwayat Unduhan</h2></div>
            <button onClick={clearHistory} className="text-[10px] text-red-500 font-bold hover:underline flex items-center gap-1"><Trash2 className="w-3 h-3" /> Hapus</button>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {history.map((item, idx) => (
              <a href={item.url} target="_blank" key={idx} className="glass-card min-w-[140px] p-2 flex flex-col gap-2 hover:-translate-y-1 transition-transform">
                {item.thumbnail ? <img src={item.thumbnail} alt="" className="w-full h-16 object-cover rounded-lg" /> : <div className="w-full h-16 bg-slate-200 dark:bg-slate-700 rounded-lg flex items-center justify-center"><DownloadCloud className="w-6 h-6 text-slate-400" /></div>}
                <div><p className="text-[10px] font-bold capitalize text-blue-500">{item.platform}</p><p className="text-[11px] font-semibold line-clamp-1">{item.title}</p></div>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Popular Tools */}
      {!search && category === "Semua" && (
        <section className="animate-fade-in-up" style={{ animationDelay: '400ms' }}>
          <div className="flex items-center gap-1.5 mb-3"><TrendingUp className="w-4 h-4 text-orange-500" /><h2 className="text-sm font-bold">Paling Populer</h2></div>
          <div className="grid grid-cols-3 gap-3">
            {popularTools.map((tool, idx) => (
              <a href={`/tool/${tool.slug}`} key={tool.slug} className="glass-card p-3 flex flex-col items-center text-center group hover:-translate-y-1 hover:shadow-blue-500/10 transition-all duration-300 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-blue-50/50 dark:to-blue-900/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative w-12 h-12 rounded-2xl bg-white dark:bg-slate-700 flex items-center justify-center mb-2 shadow-sm group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                  {renderIcon(tool.slug)}
                </div>
                <span className="relative text-[11px] font-bold line-clamp-1">{tool.name}</span>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* All Tools Grid (Animasi Staggered) */}
      <section id="tools" className="pb-10">
        <h2 className="text-sm font-bold mb-3">{search ? 'Hasil Pencarian' : 'Semua Tools'}</h2>
        <div className="grid grid-cols-3 gap-3">
          {filteredTools.map((tool, index) => (
            <a 
              href={`/tool/${tool.slug}`} 
              key={tool.slug} 
              className="glass-card p-3 flex flex-col items-center text-center group hover:-translate-y-1 hover:shadow-lg transition-all duration-300 animate-fade-in-up opacity-0"
              style={{ animationDelay: `${index * 50}ms` }} // Staggered effect
            >
              <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-2 shadow-sm group-hover:scale-110 transition-transform duration-300">
                {renderIcon(tool.slug)}
              </div>
              <span className="text-[11px] font-bold line-clamp-1">{tool.name}</span>
              <span className="text-[9px] text-slate-500 line-clamp-2 mt-0.5 leading-tight">{tool.desc}</span>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
