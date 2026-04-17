import { Ban, KeyRound, ShieldCheck, BookLock } from "lucide-react";
import { motion } from "framer-motion";
import { useSOC } from "@/lib/soc-store";

const playbooks = [
  { key: "block", label: "Block IP", icon: Ban, tone: "destructive" },
  { key: "reset", label: "Reset Password", icon: KeyRound, tone: "warning" },
  { key: "mfa", label: "Enable MFA", icon: ShieldCheck, tone: "success" },
  { key: "isolate", label: "Isolate Host", icon: BookLock, tone: "info" },
] as const;

const toneClasses: Record<string, string> = {
  destructive: "bg-destructive/15 text-destructive border-destructive/40 hover:bg-destructive/25",
  warning: "bg-warning/15 text-warning border-warning/40 hover:bg-warning/25",
  success: "bg-success/15 text-success border-success/40 hover:bg-success/25",
  info: "bg-info/15 text-info border-info/40 hover:bg-info/25",
};

export function Playbooks() {
  const { runPlaybook } = useSOC();

  return (
    <div className="glass rounded-2xl p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wider">
          Response Playbooks
        </h3>
        <span className="font-mono text-[10px] text-muted-foreground">SOAR</span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {playbooks.map((p) => {
          const Icon = p.icon;
          return (
            <motion.button
              key={p.key}
              whileTap={{ scale: 0.96 }}
              onClick={() => runPlaybook(p.label)}
              className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 text-xs font-semibold transition-all ${toneClasses[p.tone]}`}
            >
              <Icon className="h-4 w-4" />
              {p.label}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
