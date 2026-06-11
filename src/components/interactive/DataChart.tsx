interface ChartProps {
  type: "bar" | "line" | "pie";
  data: { label: string; value: number; color?: string }[];
  title: string;
}

const COLORS = ["#3b82f6", "#ef4444", "#22c55e", "#f59e0b", "#8b5cf6", "#ec4899", "#06b6d4"];

export default function DataChart({ type, data, title }: ChartProps) {
  if (type === "pie") return <PieChart data={data} title={title} />;
  if (type === "line") return <LineChart data={data} title={title} />;
  return <BarChart data={data} title={title} />;
}

function BarChart({ data, title }: { data: ChartProps["data"]; title: string }) {
  const maxVal = Math.max(...data.map((d) => d.value));
  const chartH = 160;
  const chartW = data.length * 60 + 40;
  const barW = 32;

  return (
    <div className="bg-white rounded-xl p-4 border border-slate-200">
      <div className="text-sm font-bold text-slate-700 mb-3">📊 {title}</div>
      <svg width="100%" viewBox={`0 0 ${chartW} ${chartH + 40}`} className="mx-auto" style={{ maxWidth: "100%" }}>
        {/* Y axis grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((pct) => {
          const y = chartH - pct * chartH;
          return (
            <g key={pct}>
              <line x1="30" y1={y} x2={chartW - 10} y2={y} stroke="#e2e8f0" strokeWidth="1" />
              <text x="25" y={y + 4} textAnchor="end" fontSize="9" fill="#94a3b8">
                {Math.round(maxVal * pct)}
              </text>
            </g>
          );
        })}
        {/* Bars */}
        {data.map((d, i) => {
          const barH = (d.value / maxVal) * chartH;
          const x = 40 + i * 60;
          const y = chartH - barH;
          return (
            <g key={i}>
              <rect x={x} y={y} width={barW} height={barH} rx="4"
                fill={d.color || COLORS[i % COLORS.length]} opacity="0.85" />
              <text x={x + barW / 2} y={y - 5} textAnchor="middle" fontSize="10" fontWeight="bold" fill="#475569">
                {d.value}
              </text>
              <text x={x + barW / 2} y={chartH + 16} textAnchor="middle" fontSize="9" fill="#64748b">
                {d.label.length > 4 ? d.label.slice(0, 4) + ".." : d.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function LineChart({ data, title }: { data: ChartProps["data"]; title: string }) {
  const maxVal = Math.max(...data.map((d) => d.value));
  const chartW = 300;
  const chartH = 140;
  const padding = { left: 35, right: 15, top: 10, bottom: 25 };
  const plotW = chartW - padding.left - padding.right;
  const plotH = chartH - padding.top - padding.bottom;

  const points = data.map((d, i) => {
    const x = padding.left + (i / (data.length - 1)) * plotW;
    const y = padding.top + plotH - (d.value / maxVal) * plotH;
    return `${x},${y}`;
  }).join(" ");

  return (
    <div className="bg-white rounded-xl p-4 border border-slate-200">
      <div className="text-sm font-bold text-slate-700 mb-3">📈 {title}</div>
      <svg width="100%" viewBox={`0 0 ${chartW} ${chartH}`} className="mx-auto" style={{ maxWidth: "100%" }}>
        {/* Grid */}
        {[0, 0.5, 1].map((pct) => {
          const y = padding.top + plotH - pct * plotH;
          return (
            <g key={pct}>
              <line x1={padding.left} y1={y} x2={chartW - padding.right} y2={y} stroke="#e2e8f0" strokeWidth="1" />
              <text x={padding.left - 4} y={y + 3} textAnchor="end" fontSize="8" fill="#94a3b8">
                {Math.round(maxVal * pct)}
              </text>
            </g>
          );
        })}
        {/* Line */}
        <polyline points={points} fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {/* Dots */}
        {data.map((d, i) => {
          const x = padding.left + (i / (data.length - 1)) * plotW;
          const y = padding.top + plotH - (d.value / maxVal) * plotH;
          return (
            <g key={i}>
              <circle cx={x} cy={y} r="4" fill="white" stroke="#3b82f6" strokeWidth="2" />
              <text x={x} y={y - 8} textAnchor="middle" fontSize="9" fontWeight="bold" fill="#1e40af">
                {d.value}
              </text>
              <text x={x} y={chartH - 3} textAnchor="middle" fontSize="8" fill="#64748b">
                {d.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function PieChart({ data, title }: { data: ChartProps["data"]; title: string }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  const r = 60;
  const cx = 80, cy = 80;
  let cumulative = 0;
  const slices = data.map((d) => {
    const startAngle = (cumulative / total) * 360;
    cumulative += d.value;
    const endAngle = (cumulative / total) * 360;
    return { ...d, startAngle, endAngle };
  });

  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const arcPath = (start: number, end: number) => {
    const sRad = toRad(start - 90);
    const eRad = toRad(end - 90);
    const x1 = cx + r * Math.cos(sRad);
    const y1 = cy + r * Math.sin(sRad);
    const x2 = cx + r * Math.cos(eRad);
    const y2 = cy + r * Math.sin(eRad);
    const large = end - start > 180 ? 1 : 0;
    return `M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${large} 1 ${x2},${y2} Z`;
  };

  return (
    <div className="bg-white rounded-xl p-4 border border-slate-200">
      <div className="text-sm font-bold text-slate-700 mb-3">🥧 {title}</div>
      <div className="flex flex-wrap items-center gap-4">
        <svg width="160" height="160" viewBox="0 0 160 160">
          {slices.map((s, i) => (
            <path key={i} d={arcPath(s.startAngle, s.endAngle)}
              fill={s.color || COLORS[i % COLORS.length]} stroke="white" strokeWidth="2" />
          ))}
          <circle cx={cx} cy={cy} r="30" fill="white" />
          <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle" fontSize="12" fontWeight="bold" fill="#475569">
            总计{total}
          </text>
        </svg>
        <div className="space-y-1.5">
          {slices.map((s, i) => (
            <div key={i} className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: s.color || COLORS[i % COLORS.length] }} />
              <span className="text-slate-600">{s.label}</span>
              <span className="font-bold text-slate-800">{s.value} ({Math.round((s.value/total)*100)}%)</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
