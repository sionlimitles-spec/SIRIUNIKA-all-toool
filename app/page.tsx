"use client";

import { useState } from "react";
import { Search, Sparkles } from "lucide-react";
import StatusCard from "@/components/StatusCard";
import ThemeToggle from "@/components/ThemeToggle";
import { tools } from "@/lib/tools";
import * as Icons from "lucide-react";

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

  return (
    <div className="p-4 space-y-5">
      <header className="flex justify-between items-center pt-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center shadow-lg">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <h1 className="font-bold text-xl tracking-tight">Shiriunika</h1>
        </div>
        <ThemeToggle />
      </header>

      {/* Hero Section - Lebih Besar */}
      <div className="relative w-full h-56 rounded-3xl overflow-hidden glass-card flex flex-col items-center justify-center bg-gradient-to-br from-blue-600/90 to-purple-600/90 shadow-xl shadow-blue-500/20">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center opacity-30 mix-blend-overlay" />
        <div className="relative z-10 text-center px-6">
          <h2 className="text-2xl font-bold text-white mb-2 leading-tight">Solusi Digital<br/>Dalam Satu Genggaman</h2>
          <p className="text-xs text-blue-100 font-medium">Downloader, Utility, dan Musik gratis tanpa batas.</p>
        </div>
      </div>

      <StatusCard />

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input type="text" placeholder="Cari tools impianmu..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-12 pr-4 py-3.5 rounded-2xl glass-card text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 shadow-sm" />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {categories.map(cat => (
          <button key={cat} onClick={() => setCategory(cat)} className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${category === cat ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30 scale-105' : 'glass-button text-slate-600 dark:text-slate-300'}`}>
            {cat}
          </button>
        ))}
      </div>

      {!search && category === "Semua" && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-orange-500" />
            <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Tools Populer</h2>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {popularTools.map(tool => {
              const Icon = (Icons as any)[tool.icon] || Icons.HelpCircle;
              return (
                <a href={`/tool/${tool.slug}`} key={tool.slug} className="glass-card p-3 flex flex-col items-center text-center glass-button cursor-pointer group">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-100 to-purple-100 dark:from-blue-900/40 dark:to-purple-900/40 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="text-[11px] font-bold line-clamp-1">{tool.name}</span>
                </a>
              );
            })}
          </div>
        </section>
      )}

      <section id="tools" className="pb-8">
        <h2 className="text-sm font-semibold mb-3 text-slate-800 dark:text-slate-200">{search ? 'Hasil Pencarian' : 'Semua Tools'}</h2>
        <div className="grid grid-cols-3 gap-3">
          {filteredTools.map(tool => {
            const Icon = (Icons as any)[tool.icon] || Icons.HelpCircle;
            return (
              <a href={`/tool/${tool.slug}`} key={tool.slug} className="glass-card p-3 flex flex-col items-center text-center glass-button cursor-pointer">
                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-2">
                  <Icon className="w-5 h-5 text-slate-700 dark:text-slate-300" />
                </div>
                <span className="text-[11px] font-semibold line-clamp-1">{tool.name}</span>
                <span className="text-[9px] text-slate-500 line-clamp-2 mt-1 leading-tight">{tool.desc}</span>
              </a>
            );
          })}
          {filteredTools.length === 0 && <div className="col-span-3 text-center py-8 text-sm text-slate-500">Tool tidak ditemukan.</div>}
        </div>
      </section>
    </div>
  );
}
