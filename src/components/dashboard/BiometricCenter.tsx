import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Fingerprint, 
  Activity, 
  Cpu, 
  RefreshCw, 
  Terminal, 
  Play, 
  Power,
  RotateCcw,
  Network
} from "lucide-react";
import { BiometricDevice, BiometricEvent } from "./mockData";
import { Button } from "../ui/button";
import { toast } from "sonner";

interface BiometricCenterProps {
  devices: BiometricDevice[];
  biometricEvents: BiometricEvent[];
  onSyncDevices: () => void;
}

export default function BiometricCenter({
  devices,
  biometricEvents,
  onSyncDevices
}: BiometricCenterProps) {
  const [syncing, setSyncing] = useState(false);
  const [consoleLogs, setConsoleLogs] = useState<string[]>([
    "System Initialized: Biometric Connection Pool v4.5.12",
    "TCP Gateway listening on port 5005...",
    "Main Gate Face Terminal: Socket connected (192.168.1.150:5005)",
    "Cardio Section Fingerprint: Socket connected (192.168.1.151:5006)",
    "PT Room Face Scanner: Connection timed out, retrying (192.168.1.152:5005)"
  ]);

  const handleSyncClick = () => {
    setSyncing(true);
    setConsoleLogs(prev => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] Triggering manual sync on active biometric nodes...`,
      `[${new Date().toLocaleTimeString()}] Sync in progress: DEV-01, DEV-02...`
    ]);

    setTimeout(() => {
      onSyncDevices();
      setSyncing(false);
      setConsoleLogs(prev => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] Sync success! Fetched 18 new event registers from DEV-01`,
        `[${new Date().toLocaleTimeString()}] Sync success! Fetched 4 new event registers from DEV-02`
      ]);
      toast.success("Biometric devices synced successfully!");
    }, 1500);
  };

  const handleRestartDevice = (deviceName: string) => {
    setConsoleLogs(prev => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] Issuing soft restart command to device [${deviceName}]...`,
      `[${new Date().toLocaleTimeString()}] Device [${deviceName}] disconnected. Re-initializing sockets...`,
      `[${new Date().toLocaleTimeString()}] Device [${deviceName}] status: Online`
    ]);
    toast.info(`Device "${deviceName}" restarted.`);
  };

  return (
    <div className="space-y-6">
      {/* Overview Diagnostics */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-black uppercase tracking-wider text-white">Biometric Gateway Array</h2>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Live Controller Dashboard</p>
        </div>
        <Button
          onClick={handleSyncClick}
          disabled={syncing}
          className="bg-primary hover:bg-primary/95 text-white font-bold rounded-xl flex items-center gap-2 shadow-lg hover:shadow-primary/10"
        >
          <RefreshCw size={16} className={syncing ? "animate-spin" : ""} />
          <span>{syncing ? "Syncing Grid..." : "Sync All Devices"}</span>
        </Button>
      </div>

      {/* Grid of Devices */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {devices.map(dev => (
          <div 
            key={dev.id} 
            className="bg-[#171717] border border-white/5 p-5 rounded-2xl shadow-lg flex flex-col justify-between space-y-5"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${dev.status === "Online" ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"}`}>
                    <Cpu size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-white">{dev.name}</h4>
                    <span className="text-[9px] font-mono text-slate-500 leading-none">{dev.id}</span>
                  </div>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                  dev.status === "Online" ? "bg-[#00C853]/10 text-[#00C853]" : "bg-[#FF5252]/10 text-[#FF5252]"
                }`}>
                  {dev.status}
                </span>
              </div>

              {/* Specs parameters */}
              <div className="grid grid-cols-2 gap-3 border-t border-b border-white/5 py-3 text-[11px] font-semibold text-slate-400">
                <div className="space-y-0.5">
                  <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest leading-none">IP Address</span>
                  <p className="text-white truncate font-mono">{dev.ip}:{dev.port}</p>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest leading-none">Firmware Version</span>
                  <p className="text-white truncate font-mono">{dev.firmware}</p>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest leading-none">Total Logs Today</span>
                  <p className="text-white font-mono font-bold text-xs">{dev.todaySyncs} events</p>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest leading-none">Socket Errors</span>
                  <p className={`font-mono font-bold text-xs ${dev.todayErrors > 0 ? "text-[#FF5252]" : "text-[#00C853]"}`}>
                    {dev.todayErrors} alerts
                  </p>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleRestartDevice(dev.name)}
                className="flex-1 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-[10px] font-bold uppercase tracking-wider text-slate-300 hover:text-white transition-all flex items-center justify-center gap-1.5 border border-white/5"
              >
                <RotateCcw size={12} />
                <span>Restart</span>
              </button>
              <button
                onClick={() => toast.info(`IP Ping success! Latency: ${dev.status === "Online" ? "14ms" : "Offline"}`)}
                className="flex-1 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-[10px] font-bold uppercase tracking-wider text-slate-300 hover:text-white transition-all flex items-center justify-center gap-1.5 border border-white/5"
              >
                <Network size={12} />
                <span>Ping IP</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Diagnostics Logs Console */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Live Logs Stream Terminal */}
        <div className="lg:col-span-8 bg-[#171717] border border-white/5 p-6 rounded-2xl shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Terminal size={14} className="text-primary" />
              <span>TCP Network Console logs</span>
            </h3>
            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">gateway-pool-01</span>
          </div>

          {/* Console Output Screen */}
          <div className="h-60 rounded-xl bg-[#090909] border border-white/5 p-4 overflow-y-auto space-y-2 font-mono text-[11px] text-slate-400 select-all scrollbar-none">
            {consoleLogs.map((log, idx) => (
              <div key={idx} className={`leading-relaxed ${
                log.includes("timeout") || log.includes("Offline") ? "text-[#FF5252]" :
                log.includes("Sync success") || log.includes("Online") ? "text-[#00C853]" :
                log.includes("Triggering") || log.includes("restart") ? "text-[#FF7A00]" : "text-slate-400"
              }`}>
                &gt; {log}
              </div>
            ))}
          </div>
        </div>

        {/* Live sync statistics */}
        <div className="lg:col-span-4 bg-[#171717] border border-white/5 p-6 rounded-2xl shadow-lg flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Sync Stats Engine</h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Live metrics</p>
          </div>

          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-semibold">Gateway Status:</span>
              <span className="text-xs text-[#00C853] font-black uppercase tracking-wider">Healthy</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-semibold">Total Sockets:</span>
              <span className="text-xs text-white font-mono font-bold">3 Sockets</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-semibold">Active Sync Rate:</span>
              <span className="text-xs text-[#FF7A00] font-mono font-bold">1 sync/min</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-semibold">Diagnostics Log Size:</span>
              <span className="text-xs text-slate-500 font-mono font-bold">128 KB</span>
            </div>
          </div>

          <button
            onClick={() => {
              setConsoleLogs([
                "Diagnostics Pool flushed.",
                "TCP Gateway listening on port 5005..."
              ]);
              toast.info("TCP logs cleared.");
            }}
            className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-[#FF5252]/10 hover:text-[#FF5252] text-xs font-bold text-slate-300 border border-white/5 hover:border-[#FF5252]/10 transition-colors"
          >
            Flush Console Logs
          </button>
        </div>
      </div>
    </div>
  );
}
