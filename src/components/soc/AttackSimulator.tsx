import { Swords, Bug, Network, ArrowUpFromLine } from "lucide-react";
import { motion } from "framer-motion";
import { useSOC, type AttackKind } from "@/lib/soc-store";

const attacks: {
  kind: AttackKind;
  label: string;
  icon: typeof Swords;
  hue: string;
}[] = [
  { kind: "brute", label: "Brute Force", icon: Swords, hue: "from-destructive/30 to-destructive/5" },
  { kind: "malware", label: "Malware", icon: Bug, hue: "from-warning/30 to-warning/5" },
  { kind: "exfil", label: "Exfiltration", icon: ArrowUpFromLine, hue: "from-accent/30 to-accent/5" },
  { kind: "lateral", label: "Lateral Move", icon: Network, hue: "from-info/30 to-info/5" },
];

export function AttackSimulator() {
  const { simulateAttack } = useSOC();
  return (
    <div className="grid grid-cols-2 gap-2">
      {attacks.map((a) => {
        const Icon = a.icon;
        return (
          <motion.button
            key={a.kind}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => simulateAttack(a.kind)}
            className={`group relative overflow-hidden rounded-xl border border-border p-3 text-left transition-all hover:border-primary/50`}
          >
            <div
              className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${a.hue} opacity-60 transition-opacity group-hover:opacity-100`}
            />
            <div className="relative flex items-center gap-2">
              <Icon className="h-4 w-4 text-foreground" />
              <span className="text-xs font-semibold uppercase tracking-wider">
                {a.label}
              </span>
            </div>
            <p className="relative mt-1 font-mono text-[10px] text-muted-foreground">
              ./simulate --{a.kind}
            </p>
          </motion.button>
        );
      })}
    </div>
  );
}
