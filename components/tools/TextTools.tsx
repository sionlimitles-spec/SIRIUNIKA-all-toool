"use client";

import { useState } from "react";

export default function TextTools({ slug }: { slug: string }) {
  const [text, setText] = useState("");
  const [output, setOutput] = useState("");

  const handleProcess = () => {
    if (slug === "case-converter") {
      setOutput(text.toUpperCase());
    } else if (slug === "word-counter") {
      const words = text.trim() ? text.trim().split(/\s+/).length : 0;
      setOutput(`Kata: ${words}, Karakter: ${text.length}`);
    } else if (slug === "base64") {
      try {
        setOutput(btoa(text));
      } catch {
        setOutput("Gagal encode. Pastikan karakter valid.");
      }
    }
  };

  return (
    <div className="space-y-4">
      <textarea
        className="w-full h-32 p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 border-none focus:ring-2 focus:ring-blue-500 text-sm"
        placeholder="Masukkan teks di sini..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button onClick={handleProcess} className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold active:scale-95 transition-transform">
        Proses
      </button>
      {output && (
        <div className="p-3 rounded-2xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-sm break-all">
          {output}
        </div>
      )}
    </div>
  );
}
