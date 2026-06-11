export default function WeatherStation() {
  const temps = [
    { city: "深圳", temp: 28, emoji: "☀️" },
    { city: "北京", temp: 22, emoji: "🌤️" },
    { city: "哈尔滨", temp: 15, emoji: "❄️" },
    { city: "上海", temp: 25, emoji: "🌥️" },
    { city: "广州", temp: 30, emoji: "🔥" },
  ];

  const maxTemp = 35;
  const sortedDesc = [...temps].sort((a, b) => b.temp - a.temp);

  return (
    <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl p-4 border-2 border-cyan-200">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">🌡️</span>
        <span className="text-sm font-bold text-cyan-800">气象数据站 · 今日最高气温</span>
        <span className="text-[10px] text-cyan-400 ml-auto">点击可排序</span>
      </div>
      {/* Thermometer bars */}
      <div className="space-y-2">
        {sortedDesc.map((t, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-600 w-16">{t.city}</span>
            <div className="flex-1 h-8 bg-white rounded-lg border border-cyan-200 overflow-hidden relative">
              <div
                className="h-full rounded-lg transition-all flex items-center px-2"
                style={{
                  width: `${(t.temp / maxTemp) * 100}%`,
                  background: t.temp > 28 ? "linear-gradient(90deg, #f97316, #ef4444)" :
                             t.temp > 22 ? "linear-gradient(90deg, #f59e0b, #f97316)" :
                             "linear-gradient(90deg, #06b6d4, #3b82f6)",
                }}>
                <span className="text-white text-xs font-bold">{t.emoji} {t.temp}℃</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-2 text-[10px] text-cyan-500">
        <span>已按降序排列（从高到低）</span>
        <span>平均: {Math.round(temps.reduce((s,t)=>s+t.temp,0)/temps.length)}℃</span>
      </div>
    </div>
  );
}
