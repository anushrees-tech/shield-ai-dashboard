import { Activity, AlertTriangle, FileText, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { useSOC } from "@/lib/soc-store";

const items = [
  {
    label: "Logs Ingested",
    key: "logs" as const,
    icon: FileText,
    color: "text-info",
    bg: "from-info/20 to-info/5",
  },
  {
    label: "Threats Detected",
    key: "threats" as const,
    icon: AlertTriangle,
    color: "text-destructive",
    bg: "from-destructive/25 to-destructive/5",
  },
  {
    label: "Active Alerts",
    key: "alerts" as const,
    icon: Activity,
    color: "text-warning",
    bg: "from-warning/20 to-warning/5",
  },
  {
    label: "Safe Traffic",
    key: "safePct" as const,
    icon: ShieldCheck,
    color: "text-success",
    bg: "from-success/20 to-success/5",
    suffix: "%",
  },
];

export function MetricsSidebar() {
  const { metrics } = useSOC();

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-1">
      {items.map((it, i) => {
        const Icon = it.icon;
        const value = metrics[it.key];
        return (
          <motion.div
            key={it.key}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`glass relative overflow-hidden rounded-xl p-4`}
          >
            <div
              className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${it.bg} opacity-60`}
            />
            <div className="relative flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  {it.label}
                </p>
                <motion.p
                  key={value}
                  initial={{ scale: 0.9, opacity: 0.5 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="mt-2 font-mono text-2xl font-bold text-foreground"
                >
                  {value.toLocaleString()}
                  {it.suffix ?? ""}
                </motion.p>
              </div>
              <div className={`rounded-lg bg-background/40 p-2 ${it.color}`}>
                <Icon className="h-4 w-4" />
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
