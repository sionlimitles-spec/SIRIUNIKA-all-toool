"use client";

import { useState } from "react";
import imageCompression from "browser-image-compression";
import { UploadCloud, Download } from "lucide-react";

export default function ImageTools({ slug }: { slug: string }) {
  const [compressedFile, setCompressedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    try {
      const options = { maxSizeMB: 1, maxWidthOrHeight: 1920, useWebWorker: true };
      const compressed = await imageCompression(file, options);
      setCompressedFile(compressed);
    } catch (error) {
      alert("Gagal mengompres gambar.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (slug !== "image-compressor") return <p>Tool belum tersedia.</p>;

  return (
    <div className="space-y-6 text-center">
      <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-3xl p-8 flex flex-col items-center justify-center relative">
        <UploadCloud className="w-10 h-10 text-slate-400 mb-2" />
        <p className="text-sm text-slate-500 mb-4">Pilih gambar untuk dikompres</p>
        <input type="file" accept="image/*" onChange={handleUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
        <button className="px-4 py-2 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-xl text-sm font-semibold">
          Pilih File
        </button>
      </div>
      
      {isProcessing && <p className="text-sm text-blue-500 animate-pulse">Mengompres...</p>}

      {compressedFile && (
        <div className="glass-card p-4 space-y-3">
          <p className="text-sm font-semibold">Berhasil!</p>
          <p className="text-xs text-slate-500">Ukuran asli: {(compressedFile.size / 1024).toFixed(2)} KB</p>
          <a 
            href={URL.createObjectURL(compressedFile)} 
            download="compressed.jpg"
            className="flex items-center justify-center gap-2 w-full py-2 bg-green-500 text-white rounded-xl text-sm font-semibold"
          >
            <Download className="w-4 h-4" /> Unduh Gambar
          </a>
        </div>
      )}
    </div>
  );
}
