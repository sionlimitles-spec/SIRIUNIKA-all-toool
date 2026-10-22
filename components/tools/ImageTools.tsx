"use client";

import { useState } from "react";
import imageCompression from "browser-image-compression";
import { UploadCloud, Download, Image as ImageIcon, Zap, ArrowRight } from "lucide-react";

export default function ImageTools({ slug }: { slug: string }) {
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [compressedFile, setCompressedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setOriginalFile(file);
    setIsProcessing(true);
    try {
      const compressed = await imageCompression(file, { maxSizeMB: 1, maxWidthOrHeight: 1920, useWebWorker: true });
      setCompressedFile(compressed);
    } catch { alert("Gagal mengompres gambar."); } finally { setIsProcessing(false); }
  };

  if (slug !== "image-compressor") return <p className="text-center py-10 text-slate-500">Tool belum tersedia.</p>;

  const formatSize = (bytes: number) => (bytes / 1024 / 1024).toFixed(2) + " MB";

  return (
    <div className="space-y-6 animate-fade-in-up">
      {!compressedFile ? (
        <div className="border-2 border-dashed border-blue-300 dark:border-blue-700/50 bg-blue-50/50 dark:bg-blue-900/10 rounded-[2rem] p-10 flex flex-col items-center justify-center relative hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all group">
          <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 shadow-xl group-hover:scale-110 transition-transform">
            <UploadCloud className="w-10 h-10 text-blue-600 dark:text-blue-400" />
          </div>
          <p className="text-base font-bold text-slate-800 dark:text-slate-200 mb-1">Ketuk untuk Pilih Gambar</p>
          <p className="text-xs text-slate-500 mb-0 text-center">Maksimal 10MB. Format JPG, PNG, WEBP.</p>
          <input type="file" accept="image/*" onChange={handleUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="glass-card p-5 rounded-[2rem] flex flex-col items-center">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner">
              <ImageIcon className="w-8 h-8" />
            </div>
            <p className="text-base font-bold text-slate-800 dark:text-slate-200">Kompresi Berhasil!</p>
            
            <div className="flex items-center justify-center gap-4 w-full my-5 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700">
              <div className="text-center">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Asli</p>
                <p className="text-sm font-bold text-red-500 line-through">{formatSize(originalFile!.size)}</p>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-300" />
              <div className="text-center">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Sekarang</p>
                <p className="text-sm font-bold text-green-500">{formatSize(compressedFile.size)}</p>
              </div>
            </div>

            <a href={URL.createObjectURL(compressedFile)} download="compressed_shiriunika.jpg" className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-green-500/30 transition-all active:scale-95">
              <Download className="w-5 h-5" /> Unduh Gambar
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
