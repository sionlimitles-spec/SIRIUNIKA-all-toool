"use client";

import { useState, useEffect, useRef } from "react";
import QRCode from "qrcode";
import { 
  Download, Link as LinkIcon, AlertCircle, Loader2, 
  Image as ImageIcon, Video, Music, Star, Construction, ClipboardPaste,
  Zap, MonitorPlay, ShieldAlert
} from "lucide-react";

const WORKER_URL = "https://shiriunika-proxy.sionlimitles.workers.dev"; 

type ApiMediaItem = { label?: string; type?: string; url: string; size?: string; isHD?: boolean; thumbnail?: string; artist?: string; title?: string; };

const saveToHistory = (platform: string, url: string, title: string, thumbnail?: string) => {
  try {
    const history = JSON.parse(localStorage.getItem('shiriunika_history') || '[]');
    const filtered = history.filter((h: any) => h.url !== url);
    filtered.unshift({ id: Date.now(), platform, url, title, thumbnail, date: new Date().toISOString() });
    localStorage.setItem('shiriunika_history', JSON.stringify(filtered.slice(0, 10))); 
  } catch (e) {}
};

// ==========================================
// KONFIGURASI API (TIKTOK PAKAI 2 API)
// ==========================================
const API_CONFIG: Record<string, { name: string, url: (u: string) => string }[]> = {
  tiktok: [
    { name: "TikWM", url: (u) => `${WORKER_URL}/?url=${encodeURIComponent(`https://www.tikwm.com/api/?url=${u}`)}` },
    { name: "Tiklydown", url: (u) => `${WORKER_URL}/?url=${encodeURIComponent(`https://api.tiklydown.eu.org/api/download?url=${u}`)}` }
  ],
  youtube: [
    { name: "Vevioz", url: (u) => {
        const id = u.split('v=')[1]?.split('&')[0] || u.split('/').pop()?.split('?')[0];
        return `${WORKER_URL}/?url=${encodeURIComponent(`https://api.vevioz.com/api/button/mp3/${id}`)}`;
      } 
    }
  ],
  instagram: [
    { name: "Snapinsta", url: (u) => `${WORKER_URL}/?url=${encodeURIComponent(`https://api.snapinsta.app/api/instagram?url=${u}`)}` }
  ],
  pinterest: [
    { name: "PinterestAPI", url: (u) => `${WORKER_URL}/?url=${encodeURIComponent(`https://api.pinterestvideodownloader.com/api/?url=${u}`)}` }
  ],
  spotify: [
    { name: "SpotifyDown", url: (u) => `${WORKER_URL}/?url=${encodeURIComponent(`https://api.spotifydown.com/download/${u.split('/').pop()?.split('?')[0]}`)}` }
  ],
  aio: [
    { name: "Vevioz AIO", url: (u) => {
        const id = u.split('v=')[1]?.split('&')[0] || u.split('/').pop()?.split('?')[0];
        return `${WORKER_URL}/?url=${encodeURIComponent(`https://api.vevioz.com/api/button/videos/${id}`)}`;
      } 
    }
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
  const [spotifyData, setSpotifyData] = useState<{ title: string, artist: string, thumbnail: string, tracks: any[] } | null>(null);

  const [isUpscaling, setIsUpscaling] = useState(false);
  const [upscaleError, setUpscaleError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const webSRRef = useRef<any>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  useEffect(() => {
    if (slug === "qr-generator" && text) {
      QRCode.toDataURL(text, { margin: 2, width: 400, color: { dark: "#0f172a", light: "#ffffff" } }, (err, url) => { if (!err) setQrUrl(url); });
    }
  }, [text, slug]);

  const supportedDownloaders = ["tiktok-downloader", "youtube-downloader", "instagram-downloader", "spotify-downloader", "all-media-downloader", "pinterest-downloader"];
  const isDownloader = supportedDownloaders.includes(slug);

  const handlePaste = async () => {
    try { const text = await navigator.clipboard.readText(); if (text) setUrl(text); } catch (err) { alert("Akses clipboard ditolak."); }
  };

  const fetchSpotify = async (inputUrl: string) => {
    setIsLoading(true); setError(""); setMediaList([]); setSpotifyData(null);
    try {
      const isTrack = inputUrl.includes("/track/");
      const isAlbum = inputUrl.includes("/album/");
      const isPlaylist = inputUrl.includes("/playlist/");
      if (!isTrack && !isAlbum && !isPlaylist) throw new Error("Link Spotify tidak valid.");
      const id = inputUrl.split(isTrack ? "/track/" : isAlbum ? "/album/" : "/playlist/")[1]?.split("?")[0];
      
      const targetApi = `https://api.spotifydown.com/${isTrack ? 'download' : 'metadata/' + (isAlbum ? 'album' : 'playlist')}/${id}`;
      const res = await fetch(`${WORKER_URL}/?url=${encodeURIComponent(targetApi)}`);
      const data = await res.json();

      if (isTrack) {
        if (data.success && data.link) {
          setMediaList([{ url: data.link, label: "Audio MP3 (320kbps)", type: "audio", title: data.metadata?.title, artist: data.metadata?.artists, thumbnail: data.metadata?.cover }]);
          saveToHistory("Spotify", inputUrl, data.metadata?.title || "Track", data.metadata?.cover);
        } else throw new Error("Gagal mengambil MP3.");
      } else {
        if (!data.success) throw new Error("Gagal mengambil Album/Playlist.");
        setSpotifyData({ title: data.metadata?.title || "Unknown", artist: data.metadata?.artists || "Various", thumbnail: data.metadata?.cover || "", tracks: data.trackList || [] });
        setActiveTab("audio");
        saveToHistory("Spotify", inputUrl, data.metadata?.title || "Collection", data.metadata?.cover);
      }
    } catch (err: any) { setError(err.message); } finally { setIsLoading(false); }
  };

  const handleDownload = async () => {
    if (!url) return;
    if (slug === "spotify-downloader") return fetchSpotify(url);

    setIsLoading(true); setError(""); setMediaList([]);
    let platform = slug.replace("-downloader", ""); if (platform === "all-media") platform = "aio";
    const apis = API_CONFIG[platform];
    if (!apis) { setError("Platform belum didukung."); setIsLoading(false); return; }

    let success = false; let lastError = "Gagal.";

    for (let i = 0; i < apis.length; i++) {
      const api = apis[i]; setLoadingMsg(`Menghubungkan ke ${api.name}...`);
      try {
        const response = await fetch(api.url(url));
        if (!response.ok) throw new Error(`Server sibuk`);
        
        const textData = await response.text(); 
        let items: ApiMediaItem[] = [];

        // --- PARSING TIKTOK (TikWM & Tiklydown) ---
        if (platform === "tiktok") {
           try {
             const data = JSON.parse(textData);
             
             // Cek format TikWM
             if (data.data) {
               const d = data.data;
               if (d.play) items.push({ url: d.play, label: "No Watermark (Standar)", type: "video" });
               if (d.hdplay || d.play) items.push({ url: d.hdplay || `${d.play}?hd=1`, label: "No Watermark + HD", type: "video", isHD: true });
               if (d.music || d.music_info?.play) items.push({ url: d.music || d.music_info.play, label: "Audio MP3", type: "audio" });
               if (d.images) d.images.forEach((img: string, i: number) => items.push({ url: img, label: `Slide ${i+1}`, type: "image" }));
             } 
             // Cek format Tiklydown
             else if (data.video || data.music) {
               if (data.video?.noWatermark) items.push({ url: data.video.noWatermark, label: "No Watermark", type: "video" });
               if (data.video?.noWatermarkHd) items.push({ url: data.video.noWatermarkHd, label: "No Watermark + HD", type: "video", isHD: true });
               if (data.music?.play) items.push({ url: data.music.play, label: "Audio MP3", type: "audio" });
             }
             // Jika API mengembalikan error message
             else if (data.msg || data.message) {
               throw new Error(data.msg || data.message);
             }
           } catch (e) {
             // Jika bukan JSON atau gagal parse
             throw new Error("API mengembalikan format yang tidak dikenali.");
           }
        } 
        // --- PARSING YOUTUBE (Vevioz) ---
        else if (api.name.includes("Vevioz")) {
           const mp3Match = textData.match(/href="(https:\/\/[^"]+\.mp3[^"]*)"/i);
           const mp4Match = textData.match(/href="(https:\/\/[^"]+\.mp4[^"]*)"/i);
           
           if (mp3Match && mp3Match[1]) items.push({ url: mp3Match[1], label: "Audio MP3 (Vevioz)", type: "audio" });
           if (mp4Match && mp4Match[1]) items.push({ url: mp4Match[1], label: "Video MP4 (Vevioz)", type: "video" });
           
           if (items.length === 0) throw new Error("Gagal mengekstrak link. Pastikan link YouTube valid.");
        }
        // --- PARSING UNIVERSAL (IG, Pinterest) ---
        else {
           const data = JSON.parse(textData);
           if (data.normalized?.media) {
              items = data.normalized.media.map((m: any) => ({ url: m.url, label: m.label || m.type, type: m.type }));
           } else if (data.url || data.link) {
              const finalUrl = data.url || data.link;
              items.push({ url: finalUrl, label: "Media File", type: finalUrl.includes('.mp3') ? 'audio' : 'video' });
           }
        }

        if (items.length > 0) {
          if (platform !== "tiktok") items = Array.from(new Map(items.map(item => [item.url, item])).values());
          setMediaList(items); success = true; saveToHistory(platform, url, `Media ${platform}`);
          if (items.some(m => m.type?.includes('video'))) setActiveTab("video");
          else if (items.some(m => m.type?.includes('audio'))) setActiveTab("audio");
          else setActiveTab("image");
          break; 
        } else throw new Error(`Tidak ada link ditemukan`);
      } catch (err: any) { lastError = err.message; }
    }
    if (!success) setError(`Gagal: ${lastError}.`);
    setIsLoading(false);
  };

  const handleDownloadAll = async (medias: ApiMediaItem[]) => {
    for (let i = 0; i < medias.length; i++) { window.open(medias[i].url, '_blank'); await new Promise(r => setTimeout(r, 800)); }
  };

  const startUpscaling = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    setIsUpscaling(true);
    setUpscaleError(null);

    try {
      if (!(navigator as any).gpu) throw new Error("Browser belum mendukung WebGPU.");
      
      const WebSRModule = await import(/* @vite-ignore */ "https://cdn.jsdelivr.net/npm/@websr/websr@0.0.4/dist/websr.esm.js" as any);
      const WebSR = (WebSRModule as any).default || (WebSRModule as any).WebSR || WebSRModule;
      if (typeof WebSR !== "function") throw new Error("Library WebSR gagal dimuat.");

      setLoadingMsg("Mengunduh model AI...");
      const weightsUrl = "https://raw.githubusercontent.com/sb2702/websr/main/weights/anime4k/cnn-2x-s.json";
      const weightsRes = await fetch(weightsUrl);
      if (!weightsRes.ok) throw new Error("Gagal mengunduh model AI.");
      const weights = await weightsRes.json();

      if (!isMounted.current) return;

      const gpu = await WebSR.initWebGPU();
      const websr = new WebSR({
        network_name: "anime4k/cnn-2x-s",
        weights: weights,
        gpu: gpu,
        canvas: canvasRef.current,
      });
      webSRRef.current = websr;

      videoRef.current.style.display = 'none';
      canvasRef.current.style.display = 'block';

      const renderFrame = async () => {
        if (!videoRef.current || !webSRRef.current || videoRef.current.paused || videoRef.current.ended) return;
        try {
          await webSRRef.current.render(videoRef.current);
          if (videoRef.current) videoRef.current.requestVideoFrameCallback(renderFrame);
        } catch (e) {}
      };
      videoRef.current.requestVideoFrameCallback(renderFrame);
      
    } catch (err: any) {
      const msg = err.message === "e.x is not a function" ? "Perangkat tidak didukung." : err.message;
      setUpscaleError(msg);
      if (videoRef.current) videoRef.current.style.display = 'block';
      if (canvasRef.current) canvasRef.current.style.display = 'none';
    } finally {
      if (isMounted.current) { setIsUpscaling(false); setLoadingMsg(""); }
    }
  };

  const stopUpscaling = () => {
    if (videoRef.current) videoRef.current.style.display = 'block';
    if (canvasRef.current) {
      canvasRef.current.style.display = 'none';
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
    webSRRef.current = null;
    setUpscaleError(null);
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
          <h3 className="font-extrabold text-2xl capitalize">{slug.replace("-downloader", "").replace("-", " ")}</h3>
          <p className="text-xs text-slate-500">{isSpotify ? "Unduh MP3 dari Spotify." : "Pilih unduhan tanpa watermark atau kualitas HD."}</p>
        </div>
        
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-pink-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition-opacity"></div>
          <div className="relative flex items-center bg-white dark:bg-slate-800 rounded-2xl p-1.5 shadow-sm border border-slate-100 dark:border-slate-700">
            <div className="pl-3 pr-2 text-slate-400"><LinkIcon className="w-5 h-5" /></div>
            <input type="url" placeholder="Tempel link di sini..." className="flex-1 bg-transparent py-2 text-sm focus:outline-none" value={url} onChange={(e) => setUrl(e.target.value)} />
            <button onClick={handlePaste} className="p-2 text-slate-400 hover:text-blue-500 transition-colors"><ClipboardPaste className="w-5 h-5" /></button>
            <button onClick={handleDownload} disabled={isLoading || !url} className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm active:scale-95 disabled:opacity-50 transition-transform">
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Cari"}
            </button>
          </div>
        </div>

        {error && <div className="p-4 bg-red-50 text-red-600 text-xs rounded-xl flex items-start gap-3 animate-in slide-in-from-top-2"><AlertCircle className="w-5 h-5 shrink-0" /><p>{error}</p></div>}
        
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-10 space-y-4">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 border-4 border-blue-100 dark:border-slate-700 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
              <Loader2 className="absolute inset-0 m-auto w-6 h-6 text-blue-600 animate-pulse" />
            </div>
            <p className="text-xs font-semibold text-slate-500 animate-pulse">{loadingMsg || "Memproses..."}</p>
          </div>
        )}

        {isSpotify && spotifyData && !isLoading && (
          <div className="space-y-4 animate-fade-in-up">
            <div className="bg-gradient-to-b from-slate-800 to-black rounded-[2rem] p-6 shadow-2xl flex items-center gap-4">
              <img src={spotifyData.thumbnail} className="w-24 h-24 rounded-xl shadow-lg" alt="cover" />
              <div><p className="text-[10px] font-bold text-green-500 uppercase">Spotify Collection</p><h2 className="text-lg font-extrabold text-white line-clamp-2">{spotifyData.title}</h2><p className="text-xs text-slate-400 mt-1">{spotifyData.artist}</p></div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl overflow-hidden border border-slate-100 dark:border-slate-700">
              <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between"><h4 className="text-xs font-bold text-slate-500">Daftar Lagu ({spotifyData.tracks.length})</h4></div>
              <div className="divide-y divide-slate-100 dark:divide-slate-700/50 max-h-[400px] overflow-y-auto">
                {spotifyData.tracks.map((track: any, idx: number) => (
                  <div key={idx} className="p-3 flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <span className="text-xs font-bold text-slate-400 w-4">{idx + 1}</span><img src={track.cover} className="w-10 h-10 rounded-md shrink-0" alt="" />
                      <div className="truncate"><p className="text-xs font-bold truncate">{track.title}</p><p className="text-[10px] text-slate-500 truncate">{track.artists}</p></div>
                    </div>
                    <button onClick={() => fetchSpotify(`https://open.spotify.com/track/${track.id}`)} className="p-2 bg-blue-600 text-white rounded-lg shrink-0 hover:bg-blue-700 active:scale-90 transition-transform"><Download className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {!isLoading && mediaList.length > 0 && (
          <div className="space-y-4 animate-fade-in-up">
            
            {hasMultipleTypes && (
              <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl relative">
                {mediaList.some(m => m.type?.includes('video') || m.url.includes('.mp4')) && (
                  <button onClick={() => { setActiveTab("video"); stopUpscaling(); }} className={`flex-1 py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all duration-300 ${activeTab === 'video' ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600 scale-105' : 'text-slate-500'}`}><Video className="w-4 h-4" /> Video</button>
                )}
                {mediaList.some(m => m.type?.includes('audio') || m.url.includes('.mp3')) && (
                  <button onClick={() => { setActiveTab("audio"); stopUpscaling(); }} className={`flex-1 py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all duration-300 ${activeTab === 'audio' ? 'bg-white dark:bg-slate-700 shadow-sm text-purple-600 scale-105' : 'text-slate-500'}`}><Music className="w-4 h-4" /> Audio</button>
                )}
                {mediaList.some(m => m.type?.includes('image')) && (
                  <button onClick={() => { setActiveTab("image"); stopUpscaling(); }} className={`flex-1 py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all duration-300 ${activeTab === 'image' ? 'bg-white dark:bg-slate-700 shadow-sm text-orange-600 scale-105' : 'text-slate-500'}`}><ImageIcon className="w-4 h-4" /> Gambar</button>
                )}
              </div>
            )}

            {!isSpotify && activeTab === 'video' && filteredMedia[0] && (
              <div className="relative rounded-2xl overflow-hidden bg-black flex flex-col justify-center shadow-lg border border-slate-700/50">
                <div className="relative w-full max-w-[280px] aspect-[9/16] mx-auto flex items-center justify-center bg-black">
                  <video ref={videoRef} src={filteredMedia[0].url} controls playsInline crossOrigin="anonymous" className="w-full h-full object-contain" />
                  <canvas ref={canvasRef} className="w-full h-full object-contain hidden" />
                </div>
                
                <div className="p-3 bg-slate-900/80 backdrop-blur-md border-t border-slate-700 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                    <Zap className="w-4 h-4 text-yellow-400" />
                    AI Upscaler (WebSR)
                  </div>
                  {!upscaleError ? (
                    <button 
                      onClick={isUpscaling ? undefined : (canvasRef.current?.style.display === 'block' ? stopUpscaling : startUpscaling)}
                      disabled={isUpscaling}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all active:scale-95 flex items-center gap-1.5 ${canvasRef.current?.style.display === 'block' ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md'}`}
                    >
                      {isUpscaling ? <Loader2 className="w-3 h-3 animate-spin" /> : <MonitorPlay className="w-3 h-3" />}
                      {isUpscaling ? 'Memuat AI...' : canvasRef.current?.style.display === 'block' ? 'Matikan AI' : 'Upscale AI 2x'}
                    </button>
                  ) : (
                    <div className="text-[10px] text-red-400 flex items-center gap-1">
                      <ShieldAlert className="w-3 h-3" /> {upscaleError}
                    </div>
                  )}
                </div>
              </div>
            )}

            {!isSpotify && activeTab === 'image' && filteredMedia[0] && (
              <div className="rounded-2xl overflow-hidden bg-black flex justify-center shadow-lg">
                <img src={filteredMedia[0].url} alt="Preview" className="w-full max-h-[350px] object-contain" />
              </div>
            )}

            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden">
              <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                <h4 className="text-xs font-bold text-slate-500 uppercase">Pilih Kualitas</h4>
                {isTikTok && activeTab === 'image' && filteredMedia.length > 1 && (
                  <button onClick={() => handleDownloadAll(filteredMedia)} className="text-[10px] bg-blue-600 text-white font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-blue-700 transition-colors"><Download className="w-3 h-3" /> Unduh Semua</button>
                )}
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {filteredMedia.map((media, idx) => (
                  <div key={idx} className="p-4 flex flex-col gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {media.isHD && <Star className="w-4 h-4 text-orange-500 fill-orange-500 animate-pulse" />}
                        <p className="text-sm font-bold line-clamp-1">{media.label}</p>
                      </div>
                      <span className={`px-2 py-1 text-[10px] font-bold rounded ${media.isHD ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 dark:bg-slate-700 text-slate-600'}`}>
                        {media.isHD ? 'HD' : media.type === 'audio' ? 'MP3' : media.type === 'video' ? 'MP4' : 'IMG'}
                      </span>
                    </div>
                    
                    <a href={media.url} target="_blank" rel="noopener noreferrer" className={`w-full py-2.5 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 active:scale-95 shadow-md transition-all ${media.isHD ? 'bg-gradient-to-r from-orange-500 to-red-500 animate-pulse-glow' : isSpotify ? 'bg-green-500 hover:bg-green-600 text-black' : 'bg-slate-900 dark:bg-blue-600 hover:bg-black dark:hover:bg-blue-700'}`}>
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
      <div className="space-y-6 flex flex-col items-center pb-10 animate-fade-in-up">
        <input type="text" placeholder="Ketik URL / Teks..." className="w-full p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 transition-shadow" value={text} onChange={(e) => setText(e.target.value)} />
        {qrUrl && <div className="p-5 bg-white dark:bg-slate-800 rounded-3xl shadow-2xl flex flex-col items-center w-full max-w-[280px] animate-in zoom-in-95"><img src={qrUrl} alt="QR" className="w-full aspect-square rounded-xl mb-4" /><a href={qrUrl} download="qrcode.png" className="w-full py-3 bg-blue-600 text-white rounded-xl text-sm font-bold text-center flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors"><Download className="w-4 h-4" /> Simpan QR</a></div>}
      </div>
    );
  }

  return <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 animate-fade-in-up"><Construction className="w-10 h-10 text-slate-400 animate-bounce" /><h2 className="text-xl font-bold">Segera Hadir</h2></div>;
}
