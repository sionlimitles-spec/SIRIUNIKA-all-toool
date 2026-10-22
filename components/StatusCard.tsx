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
    const interval = setInterval(updateTime, 10000); // Cukup tiap 10 detik agar hemat resource

    const ua = navigator.userAgent;
    if (/android/i.test(ua)) setDevice("Android");
    else if (/iPad|iPhone|iPod/.test(ua)) setDevice("iOS");
    else if (/Windows/.test(ua)) setDevice("Windows");
    else if (/Mac/.test(ua)) setDevice("MacOS");
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
    <div className="glass-card p-4 flex items-center justify-between gap-2 overflow-hidden">
      {/* Avatar & Role */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-md">G</div>
        <div>
          <h3 className="font-bold text-sm leading-tight">Guest</h3>
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">MEMBER</span>
        </div>
      </div>

      {/* Info Grid Gepeng (4 Kolom) */}
      <div className="flex items-center gap-2 flex-1 justify-end text-[10px] font-medium text-slate-600 dark:text-slate-300">
        <div className="flex items-center gap-1 bg-slate-100/50 dark:bg-slate-800/50 px-2 py-1.5 rounded-lg">
          <Smartphone className="w-3.5 h-3.5 text-blue-500" /> <span className="truncate max-w-[40px]">{device}</span>
        </div>
        <div className="flex items-center gap-1 bg-slate-100/50 dark:bg-slate-800/50 px-2 py-1.5 rounded-lg">
          <Battery className="w-3.5 h-3.5 text-green-500" />
          {battery ? (
            <div className="flex items-center gap-1">
              <div className="w-6 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div className={`h-full ${getBatteryColor(battery.level)}`} style={{ width: `${battery.level}%` }} />
              </div>
              <span>{battery.level}%</span>
            </div>
          ) : <span>N/A</span>}
        </div>
        <div className="flex items-center gap-1 bg-slate-100/50 dark:bg-slate-800/50 px-2 py-1.5 rounded-lg">
          <Wifi className="w-3.5 h-3.5 text-purple-500" /> <span>{network}</span>
        </div>
        <div className="flex items-center gap-1 bg-slate-100/50 dark:bg-slate-800/50 px-2 py-1.5 rounded-lg">
          <Clock className="w-3.5 h-3.5 text-orange-500" /> <span className="tabular-nums">{time}</span>
        </div>
      </div>
    </div>
  );
}
