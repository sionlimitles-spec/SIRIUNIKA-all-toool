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

// --- KONFIGURASI API FALLBACK ---
const API_CONFIG = {
  tiktok: [
    { name: "TikWM", url: (u: string) => `https://www.tikwm.com/api/?url=${encodeURIComponent(u)}` },
    { name: "BTCH", url: (u: string) => `https://btch-downloader-api-green.vercel.app/api/download/tiktok?url=${encodeURIComponent(u)}` },
    { name: "Tiklydown", url: (u: string) => `https://api.tiklydown.eu.org/api/download?url=${encodeURIComponent(u)}` }
  ],
  instagram: [
    { name: "BTCH", url: (u: string) => `https://btch-downloader-api-green.vercel.app/api/download/instagram?url=${encodeURIComponent(u)}` },
    { name: "Snapinsta", url: (u: string) => `https://api.snapinsta.app/api/instagram?url=${encodeURIComponent(u)}` },
    { name: "IGram", url: (u: string) => `https://api.igram.world/api/download?url=${encodeURIComponent(u)}` }
  ],
  youtube: [
    { name: "BTCH", url: (u: string) => `https://btch-downloader-api-green.vercel.app/api/download/youtube?url=${encodeURIComponent(u)}` },
    { name: "Cobalt", url: (u: string) => `https://api.cobalt.tools/api/json` }, // Cobalt butuh POST, akan ditangani khusus
    { name: "Vevioz", url: (u: string) => `https://api.vevioz.com/api/button/mp3/${u.split('v=')[1]?.split('&')[0] || u.split('/').pop()}` }
  ],
  pinterest: [
    { name: "BTCH", url: (u: string) => `https://btch-downloader-api-green.vercel.app/api/download/pinterest?url=${encodeURIComponent(u)}` }
  ]
};

const getBadgeStyle = (label: string = "") => {
  const l = label.toLowerCase();
  if (l.includes('hd') || l.includes('1080')) return "bg-gradient-to-r from-red-500 to-orange-500 text-white";
  if (l.includes('nowm') || l.includes('no watermark')) return "bg-gradient-to-r from-green-500 to-emerald-500 text-white";
  if (l.includes('mp3') || l.includes('audio')) return "bg-gradient-to-r from-purple-500 to-pink-500 text-white";
  return "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300";
};

const getPinterestOriginalUrl = (url: string) => {
  if (url.includes('i.pinimg.com')) return url.replace(/\/(236x|474x|564x|736x|1200x)\//, '/originals/');
  return url;
};

export default function MiscTools({ slug }: { slug: string }) {
  const [qrUrl, setQrUrl] = useState("");
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("");
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

  // FUNGSI UNIVERSAL UNTUK EKSTRAK LINK DARI BERBAGAI STRUKTUR API
  const extractMediaFromRaw = (raw: any, platform: string): ApiMediaItem[] => {
    let items: ApiMediaItem[] = [];
    
    // 1. Coba baca dari format normalized (BTCH)
    if (raw.normalized?.media && Array.isArray(raw.normalized.media)) {
      items = raw.normalized.media.map((m: any) => ({
        url: m.url,
        label: m.label || m.type,
        type: m.type || (m.url.match(/\.(mp4)/) ? 'video' : m.url.match(/\.(mp3)/) ? 'audio' : 'image')
      }));
    } 
    // 2. Coba baca dari format result (TikWM, Tiklydown, dll)
    else if (raw.data || raw.result || raw.medias) {
      const source = raw.data || raw.result || raw.medias;
      const traverse = (obj: any) => {
        if (obj && typeof obj === "object") {
          // Jika objek punya URL
          if (typeof obj.url === "string" && obj.url.startsWith("http")) {
            let label = obj.label || obj.quality || obj.type || "Original";
            // Normalisasi label
            label = label.replace(/_/g, " ").toUpperCase();
            if (label === "ORIGINAL") label = platform === 'tiktok' ? "HD NO WATERMARK" : "ORIGINAL";
            
            items.push({ 
              url: obj.url, 
              label, 
              type: obj.type || (obj.url.match(/\.(mp4)/) ? 'video' : obj.url.match(/\.(mp3|m4a)/) ? 'audio' : 'image')
            });
          }
          Object.values(obj).forEach(traverse);
        }
      };
      traverse(source);
    }
    
    // 3. Penyesuaian khusus per platform
    if (platform === "pinterest") {
      items = items.map(item => ({
        ...item,
        url: getPinterestOriginalUrl(item.url),
        label: "HD ORIGINAL QUALITY"
      }));
    }
    
    // Hilangkan duplikat berdasarkan URL
    return Array.from(new Map(items.map(item => [item.url, item])).values());
  };

  const handleDownload = async () => {
    if (!url) return;
    setIsLoading(true); setError(""); setMediaList([]);
    
    let platform = slug.replace("-downloader", "");
    if (platform === "all-media") platform = "aio";
    
    const apis = (API_CONFIG as any)[platform] || API_CONFIG.tiktok;
    let success = false;
    let lastError = "Gagal mengambil media.";

    // Loop melalui daftar API (Fallback Mechanism)
    for (let i = 0; i < apis.length; i++) {
      const api = apis[i];
      setLoadingMsg(`Mencoba server ${api.name}...`);
      
      try {
        let response;
        if (api.name === "Cobalt") {
          // Cobalt butuh POST
          response = await fetch(api.url(url), {
            method: 'POST',
            headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
            body: JSON.stringify({ url })
          });
        } else {
          response = await fetch(api.url(url));
        }

        if (!response.ok) throw new Error(`Server ${api.name} menolak.`);
        const data = await response.json();
        
        const extracted = extractMediaFromRaw(data, platform);
        if (extracted.length > 0) {
          setMediaList(extracted);
          success = true;
          
          // Atur tab default
          if (extracted.some(m => m.type?.includes('audio'))) setActiveTab("audio");
          else if (extracted.some(m => m.type?.includes('video'))) setActiveTab("video");
          else setActiveTab("image");
          
          break; // Keluar dari loop jika berhasil
        } else {
          throw new Error(`Server ${api.name} tidak mengembalikan link.`);
        }
      } catch (err: any) {
        lastError = err.message;
        // Lanjut ke API berikutnya
      }
    }

    if (!success) {
      setError(`Semua server sedang sibuk atau link tidak valid. (Error: ${lastError})`);
    }
    
    setIsLoading(false);
    setLoadingMsg("");
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
        
        <div className="text-center space-y-3 relative pt-2">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-blue-500/20 blur-3xl rounded-full pointer-events-none"></div>
          <h3 className="font-extrabold text-2xl text-slate-800 dark:text-white relative z-10">
            {isPinterest ? "Pinterest HD" : "Media Downloader"}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-[280px] mx-auto relative z-10 leading-relaxed">
            {isPinterest ? "Sistem akan otomatis mengambil gambar resolusi asli." : 
             isTikTok ? "Dapatkan video HD tanpa watermark, audio MP3, atau slide foto." : 
             "Unduh media dengan kualitas maksimal secara instan."}
          </p>
        </div>

        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-500"></div>
          <div className="relative flex items-center bg-white dark:bg-slate-800 rounded-2xl p-1.5 shadow-sm border border-slate-100 dark:border-slate-700">
            <div className="pl-3 pr-2 text-slate-400"><LinkIcon className="w-5 h-5" /></div>
            <input
              type="url"
              placeholder="Tempel link di sini..."
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

        {isLoading && (
          <div className="space-y-4 pt-4 animate-pulse text-center">
            <div className="flex justify-center mb-2"><Loader2 className="w-8 h-8 text-blue-500 animate-spin" /></div>
            <p className="text-xs font-medium text-slate-500">{loadingMsg || "Memproses media..."}</p>
            <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-3xl w-full"></div>
            <div className="h-16 bg-slate-200 dark:bg-slate-800 rounded-2xl w-full"></div>
          </div>
        )}

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
              filteredMedia.map((media, idx) => (
                <div key={idx} className="space-y-3">
                  
                  {/* PERBAIKAN PREVIEW: Tanpa Letterbox, Tinggi Menyesuaikan Video */}
                  <div className="rounded-3xl overflow-hidden shadow-2xl bg-black/90 border border-slate-700/50 flex justify-center">
                    {activeTab === 'video' && (
                      <div className="relative w-full max-h-[450px] flex items-center justify-center bg-black">
                        <video src={media.url} controls playsInline className="w-full h-auto max-h-[450px] object-contain" />
                      </div>
                    )}
                    {activeTab === 'image' && (
                      <div className="relative bg-slate-900 flex items-center justify-center w-full max-h-[450px]">
                        <img src={media.url} alt="Preview" className={`w-full h-auto max-h-[450px] object-contain ${isPinterest ? 'contrast-105 saturate-105' : ''}`} />
                        {isPinterest && (
                          <div className="absolute top-3 left-3 bg-gradient-to-r from-red-500 to-orange-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-md shadow-lg flex items-center gap-1">
                            <Zap className="w-3 h-3" /> HD 1080p Original
                          </div>
                        )}
                      </div>
                    )}
                    {activeTab === 'audio' && (
                      <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-5 flex items-center gap-4 w-full">
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

                  {/* KARTU DOWNLOAD & OPSI */}
                  <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-lg border border-slate-100 dark:border-slate-700 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-0.5 text-[10px] font-extrabold rounded-md tracking-wider ${getBadgeStyle(media.label)}`}>
                            {isPinterest ? 'HD ORIGINAL' : 
                             media.label?.includes('HD') ? 'HD' : 
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
