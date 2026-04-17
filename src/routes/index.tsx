import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TopBar } from "@/components/soc/TopBar";
import { MetricsSidebar } from "@/components/soc/MetricsSidebar";
import { FileUpload } from "@/components/soc/FileUpload";
import { AttackSimulator } from "@/components/soc/AttackSimulator";
import { LogsAlertsPanel } from "@/components/soc/LogsAlertsPanel";
import { ChartsPanel } from "@/components/soc/ChartsPanel";
import { GeoMap } from "@/components/soc/GeoMap";
import { MitreMap } from "@/components/soc/MitreMap";
import { Playbooks } from "@/components/soc/Playbooks";
import { ThreatTicker } from "@/components/soc/ThreatTicker";
import { useSOC } from "@/lib/soc-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ShieldAI — AI-Powered Cybersecurity SOC" },
      {
        name: "description",
        content:
          "Real-time AI-powered threat detection, MITRE ATT&CK mapping, and automated response playbooks for modern Security Operations Centers.",
      },
      { property: "og:title", content: "ShieldAI — AI-Powered Cybersecurity SOC" },
      {
        property: "og:description",
        content:
          "Real-time threat detection with anomaly scoring, geo-intelligence, and SOAR playbooks.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const tick = useSOC((s) => s.tick);

  useEffect(() => {
    // Seed traffic immediately
    for (let i = 0; i < 12; i++) tick();
    const id = setInterval(tick, 1400);
    return () => clearInterval(id);
  }, [tick]);

  return (
    <div className="min-h-screen">
      <TopBar />

      <main className="mx-auto max-w-[1600px] p-4 lg:p-6">
        <div className="mb-4">
          <ThreatTicker />
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[280px_1fr]">
          {/* Left rail */}
          <aside className="space-y-4">
            <MetricsSidebar />

            <section className="glass rounded-2xl p-4">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Ingest Logs
              </h3>
              <FileUpload />
            </section>

            <section className="glass rounded-2xl p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Attack Simulator
                </h3>
                <span className="font-mono text-[9px] text-warning">RED TEAM</span>
              </div>
              <AttackSimulator />
            </section>

            <Playbooks />
          </aside>

          {/* Main grid */}
          <section className="space-y-4">
            <ChartsPanel />

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_440px]">
              <div className="h-[480px]">
                <LogsAlertsPanel />
              </div>
              <GeoMap />
            </div>

            <MitreMap />
          </section>
        </div>

        <footer className="mt-6 flex items-center justify-between border-t border-border pt-4 font-mono text-[10px] text-muted-foreground">
          <span>SHIELDAI v1.0 · SOC // Glass Aurora</span>
          <span>
            <span className="text-success">●</span> All sensors operational ·
            anomaly engine: Isolation Forest (simulated)
          </span>
        </footer>
      </main>

      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: "oklch(0.19 0.04 265 / 0.9)",
            color: "oklch(0.96 0.02 240)",
            border: "1px solid oklch(0.95 0.02 240 / 0.1)",
            backdropFilter: "blur(20px)",
          },
        }}
      />
    </div>
  );
}
