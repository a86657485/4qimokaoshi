const WORD_DATA = [
  { text: "孙悟空", size: 42, color: "#ef4444" },
  { text: "唐僧", size: 36, color: "#f59e0b" },
  { text: "猪八戒", size: 32, color: "#22c55e" },
  { text: "沙和尚", size: 28, color: "#3b82f6" },
  { text: "妖怪", size: 26, color: "#8b5cf6" },
  { text: "西天", size: 22, color: "#ec4899" },
  { text: "取经", size: 20, color: "#06b6d4" },
  { text: "如来", size: 18, color: "#84cc16" },
  { text: "观音", size: 17, color: "#f97316" },
  { text: "白龙马", size: 14, color: "#64748b" },
  { text: "花果山", size: 13, color: "#14b8a6" },
  { text: "金箍棒", size: 12, color: "#a855f7" },
  { text: "天庭", size: 11, color: "#78716c" },
  { text: "蟠桃", size: 10, color: "#f43f5e" },
  { text: "龙宫", size: 9, color: "#0ea5e9" },
];

export default function WordCloud() {
  return (
    <div className="bg-gradient-to-br from-fuchsia-50 to-purple-50 rounded-xl p-4 border-2 border-fuchsia-200">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">☁️</span>
        <span className="text-sm font-bold text-fuchsia-800">《西游记》词云图</span>
        <span className="text-[10px] text-fuchsia-400 ml-auto">字越大=出现越多</span>
      </div>
      <div className="flex flex-wrap justify-center items-center gap-1.5 min-h-[150px] p-2">
        {WORD_DATA.map((word, i) => (
          <span
            key={i}
            className="inline-block font-bold transition-all hover:scale-110 cursor-default"
            style={{
              fontSize: `${word.size}px`,
              color: word.color,
              opacity: 0.85,
              lineHeight: 1.2,
              filter: `drop-shadow(0 1px 2px ${word.color}40)`,
            }}
          >
            {word.text}
          </span>
        ))}
      </div>
    </div>
  );
}

export { WORD_DATA };
