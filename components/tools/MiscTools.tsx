"use client";

import { useState, useEffect } from "react";
import QRCode from "qrcode";
import { Download, Link as LinkIcon, AlertCircle, Loader2 } from "lucide-react";

type ApiMediaItem = {
  label?: string;
  type?: string;
  url: string;
};

type ApiResponse = {
  success: boolean;
  platform?: string;
  normalized?: {
    kind: string;
    title?: string;
    thumbnail?: string;
    media?: ApiMediaItem[];
  };
  error?: { message: string };
};

export default function MiscTools({ slug }: { slug: string }) {
  const [qrUrl, setQrUrl] = useState("");
  const [text, setText] = useState("");
  
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mediaList, setMediaList] = useState<ApiMediaItem[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (slug === "qr-generator" && text) {
      QRCode.toDataURL(text, { margin: 1, width: 300 }, (err, url) => {
        if (!err) setQrUrl(url);
      });
    }
  }, [text, slug]);

  const isDownloader = [
    "tiktok-downloader", 
    "youtube-downloader", 
    "instagram-downloader", 
    "spotify-downloader", 
    "all-media-downloader"
  ].includes(slug);

  const extractMedia = (data: ApiResponse): ApiMediaItem[] => {
    if (data.normalized?.media && Array.isArray(data.normalized.media)) {
      return data.normalized.media.filter((item) => item.url);
    }
    const raw = (data as any).result;
    if (raw && typeof raw === "object") {
      const found: ApiMediaItem[] = [];
      const traverse = (obj: any) => {
        if (obj && typeof obj === "object") {
          if (typeof obj.url === "string" && obj.url.startsWith("http")) {
            found.push({ url: obj.url, label: obj.label || "Download", type: obj.type });
          }
          Object.values(obj).forEach(traverse);
        }
      };
      traverse(raw);
      return found;
    }
    return [];
  };

  const handleDownload = async () => {
    if (!url) return;
    setIsLoading(true);
    setError("");
    setMediaList([]);

    try {
      let platform = slug.replace("-downloader", "");
      if (platform === "all-media") platform = "aio";

      const apiUrl = `https://btch-downloader-api-green.vercel.app/api/download/${platform}?url=${encodeURIComponent(url)}`;
      
      const response = await fetch(apiUrl);
      const data: ApiResponse = await response.json();

      if (!data.success) {
        throw new Error(data.error?.message || "Gagal mengambil media. Pastikan link valid.");
      }

      const extracted = extractMedia(data);
      if (extracted.length === 0) {
        throw new Error("API berhasil, namun tidak ada link media yang ditemukan. Format mungkin belum didukung.");
      }

      setMediaList(extracted);
    } catch (err: any) {
      setError(err.message || "API publik sedang sibuk atau link tidak valid. Coba lagi nanti.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isDownloader) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col items-center text-center space-y-2 mb-4">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
             <Download className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="font-bold text-lg">Media Downloader</h3>
          <p className="text-xs text-slate-500">Menggunakan API publik. Tanpa watermark.</p>
        </div>

        <div className="relative">
          <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="url"
            placeholder="Tempel link video/foto di sini..."
            className="w-full pl-12 pr-4 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-blue-500 border-none outline-none"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
        </div>

        <button 
          onClick={handleDownload} 
          disabled={isLoading || !url}
          className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95 transition-transform"
        >
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Ambil Media"}
        </button>

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs rounded-xl flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {mediaList.length > 0 && (
          <div className="glass-card p-4 space-y-3 mt-4">
            <p className="text-sm font-semibold text-green-600">Berhasil! Pilih media di bawah:</p>
            <div className="space-y-2">
              {mediaList.map((media, idx) => (
                <a 
                  key={idx}
                  href={media.url} 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between gap-2 w-full p-3 bg-white/50 dark:bg-slate-700/50 hover:bg-white dark:hover:bg-slate-700 rounded-xl text-sm font-medium transition-colors border border-slate-200 dark:border-slate-600"
                >
                  <span className="truncate">{media.label || `Media ${idx + 1}`}</span>
                  <Download className="w-4 h-4 text-blue-500 shrink-0" />
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (slug === "qr-generator") {
    return (
      <div className="space-y-4 flex flex-col items-center">
        <input
          type="text"
          placeholder="Masukkan URL atau Teks..."
          className="w-full p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        {qrUrl && (
          <div className="p-4 bg-white rounded-2xl shadow-lg">
            <img src={qrUrl} alt="QR Code" className="w-48 h-48" />
          </div>
        )}
      </div>
    );
  }

  return <p className="text-center text-slate-500 py-10">Tool belum diimplementasikan.</p>;
}
