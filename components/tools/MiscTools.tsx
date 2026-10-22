"use client";

import { useState, useEffect } from "react";
import QRCode from "qrcode";
import { 
  Download, Link as LinkIcon, AlertCircle, Loader2, 
  Image as ImageIcon, Video, Music, Sparkles, Copy, CheckCircle2,
  ShieldCheck, Zap
} from "lucide-react";

type ApiMediaItem = { label?: string; type?: string; url: string; };
type ApiResponse = { success: boolean; normalized?: { media?: ApiMediaItem[]; }; error?: { message: string }; result?: any; };

// Helper untuk memberikan style badge pada opsi download
const getBadgeStyle = (label: string = "") => {
  const l = label.toLowerCase();
  if (l.includes('hd') || l.includes('1080')) return "bg-gradient-to-r from-red-500 to-orange-500 text-white";
  if (l.includes('nowm') || l.includes('no watermark') || l.includes('no_wm')) return "bg-gradient-to-r from-green-500 to-emerald-500 text-white";
  if (l.includes('mp3') || l.includes('audio')) return "bg-gradient-to-r from-purple-500 to-pink-500 text-white";
  return "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300";
};

export default function MiscTools({ slug }: { slug: string }) {
  const [qrUrl, setQrUrl] = useState("");
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mediaList, setMediaList] = useState<ApiMediaItem[]>([]);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"video" | "audio" | "image">("video");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  useEffect(() => {
    if (slug === "qr-generator" && text) {
      QRCode.toDataURL(text, { margin: 2, width: 400, color: { dark: "#0f172a", light: "#ffffff" } }, (err, url) => { 
        if (!err) setQrUrl(url); 
      });
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
            // Mempercantik label bawaan API menjadi lebih rapi
            let rawLabel = obj.label || obj.quality || obj.type || "Media";
            let cleanLabel = rawLabel.replace(/_/g, " ").toUpperCase();
            if (cleanLabel === "MEDIA") cleanLabel = "ORIGINAL QUALITY";

            items.push({ 
              url: obj.url, 
              label: cleanLabel, 
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
      if (platform === "pinterest") platform = "pinterest";

      const apiUrl = `https://btch-downloader-api-green.vercel.app/api/download/${platform}?url=${encodeURIComponent(url)}`;
      
      const response = await fetch(apiUrl);
      const data: ApiResponse = await response.json();

      if (!data.success) throw new Error(data.error?.message || "Gagal mengambil media.");
      
      const extracted = extractMedia(data);
      if (extracted.length === 0) throw new Error("Media tidak ditemukan. Pastikan link publik.");
      
      setMediaList(extracted);
      
      if (extracted.some(i => i.type?.includes('audio') || i.url.includes('.mp3'))) setActiveTab("audio");
      else if (extracted.some(i => i.type?.includes('image') || i.url.match(/\.(jpg|jpeg|png)/i))) setActiveTab("image");
      else setActiveTab("video");

    } catch (err: any) {
      setError(err.message || "Server API sedang sibuk.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  if (isDownloader) {
    const isTikTok = slug === "tiktok-downloader";
    const isPinterest = slug === "pinterest-downloader";

    const filteredMedia = mediaList.filter(m => {
      if (activeTab === "video") return m.type?.includes('video') || m.url.includes('.mp4');
      if (activeTab === "audio") return m.type?.includes('audio') || m.url.includes('.mp3');
      return m.type?.includes('image') || m.url.match(/\.(jpg|jpeg|png|webp)/i);
    });

    const hasMultipleTypes = new Set(mediaList.map(m => 
      m.type?.includes('video') ? 'video' : m.type?.includes('audio') ? 'audio' : 'image'
    )).size > 1;

    return (
      <div className="space-y-6 pb-10 animate-fade-in-up">
        
        {/* Header Info */}
        <div className="text-center space-y-3 relative pt-2">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-blue-500/20 blur-3xl rounded-full pointer-events-none"></div>
          <h3 className="font-extrabold text-2xl text-slate-800 dark:text-white relative z-10">
            {isPinterest ? "Pinterest HD" : "Media Downloader"}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-[280px] mx-auto relative z-10 leading-relaxed">
            {isTikTok ? "Dapatkan video HD tanpa watermark, audio MP3, atau slide foto." : "Unduh media dengan kualitas maksimal secara instan."}
          </p>
        </div>

        {/* Input Field Premium */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-500"></div>
          <div className="relative flex items-center bg-white dark:bg-slate-800 rounded-2xl p-1.5 shadow-sm border border-slate-100 dark:border-slate-700">
            <div className="pl-3 pr-2 text-slate-400"><LinkIcon className="w-5 h-5" /></div>
            <input
              type="url"
              placeholder="Tempel link video di sini..."
              className="flex-1 bg-transparent py-2 text-sm focus:outline-none placeholder:text-slate-400 font-medium"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleDownload()}
            />
            <button 
              onClick={handleDownload} 
              disabled={isLoading || !url}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-blue-500/30 active:scale-95"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Ambil"}
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs rounded-xl flex items-start gap-3 border border-red-100 dark:border-red-900/50 animate-in slide-in-from-top-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="leading-relaxed">{error}</p>
          </div>
        )}

        {/* Loading Skeleton */}
        {isLoading && (
          <div className="space-y-4 pt-4 animate-pulse">
            <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-3xl w-full"></div>
            <div className="h-16 bg-slate-200 dark:bg-slate-800 rounded-2xl w-full"></div>
          </div>
        )}

        {/* HASIL DOWNLOAD */}
        {!isLoading && mediaList.length > 0 && (
          <div className="space-y-6 animate-fade-in-up">
            
            {hasMultipleTypes && (
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

            {/* TIKTOK SLIDE CAROUSEL */}
            {isTikTok && activeTab === 'image' && filteredMedia.length > 1 ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 px-1">
                  <Sparkles className="w-4 h-4 text-orange-500" />
                  <h4 className="text-sm font-bold">Slide Foto ({filteredMedia.length})</h4>
                </div>
                <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 scrollbar-hide px-1">
                  {filteredMedia.map((media, idx) => (
                    <div key={idx} className="snap-center shrink-0 w-52 space-y-2">
                      <div className="w-full h-72 rounded-2xl overflow-hidden bg-slate-900 border-2 border-white/50 shadow-xl relative group">
                        <img src={media.url} alt={`Slide ${idx+1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute top-3 right-3 bg-black/60 text-white text-[10px] font-bold px-2 py-1 rounded-md backdrop-blur-md">{idx+1}/{filteredMedia.length}</div>
                      </div>
                      <button onClick={() => handleCopy(media.url, idx)} className="flex items-center justify-center gap-1.5 w-full py-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold shadow-sm border border-slate-200 dark:border-slate-700">
                        {copiedIndex === idx ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />} 
                        {copiedIndex === idx ? "Tersalin!" : "Salin Link"}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              // PREVIEW & MULTI-OPTIONS
              filteredMedia.map((media, idx) => (
                <div key={idx} className="space-y-3">
                  
                  {/* PREVIEW BOX */}
                  <div className="rounded-3xl overflow-hidden shadow-2xl bg-black/90 border border-slate-700/50">
                    {activeTab === 'video' && (
                      <div className="relative aspect-[9/16] max-h-[400px] w-full flex items-center justify-center">
                        <video src={media.url} controls playsInline className="w-full h-full object-contain" />
                      </div>
                    )}
                    {activeTab === 'image' && (
                      <div className="relative bg-slate-900 flex items-center justify-center max-h-[400px]">
                        <img src={media.url} alt="Preview" className={`w-full object-contain ${isPinterest ? 'contrast-105 saturate-105' : ''}`} />
                        {isPinterest && (
                          <div className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-md shadow-lg flex items-center gap-1">
                            <Zap className="w-3 h-3" /> HD 1080p
                          </div>
                        )}
                      </div>
                    )}
                    {activeTab === 'audio' && (
                      <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-5 flex items-center gap-4">
                        <div className="w-14 h-14 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0">
                          <Music className="w-7 h-7 text-purple-400" />
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <p className="text-sm font-bold text-white truncate">{media.label || "Audio MP3"}</p>
                          <p className="text-xs text-slate-400 mt-0.5">Siap diunduh</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* KARTU DOWNLOAD PREMIUM */}
                  <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-lg border border-slate-100 dark:border-slate-700 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2 mb-1">
                          {/* BADGE LOGIC */}
                          <span className={`px-2 py-0.5 text-[10px] font-extrabold rounded-md tracking-wider ${getBadgeStyle(media.label)}`}>
                            {media.label?.includes('HD') || media.label?.includes('1080') ? 'HD' : 
                             media.label?.includes('NOWM') ? 'NO WM' : 
                             activeTab === 'audio' ? 'MP3' : 'ORIGINAL'}
                          </span>
                          {activeTab === 'video' && <ShieldCheck className="w-4 h-4 text-green-500" />}
                        </div>
                        <p className="text-sm font-bold text-slate-800 dark:text-white">
                          {media.label || (activeTab === 'video' ? 'Video Tanpa Watermark' : 'Media File')}
                        </p>
                      </div>
                    </div>

                    <a 
                      href={media.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
                    >
                      <Download className="w-4 h-4" /> Unduh Sekarang
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    );
  }

  // --- UI QR GENERATOR ---
  if (slug === "qr-generator") {
    return (
      <div className="space-y-6 flex flex-col items-center animate-fade-in-up pb-10">
        <div className="text-center mb-2">
          <h3 className="font-extrabold text-2xl text-slate-800 dark:text-white">QR Generator</h3>
        </div>
        <div className="w-full relative group">
          <input type="text" placeholder="Ketik URL / Teks..." className="relative w-full p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm text-sm font-medium" value={text} onChange={(e) => setText(e.target.value)} />
        </div>
        {qrUrl && (
          <div className="p-5 bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-700 flex flex-col items-center w-full max-w-[280px]">
            <img src={qrUrl} alt="QR Code" className="w-full aspect-square rounded-xl mb-4" />
            <a href={qrUrl} download="qrcode.png" className="flex items-center justify-center gap-2 w-full py-3 bg-slate-900 text-white rounded-xl text-sm font-bold shadow-lg">
              <Download className="w-4 h-4" /> Simpan QR
            </a>
          </div>
        )}
      </div>
    );
  }

  return <p className="text-center text-slate-500 py-10">Tool belum diimplementasikan.</p>;
}
