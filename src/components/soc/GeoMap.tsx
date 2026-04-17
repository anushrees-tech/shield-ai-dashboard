import { motion } from "framer-motion";
import { useSOC } from "@/lib/soc-store";
import { Globe2 } from "lucide-react";

// Approx lat/lng → percentage on equirectangular bg
function project(lat: number, lng: number) {
  const x = ((lng + 180) / 360) * 100;
  const y = ((90 - lat) / 180) * 100;
  return { x, y };
}

export function GeoMap() {
  const { geoSources } = useSOC();

  return (
    <div className="glass relative overflow-hidden rounded-2xl p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Globe2 className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold uppercase tracking-wider">
            Threat Origins
          </h3>
        </div>
        <span className="font-mono text-[10px] text-muted-foreground">
          {geoSources.length} active sources
        </span>
      </div>

      <div className="relative aspect-[2/1] w-full overflow-hidden rounded-lg border border-border bg-background/50">
        {/* World grid */}
        <svg className="absolute inset-0 h-full w-full opacity-40" viewBox="0 0 200 100">
          <defs>
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="oklch(0.78 0.18 195 / 0.15)" strokeWidth="0.2" />
            </pattern>
          </defs>
          <rect width="200" height="100" fill="url(#grid)" />
          {/* Stylized continents */}
          <g fill="oklch(0.78 0.18 195 / 0.12)" stroke="oklch(0.78 0.18 195 / 0.4)" strokeWidth="0.3">
            <path d="M20,30 Q35,20 55,28 L60,45 Q45,55 30,50 Z" />
            <path d="M85,25 Q105,18 125,30 L130,55 Q110,65 90,55 Z" />
            <path d="M140,30 Q165,25 180,40 L175,60 Q160,68 145,55 Z" />
            <path d="M55,60 Q70,58 75,75 L65,85 Q50,82 50,72 Z" />
            <path d="M105,65 Q118,62 122,78 L115,88 Q102,85 100,75 Z" />
            <path d="M155,70 Q170,68 175,80 L168,88 Q155,85 152,78 Z" />
          </g>
        </svg>

        {/* Radar sweep */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[200%] w-[200%] -translate-x-1/2 -translate-y-1/2">
          <div
            className="animate-radar h-full w-full origin-center"
            style={{
              background:
                "conic-gradient(from 0deg, transparent 0deg, oklch(0.78 0.18 195 / 0.18) 30deg, transparent 60deg)",
            }}
          />
        </div>

        {/* Threat blips */}
        {geoSources.map((g) => {
          const { x, y } = project(g.lat, g.lng);
          const color =
            g.severity === "malicious"
              ? "oklch(0.68 0.24 22)"
              : g.severity === "suspicious"
                ? "oklch(0.82 0.17 75)"
                : "oklch(0.78 0.18 155)";
          return (
            <motion.div
              key={g.id}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${x}%`, top: `${y}%` }}
            >
              <div className="relative">
                <span
                  className="animate-blip absolute inset-0 rounded-full"
                  style={{ backgroundColor: color, opacity: 0.5 }}
                />
                <span
                  className="relative block h-2 w-2 rounded-full"
                  style={{
                    backgroundColor: color,
                    boxShadow: `0 0 10px ${color}`,
                  }}
                />
              </div>
              <div className="absolute left-3 top-0 whitespace-nowrap rounded bg-background/80 px-1.5 py-0.5 font-mono text-[9px] backdrop-blur">
                {g.country} · {g.ip}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
