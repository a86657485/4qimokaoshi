interface Props {
  total: number;
  answered: Set<number>;
  currentIndex: number;
  onSelect: (index: number) => void;
}

export default function QuestionNav({ total, answered, currentIndex, onSelect }: Props) {
  const sections = [
    { label: "选择题", start: 0, end: 20, pts: "2.5分" },
    { label: "判断题", start: 20, end: 30, pts: "2分" },
    { label: "匹配题", start: 30, end: 35, pts: "6分" },
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <h3 className="text-sm font-semibold text-slate-500 mb-3">题目导航</h3>
      {sections.map((sec) => (
        <div key={sec.label} className="mb-3 last:mb-0">
          <div className="text-xs text-slate-400 mb-1.5 flex justify-between">
            <span>{sec.label}</span>
            <span>{sec.pts}/题</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {Array.from({ length: sec.end - sec.start }, (_, i) => {
              const idx = sec.start + i;
              const qNum = idx + 1;
              const isActive = idx === currentIndex;
              const isAnswered = answered.has(idx);
              return (
                <button
                  key={idx}
                  onClick={() => onSelect(idx)}
                  className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all flex items-center justify-center ${
                    isActive
                      ? "bg-blue-600 text-white shadow-sm"
                      : isAnswered
                      ? "bg-green-100 text-green-700 border border-green-300"
                      : "bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200"
                  }`}
                >
                  {qNum}
                </button>
              );
            })}
          </div>
        </div>
      ))}
      <div className="mt-3 pt-3 border-t border-slate-100 flex justify-between text-xs text-slate-400">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-green-100 border border-green-300 inline-block" /> 已答
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-slate-100 border border-slate-200 inline-block" /> 未答
        </span>
        <span>{answered.size}/{total} 已答</span>
      </div>
    </div>
  );
}
