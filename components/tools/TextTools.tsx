"use client";
import { useState } from "react";
import { Copy, Check } from "lucide-react";

export default function TextTools({ slug }: { slug: string }) {
  const [text, setText] = useState("");
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);

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
    <div className="space-y-4">
      <textarea className="w-full h-40 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm outline-none resize-none shadow-inner" placeholder="Ketik atau tempel teks di sini..." value={text} onChange={(e) => setText(e.target.value)} />
      <button onClick={handleProcess} className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-semibold shadow-lg shadow-blue-500/30 active:scale-95 transition-transform">Proses Teks</button>
      
      {output && (
        <div className="relative p-4 rounded-2xl bg-white dark:bg-slate-800 border border-blue-100 dark:border-blue-900/50 shadow-sm animate-in fade-in">
          <p className="text-sm text-slate-800 dark:text-slate-200 break-all pr-10 font-mono">{output}</p>
          <button onClick={copyToClipboard} className="absolute top-3 right-3 p-2 bg-slate-100 dark:bg-slate-700 rounded-lg text-slate-500 hover:text-blue-600 transition-colors">
            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      )}
    </div>
  );
}
