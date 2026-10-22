"use client";

import { useState } from "react";
import { Search, Sparkles, TrendingUp, ChevronRight } from "lucide-react";
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
    <div className="p-4 space-y-6">
      {/* Header */}
      <header className="flex justify-between items-center pt-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <h1 className="font-bold text-xl tracking-tight">Shiriunika</h1>
        </div>
        <ThemeToggle />
      </header>

      {/* Hero Section - Big & Bold */}
      <div className="relative w-full h-64 rounded-[2rem] overflow-hidden shadow-2xl shadow-blue-500/20 animate-fade-in-up">
        {/* Ganti URL di bawah dengan gambar lokal /banner.jpg nanti */}
        <img src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop" alt="Hero" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-6">
          <span className="px-2.5 py-1 bg-blue-500/80 backdrop-blur-md text-white text-[10px] font-bold rounded-lg w-fit mb-2 shadow-sm">✨ Fitur Baru</span>
          <h2 className="text-2xl font-bold text-white mb-1 leading-tight">Solusi Digital<br/>Tanpa Batas.</h2>
          <p className="text-[11px] text-slate-300 font-medium">Downloader, Utility & Musik dalam satu aplikasi.</p>
        </div>
      </div>

      <StatusCard />

      {/* Search Bar - Modern */}
      <div className="relative group animate-fade-in-up" style={{ animationDelay: '100ms' }}>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
        <div className="relative flex items-center bg-white dark:bg-slate-800 rounded-2xl p-1.5 shadow-sm border border-slate-200 dark:border-slate-700">
          <Search className="w-5 h-5 text-slate-400 ml-3" />
          <input type="text" placeholder="Mau download apa hari ini?" value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-transparent px-3 py-2 text-sm focus:outline-none" />
        </div>
      </div>

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide animate-fade-in-up" style={{ animationDelay: '150ms' }}>
        {categories.map(cat => (
          <button key={cat} onClick={() => setCategory(cat)} className={`px-4 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${category === cat ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md' : 'bg-white/50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800'}`}>
            {cat}
          </button>
        ))}
      </div>

      {/* Popular Tools */}
      {!search && category === "Semua" && (
        <section className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          <div className="flex justify-between items-end mb-3">
            <div className="flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-orange-500" />
              <h2 className="text-sm font-bold">Paling Populer</h2>
            </div>
            <span className="text-[10px] font-medium text-blue-500 flex items-center cursor-pointer">Lihat Semua <ChevronRight className="w-3 h-3" /></span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {popularTools.map(tool => {
              const Icon = (Icons as any)[tool.icon] || Icons.HelpCircle;
              return (
                <a href={`/tool/${tool.slug}`} key={tool.slug} className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-md border border-white/40 dark:border-slate-700/50 rounded-2xl p-3 flex flex-col items-center text-center hover:scale-105 transition-transform duration-300 shadow-sm">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 flex items-center justify-center mb-2 shadow-inner">
                    <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="text-[11px] font-bold line-clamp-1">{tool.name}</span>
                </a>
              );
            })}
          </div>
        </section>
      )}

      {/* All Tools Grid (Always 3 Columns) */}
      <section id="tools" className="pb-10 animate-fade-in-up" style={{ animationDelay: '250ms' }}>
        <h2 className="text-sm font-bold mb-3">{search ? 'Hasil Pencarian' : 'Semua Tools'}</h2>
        <div className="grid grid-cols-3 gap-3">
          {filteredTools.map(tool => {
            const Icon = (Icons as any)[tool.icon] || Icons.HelpCircle;
            return (
              <a href={`/tool/${tool.slug}`} key={tool.slug} className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-md border border-white/40 dark:border-slate-700/50 rounded-2xl p-3 flex flex-col items-center text-center hover:bg-white dark:hover:bg-slate-800 transition-colors shadow-sm relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-blue-50/50 dark:to-blue-900/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center mb-2">
                  <Icon className="w-5 h-5 text-slate-700 dark:text-slate-300" />
                </div>
                <span className="relative text-[11px] font-semibold line-clamp-1">{tool.name}</span>
                <span className="relative text-[9px] text-slate-500 line-clamp-2 mt-0.5 leading-tight">{tool.desc}</span>
              </a>
            );
          })}
          {filteredTools.length === 0 && <div className="col-span-3 text-center py-10 text-sm text-slate-500">Tool tidak ditemukan.</div>}
        </div>
      </section>
    </div>
  );
}
