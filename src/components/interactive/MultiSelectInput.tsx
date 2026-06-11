import type { MultiSelectQuestion } from "../../questions";
import type { LessonTheme } from "../../themes";

interface Props {
  msq: MultiSelectQuestion;
  answer: number[] | undefined;
  onChange: (val: number[]) => void;
  theme: LessonTheme;
}

export default function MultiSelectInput({ msq, answer, onChange, theme }: Props) {
  const selected = answer || [];

  const toggle = (idx: number) => {
    if (selected.includes(idx)) {
      onChange(selected.filter((i) => i !== idx));
    } else {
      onChange([...selected, idx]);
    }
  };

  return (
    <div>
      <p className="text-xs font-semibold text-amber-600 mb-2">
        (多选题) 请选择所有正确的答案
      </p>
      <div className="space-y-2">
        {msq.options.map((opt, idx) => {
          const isChecked = selected.includes(idx);
          return (
            <button
              key={idx}
              onClick={() => toggle(idx)}
              className="w-full text-left px-4 py-3 rounded-xl border-2 transition-all flex items-center gap-3"
              style={
                isChecked
                  ? { borderColor: theme.color, backgroundColor: theme.color + "12" }
                  : { borderColor: "#e2e8f0" }
              }
            >
              <div
                className="w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all"
                style={
                  isChecked
                    ? { borderColor: theme.color, backgroundColor: theme.color }
                    : { borderColor: "#cbd5e1", backgroundColor: "white" }
                }
              >
                {isChecked && (
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M2 7L5.5 10.5L12 3.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              <span className="text-sm" style={{ color: isChecked ? "#1e293b" : "#475569" }}>
                {opt}
              </span>
            </button>
          );
        })}
      </div>
      <p className="text-[10px] text-slate-400 mt-1">
        已选 {selected.length} 项
      </p>
    </div>
  );
}
