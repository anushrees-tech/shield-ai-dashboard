import { create } from "zustand";
import { toast } from "sonner";

export type Severity = "normal" | "suspicious" | "malicious";
export type AttackKind = "brute" | "malware" | "exfil" | "lateral";

export interface LogEntry {
  id: string;
  time: string;
  ip: string;
  message: string;
  severity: Severity;
  layer: string;
}

export interface AlertEntry {
  id: string;
  time: string;
  threat: string;
  ip: string;
  confidence: number;
  action: string;
}

export interface GeoSource {
  id: string;
  ip: string;
  country: string;
  lat: number;
  lng: number;
  severity: Severity;
}

interface Metrics {
  logs: number;
  threats: number;
  alerts: number;
  safePct: number;
  normal: number;
  suspicious: number;
  malicious: number;
}

interface TimelinePoint {
  t: string;
  value: number;
}

interface ThreatBucket {
  name: string;
  count: number;
}

interface SOCState {
  metrics: Metrics;
  logs: LogEntry[];
  alerts: AlertEntry[];
  geoSources: GeoSource[];
  timeline: TimelinePoint[];
  threatBreakdown: ThreatBucket[];
  mitreHits: Record<string, number>;
  pushLog: (l: LogEntry) => void;
  pushAlert: (a: AlertEntry) => void;
  simulateAttack: (k: AttackKind) => void;
  ingestFile: (name: string) => void;
  runPlaybook: (label: string) => void;
  tick: () => void;
}

const COUNTRIES: { country: string; lat: number; lng: number }[] = [
  { country: "RU", lat: 55.7, lng: 37.6 },
  { country: "CN", lat: 39.9, lng: 116.4 },
  { country: "US", lat: 38.9, lng: -77 },
  { country: "BR", lat: -15.8, lng: -47.9 },
  { country: "IN", lat: 28.6, lng: 77.2 },
  { country: "DE", lat: 52.5, lng: 13.4 },
  { country: "NG", lat: 9.1, lng: 7.5 },
  { country: "KP", lat: 39, lng: 125.7 },
  { country: "IR", lat: 35.7, lng: 51.4 },
  { country: "AU", lat: -33.9, lng: 151.2 },
];

const MESSAGES_NORMAL = [
  "GET /api/health 200",
  "TLS handshake ok",
  "DNS resolve cdn.shieldai.io",
  "POST /metrics 204",
  "Session refreshed",
  "Heartbeat ack",
];

const ATTACK_PROFILES: Record<
  AttackKind,
  { label: string; mitre: string[]; messages: string[]; action: string }
> = {
  brute: {
    label: "Brute Force Login",
    mitre: ["T1110", "T1078"],
    messages: [
      "Failed login attempt user=admin",
      "Failed login attempt user=root",
      "Auth: 14 failed attempts in 30s",
    ],
    action: "Block source IP + force MFA reset",
  },
  malware: {
    label: "Malware C2 Beaconing",
    mitre: ["T1059", "T1547"],
    messages: [
      "Periodic outbound to suspicious host",
      "Process spawn cmd.exe → powershell -enc",
      "Hash matches known IOC database",
    ],
    action: "Quarantine endpoint + sweep network",
  },
  exfil: {
    label: "Data Exfiltration",
    mitre: ["T1041", "T1567"],
    messages: [
      "Outbound 412MB to external host",
      "Unusual upload pattern detected",
      "Compressed archive sent over HTTPS",
    ],
    action: "Throttle egress + revoke tokens",
  },
  lateral: {
    label: "Lateral Movement",
    mitre: ["T1021", "T1570"],
    messages: [
      "SMB connection across 7 hosts in 60s",
      "RDP session chain detected",
      "Service account used outside scope",
    ],
    action: "Isolate host segment + audit creds",
  },
};

function rid() {
  return Math.random().toString(36).slice(2, 10);
}
function rip() {
  return `${(Math.random() * 223 + 11) | 0}.${(Math.random() * 255) | 0}.${(Math.random() * 255) | 0}.${(Math.random() * 255) | 0}`;
}
function now() {
  return new Date().toLocaleTimeString("en-GB", { hour12: false });
}

const initialTimeline: TimelinePoint[] = Array.from({ length: 18 }, (_, i) => ({
  t: `-${17 - i}m`,
  value: 6 + ((Math.sin(i / 2) + 1) * 8 + Math.random() * 4) | 0,
}));

const initialBreakdown: ThreatBucket[] = [
  { name: "Brute", count: 0 },
  { name: "Malware", count: 0 },
  { name: "Exfil", count: 0 },
  { name: "Lateral", count: 0 },
  { name: "Recon", count: 2 },
];

function recompute(state: SOCState): Metrics {
  const normal = state.logs.filter((l) => l.severity === "normal").length;
  const suspicious = state.logs.filter((l) => l.severity === "suspicious").length;
  const malicious = state.logs.filter((l) => l.severity === "malicious").length;
  const total = Math.max(1, state.logs.length);
  return {
    logs: state.metrics.logs,
    threats: malicious + suspicious,
    alerts: state.alerts.length,
    safePct: Math.round((normal / total) * 100),
    normal,
    suspicious,
    malicious,
  };
}

export const useSOC = create<SOCState>((set, get) => ({
  metrics: {
    logs: 0,
    threats: 0,
    alerts: 0,
    safePct: 100,
    normal: 0,
    suspicious: 0,
    malicious: 0,
  },
  logs: [],
  alerts: [],
  geoSources: [],
  timeline: initialTimeline,
  threatBreakdown: initialBreakdown,
  mitreHits: {},

  pushLog: (l) =>
    set((s) => {
      const logs = [l, ...s.logs].slice(0, 200);
      const next = { ...s, logs };
      return { logs, metrics: { ...recompute(next), logs: s.metrics.logs + 1 } };
    }),

  pushAlert: (a) =>
    set((s) => {
      const alerts = [a, ...s.alerts].slice(0, 80);
      return { alerts, metrics: { ...s.metrics, alerts: alerts.length } };
    }),

  simulateAttack: (kind) => {
    const profile = ATTACK_PROFILES[kind];
    const ip = rip();
    const geo = COUNTRIES[(Math.random() * COUNTRIES.length) | 0];

    toast.error(`⚠ ${profile.label} simulation launched`, {
      description: `Source ${ip} (${geo.country})`,
    });

    // Burst of logs
    let i = 0;
    const burst = setInterval(() => {
      const msg = profile.messages[i % profile.messages.length];
      get().pushLog({
        id: rid(),
        time: now(),
        ip,
        message: msg,
        severity: i < 2 ? "suspicious" : "malicious",
        layer: kind,
      });
      i++;
      if (i >= 6) clearInterval(burst);
    }, 250);

    setTimeout(() => {
      const confidence = 0.75 + Math.random() * 0.23;
      get().pushAlert({
        id: rid(),
        time: now(),
        threat: profile.label,
        ip,
        confidence,
        action: profile.action,
      });

      set((s) => {
        const mitreHits = { ...s.mitreHits };
        profile.mitre.forEach((m) => {
          mitreHits[m] = (mitreHits[m] || 0) + 1;
        });
        const breakdownKey =
          kind === "brute"
            ? "Brute"
            : kind === "malware"
              ? "Malware"
              : kind === "exfil"
                ? "Exfil"
                : "Lateral";
        const threatBreakdown = s.threatBreakdown.map((b) =>
          b.name === breakdownKey ? { ...b, count: b.count + 1 } : b,
        );
        const geoSources = [
          { id: rid(), ip, country: geo.country, lat: geo.lat, lng: geo.lng, severity: "malicious" as Severity },
          ...s.geoSources,
        ].slice(0, 12);
        return { mitreHits, threatBreakdown, geoSources };
      });
    }, 1600);
  },

  ingestFile: (name) => {
    toast.success(`File parsed: ${name}`, {
      description: "Running anomaly detection...",
    });
    const ext = name.split(".").pop()?.toLowerCase();
    const lines = ext === "csv" ? 8 : ext === "pdf" ? 5 : 3;
    for (let i = 0; i < lines; i++) {
      setTimeout(() => {
        const sev: Severity =
          Math.random() < 0.65 ? "normal" : Math.random() < 0.7 ? "suspicious" : "malicious";
        get().pushLog({
          id: rid(),
          time: now(),
          ip: rip(),
          message: `[${ext?.toUpperCase()}] parsed entry #${i + 1}`,
          severity: sev,
          layer: "ingest",
        });
      }, i * 220);
    }
  },

  runPlaybook: (label) => {
    toast.success(`Playbook executed: ${label}`, {
      description: "Action propagated to enforcement nodes",
    });
  },

  tick: () => {
    // Background traffic
    const sev: Severity =
      Math.random() < 0.85 ? "normal" : Math.random() < 0.7 ? "suspicious" : "malicious";
    const msg = MESSAGES_NORMAL[(Math.random() * MESSAGES_NORMAL.length) | 0];
    get().pushLog({
      id: rid(),
      time: now(),
      ip: rip(),
      message: msg,
      severity: sev,
      layer: "edge",
    });

    set((s) => {
      const last = s.timeline[s.timeline.length - 1]?.value ?? 10;
      const next = Math.max(2, Math.min(40, last + (Math.random() * 6 - 3)));
      const timeline = [...s.timeline.slice(1), { t: "now", value: Math.round(next) }].map(
        (p, i, arr) => ({ t: i === arr.length - 1 ? "now" : `-${arr.length - 1 - i}m`, value: p.value }),
      );
      return { timeline };
    });
  },
}));
