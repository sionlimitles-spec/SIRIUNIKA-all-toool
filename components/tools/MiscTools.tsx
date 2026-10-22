"use client";

import { useState, useEffect } from "react";
import QRCode from "qrcode";
import { 
  Download, Link as LinkIcon, AlertCircle, Loader2, 
  Image as ImageIcon, Video, Music, Copy, CheckCircle2,
  Star, Construction, ClipboardPaste, Headphones
} from "lucide-react";

// ====================================================================
// ✅ URL CLOUDFLARE WORKER KAMU SUDAH DIPASANG DI SINI
const WORKER_URL = "https://shiriunika-proxy.sionlimitles.workers.dev"; 
// ====================================================================

type ApiMediaItem = { label?: string; type?: string; url: string; size?: string; isHD?: boolean; thumbnail?: string; artist?: string; title?: string; };

// Helper Simpan Riwayat (LocalStorage)
const saveToHistory = (platform: string, url: string, title: string, thumbnail?: string) => {
  try {
    const history = JSON.parse(localStorage.getItem('shiriunika_history') || '[]');
    const filtered = history.filter((h: any) => h.url !== url);
    filtered.unshift({ id: Date.now(), platform, url, title, thumbnail, date: new Date().toISOString() });
    localStorage.setItem('shiriunika_history', JSON.stringify(filtered.slice(0, 10))); 
  } catch (e) {}
};

// SEMUA API DIBUNGKUS DENGAN WORKER
const API_CONFIG: Record<string, { name: string, url: (u: string) => string }[]> = {
  tiktok: [
    { name: "TikWM", url: (u) => `${WORKER_URL}/?url=${encodeURIComponent(`https://www.tikwm.com/api/?url=${u}`)}` },
    { name: "BTCH", url: (u) => `${WORKER_URL}/?url=${encodeURIComponent(`https://btch-downloader-api-green.vercel.app/api/download/tiktok?url=${u}`)}` },
  ],
  youtube: [
    { name: "BTCH", url: (u) => `${WORKER_URL}/?url=${encodeURIComponent(`https://btch-downloader-api-green.vercel.app/api/download/youtube?url=${u}`)}` }
  ],
  instagram: [
    { name: "BTCH", url: (u) => `${WORKER_URL}/?url=${encodeURIComponent(`https://btch-downloader-api-green.vercel.app/api/download/instagram?url=${u}`)}` }
  ],
  pinterest: [
    { name: "BTCH", url: (u) => `${WORKER_URL}/?url=${encodeURIComponent(`https://btch-downloader-api-green.vercel.app/api/download/pinterest?url=${u}`)}` }
  ],
  spotify: [
    { name: "SpotifyDown", url: (u) => `${WORKER_URL}/?url=${encodeURIComponent(`https://api.spotifydown.com/download/${u.split('/').pop()?.split('?')[0]}`)}` }
  ],
  aio: [
    { name: "BTCH AIO", url: (u) => `${WORKER_URL}/?url=${encodeURIComponent(`https://btch-downloader-api-green.vercel.app/api/download/aio?url=${u}`)}` }
  ]
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
  const [spotifyData, setSpotifyData] = useState<{ title: string, artist: string, thumbnail: string, tracks: any[] } | null>(null);

  useEffect(() => {
    if (slug === "qr-generator" && text) {
      QRCode.toDataURL(text, { margin: 2, width: 400, color: { dark: "#0f172a", light: "#ffffff" } }, (err, url) => { if (!err) setQrUrl(url); });
    }
  }, [text, slug]);

  const supportedDownloaders = [
    "tiktok-downloader", "youtube-downloader", "instagram-downloader", 
    "spotify-downloader", "all-media-downloader", "pinterest-downloader"
  ];
  const isDownloader = supportedDownloaders.includes(slug);

  // Fitur Auto Paste Clipboard
  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) setUrl(text);
    } catch (err) { alert("Browser memblokir akses clipboard. Silakan tempel manual."); }
  };

  // LOGIKA SPOTIFY (Track / Album / Playlist)
  const fetchSpotify = async (inputUrl: string) => {
    setIsLoading(true); setError(""); setMediaList([]); setSpotifyData(null);
    try {
      const isTrack = inputUrl.includes("/track/");
      const isAlbum = inputUrl.includes("/album/");
      const isPlaylist = inputUrl.includes("/playlist/");
      if (!isTrack && !isAlbum && !isPlaylist) throw new Error("Link Spotify tidak valid.");
      
      const id = inputUrl.split(isTrack ? "/track/" : isAlbum ? "/album/" : "/playlist/")[1]?.split("?")[0];
      if (!id) throw new Error("ID Spotify tidak ditemukan.");

      const targetApi = `https://api.spotifydown.com/${isTrack ? 'download' : 'metadata/' + (isAlbum ? 'album' : 'playlist')}/${id}`;
      const apiUrl = `${WORKER_URL}/?url=${encodeURIComponent(targetApi)}`;
      
      const res = await fetch(apiUrl);
      const data = await res.json();

      if (isTrack) {
        if (data.success && data.link) {
          setMediaList([{ 
            url: data.link, 
            label: "Audio MP3 (320kbps)", 
            type: "audio", 
            title: data.metadata?.title, 
            artist: data.metadata?.artists, 
            thumbnail: data.metadata?.cover 
          }]);
          saveToHistory("Spotify", inputUrl, data.metadata?.title || "Spotify Track", data.metadata?.cover);
        } else throw new Error("Gagal mendapatkan link MP3.");
      } else {
        if (!data.success) throw new Error("Gagal mengambil metadata album/playlist.");
        setSpotifyData({
          title: data.metadata?.title || "Unknown Album",
          artist: data.metadata?.artists || "Various Artists",
          thumbnail: data.metadata?.cover || "",
          tracks: data.trackList || []
        });
        setActiveTab("audio");
        saveToHistory("Spotify", inputUrl, data.metadata?.title || "Spotify Collection", data.metadata?.cover);
      }
    } catch (err: any) { setError(err.message || "Gagal mengambil data Spotify."); } finally { setIsLoading(false); }
  };

  const handleDownload = async () => {
    if (!url) return;
    
    // Jika yang diklik adalah tool Spotify
    if (slug === "spotify-downloader") return fetchSpotify(url);

    setIsLoading(true); setError(""); setMediaList([]);
    
    let platform = slug.replace("-downloader", "");
    if (platform === "all-media") platform = "aio";
    
    const apis = API_CONFIG[platform];
    if (!apis) { setError("Platform belum didukung."); setIsLoading(false); return; }

    let success = false;
    let lastError = "Gagal mengambil media.";

    for (let i = 0; i < apis.length; i++) {
      const api = apis[i];
      setLoadingMsg(`Menghubungkan ke ${api.name}...`);
      try {
        const response = await fetch(api.url(url));
        if (!response.ok) throw new Error(`Server sibuk`);
        const data = await response.json();
        
        let items: ApiMediaItem[] = [];
        
        // Parsing khusus TikTok
        if (platform === "tiktok" && data.data) {
           const d = data.data;
           if (d.play) items.push({ url: d.play, label: "No Watermark", type: "video" });
           if (d.hdplay || d.play) items.push({ url: d.hdplay || `${d.play}?hd=1`, label: "HD + No Watermark", type: "video", isHD: true });
           if (d.images) d.images.forEach((img: string, i: number) => items.push({ url: img, label: `Slide ${i+1}`, type: "image" }));
           if (d.music) items.push({ url: d.music, label: "Audio MP3", type: "audio" });
        } 
        // Parsing Universal
        else if (data.normalized?.media) {
           items = data.normalized.media.map((m: any) => ({ url: m.url, label: m.label || m.type, type: m.type }));
        } else if (data.url) {
           items.push({ url: data.url, label: "Video / Audio", type: data.url.includes('.mp3') ? 'audio' : 'video' });
        }

        if (items.length > 0) {
          setMediaList(items);
          success = true;
          saveToHistory(platform, url, `Media ${platform}`);
          
          if (items.some(m => m.type?.includes('audio'))) setActiveTab("audio");
          else if (items.some(m => m.type?.includes('video'))) setActiveTab("video");
          else setActiveTab("image");
          
          break; 
        } else throw new Error(`Tidak ada link`);
      } catch (err: any) { lastError = err.message; }
    }
    
    if (!success) setError(`Gagal: ${lastError}. Pastikan link publik.`);
    setIsLoading(false);
  };

  // Fitur Download Semua Slide
  const handleDownloadAll = async (medias: ApiMediaItem[]) => {
    for (let i = 0; i < medias.length; i++) {
       window.open(medias[i].url, '_blank');
       await new Promise(r => setTimeout(r, 800));
    }
  };

  if (isDownloader) {
    const isSpotify = slug === "spotify-downloader";
    const isTikTok = slug === "tiktok-downloader";

    const filteredMedia = mediaList.filter(m => {
      if (activeTab === "video") return m.type?.includes('video') || m.url.includes('.mp4');
      if (activeTab === "audio") return m.type?.includes('audio') || m.url.includes('.mp3');
      return m.type?.includes('image') || m.url.match(/\.(jpg|jpeg|png|webp)/i);
    });

    const hasMultipleTypes = new Set(mediaList.map(m => m.type?.includes('video') ? 'video' : m.type?.includes('audio') ? 'audio' : 'image')).size > 1;

    return (
      <div className="space-y-6 pb-10 animate-fade-in-up">
        <div className="text-center space-y-2 relative pt-2">
          <h3 className="font-extrabold text-2xl text-slate-800 dark:text-white capitalize">
            {slug.replace("-downloader", "").replace("-", " ")} Downloader
          </h3>
          <p className="text-xs text-slate-500 max-w-[280px] mx-auto">
            {isSpotify ? "Unduh lagu, album, atau playlist Spotify ke MP3." : "Pilih unduhan tanpa watermark (No WM) atau kualitas HD."}
          </p>
        </div>

        {/* Input dengan tombol Paste */}
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
            <button onClick={handlePaste} title="Tempel dari Clipboard" className="p-2 text-slate-400 hover:text-blue-500 transition-colors">
              <ClipboardPaste className="w-5 h-5" />
            </button>
            <button onClick={handleDownload} disabled={isLoading || !url} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg active:scale-95">
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Cari"}
            </button>
          </div>
        </div>

        {error && <div className="p-4 bg-red-50 text-red-600 text-xs rounded-xl flex items-start gap-3 border border-red-100"><AlertCircle className="w-5 h-5 shrink-0" /><p>{error}</p></div>}
        
        {isLoading && (
          <div className="space-y-4 pt-4 animate-pulse text-center">
            <div className="flex justify-center mb-2"><Loader2 className="w-8 h-8 text-blue-500 animate-spin" /></div>
            <p className="text-xs font-medium text-slate-500">{loadingMsg}</p>
            <div className="h-48 bg-slate-200 dark:bg-slate-800 rounded-3xl w-full"></div>
          </div>
        )}

        {/* UI SPOTIFY PREMIUM (Album/Playlist) */}
        {isSpotify && spotifyData && !isLoading && (
          <div className="space-y-4 animate-fade-in-up">
            <div className="bg-gradient-to-b from-slate-800 to-black rounded-[2rem] p-6 shadow-2xl relative overflow-hidden">
               <div className="flex items-center gap-4 relative z-10">
                 <img src={spotifyData.thumbnail} className="w-24 h-24 rounded-xl shadow-lg" alt="cover" />
                 <div>
                    <p className="text-[10px] font-bold text-green-500 uppercase tracking-wider mb-1">Spotify {spotifyData.tracks.length > 1 ? 'Collection' : 'Track'}</p>
                    <h2 className="text-lg font-extrabold text-white line-clamp-2 leading-tight">{spotifyData.title}</h2>
                    <p className="text-xs text-slate-400 mt-1">{spotifyData.artist}</p>
                 </div>
               </div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center sticky top-0 z-10">
                <h4 className="text-xs font-bold text-slate-500 uppercase">Daftar Lagu ({spotifyData.tracks.length})</h4>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-700/50 max-h-[400px] overflow-y-auto">
                {spotifyData.tracks.map((track: any, idx: number) => (
                  <div key={idx} className="p-3 flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <span className="text-xs font-bold text-slate-400 w-4">{idx + 1}</span>
                      <img src={track.cover} className="w-10 h-10 rounded-md shrink-0" alt="" />
                      <div className="truncate">
                        <p className="text-xs font-bold text-slate-800 dark:text-white truncate">{track.title}</p>
                        <p className="text-[10px] text-slate-500 truncate">{track.artists}</p>
                      </div>
                    </div>
                    <button onClick={() => fetchSpotify(`https://open.spotify.com/track/${track.id}`)} className="p-2 bg-slate-900 dark:bg-blue-600 text-white rounded-lg shrink-0 hover:bg-black transition-colors"><Download className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* UI DOWNLOADER UMUM & PREVIEW */}
        {!isLoading && mediaList.length > 0 && (
          <div className="space-y-6 animate-fade-in-up">
            
            {hasMultipleTypes && (
              <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl">
                {mediaList.some(m => m.type?.includes('video') || m.url.includes('.mp4')) && (
                  <button onClick={() => setActiveTab("video")} className={`flex-1 py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 ${activeTab === 'video' ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600' : 'text-slate-500'}`}><Video className="w-4 h-4" /> Video</button>
                )}
                {mediaList.some(m => m.type?.includes('audio') || m.url.includes('.mp3')) && (
                  <button onClick={() => setActiveTab("audio")} className={`flex-1 py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 ${activeTab === 'audio' ? 'bg-white dark:bg-slate-700 shadow-sm text-purple-600' : 'text-slate-500'}`}><Music className="w-4 h-4" /> Audio</button>
                )}
                {mediaList.some(m => m.type?.includes('image')) && (
                  <button onClick={() => setActiveTab("image")} className={`flex-1 py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 ${activeTab === 'image' ? 'bg-white dark:bg-slate-700 shadow-sm text-orange-600' : 'text-slate-500'}`}><ImageIcon className="w-4 h-4" /> Gambar</button>
                )}
              </div>
            )}

            {!isSpotify && (
              <div className="rounded-3xl overflow-hidden shadow-2xl bg-black/90 flex justify-center">
                {activeTab === 'video' && filteredMedia[0] && <video src={filteredMedia[0].url} controls playsInline className="w-full max-h-[300px] object-contain" />}
                {activeTab === 'image' && filteredMedia[0] && <img src={filteredMedia[0].url} alt="Preview" className="w-full max-h-[300px] object-contain" />}
              </div>
            )}

            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden">
              <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                <h4 className="text-xs font-bold text-slate-500 uppercase">Pilih Kualitas</h4>
                {isTikTok && activeTab === 'image' && filteredMedia.length > 1 && (
                  <button onClick={() => handleDownloadAll(filteredMedia)} className="text-[10px] bg-blue-600 text-white font-bold px-3 py-1.5 rounded-lg shadow-md active:scale-95 transition-all flex items-center gap-1">
                    <Download className="w-3 h-3" /> Unduh Semua
                  </button>
                )}
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {filteredMedia.map((media, idx) => (
                  <div key={idx} className="p-4 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold text-slate-800 dark:text-white line-clamp-1">{media.label}</p>
                      <span className="px-2 py-1 text-[10px] font-bold rounded bg-slate-100 dark:bg-slate-700 text-slate-600">{media.isHD ? 'HD' : media.type === 'audio' ? 'MP3' : 'FILE'}</span>
                    </div>
                    <a href={media.url} target="_blank" rel="noopener noreferrer" className={`w-full py-2.5 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 active:scale-95 shadow-md ${isSpotify ? 'bg-green-500 hover:bg-green-600 text-black' : 'bg-slate-900 dark:bg-blue-600'}`}>
                      <Download className="w-4 h-4" /> Unduh File
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

  if (slug === "qr-generator") {
    return (
      <div className="space-y-6 flex flex-col items-center animate-fade-in-up pb-10">
        <div className="w-full">
          <input type="text" placeholder="Ketik URL / Teks..." className="w-full p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm text-sm font-medium" value={text} onChange={(e) => setText(e.target.value)} />
        </div>
        {qrUrl && (
          <div className="p-5 bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-700 flex flex-col items-center w-full max-w-[280px]">
            <img src={qrUrl} alt="QR Code" className="w-full aspect-square rounded-xl mb-4" />
            <a href={qrUrl} download="qrcode.png" className="flex items-center justify-center gap-2 w-full py-3 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-lg"><Download className="w-4 h-4" /> Simpan QR</a>
          </div>
        )}
      </div>
    );
  }

  return <div className="flex flex-col items-center justify-center py-20 text-center space-y-4"><Construction className="w-10 h-10 text-slate-400" /><h2 className="text-xl font-bold text-slate-800 dark:text-white">Segera Hadir</h2></div>;
}
