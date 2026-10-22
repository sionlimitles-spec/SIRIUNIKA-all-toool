"use client";

import { useState, useEffect } from "react";
import QRCode from "qrcode";
import { 
  Download, Link as LinkIcon, AlertCircle, Loader2, 
  Image as ImageIcon, Video, Music, Sparkles, Copy, CheckCircle2,
  ShieldCheck, Zap, FileAudio, FileVideo, Star, Construction
} from "lucide-react";

type ApiMediaItem = { label?: string; type?: string; url: string; size?: string; isHD?: boolean; };
type ApiResponse = { success?: boolean; normalized?: { media?: ApiMediaItem[]; }; error?: { message: string }; data?: any; result?: any; status?: string; url?: string; };

// KONFIGURASI MULTI-API (FALLBACK)
const API_CONFIG: Record<string, { name: string, url: (u: string) => string, method?: string }[]> = {
  tiktok: [
    { name: "TikWM", url: (u) => `https://www.tikwm.com/api/?url=${encodeURIComponent(u)}` },
    { name: "BTCH", url: (u) => `https://btch-downloader-api-green.vercel.app/api/download/tiktok?url=${encodeURIComponent(u)}` },
  ],
  youtube: [
    { name: "Cobalt", url: () => `https://api.cobalt.tools/api/json`, method: "POST" },
    { name: "Vevioz (MP3)", url: (u) => `https://api.vevioz.com/api/button/mp3/${u.split('v=')[1]?.split('&')[0] || u.split('/').pop()}` },
    { name: "BTCH", url: (u) => `https://btch-downloader-api-green.vercel.app/api/download/youtube?url=${encodeURIComponent(u)}` }
  ],
  instagram: [
    { name: "Snapinsta", url: (u) => `https://api.snapinsta.app/api/instagram?url=${encodeURIComponent(u)}` },
    { name: "BTCH", url: (u) => `https://btch-downloader-api-green.vercel.app/api/download/instagram?url=${encodeURIComponent(u)}` }
  ],
  pinterest: [
    { name: "BTCH", url: (u) => `https://btch-downloader-api-green.vercel.app/api/download/pinterest?url=${encodeURIComponent(u)}` }
  ],
  spotify: [
    { name: "BTCH", url: (u) => `https://btch-downloader-api-green.vercel.app/api/download/spotify?url=${encodeURIComponent(u)}` }
  ],
  aio: [ // All Media
    { name: "Cobalt AIO", url: () => `https://api.cobalt.tools/api/json`, method: "POST" },
    { name: "BTCH AIO", url: (u) => `https://btch-downloader-api-green.vercel.app/api/download/aio?url=${encodeURIComponent(u)}` }
  ]
};

const getBadgeStyle = (label: string = "") => {
  const l = label.toLowerCase();
  if (l.includes('hd')) return "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-red-500/30";
  if (l.includes('nowm') || l.includes('no watermark')) return "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-green-500/30";
  if (l.includes('mp3') || l.includes('audio')) return "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-purple-500/30";
  return "bg-blue-500 text-white";
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

  const supportedDownloaders = [
    "tiktok-downloader", "youtube-downloader", "instagram-downloader", 
    "spotify-downloader", "all-media-downloader", "pinterest-downloader"
  ];
  const isDownloader = supportedDownloaders.includes(slug);

  const extractMediaFromRaw = (raw: any, platform: string): ApiMediaItem[] => {
    let items: ApiMediaItem[] = [];
    
    // --- LOGIKA TIKTOK ---
    if (platform === "tiktok" && raw.data) {
      const d = raw.data;
      if (d.play) items.push({ url: d.play, label: "No Watermark (Standar)", type: "video", size: d.size ? (d.size/1024/1024).toFixed(1)+" MB" : "" });
      if (d.hdplay) {
        items.push({ url: d.hdplay, label: "No Watermark + HD", type: "video", isHD: true });
      } else if (d.play) {
        const hdUrl = d.play.includes('?') ? `${d.play}&hd=1` : `${d.play}?hd=1`;
        items.push({ url: hdUrl, label: "No Watermark + HD", type: "video", isHD: true });
      }
      if (d.music || d.music_info?.play) items.push({ url: d.music || d.music_info.play, label: "Audio MP3", type: "audio" });
    }
    // --- LOGIKA PINTEREST ---
    else if (platform === "pinterest") {
      const source = raw.normalized?.media || raw.data || raw.result || [];
      const traverse = (obj: any) => {
        if (obj && typeof obj === "object") {
          if (typeof obj.url === "string" && obj.url.startsWith("http")) {
            const originalUrl = obj.url.replace(/\/(236x|474x|564x|736x|1200x)\//, '/originals/');
            items.push({ url: obj.url, label: "Ukuran Asli", type: "image" });
            if (originalUrl !== obj.url) items.push({ url: originalUrl, label: "HD 1080p", type: "image", isHD: true });
          }
          Object.values(obj).forEach(traverse);
        }
      };
      traverse(source);
    }
    // --- LOGIKA COBALT (YouTube / AIO) ---
    else if (raw.status === "success" || raw.url) {
      // Cobalt mengembalikan { status: "success", url: "..." } atau { status: "success", picker: [...] }
      if (raw.picker && Array.isArray(raw.picker)) {
         raw.picker.forEach((p: any) => {
            items.push({ url: p.url, label: p.type === 'audio' ? 'Audio MP3' : 'Video MP4', type: p.type });
         });
      } else if (raw.url) {
         items.push({ url: raw.url, label: platform === 'youtube' ? 'Video / Audio' : 'Original Media', type: raw.url.includes('.mp3') ? 'audio' : 'video' });
      }
    }
    // --- LOGIKA VEVI0Z (YouTube MP3) ---
    else if (raw.success && typeof raw === 'string' && raw.includes('mp3')) {
      items.push({ url: raw, label: "Audio MP3 (HQ)", type: "audio" });
    }
    // --- LOGIKA BTCH / UMUM ---
    else {
      if (raw.normalized?.media && Array.isArray(raw.normalized.media)) {
        items = raw.normalized.media.map((m: any) => ({
          url: m.url, label: m.label || m.type || "Original Quality", type: m.type || (m.url.match(/\.(mp4)/) ? 'video' : m.url.match(/\.(mp3|m4a)/) ? 'audio' : 'image')
        }));
      } else if (raw.data || raw.result) {
        const traverse = (obj: any) => {
          if (obj && typeof obj === "object") {
            if (typeof obj.url === "string" && obj.url.startsWith("http")) {
              items.push({ url: obj.url, label: obj.label || obj.quality || "Original Quality", type: obj.type || (obj.url.match(/\.(mp4)/) ? 'video' : obj.url.match(/\.(mp3)/) ? 'audio' : 'image') });
            }
            Object.values(obj).forEach(traverse);
          }
        };
        traverse(raw.data || raw.result);
      }
    }
    
    return Array.from(new Map(items.map(item => [item.url, item])).values());
  };

  const handleDownload = async () => {
    if (!url) return;
    setIsLoading(true); setError(""); setMediaList([]);
    
    let platform = slug.replace("-downloader", "");
    if (platform === "all-media") platform = "aio";
    
    const apis = API_CONFIG[platform];
    if (!apis) {
      setError("Platform belum didukung.");
      setIsLoading(false);
      return;
    }

    let success = false;
    let lastError = "Gagal mengambil media.";

    for (let i = 0; i < apis.length; i++) {
      const api = apis[i];
      setLoadingMsg(`Mencoba server ${api.name}...`);
      
      try {
        const fetchOptions: RequestInit = { method: api.method || "GET" };
        if (api.method === "POST") {
          fetchOptions.headers = { 'Accept': 'application/json', 'Content-Type': 'application/json' };
          fetchOptions.body = JSON.stringify({ url: url, vQuality: "1080" }); // Minta kualitas 1080p ke Cobalt
        }

        const response = await fetch(api.url(url), fetchOptions);
        if (!response.ok) throw new Error(`Server ${api.name} sibuk.`);
        
        // Cek jika response berupa text (Vevioz)
        const textData = await response.text();
        let data: any;
        try {
          data = JSON.parse(textData);
        } catch {
          // Jika bukan JSON, mungkin Vevioz mengembalikan string link langsung
          if (textData.includes('http') && textData.includes('mp3')) {
             data = { success: true, link: textData.match(/https?:\/\/[^\s"']+/)?.[0] || textData };
          } else {
             throw new Error(`Format response tidak dikenali.`);
          }
        }
        
        const extracted = extractMediaFromRaw(data, platform);
        
        if (extracted.length > 0) {
          setMediaList(extracted);
          success = true;
          if (extracted.some(m => m.type?.includes('audio'))) setActiveTab("audio");
          else if (extracted.some(m => m.type?.includes('video'))) setActiveTab("video");
          else setActiveTab("image");
          break; 
        } else {
          throw new Error(`Tidak ada link ditemukan di server ${api.name}`);
        }
      } catch (err: any) {
        lastError = err.message;
      }
    }

    if (!success) setError(`Semua server gagal. (${lastError}). Link mungkin diprivate atau server API sedang down.`);
    setIsLoading(false);
  };

  // --- UI DOWNLOADER ---
  if (isDownloader) {
    const isTikTok = slug === "tiktok-downloader";
    const isPinterest = slug === "pinterest-downloader";
    const isSpotify = slug === "spotify-downloader";

    const filteredMedia = mediaList.filter(m => {
      if (activeTab === "video") return m.type?.includes('video') || m.url.includes('.mp4');
      if (activeTab === "audio") return m.type?.includes('audio') || m.url.includes('.mp3') || m.url.includes('.m4a');
      return m.type?.includes('image') || m.url.match(/\.(jpg|jpeg|png|webp)/i);
    });

    const hasMultipleTypes = new Set(mediaList.map(m => m.type?.includes('video') ? 'video' : m.type?.includes('audio') ? 'audio' : 'image')).size > 1;

    return (
      <div className="space-y-6 pb-10 animate-fade-in-up">
        <div className="text-center space-y-2 relative pt-2">
          <h3 className="font-extrabold text-2xl text-slate-800 dark:text-white relative z-10 capitalize">
            {slug.replace("-downloader", "").replace("-", " ")} Downloader
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-[280px] mx-auto relative z-10 leading-relaxed">
            {isPinterest ? "Unduh gambar resolusi asli atau versi HD (1080p)." : 
             isSpotify ? "Unduh lagu favoritmu dalam format MP3." :
             "Sistem akan otomatis mencari kualitas video/audio terbaik."}
          </p>
        </div>

        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-500"></div>
          <div className="relative flex items-center bg-white dark:bg-slate-800 rounded-2xl p-1.5 shadow-sm border border-slate-100 dark:border-slate-700">
            <div className="pl-3 pr-2 text-slate-400"><LinkIcon className="w-5 h-5" /></div>
            <input type="url" placeholder="Tempel link di sini..." className="flex-1 bg-transparent py-2 text-sm focus:outline-none placeholder:text-slate-400 font-medium" value={url} onChange={(e) => setUrl(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleDownload()} />
            <button onClick={handleDownload} disabled={isLoading || !url} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-blue-500/30 active:scale-95">
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
            <p className="text-xs font-medium text-slate-500">{loadingMsg || "Memproses..."}</p>
            <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-3xl w-full"></div>
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

            <div className="rounded-3xl overflow-hidden shadow-lg bg-black/90 border border-slate-700/50 flex justify-center">
              {activeTab === 'video' && filteredMedia[0] && <video src={filteredMedia[0].url} controls playsInline className="w-full h-auto max-h-[300px] object-contain" />}
              {activeTab === 'image' && filteredMedia[0] && <img src={filteredMedia[0].url} alt="Preview" className="w-full h-auto max-h-[300px] object-contain" />}
              {activeTab === 'audio' && filteredMedia[0] && (
                <div className="w-full p-6 flex flex-col items-center justify-center bg-gradient-to-r from-slate-800 to-slate-900">
                  <Music className="w-12 h-12 text-purple-400 mb-2 animate-bounce" />
                  <p className="text-sm font-bold text-white">Audio Preview</p>
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pilih Kualitas Unduhan</h4>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {filteredMedia.map((media, idx) => (
                  <div key={idx} className="p-4 flex flex-col gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        {media.isHD ? <Star className="w-4 h-4 text-orange-500 fill-orange-500" /> : activeTab === 'video' ? <ShieldCheck className="w-4 h-4 text-green-500" /> : <ImageIcon className="w-4 h-4 text-blue-500" />}
                        <p className="text-sm font-bold text-slate-800 dark:text-white line-clamp-1">{media.label}</p>
                      </div>
                      <span className={`px-2 py-1 text-[10px] font-extrabold rounded-md uppercase tracking-wider shadow-sm ${getBadgeStyle(media.label)}`}>
                        {media.isHD ? 'HD' : media.label?.includes('HD') ? 'HD' : media.label?.includes('NOWM') || media.label?.includes('No Watermark') ? 'No WM' : activeTab === 'audio' ? 'MP3' : 'IMG'}
                      </span>
                    </div>
                    <a href={media.url} target="_blank" rel="noopener noreferrer" className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 active:scale-95 transition-all shadow-md ${media.isHD ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white' : 'bg-slate-900 dark:bg-blue-600 text-white'}`}>
                      <Download className="w-4 h-4" /> Unduh {media.isHD ? 'Versi HD' : 'Sekarang'}
                    </a>
                  </div>
                ))}
              </div>
            </div>
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

  // --- UI SEGERA HADIR ---
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 animate-fade-in-up">
      <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
        <Construction className="w-10 h-10 text-slate-400" />
      </div>
      <h2 className="text-xl font-bold text-slate-800 dark:text-white">Segera Hadir</h2>
      <p className="text-sm text-slate-500 max-w-[250px]">
        Fitur ini sedang dalam tahap pengembangan. Nantikan update selanjutnya!
      </p>
    </div>
  );
}
