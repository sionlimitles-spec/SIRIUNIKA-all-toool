"use client";

import { useEffect, useState } from "react";
import { Smartphone, Battery, Wifi, Clock } from "lucide-react";

export default function StatusCard() {
  const [time, setTime] = useState("");
  const [device, setDevice] = useState("...");
  const [battery, setBattery] = useState<{ level: number; charging: boolean } | null>(null);
  const [network, setNetwork] = useState("...");

  useEffect(() => {
    const updateTime = () => setTime(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }));
    updateTime();
    const interval = setInterval(updateTime, 30000);

    const ua = navigator.userAgent;
    if (/android/i.test(ua)) setDevice("Android");
    else if (/iPad|iPhone|iPod/.test(ua)) setDevice("iOS");
    else if (/Windows/.test(ua)) setDevice("Windows");
    else if (/Mac/.test(ua)) setDevice("Mac");
    else if (/Linux/.test(ua)) setDevice("Linux");
    else setDevice("Unknown");

    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((bat: any) => {
        setBattery({ level: Math.round(bat.level * 100), charging: bat.charging });
        bat.addEventListener('levelchange', () => setBattery({ level: Math.round(bat.level * 100), charging: bat.charging }));
      }).catch(() => setBattery(null));
    }

    const updateNetwork = () => {
      if (!navigator.onLine) setNetwork("Offline");
      else {
        const conn = (navigator as any).connection;
        if (conn && conn.effectiveType) setNetwork(`${conn.effectiveType.toUpperCase()}`);
        else setNetwork("Online");
      }
    };
    updateNetwork();
    window.addEventListener('online', updateNetwork);
    window.addEventListener('offline', updateNetwork);

    return () => {
      clearInterval(interval);
      window.removeEventListener('online', updateNetwork);
      window.removeEventListener('offline', updateNetwork);
    };
  }, []);

  const getBatteryColor = (level: number) => {
    if (level > 50) return "bg-green-500";
    if (level > 20) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="glass-card flex items-center justify-between p-3 pr-4 gap-2 animate-fade-in-up">
      {/* Profile Kiri */}
      <div className="flex items-center gap-2.5 shrink-0 border-r border-slate-200 dark:border-slate-700 pr-3">
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-md">G</div>
          <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 border-2 border-white dark:border-slate-800 rounded-full"></div>
        </div>
        <div>
          <h3 className="font-bold text-xs leading-tight">Guest</h3>
          <span className="text-[9px] font-bold text-blue-600 dark:text-blue-400">MEMBER</span>
        </div>
      </div>

      {/* Info Kanan (Gepeng) */}
      <div className="flex items-center gap-1.5 flex-1 justify-end overflow-x-auto scrollbar-hide">
        <div className="flex items-center gap-1 bg-slate-100/80 dark:bg-slate-800/80 px-2 py-1 rounded-md text-[10px] font-medium text-slate-600 dark:text-slate-300">
          <Smartphone className="w-3 h-3 text-blue-500" /> <span className="hidden sm:inline">{device}</span>
        </div>
        <div className="flex items-center gap-1 bg-slate-100/80 dark:bg-slate-800/80 px-2 py-1 rounded-md text-[10px] font-medium text-slate-600 dark:text-slate-300">
          <Battery className="w-3 h-3 text-green-500" />
          <div className="w-5 h-1.5 bg-slate-300 dark:bg-slate-600 rounded-full overflow-hidden">
            <div className={`h-full ${getBatteryColor(battery?.level || 0)}`} style={{ width: `${battery?.level || 0}%` }} />
          </div>
        </div>
        <div className="flex items-center gap-1 bg-slate-100/80 dark:bg-slate-800/80 px-2 py-1 rounded-md text-[10px] font-medium text-slate-600 dark:text-slate-300">
          <Wifi className="w-3 h-3 text-purple-500" />
        </div>
        <div className="flex items-center gap-1 bg-slate-100/80 dark:bg-slate-800/80 px-2 py-1 rounded-md text-[10px] font-medium text-slate-600 dark:text-slate-300 tabular-nums">
          <Clock className="w-3 h-3 text-orange-500" /> {time}
        </div>
      </div>
    </div>
  );
}
