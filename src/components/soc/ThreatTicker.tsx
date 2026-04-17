import { useSOC } from "@/lib/soc-store";

export function ThreatTicker() {
  const { logs } = useSOC();
  const slice = logs.slice(0, 10);
  if (slice.length === 0) return null;
  const repeated = [...slice, ...slice];

  return (
    <div className="glass relative overflow-hidden rounded-full px-4 py-1.5">
      <div className="absolute left-0 top-0 z-10 h-full w-12 bg-gradient-to-r from-background to-transparent" />
      <div className="absolute right-0 top-0 z-10 h-full w-12 bg-gradient-to-l from-background to-transparent" />
      <div
        className="flex w-max gap-8 whitespace-nowrap font-mono text-[11px]"
        style={{ animation: "ticker 40s linear infinite" }}
      >
        {repeated.map((l, i) => (
          <span key={`${l.id}-${i}`} className="flex items-center gap-2">
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                l.severity === "malicious"
                  ? "bg-destructive"
                  : l.severity === "suspicious"
                    ? "bg-warning"
                    : "bg-success"
              }`}
            />
            <span className="text-muted-foreground">{l.time}</span>
            <span className="text-primary">{l.ip}</span>
            <span className="text-foreground/80">{l.message}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
