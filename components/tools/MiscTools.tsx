"use client";

import { useState, useEffect } from "react";
import QRCode from "qrcode";
import { Download, Link as LinkIcon, AlertCircle, Loader2, Image as ImageIcon, Video, Music, Play } from "lucide-react";

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
    if (data.normalized?.media && Array.isArray(data.normalized.media)) {
      items = data.normalized.media.filter((item) => item.url);
    } else if (data.result) {
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
    return Array.from(new Map(items.map(item => [item.url, item])).values());
  };

  const handleDownload = async () => {
    if (!url) return;
    setIsLoading(true); setError(""); setMediaList([]);

    try {
      let platform = slug.replace("-downloader", "");
      if (platform === "all-media") platform = "aio";
      const apiUrl = `https://btch-downloader-api-green.vercel.app/api/download/${platform}?url=${encodeURIComponent(url)}`;
      
      const response = await fetch(apiUrl);
      const data: ApiResponse = await response.json();

      if (!data.success) throw new Error(data.error?.message || "Gagal mengambil media.");
      const extracted = extractMedia(data);
      if (extracted.length === 0) throw new Error("Media tidak ditemukan. Pastikan link publik.");
      
      setMediaList(extracted);
      
      // Auto switch tab based on results
      if (extracted.some(i => i.type?.includes('audio') || i.url.includes('.mp3'))) setActiveTab("audio");
      else if (extracted.some(i => i.type?.includes('image') || i.url.match(/\.(jpg|jpeg|png)/i))) setActiveTab("image");
      else setActiveTab("video");

    } catch (err: any) {
      setError(err.message || "API sibuk atau link tidak valid.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isDownloader) {
    const isTikTok = slug === "tiktok-downloader";
    const isPinterest = slug === "pinterest-downloader";

    const filteredMedia = mediaList.filter(m => {
      if (activeTab === "video") return m.type?.includes('video') || m.url.includes('.mp4');
      if (activeTab === "audio") return m.type?.includes('audio') || m.url.includes('.mp3');
      return m.type?.includes('image') || m.url.match(/\.(jpg|jpeg|png|webp)/i);
    });

    return (
      <div className="space-y-6">
        {/* Header Info */}
        <div className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/30 mb-3">
             {isPinterest ? <ImageIcon className="w-8 h-8 text-white" /> : <Download className="w-8 h-8 text-white" />}
          </div>
          <h3 className="font-bold text-2xl text-slate-800 dark:text-white">{isPinterest ? "Pinterest HD" : "Downloader"}</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 px-4">
            {isTikTok ? "Simpan video tanpa watermark atau slide foto dengan mudah." : "Dapatkan media favoritmu dengan kualitas terbaik."}
          </p>
        </div>

        {/* Input Area */}
        <div className="glass-card p-2 relative flex items-center">
          <div className="pl-3 pr-2 text-slate-400"><LinkIcon className="w-5 h-5" /></div>
          <input
            type="url"
            placeholder="Tempel link di sini..."
            className="flex-1 bg-transparent py-3 text-sm focus:outline-none placeholder:text-slate-400"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <button 
            onClick={handleDownload} 
            disabled={isLoading || !url}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Ambil"}
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-2xl flex items-start gap-3 border border-red-100 dark:border-red-900/50 animate-fade-in-up">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="glass-card p-8 flex flex-col items-center justify-center space-y-4 animate-fade-in-up">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 border-4 border-blue-100 dark:border-slate-700 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
            </div>
            <p className="text-sm font-medium text-slate-500 animate-pulse">Mengambil media terbaik...</p>
          </div>
        )}

        {/* Hasil Download */}
        {!isLoading && mediaList.length > 0 && (
          <div className="space-y-4 animate-fade-in-up">
            {/* TABS (Jika media campuran) */}
            {new Set(mediaList.map(m => m.type?.includes('video') ? 'video' : m.type?.includes('audio') ? 'audio' : 'image')).size > 1 && (
              <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl">
                {mediaList.some(m => m.type?.includes('video') || m.url.includes('.mp4')) && (
                  <button onClick={() => setActiveTab("video")} className={`flex-1 py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all ${activeTab === 'video' ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600' : 'text-slate-500'}`}><Video className="w-4 h-4" /> Video</button>
                )}
                {mediaList.some(m => m.type?.includes('audio') || m.url.includes('.mp3')) && (
                  <button onClick={() => setActiveTab("audio")} className={`flex-1 py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all ${activeTab === 'audio' ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600' : 'text-slate-500'}`}><Music className="w-4 h-4" /> Audio</button>
                )}
                {mediaList.some(m => m.type?.includes('image') || m.url.match(/\.(jpg|jpeg|png)/i)) && (
                  <button onClick={() => setActiveTab("image")} className={`flex-1 py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all ${activeTab === 'image' ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600' : 'text-slate-500'}`}><ImageIcon className="w-4 h-4" /> Gambar</button>
                )}
              </div>
            )}

            {/* TIKTOK SLIDE (Carousel) */}
            {isTikTok && activeTab === 'image' && filteredMedia.length > 1 ? (
              <div className="space-y-3">
                <h4 className="text-sm font-bold px-1">Slide Foto ({filteredMedia.length})</h4>
                <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-4 scrollbar-hide">
                  {filteredMedia.map((media, idx) => (
                    <div key={idx} className="snap-center shrink-0 w-48 space-y-2">
                      <div className="w-full h-64 rounded-2xl overflow-hidden bg-slate-200 border-2 border-white shadow-md relative">
                        <img src={media.url} alt={`Slide ${idx+1}`} className="w-full h-full object-cover" />
                        <div className="absolute top-2 right-2 bg-black/50 text-white text-[10px] font-bold px-2 py-1 rounded-md backdrop-blur-sm">{idx+1} / {filteredMedia.length}</div>
                      </div>
                      <a href={media.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-1.5 w-full py-2 bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 rounded-xl text-xs font-bold shadow-sm border border-slate-200 dark:border-slate-700">
                        <Download className="w-3.5 h-3.5" /> Simpan
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              // VIDEO / AUDIO / GAMBAR BIASA
              filteredMedia.map((media, idx) => (
                <div key={idx} className="glass-card p-3 flex flex-col gap-3">
                  {/* Preview Media */}
                  {activeTab === 'video' && (
                    <div className="relative rounded-2xl overflow-hidden bg-black/5 aspect-video flex items-center justify-center">
                      {/* Gunakan tag video standar, atau poster image */}
                      <video src={media.url} controls className="w-full max-h-[250px] object-contain" />
                    </div>
                  )}
                  {activeTab === 'image' && (
                    <div className="relative rounded-2xl overflow-hidden bg-slate-100 flex items-center justify-center">
                      <img src={media.url} alt="Preview" className={`w-full max-h-[350px] object-contain ${isPinterest ? 'contrast-105 saturate-105' : ''}`} />
                      {isPinterest && <span className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-md">HD / Original</span>}
                    </div>
                  )}
                  {activeTab === 'audio' && (
                    <div className="flex items-center gap-3 bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700">
                      <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center shrink-0">
                        <Music className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <p className="text-sm font-bold truncate">{media.label || "Audio Track"}</p>
                        <p className="text-xs text-slate-500">Format MP3</p>
                      </div>
                    </div>
                  )}

                  {/* Tombol Action */}
                  <div className="flex items-center justify-between gap-2 mt-1">
                    <span className="text-xs font-bold px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg">
                      {media.label || `Opsi ${idx + 1}`}
                    </span>
                    <a href={media.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/30 transition-all">
                      <Download className="w-4 h-4" /> Unduh
                    </a>
                  </div>
                </div>
              ))
            )}
            
            <p className="text-[10px] text-slate-400 text-center px-4 mt-2">
              *Jika tombol unduh tidak berfungsi (terblokir browser), klik kanan pada preview media lalu pilih "Save as".
            </p>
          </div>
        )}
      </div>
    );
  }

  // --- RENDER UI QR GENERATOR ---
  if (slug === "qr-generator") {
    return (
      <div className="space-y-5 flex flex-col items-center animate-fade-in-up">
        <div className="text-center mb-2">
          <h3 className="font-bold text-2xl text-slate-800 dark:text-white">QR Generator</h3>
          <p className="text-sm text-slate-500">Ubah teks atau link menjadi QR Code instan.</p>
        </div>
        <input type="text" placeholder="Ketik URL / Teks..." className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm transition-all text-sm" value={text} onChange={(e) => setText(e.target.value)} />
        
        {qrUrl && (
          <div className="p-5 bg-white rounded-[2rem] shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-300 flex flex-col items-center">
            <div className="p-2 border-2 border-dashed border-blue-200 rounded-xl mb-4">
              <img src={qrUrl} alt="QR Code" className="w-48 h-48 rounded-lg" />
            </div>
            <a href={qrUrl} download="shiriunika-qr.png" className="flex items-center justify-center gap-2 w-full py-3 bg-slate-900 hover:bg-black text-white rounded-xl text-sm font-bold shadow-lg transition-all">
              <Download className="w-4 h-4" /> Simpan QR Code
            </a>
          </div>
        )}
      </div>
    );
  }

  return <p className="text-center text-slate-500 py-10">Tool belum diimplementasikan.</p>;
}
