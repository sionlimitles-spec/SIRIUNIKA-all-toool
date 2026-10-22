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
    <div className="p-4 space-y-6">
      {/* Header */}
      <header className="flex justify-between items-center pt-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center shadow-lg">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <h1 className="font-bold text-xl tracking-tight">Shiriunika</h1>
        </div>
        <ThemeToggle />
      </header>

      {/* Banner */}
      <div className="relative w-full h-40 rounded-3xl overflow-hidden glass-card flex items-center justify-center bg-gradient-to-br from-blue-500/20 to-purple-500/20 border-dashed border-2 border-slate-300 dark:border-slate-700">
        {/* Ganti dengan <Image src="/banner.jpg" fill alt="Banner" className="object-cover" /> */}
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Banner Image Placeholder</p>
      </div>

      <StatusCard />

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input 
          type="text" 
          placeholder="Cari tools..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-3 rounded-2xl glass-card text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        />
      </div>

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map(cat => (
          <button 
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${category === cat ? 'bg-blue-600 text-white shadow-md' : 'glass-button text-slate-600 dark:text-slate-300'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Popular Tools */}
      {!search && category === "Semua" && (
        <section>
          <h2 className="text-sm font-semibold mb-3 text-slate-800 dark:text-slate-200">Tools Populer</h2>
          <div className="grid grid-cols-3 gap-3">
            {popularTools.map(tool => {
              const Icon = (Icons as any)[tool.icon] || Icons.HelpCircle;
              return (
                <a href={`/tool/${tool.slug}`} key={tool.slug} className="glass-card p-3 flex flex-col items-center text-center glass-button cursor-pointer">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-100 to-purple-100 dark:from-blue-900/40 dark:to-purple-900/40 flex items-center justify-center mb-2">
                    <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="text-xs font-semibold line-clamp-1">{tool.name}</span>
                </a>
              );
            })}
          </div>
        </section>
      )}

      {/* All Tools */}
      <section id="tools" className="pb-8">
        <h2 className="text-sm font-semibold mb-3 text-slate-800 dark:text-slate-200">
          {search ? 'Hasil Pencarian' : 'Semua Tools'}
        </h2>
        <div className="grid grid-cols-3 gap-3">
          {filteredTools.map(tool => {
            const Icon = (Icons as any)[tool.icon] || Icons.HelpCircle;
            return (
              <a href={`/tool/${tool.slug}`} key={tool.slug} className="glass-card p-3 flex flex-col items-center text-center glass-button cursor-pointer">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-100 to-purple-100 dark:from-blue-900/40 dark:to-purple-900/40 flex items-center justify-center mb-2">
                  <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="text-xs font-semibold line-clamp-1">{tool.name}</span>
                <span className="text-[10px] text-slate-500 line-clamp-1 mt-1">{tool.desc}</span>
              </a>
            );
          })}
          {filteredTools.length === 0 && (
            <div className="col-span-3 text-center py-8 text-sm text-slate-500">Tool tidak ditemukan.</div>
          )}
        </div>
      </section>
    </div>
  );
        }
