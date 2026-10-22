"use client";

import { useState, useEffect } from "react";
import { Copy, Check, Trash2, Type, AlignLeft } from "lucide-react";

export default function TextTools({ slug }: { slug: string }) {
  const [text, setText] = useState("");
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);

  // Live Convert saat mengetik (khusus untuk beberapa tool)
  useEffect(() => {
    if (slug === "case-converter") setOutput(text.toUpperCase());
    if (slug === "base64") {
      try { setOutput(text ? btoa(text) : ""); } catch { setOutput("Gagal encode."); }
    }
  }, [text, slug]);

  const handleProcess = () => {
    if (slug === "case-converter") setOutput(text.toUpperCase());
    else if (slug === "word-counter") setOutput(`Kata: ${text.trim() ? text.trim().split(/\s+/).length : 0}, Karakter: ${text.length}`);
    else if (slug === "base64") {
      try { setOutput(btoa(text)); } catch { setOutput("Gagal encode."); }
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-5 animate-fade-in-up">
      <div className="relative">
        <div className="flex justify-between items-center mb-2 px-1">
          <label className="text-xs font-bold text-slate-500 flex items-center gap-1.5"><AlignLeft className="w-3.5 h-3.5" /> Input Teks</label>
          <button onClick={() => setText("")} className="text-[10px] text-red-500 font-bold hover:underline flex items-center gap-1"><Trash2 className="w-3 h-3" /> Hapus</button>
        </div>
        <textarea 
          className="w-full h-40 p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm outline-none resize-none shadow-sm transition-all" 
          placeholder="Ketik atau tempel teks di sini..." 
          value={text} 
          onChange={(e) => setText(e.target.value)} 
        />
      </div>

      <button onClick={handleProcess} className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-bold text-sm shadow-lg shadow-blue-500/30 active:scale-95 transition-transform flex items-center justify-center gap-2">
        <Type className="w-4 h-4" /> Proses Teks
      </button>
      
      {output && (
        <div className="relative p-5 rounded-2xl bg-gradient-to-br from-blue-50 to-purple-50 dark:from-slate-800 dark:to-slate-800/80 border border-blue-100 dark:border-slate-700 shadow-sm animate-in fade-in">
          <label className="text-[10px] font-bold text-blue-500 uppercase tracking-wider mb-2 block">Hasil</label>
          <p className="text-sm text-slate-800 dark:text-slate-200 break-all pr-10 font-mono leading-relaxed">{output}</p>
          <button onClick={copyToClipboard} className="absolute top-4 right-4 p-2.5 bg-white dark:bg-slate-700 rounded-xl text-slate-500 hover:text-blue-600 shadow-sm transition-colors active:scale-90">
            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      )}
    </div>
  );
}
