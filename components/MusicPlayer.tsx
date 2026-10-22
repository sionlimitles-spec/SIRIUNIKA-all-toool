"use client";

import { useState, useRef } from "react";
import { Play, Pause, Music } from "lucide-react";

type Track = { id: string; title: string; artist: string; url: string; thumbnail?: string };

export default function MusicPlayer() {
  const [activeTab, setActiveTab] = useState<"yt" | "jamendo">("yt");
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [queue, setQueue] = useState<Track[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const YT_API_KEY = process.env.NEXT_PUBLIC_YT_API_KEY;
  const JAMENDO_CLIENT_ID = process.env.NEXT_PUBLIC_JAMENDO_CLIENT_ID;

  const handleSearch = async () => {
    if (!searchQuery) return;
    setIsLoading(true);

    try {
      if (activeTab === "yt") {
        if (!YT_API_KEY) {
          alert("YouTube API Key belum diset di .env.local");
          return;
        }
        const res = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=10&q=${searchQuery}&type=video&key=${YT_API_KEY}`);
        const data = await res.json();
        const tracks: Track[] = data.items.map((item: any) => ({
          id: item.id.videoId,
          title: item.snippet.title,
          artist: item.snippet.channelTitle,
          url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
          thumbnail: item.snippet.thumbnails.default.url,
        }));
        setQueue(tracks);
      } else {
        if (!JAMENDO_CLIENT_ID) {
          alert("Jamendo Client ID belum diset di .env.local");
          return;
        }
        const res = await fetch(`https://api.jamendo.com/v3.0/tracks/?client_id=${JAMENDO_CLIENT_ID}&format=json&limit=10&search=${searchQuery}`);
        const data = await res.json();
        const tracks: Track[] = data.results.map((item: any) => ({
          id: item.id,
          title: item.name,
          artist: item.artist_name,
          url: item.audio,
          thumbnail: item.image,
        }));
        setQueue(tracks);
      }
    } catch (error) {
      console.error(error);
      alert("Gagal mengambil data.");
    } finally {
      setIsLoading(false);
    }
  };

  const playTrack = (track: Track) => {
    setCurrentTrack(track);
    setIsPlaying(true);
    if (activeTab === "jamendo" && audioRef.current) {
      audioRef.current.src = track.url;
      audioRef.current.play();
    }
  };

  const togglePlay = () => {
    if (!currentTrack) return;
    setIsPlaying(!isPlaying);
    if (activeTab === "jamendo" && audioRef.current) {
      isPlaying ? audioRef.current.pause() : audioRef.current.play();
    }
  };

  return (
    <>
      {currentTrack && (
        <div className="fixed bottom-16 left-1/2 -translate-x-1/2 w-full max-w-md p-2 z-40">
          <div className="glass-card bg-white/90 dark:bg-slate-800/90 p-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center overflow-hidden">
                {currentTrack.thumbnail ? <img src={currentTrack.thumbnail} alt="" className="w-full h-full object-cover"/> : <Music className="w-5 h-5" />}
              </div>
              <div className="overflow-hidden w-32">
                <p className="text-xs font-bold truncate">{currentTrack.title}</p>
                <p className="text-[10px] text-slate-500 truncate">{currentTrack.artist}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={togglePlay} aria-label="Play/Pause" className="p-2 bg-blue-500 text-white rounded-full">
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      )}

      <div id="musik" className="hidden">
         {/* Full player implementation goes here */}
      </div>
      
      <audio ref={audioRef} onEnded={() => setIsPlaying(false)} className="hidden" />
    </>
  );
            }
