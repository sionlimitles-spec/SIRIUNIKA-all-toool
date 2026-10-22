"use client";

import { useEffect, useState } from "react";
import { Smartphone, Battery, Wifi, Clock } from "lucide-react";

export default function StatusCard() {
  const [time, setTime] = useState("");
  const [device, setDevice] = useState("Memuat...");
  const [battery, setBattery] = useState<{ level: number; charging: boolean } | null>(null);
  const [network, setNetwork] = useState("Online");

  useEffect(() => {
    const updateTime = () => {
      setTime(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);

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
        bat.addEventListener('chargingchange', () => setBattery({ level: Math.round(bat.level * 100), charging: bat.charging }));
      }).catch(() => setBattery(null));
    }

    const updateNetwork = () => {
      if (!navigator.onLine) setNetwork("Offline");
      else {
        const conn = (navigator as any).connection;
        if (conn && conn.effectiveType) setNetwork(`Online (${conn.effectiveType.toUpperCase()})`);
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

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 11) return "Selamat Pagi";
    if (hour < 15) return "Selamat Siang";
    if (hour < 18) return "Selamat Sore";
    return "Selamat Malam";
  };

  const getBatteryColor = (level: number) => {
    if (level > 50) return "bg-green-500";
    if (level > 20) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="glass-card p-5 space-y-4">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-xl shadow-lg border-2 border-white/50">
          G
        </div>
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400">{getGreeting()},</p>
          <h3 className="font-bold text-lg">Guest User</h3>
          <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-bold rounded-md bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-700 dark:text-blue-300 border border-blue-500/30">
            GUEST
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 pt-2">
        <div className="bg-slate-100/50 dark:bg-slate-800/50 p-2.5 rounded-2xl flex items-center gap-3">
          <Smartphone className="w-4 h-4 text-blue-500" />
          <div>
            <p className="text-[10px] text-slate-500">Perangkat</p>
            <p className="text-xs font-semibold">{device}</p>
          </div>
        </div>

        <div className="bg-slate-100/50 dark:bg-slate-800/50 p-2.5 rounded-2xl flex items-center gap-3">
          <Battery className="w-4 h-4 text-green-500" />
          <div className="w-full">
            <p className="text-[10px] text-slate-500">Baterai</p>
            {battery ? (
              <div className="flex items-center gap-2">
                <div className="h-1.5 flex-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div className={`h-full ${getBatteryColor(battery.level)}`} style={{ width: `${battery.level}%` }} />
                </div>
                <span className="text-[10px] font-semibold">{battery.level}% {battery.charging && "⚡"}</span>
              </div>
            ) : (
              <p className="text-xs font-semibold">N/A</p>
            )}
          </div>
        </div>

        <div className="bg-slate-100/50 dark:bg-slate-800/50 p-2.5 rounded-2xl flex items-center gap-3">
          <Wifi className="w-4 h-4 text-purple-500" />
          <div>
            <p className="text-[10px] text-slate-500">Jaringan</p>
            <p className="text-xs font-semibold">{network}</p>
          </div>
        </div>

        <div className="bg-slate-100/50 dark:bg-slate-800/50 p-2.5 rounded-2xl flex items-center gap-3">
          <Clock className="w-4 h-4 text-orange-500" />
          <div>
            <p className="text-[10px] text-slate-500">Waktu</p>
            <p className="text-xs font-semibold tabular-nums">{time || "--:--:--"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
