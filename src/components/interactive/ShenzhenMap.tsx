import { useState } from "react";

const LANDMARKS = [
  { id: "tech", name: "科技园", x: 55, y: 55, emoji: "💻", data: "高新企业: 2.8万家", desc: "科技创新中心" },
  { id: "park", name: "深圳湾公园", x: 40, y: 80, emoji: "🌿", data: "公园总数: 1260个", desc: "千园之城" },
  { id: "metro", name: "深圳北站", x: 65, y: 35, emoji: "🚄", data: "地铁里程: 559km", desc: "交通枢纽" },
  { id: "school", name: "深圳大学", x: 50, y: 70, emoji: "🎓", data: "高校: 15所", desc: "教育高地" },
];

export default function ShenzhenMap() {
  const [active, setActive] = useState<string | null>(null);

  return (
    <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl p-4 border-2 border-amber-200">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">🗺️</span>
        <span className="text-sm font-bold text-amber-800">深圳城市数据地图</span>
        <span className="text-[10px] text-amber-400 ml-auto">点击地标查看数据</span>
      </div>

      {/* Simplified Shenzhen map outline */}
      <div className="relative bg-white rounded-xl border border-amber-200 overflow-hidden" style={{ height: 220 }}>
        {/* Background shape - simplified Shenzhen */}
        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full opacity-10">
          <polygon points="20,20 80,15 90,50 85,85 60,90 30,80 15,55" fill="#b45309" />
        </svg>
        
        {/* Grid lines for map feel */}
        <div className="absolute inset-0" style={{
          backgroundImage: "linear-gradient(#fef3c7 1px, transparent 1px), linear-gradient(90deg, #fef3c7 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }} />

        {/* Landmarks */}
        {LANDMARKS.map((lm) => (
          <button
            key={lm.id}
            onClick={() => setActive(active === lm.id ? null : lm.id)}
            className={`absolute transition-all transform -translate-x-1/2 -translate-y-1/2 ${
              active === lm.id ? "scale-125 z-10" : "hover:scale-110 z-0"
            }`}
            style={{ left: `${lm.x}%`, top: `${lm.y}%` }}>
            <div className="relative">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl shadow-lg transition-all ${
                active === lm.id ? "bg-amber-500 ring-4 ring-amber-300" : "bg-white border-2 border-amber-400"
              }`}>
                {lm.emoji}
              </div>
              <div className="text-[9px] font-bold text-slate-600 mt-0.5 text-center whitespace-nowrap">
                {lm.name}
              </div>
              {/* Data popup */}
              {active === lm.id && (
                <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-white rounded-lg shadow-xl border border-amber-200 p-2 z-20 min-w-[120px]">
                  <div className="text-[10px] font-bold text-slate-700">{lm.desc}</div>
                  <div className="text-[11px] text-amber-700 font-bold mt-0.5">{lm.data}</div>
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white border-t border-l border-amber-200 rotate-45" />
                </div>
              )}
            </div>
          </button>
        ))}

        {/* Map labels */}
        <div className="absolute top-2 left-2 text-[10px] text-amber-400 font-bold">深圳市</div>
        <div className="absolute bottom-2 right-2 text-[10px] text-slate-300">示意地图 · 非真实比例</div>
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-3 mt-2 text-[10px] text-slate-500">
        <span>💻 科技</span>
        <span>🌿 生态</span>
        <span>🚄 交通</span>
        <span>🎓 教育</span>
      </div>
    </div>
  );
}
