import { Shield, Activity, Download, Bell, Volume2, VolumeX, Ban } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useSOC } from "@/lib/soc-store";

function CountUp({ value }: { value: number }) {
  const mv = useMotionValue(0);
  const spring = useSpring(mv, { stiffness: 90, damping: 18 });
  const rounded = useTransform(spring, (v) => Math.round(v).toLocaleString());
  const [text, setText] = useState("0");
  useEffect(() => {
    mv.set(value);
    const unsub = rounded.on("change", (v) => setText(v));
    return () => unsub();
  }, [value, mv, rounded]);
  return <span>{text}</span>;
}

export function TopBar() {
  const { metrics, attacksBlocked, voiceEnabled, toggleVoice } = useSOC();
  const prev = useRef(attacksBlocked);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    if (attacksBlocked > prev.current) {
      setPulse(true);
      const t = setTimeout(() => setPulse(false), 700);
      prev.current = attacksBlocked;
      return () => clearTimeout(t);
    }
    prev.current = attacksBlocked;
  }, [attacksBlocked]);

  return (
    <header className="glass-strong sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-border px-6 py-3">
      <div className="flex items-center gap-3">
        <div className="relative grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-primary to-accent">
          <Shield className="h-4 w-4 text-primary-foreground" strokeWidth={2.5} />
          <span className="absolute -inset-0.5 -z-10 rounded-xl bg-gradient-to-br from-primary to-accent opacity-50 blur-md" />
        </div>
        <div>
          <h1 className="font-display text-lg font-bold tracking-tight">
            Shield<span className="text-gradient">AI</span>
          </h1>
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Security Operations Center
          </p>
        </div>
      </div>

      <div className="hidden items-center gap-4 md:flex">
        <motion.div
          animate={pulse ? { scale: [1, 1.08, 1] } : { scale: 1 }}
          transition={{ duration: 0.6 }}
          className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 transition-colors ${
            pulse
              ? "border-success/60 bg-success/15"
              : "border-border bg-background/40"
          }`}
        >
          <Ban className={`h-3.5 w-3.5 ${pulse ? "text-success" : "text-success/80"}`} />
          <div className="leading-none">
            <p className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
              Attacks blocked
            </p>
            <p className="font-mono text-sm font-bold text-success">
              <CountUp value={attacksBlocked} />
            </p>
          </div>
        </motion.div>

        <div className="flex items-center gap-2 rounded-lg bg-background/40 px-3 py-1.5">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
          </span>
          <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            Sensors online
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Activity className="h-3 w-3 text-primary" />
          <span className="font-mono">
            <span className="text-foreground">{metrics.logs.toLocaleString()}</span> events/min
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={toggleVoice}
          aria-label={voiceEnabled ? "Mute voice alerts" : "Enable voice alerts"}
          className={`rounded-lg border p-2 transition-all ${
            voiceEnabled
              ? "border-success/50 bg-success/15 text-success glow-ring"
              : "border-border bg-background/40 text-muted-foreground hover:text-foreground"
          }`}
        >
          {voiceEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
        </button>
        <button className="relative rounded-lg border border-border bg-background/40 p-2 text-muted-foreground transition-colors hover:text-foreground">
          <Bell className="h-4 w-4" />
          {metrics.alerts > 0 && (
            <span className="absolute -right-1 -top-1 grid h-4 min-w-[16px] place-items-center rounded-full bg-destructive px-1 font-mono text-[9px] font-bold text-destructive-foreground">
              {metrics.alerts > 99 ? "99+" : metrics.alerts}
            </span>
          )}
        </button>
        <button className="flex items-center gap-2 rounded-lg border border-border bg-background/40 px-3 py-2 text-xs font-semibold text-foreground transition-colors hover:border-primary/50 hover:text-primary">
          <Download className="h-3.5 w-3.5" />
          Export Report
        </button>
        <div className="ml-1 grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-primary to-accent font-mono text-xs font-bold text-primary-foreground">
          AN
        </div>
      </div>
    </header>
  );
}
