const NODES = [
  { id: "liubei", label: "刘备", x: 200, y: 40, color: "#ef4444", emoji: "👑" },
  { id: "guanyu", label: "关羽", x: 100, y: 120, color: "#ef4444", emoji: "⚔️" },
  { id: "zhangfei", label: "张飞", x: 300, y: 120, color: "#ef4444", emoji: "🛡️" },
  { id: "caocao", label: "曹操", x: 200, y: 260, color: "#3b82f6", emoji: "🐺" },
  { id: "sunquan", label: "孙权", x: 400, y: 200, color: "#22c55e", emoji: "🐉" },
  { id: "zhugeliang", label: "诸葛亮", x: 50, y: 200, color: "#ef4444", emoji: "🪶" },
];

const EDGES = [
  { from: "liubei", to: "guanyu", label: "结拜兄弟" },
  { from: "liubei", to: "zhangfei", label: "结拜兄弟" },
  { from: "liubei", to: "zhugeliang", label: "君臣" },
  { from: "liubei", to: "caocao", label: "对手", dashed: true },
  { from: "liubei", to: "sunquan", label: "盟友", dashed: true },
  { from: "caocao", to: "sunquan", label: "对手", dashed: true },
];

export default function KnowledgeGraph() {
  return (
    <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-4 border-2 border-orange-200">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">🌟</span>
        <span className="text-sm font-bold text-orange-800">《三国演义》人物关系图</span>
        <span className="text-[10px] text-orange-400 ml-auto">节点=人物 · 连线=关系</span>
      </div>
      <svg width="100%" viewBox="0 0 460 300" className="mx-auto" style={{ maxWidth: "420px" }}>
        {/* Edges */}
        {EDGES.map((edge, i) => {
          const from = NODES.find((n) => n.id === edge.from)!;
          const to = NODES.find((n) => n.id === edge.to)!;
          return (
            <g key={i}>
              <line
                x1={from.x + 25} y1={from.y + 14} x2={to.x + 25} y2={to.y + 14}
                stroke={edge.dashed ? "#d4d4d8" : "#a1a1aa"}
                strokeWidth={edge.dashed ? "1.5" : "2"}
                strokeDasharray={edge.dashed ? "6,3" : "none"}
              />
              <text
                x={(from.x + to.x) / 2 + 25} y={(from.y + to.y) / 2 + 10}
                textAnchor="middle" fontSize="9" fill="#71717a"
                className="bg-white/80 px-1"
              >
                {edge.label}
              </text>
            </g>
          );
        })}
        {/* Nodes */}
        {NODES.map((node) => (
          <g key={node.id}>
            <rect
              x={node.x} y={node.y} width={50} height={28} rx="14"
              fill="white" stroke={node.color} strokeWidth="2"
            />
            <text
              x={node.x + 25} y={node.y + 18}
              textAnchor="middle" fontSize="11" fontWeight="bold"
              fill={node.color}
            >
              {node.label}
            </text>
          </g>
        ))}
      </svg>
      <div className="flex flex-wrap gap-3 justify-center mt-2">
        <div className="flex items-center gap-1 text-[10px] text-slate-500">
          <div className="w-3 h-3 rounded-full bg-red-500" /> 蜀汉
        </div>
        <div className="flex items-center gap-1 text-[10px] text-slate-500">
          <div className="w-3 h-3 rounded-full bg-blue-500" /> 曹魏
        </div>
        <div className="flex items-center gap-1 text-[10px] text-slate-500">
          <div className="w-3 h-3 rounded-full bg-green-500" /> 东吴
        </div>
        <div className="flex items-center gap-1 text-[10px] text-slate-500">
          <span style={{ borderTop: "2px dashed #d4d4d8", width: 16, display: "inline-block" }} /> 对手关系
        </div>
      </div>
    </div>
  );
}
