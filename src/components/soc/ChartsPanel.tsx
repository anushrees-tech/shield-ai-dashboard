import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { useSOC } from "@/lib/soc-store";

const COLORS = [
  "oklch(0.78 0.18 155)",
  "oklch(0.82 0.17 75)",
  "oklch(0.68 0.24 22)",
];

const tooltipStyle = {
  backgroundColor: "oklch(0.19 0.04 265 / 0.95)",
  border: "1px solid oklch(0.95 0.02 240 / 0.1)",
  borderRadius: 8,
  fontSize: 12,
  color: "oklch(0.96 0.02 240)",
} as const;

export function ChartsPanel() {
  const { metrics, timeline, threatBreakdown } = useSOC();

  const pieData = [
    { name: "Normal", value: metrics.normal },
    { name: "Suspicious", value: metrics.suspicious },
    { name: "Malicious", value: metrics.malicious },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
      <div className="glass rounded-xl p-3">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Traffic Classification
        </p>
        <div className="h-40">
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={pieData}
                innerRadius={36}
                outerRadius={62}
                paddingAngle={3}
                dataKey="value"
                stroke="none"
              >
                {pieData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i]} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-1 flex justify-around text-[10px] text-muted-foreground">
          {pieData.map((d, i) => (
            <div key={d.name} className="flex items-center gap-1">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: COLORS[i] }}
              />
              {d.name}
            </div>
          ))}
        </div>
      </div>

      <div className="glass rounded-xl p-3">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Threat Velocity
        </p>
        <div className="h-40">
          <ResponsiveContainer>
            <LineChart data={timeline}>
              <defs>
                <linearGradient id="lineGrad" x1="0" x2="1" y1="0" y2="0">
                  <stop offset="0%" stopColor="oklch(0.78 0.18 195)" />
                  <stop offset="100%" stopColor="oklch(0.7 0.22 310)" />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="oklch(0.95 0.02 240 / 0.06)" vertical={false} />
              <XAxis dataKey="t" tick={{ fontSize: 9, fill: "oklch(0.7 0.03 250)" }} />
              <YAxis tick={{ fontSize: 9, fill: "oklch(0.7 0.03 250)" }} width={20} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line
                type="monotone"
                dataKey="value"
                stroke="url(#lineGrad)"
                strokeWidth={2.5}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="glass rounded-xl p-3">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Threats by Type
        </p>
        <div className="h-40">
          <ResponsiveContainer>
            <BarChart data={threatBreakdown}>
              <CartesianGrid stroke="oklch(0.95 0.02 240 / 0.06)" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 9, fill: "oklch(0.7 0.03 250)" }} />
              <YAxis tick={{ fontSize: 9, fill: "oklch(0.7 0.03 250)" }} width={20} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "oklch(0.95 0.02 240 / 0.04)" }} />
              <Bar dataKey="count" fill="oklch(0.78 0.18 195)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
