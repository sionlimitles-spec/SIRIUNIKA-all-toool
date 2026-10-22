"use client";

import { useState, useEffect } from "react";
import QRCode from "qrcode";
import { Download, Link as LinkIcon, AlertCircle, Loader2, Image as ImageIcon, Video, Music, Play, ChevronRight } from "lucide-react";

type ApiMediaItem = { label?: string; type?: string; url: string; };
type ApiResponse = { success: boolean; normalized?: { media?: ApiMediaItem[]; }; error?: { message: string }; result?: any; };

export default function MiscTools({ slug }: { slug: string }) {
  const [qrUrl, setQrUrl] = useState("");
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mediaList, setMediaList] = useState<ApiMediaItem[]>([]);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"video" | "audio" | "image">("video");

  useEffect(() => {
    if (slug === "qr-generator" && text) {
      QRCode.toDataURL(text, { margin: 1, width: 300 }, (err, url) => { if (!err) setQrUrl(url); });
    }
  }, [text, slug]);

  const isDownloader = ["tiktok-downloader", "youtube-downloader", "instagram-downloader", "spotify-downloader", "all-media-downloader", "pinterest-downloader"].includes(slug);

  const extractMedia = (data: ApiResponse): ApiMediaItem[] => {
    let items: ApiMediaItem[] = [];
    // 1. Cek normalized media (standar API)
    if (data.normalized?.media && Array.isArray(data.normalized.media)) {
      items = data.normalized.media.filter((item) => item.url);
    } 
    // 2. Fallback untuk API yang mengembalikan raw result (kadang bentuknya nested array/object)
    else if (data.result) {
      const traverse = (obj: any) => {
        if (obj && typeof obj === "object") {
          if (typeof obj.url === "string" && obj.url.startsWith("http")) {
            items.push({ 
              url: obj.url, 
              label: obj.label || obj.quality || obj.type || "Media", 
              type: obj.type || (obj.url.match(/\.(mp4|webm)/i) ? 'video' : obj.url.match(/\.(mp3|m4a|wav)/i) ? 'audio' : 'image')
            });
          }
          Object.values(obj).forEach(traverse);
        }
      };
      traverse(data.result);
    }

    // Hilangkan duplikat berdasarkan URL
    const uniqueItems = Array.from(new Map(items.map(item => [item.url, item])).values());
    return uniqueItems;
  };

  const handleDownload = async () => {
    if (!url) return;
    setIsLoading(true);
    setError("");
    setMediaList([]);

    try {
      let platform = slug.replace("-downloader", "");
      if (platform === "all-media") platform = "aio";
      if (platform === "pinterest") platform = "pinterest"; // Sesuaikan endpoint jika perlu

      const apiUrl = `https://btch-downloader-api-green.vercel.app/api/download/${platform}?url=${encodeURIComponent(url)}`;
      
      const response = await fetch(apiUrl);
      const data: ApiResponse = await response.json();

      if (!data.success) throw new Error(data.error?.message || "Gagal mengambil media.");
      
      const extracted = extractMedia(data);
      if (extracted.length === 0) throw new Error("Tidak ada media yang ditemukan. Pastikan link publik.");
      
      setMediaList(extracted);
      
      // Set tab default berdasarkan apa yang ditemukan
      if (extracted.some(i => i.type?.includes('audio'))) setActiveTab("audio");
      else if (extracted.some(i => i.type?.includes('video'))) setActiveTab("video");
      else setActiveTab("image");

    } catch (err: any) {
      setError(err.message || "API sedang sibuk atau link tidak valid.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- RENDER UI DOWNLOADER ---
  if (isDownloader) {
    const isTikTok = slug === "tiktok-downloader";
    const isYT = slug === "youtube-downloader";
    const isPinterest = slug === "pinterest-downloader";

    // Filter media berdasarkan tab
    const filteredMedia = mediaList.filter(m => {
      if (activeTab === "video") return m.type?.includes('video') || m.url.includes('.mp4');
      if (activeTab === "audio") return m.type?.includes('audio') || m.url.includes('.mp3');
      return m.type?.includes('image') || m.url.match(/\.(jpg|jpeg|png|webp)/i);
    });

    return (
      <div className="space-y-6">
        <div className="flex flex-col items-center text-center space-y-2 mb-2">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${isPinterest ? 'bg-red-100 dark:bg-red-900/30' : 'bg-blue-100 dark:bg-blue-900/30'}`}>
             {isPinterest ? <ImageIcon className="w-7 h-7 text-red-600" /> : <Download className="w-7 h-7 text-blue-600" />}
          </div>
          <h3 className="font-bold text-xl">{isPinterest ? "Pinterest HD 1080p" : "Media Downloader"}</h3>
          <p className="text-xs text-slate-500 max-w-[250px]">
            {isTikTok ? "Unduh video tanpa watermark atau slide foto." : isYT ? "Pilih format MP4 atau ekstrak audio MP3." : "Mengambil resolusi tertinggi yang tersedia."}
          </p>
        </div>

        <div className="relative">
          <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="url"
            placeholder={`Tempel link ${slug.split('-')[0]} di sini...`}
            className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white/50 dark:bg-slate-800/50 border border-white/20 dark:border-slate-700 text-sm focus:ring-2 focus:ring-blue-500 outline-none shadow-sm backdrop-blur-sm"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
        </div>

        <button 
          onClick={handleDownload} 
          disabled={isLoading || !url}
          className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95 transition-all shadow-lg shadow-blue-500/30"
        >
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Ambil Media"}
        </button>

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs rounded-xl flex items-start gap-2 border border-red-100 dark:border-red-900/50">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {mediaList.length > 0 && (
          <div className="glass-card p-4 space-y-4 mt-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* TABS (Jika ada lebih dari 1 jenis media) */}
            {new Set(mediaList.map(m => m.type?.includes('video') ? 'video' : m.type?.includes('audio') ? 'audio' : 'image')).size > 1 && (
              <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                {mediaList.some(m => m.type?.includes('video') || m.url.includes('.mp4')) && (
                  <button onClick={() => setActiveTab("video")} className={`flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1 transition-all ${activeTab === 'video' ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600' : 'text-slate-500'}`}><Video className="w-3 h-3" /> Video</button>
                )}
                {mediaList.some(m => m.type?.includes('audio') || m.url.includes('.mp3')) && (
                  <button onClick={() => setActiveTab("audio")} className={`flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1 transition-all ${activeTab === 'audio' ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600' : 'text-slate-500'}`}><Music className="w-3 h-3" /> Audio</button>
                )}
                {mediaList.some(m => m.type?.includes('image')) && (
                  <button onClick={() => setActiveTab("image")} className={`flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1 transition-all ${activeTab === 'image' ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600' : 'text-slate-500'}`}><ImageIcon className="w-3 h-3" /> Gambar</button>
                )}
              </div>
            )}

            <div className="space-y-3">
              {/* LOGIKA TIKTOK SLIDE (Jika lebih dari 1 gambar) */}
              {isTikTok && activeTab === 'image' && filteredMedia.length > 1 ? (
                <div>
                  <p className="text-xs font-semibold text-slate-500 mb-2">Terdeteksi Slide Foto ({filteredMedia.length})</p>
                  <div className="flex gap-3 overflow-x-auto pb-2 snap-x">
                    {filteredMedia.map((media, idx) => (
                      <div key={idx} className="snap-center shrink-0 w-40 space-y-2">
                        <div className="w-full h-56 rounded-xl overflow-hidden bg-slate-200 border border-slate-300">
                          <img src={media.url} alt={`Slide ${idx+1}`} className="w-full h-full object-cover" />
                        </div>
                        <a href={media.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-1 w-full py-1.5 bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold">
                          <Download className="w-3 h-3" /> Simpan {idx+1}
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                // LOGIKA DOWNLOAD BIASA (VIDEO/AUDIO/GAMBAR TUNGGAL)
                filteredMedia.map((media, idx) => (
                  <div key={idx} className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 border border-slate-100 dark:border-slate-700">
                    {/* Preview Video */}
                    {activeTab === 'video' && (
                      <div className="mb-3 rounded-lg overflow-hidden bg-black/5 aspect-video flex items-center justify-center">
                        <video src={media.url} controls className="w-full max-h-[200px] object-contain" poster="" />
                      </div>
                    )}
                    {/* Preview Gambar */}
                    {activeTab === 'image' && (
                      <div className="mb-3 rounded-lg overflow-hidden bg-black/5 flex items-center justify-center">
                        <img src={media.url} alt="Preview" className={`w-full max-h-[300px] object-contain ${isPinterest ? 'contrast-105 saturate-105' : ''}`} />
                      </div>
                    )}
                    {/* Preview Audio */}
                    {activeTab === 'audio' && (
                      <div className="mb-3 flex items-center gap-3 bg-white dark:bg-slate-900 p-2 rounded-lg">
                        <Music className="w-8 h-8 text-blue-500" />
                        <div className="text-xs font-medium truncate">{media.label || "Audio Track"}</div>
                      </div>
                    )}

                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold px-2 py-1 bg-white dark:bg-slate-700 rounded-md shadow-sm border border-slate-200 dark:border-slate-600">
                        {isPinterest ? (idx === 0 ? "Original / HD" : "Quality Opsi") : (media.label || `Opsi ${idx + 1}`)}
                      </span>
                      <a href={media.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-md transition-colors">
                        <Download className="w-3.5 h-3.5" /> Unduh
                      </a>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            {/* Info Khusus Pinterest */}
            {isPinterest && (
              <p className="text-[10px] text-slate-400 text-center italic mt-2">
                *Sistem mengambil resolusi maksimal (HD). Jika asli 720p, API akan mengembalikan versi terbaik yang tersedia.
              </p>
            )}
            
            {/* Info Khusus TikTok */}
            {isTikTok && (
              <p className="text-[10px] text-slate-400 text-center italic mt-2">
                *Pilih opsi "HD" untuk kualitas terbaik tanpa watermark.
              </p>
            )}
            
            {/* Info Khusus YouTube */}
            {isYT && activeTab === 'audio' && (
              <p className="text-[10px] text-slate-400 text-center italic mt-2">
                *Audio diekstrak langsung oleh server API (MP3). Bitrate tergantung ketersediaan sumber.
              </p>
            )}

          </div>
        )}
      </div>
    );
  }

  // --- RENDER UI QR GENERATOR ---
  if (slug === "qr-generator") {
    return (
      <div className="space-y-4 flex flex-col items-center">
        <div className="w-full relative">
          <input type="text" placeholder="Masukkan URL, Teks, atau Nomor..." className="w-full p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-blue-500 outline-none border border-transparent focus:border-blue-300 transition-all" value={text} onChange={(e) => setText(e.target.value)} />
        </div>
        {qrUrl && (
          <div className="p-4 bg-white rounded-3xl shadow-xl border border-slate-100 animate-in zoom-in-95 duration-300">
            <img src={qrUrl} alt="QR Code" className="w-56 h-56" />
            <a href={qrUrl} download="qrcode.png" className="mt-4 flex items-center justify-center gap-2 w-full py-2 bg-blue-50 text-blue-600 rounded-xl text-sm font-semibold hover:bg-blue-100 transition-colors">
              <Download className="w-4 h-4" /> Simpan QR
            </a>
          </div>
        )}
      </div>
    );
  }

  return <p className="text-center text-slate-500 py-10">Tool belum diimplementasikan.</p>;
}
