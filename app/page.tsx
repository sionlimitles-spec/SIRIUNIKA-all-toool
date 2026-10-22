"use client";

import { useState, useEffect } from "react";
import { Search, Sparkles, TrendingUp, Clock, Trash2 } from "lucide-react";
import StatusCard from "@/components/StatusCard";
import ThemeToggle from "@/components/ThemeToggle";
import { tools } from "@/lib/tools";
import * as Icons from "lucide-react";

export default function Home() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Semua");
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    // Load History dari localStorage
    const saved = JSON.parse(localStorage.getItem('shiriunika_history') || '[]');
    setHistory(saved);
  }, []);

  const clearHistory = () => {
    localStorage.removeItem('shiriunika_history');
    setHistory([]);
  };

  const categories = ["Semua", ...Array.from(new Set(tools.map(t => t.category)))];
  
  const filteredTools = tools.filter(t => {
    const matchSearch = t.name.toLowerCase().includes(search.toLowerCase());
    const matchCategory = category === "Semua" || t.category === category;
    return matchSearch && matchCategory;
  });

  const popularTools = tools.filter(t => t.popular);

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

      <div className="relative w-full h-56 rounded-[2rem] overflow-hidden shadow-2xl shadow-blue-500/20">
        <img src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop" alt="Hero" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-6">
          <h2 className="text-2xl font-bold text-white mb-1 leading-tight">Solusi Digital<br/>Tanpa Batas.</h2>
          <p className="text-[11px] text-slate-300 font-medium">TikTok, YT, IG, Pinterest, Spotify HD.</p>
        </div>
      </div>

      <StatusCard />

      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur opacity-20"></div>
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

      {/* RIWAYAT UNDUHAN */}
      {history.length > 0 && !search && (
        <section className="animate-fade-in-up">
          <div className="flex justify-between items-end mb-3">
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-blue-500" />
              <h2 className="text-sm font-bold">Riwayat Unduhan</h2>
            </div>
            <button onClick={clearHistory} className="text-[10px] text-red-500 font-bold hover:underline flex items-center gap-1"><Trash2 className="w-3 h-3" /> Hapus</button>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {history.map((item, idx) => (
              <a href={item.url} target="_blank" key={idx} className="glass-card min-w-[140px] p-2 flex flex-col gap-2 snap-start">
                {item.thumbnail ? (
                  <img src={item.thumbnail} alt="" className="w-full h-16 object-cover rounded-lg" />
                ) : (
                  <div className="w-full h-16 bg-slate-200 dark:bg-slate-700 rounded-lg flex items-center justify-center"><Icons.DownloadCloud className="w-6 h-6 text-slate-400" /></div>
                )}
                <div>
                  <p className="text-[10px] font-bold capitalize text-blue-500">{item.platform}</p>
                  <p className="text-[11px] font-semibold line-clamp-1">{item.title}</p>
                </div>
              </a>
            ))}
          </div>
        </section>
      )}

      {!search && category === "Semua" && (
        <section>
          <div className="flex justify-between items-end mb-3">
            <div className="flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-orange-500" />
              <h2 className="text-sm font-bold">Paling Populer</h2>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {popularTools.map(tool => {
              const Icon = (Icons as any)[tool.icon] || Icons.HelpCircle;
              return (
                <a href={`/tool/${tool.slug}`} key={tool.slug} className="glass-card p-3 flex flex-col items-center text-center hover:scale-105 transition-transform shadow-sm">
                  <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-700 flex items-center justify-center mb-2 shadow-sm">
                    <Icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <span className="text-[11px] font-bold line-clamp-1">{tool.name}</span>
                </a>
              );
            })}
          </div>
        </section>
      )}

      <section id="tools" className="pb-10">
        <h2 className="text-sm font-bold mb-3">{search ? 'Hasil Pencarian' : 'Semua Tools'}</h2>
        <div className="grid grid-cols-3 gap-3">
          {filteredTools.map(tool => {
            const Icon = (Icons as any)[tool.icon] || Icons.HelpCircle;
            return (
              <a href={`/tool/${tool.slug}`} key={tool.slug} className="glass-card p-3 flex flex-col items-center text-center hover:bg-white dark:hover:bg-slate-800 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center mb-2">
                  <Icon className="w-5 h-5 text-slate-700 dark:text-slate-300" />
                </div>
                <span className="text-[11px] font-bold line-clamp-1">{tool.name}</span>
                <span className="text-[9px] text-slate-500 line-clamp-2 mt-0.5 leading-tight">{tool.desc}</span>
              </a>
            );
          })}
        </div>
      </section>
    </div>
  );
}
