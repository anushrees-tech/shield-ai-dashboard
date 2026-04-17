import { useSOC } from "@/lib/soc-store";
import { Crosshair } from "lucide-react";
import { motion } from "framer-motion";

const TACTICS = [
  { id: "TA0001", name: "Initial Access", techniques: ["T1078 Valid Accounts", "T1190 Exploit Public-Facing"] },
  { id: "TA0002", name: "Execution", techniques: ["T1059 Command Scripting", "T1204 User Execution"] },
  { id: "TA0003", name: "Persistence", techniques: ["T1098 Account Manipulation", "T1547 Boot/Logon"] },
  { id: "TA0006", name: "Credential Access", techniques: ["T1110 Brute Force", "T1003 OS Credential Dump"] },
  { id: "TA0008", name: "Lateral Movement", techniques: ["T1021 Remote Services", "T1570 Lateral Tool"] },
  { id: "TA0010", name: "Exfiltration", techniques: ["T1041 C2 Exfil", "T1567 Web Service Exfil"] },
];

export function MitreMap() {
  const { mitreHits } = useSOC();

  return (
    <div className="glass rounded-2xl p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Crosshair className="h-4 w-4 text-accent" />
          <h3 className="text-sm font-semibold uppercase tracking-wider">
            MITRE ATT&CK Mapping
          </h3>
        </div>
        <span className="font-mono text-[10px] text-muted-foreground">
          enterprise matrix
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-6">
        {TACTICS.map((tactic) => (
          <div key={tactic.id} className="rounded-lg border border-border bg-background/30 p-2">
            <p className="font-mono text-[9px] text-muted-foreground">{tactic.id}</p>
            <p className="mb-2 text-[11px] font-semibold leading-tight">{tactic.name}</p>
            <div className="space-y-1">
              {tactic.techniques.map((tech) => {
                const code = tech.split(" ")[0];
                const hit = mitreHits[code] || 0;
                const intensity = Math.min(1, hit / 5);
                return (
                  <motion.div
                    key={tech}
                    animate={{
                      backgroundColor:
                        hit > 0
                          ? `oklch(0.68 0.24 22 / ${0.15 + intensity * 0.5})`
                          : "oklch(0.95 0.02 240 / 0.04)",
                    }}
                    className="flex items-center justify-between rounded border border-border/40 px-1.5 py-1 text-[9px]"
                  >
                    <span className="truncate">{tech}</span>
                    {hit > 0 && (
                      <span className="ml-1 rounded bg-destructive/30 px-1 font-mono text-[8px] font-bold text-destructive-foreground">
                        {hit}
                      </span>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
