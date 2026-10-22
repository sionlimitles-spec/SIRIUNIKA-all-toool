"use client";
import { useState } from "react";
import imageCompression from "browser-image-compression";
import { UploadCloud, Download, Image as ImageIcon } from "lucide-react";

export default function ImageTools({ slug }: { slug: string }) {
  const [compressedFile, setCompressedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsProcessing(true);
    try {
      const compressed = await imageCompression(file, { maxSizeMB: 1, maxWidthOrHeight: 1920, useWebWorker: true });
      setCompressedFile(compressed);
    } catch { alert("Gagal mengompres gambar."); } finally { setIsProcessing(false); }
  };

  if (slug !== "image-compressor") return <p className="text-center py-10">Tool belum tersedia.</p>;

  return (
    <div className="space-y-6 text-center">
      <div className="border-2 border-dashed border-blue-300 dark:border-blue-700/50 bg-blue-50/50 dark:bg-blue-900/10 rounded-3xl p-10 flex flex-col items-center justify-center relative hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center mb-4">
          <UploadCloud className="w-8 h-8 text-blue-600 dark:text-blue-300" />
        </div>
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Pilih gambar untuk dikompres</p>
        <p className="text-xs text-slate-500 mb-4">Maksimal 1MB (Otomatis)</p>
        <input type="file" accept="image/*" onChange={handleUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
        <button className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold shadow-md pointer-events-none">Pilih File</button>
      </div>
      
      {isProcessing && (
        <div className="flex items-center justify-center gap-2 text-sm text-blue-500 font-medium">
          <span className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></span> Sedang mengompres...
        </div>
      )}

      {compressedFile && (
        <div className="glass-card p-5 space-y-4 animate-in slide-in-from-bottom-2">
          <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
            <ImageIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Kompresi Berhasil!</p>
            <p className="text-xs text-slate-500 mt-1">Ukuran baru: {(compressedFile.size / 1024).toFixed(2)} KB</p>
          </div>
          <a href={URL.createObjectURL(compressedFile)} download="compressed_shiriunika.jpg" className="flex items-center justify-center gap-2 w-full py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl text-sm font-semibold shadow-lg shadow-green-500/30 transition-colors">
            <Download className="w-4 h-4" /> Unduh Gambar
          </a>
        </div>
      )}
    </div>
  );
}
