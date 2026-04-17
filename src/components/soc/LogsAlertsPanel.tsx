import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSOC } from "@/lib/soc-store";
import { AlertOctagon, Terminal, ShieldAlert, ShieldCheck } from "lucide-react";

const tabs = ["logs", "alerts"] as const;
type Tab = (typeof tabs)[number];

const sevColor: Record<string, string> = {
  malicious: "text-destructive",
  suspicious: "text-warning",
  normal: "text-success",
};

const sevDot: Record<string, string> = {
  malicious: "bg-destructive shadow-[0_0_10px_currentColor]",
  suspicious: "bg-warning shadow-[0_0_8px_currentColor]",
  normal: "bg-success",
};

export function LogsAlertsPanel() {
  const [tab, setTab] = useState<Tab>("logs");
  const { logs, alerts } = useSOC();

  return (
    <div className="glass flex h-full min-h-0 flex-col rounded-2xl">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex gap-1 rounded-lg bg-background/40 p-1">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-all ${
                tab === t
                  ? "bg-primary text-primary-foreground glow-ring"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t === "logs" ? (
                <Terminal className="h-3 w-3" />
              ) : (
                <AlertOctagon className="h-3 w-3" />
              )}
              {t}
              <span className="ml-1 rounded bg-background/40 px-1.5 font-mono text-[10px]">
                {t === "logs" ? logs.length : alerts.length}
              </span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
          </span>
          Live stream
        </div>
      </div>

      <div className="relative min-h-0 flex-1 overflow-hidden">
        <div className="scanline absolute inset-0" />
        <div className="relative h-full overflow-y-auto px-4 py-3">
          <AnimatePresence initial={false}>
            {tab === "logs"
              ? logs.slice(0, 40).map((l) => (
                  <motion.div
                    key={l.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-3 border-b border-border/50 py-2 font-mono text-xs last:border-0"
                  >
                    <span className={`h-2 w-2 shrink-0 rounded-full ${sevDot[l.severity]}`} />
                    <span className="text-muted-foreground">{l.time}</span>
                    <span className="text-primary">{l.ip}</span>
                    <span className="text-muted-foreground">→</span>
                    <span className="truncate text-foreground/90">{l.message}</span>
                    <span
                      className={`ml-auto rounded bg-background/40 px-1.5 py-0.5 text-[10px] uppercase ${sevColor[l.severity]}`}
                    >
                      {l.severity}
                    </span>
                  </motion.div>
                ))
              : alerts.slice(0, 30).map((a) => (
                  <motion.div
                    key={a.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    className="mb-2 rounded-lg border border-border bg-background/30 p-3"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`rounded-lg p-2 ${
                          a.confidence > 0.8
                            ? "bg-destructive/20 text-destructive animate-pulse-glow-danger"
                            : "bg-warning/20 text-warning"
                        }`}
                      >
                        {a.confidence > 0.8 ? (
                          <ShieldAlert className="h-4 w-4" />
                        ) : (
                          <ShieldCheck className="h-4 w-4" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-semibold">{a.threat}</p>
                          <span className="font-mono text-[10px] text-muted-foreground">
                            {a.time}
                          </span>
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          <span className="font-mono text-primary">{a.ip}</span>
                          <span>·</span>
                          <span>
                            Confidence:{" "}
                            <span className="font-mono text-foreground">
                              {(a.confidence * 100).toFixed(0)}%
                            </span>
                          </span>
                        </div>
                        <p className="mt-2 text-xs text-foreground/80">
                          → {a.action}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
