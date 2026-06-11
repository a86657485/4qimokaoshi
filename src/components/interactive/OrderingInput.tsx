import type { OrderingQuestion } from "../../questions";
import type { LessonTheme } from "../../themes";
import { X } from "lucide-react";

interface Props {
  oq: OrderingQuestion;
  answer: number[] | undefined;
  onChange: (val: number[]) => void;
  theme: LessonTheme;
}

export default function OrderingInput({ oq, answer, onChange, theme }: Props) {
  const currentOrder: number[] = answer || [];

  const handleToggle = (stepIndex: number) => {
    const pos = currentOrder.indexOf(stepIndex);
    if (pos >= 0) {
      // Remove from current position
      const newOrder = [...currentOrder];
      newOrder.splice(pos, 1);
      onChange(newOrder);
    } else {
      // Add to the end
      onChange([...currentOrder, stepIndex]);
    }
  };

  const handleMoveUp = (stepIndex: number) => {
    const pos = currentOrder.indexOf(stepIndex);
    if (pos <= 0) return;
    const newOrder = [...currentOrder];
    [newOrder[pos - 1], newOrder[pos]] = [newOrder[pos], newOrder[pos - 1]];
    onChange(newOrder);
  };

  const handleMoveDown = (stepIndex: number) => {
    const pos = currentOrder.indexOf(stepIndex);
    if (pos < 0 || pos >= currentOrder.length - 1) return;
    const newOrder = [...currentOrder];
    [newOrder[pos], newOrder[pos + 1]] = [newOrder[pos + 1], newOrder[pos]];
    onChange(newOrder);
  };

  const placedSteps = currentOrder.map(idx => ({ idx, text: oq.steps[idx] }));
  const unplacedSteps = oq.steps
    .map((text, idx) => ({ idx, text }))
    .filter(s => !currentOrder.includes(s.idx));

  return (
    <div>
      <p className="text-sm text-slate-700 mb-3">{oq.instruction}</p>

      {/* Placed steps - ordered list */}
      {placedSteps.length > 0 && (
        <div className="space-y-1.5 mb-3">
          {placedSteps.map((s, i) => (
            <div
              key={s.idx}
              className="flex items-center gap-2 bg-slate-50 rounded-xl p-2.5 border-2 transition-all"
              style={{ borderColor: theme.color + "40" }}
            >
              <span
                className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                style={{ backgroundColor: theme.color }}
              >
                {i + 1}
              </span>
              <span className="flex-1 text-sm text-slate-700">{s.text}</span>
              <div className="flex items-center gap-0.5">
                <button
                  type="button"
                  onClick={() => handleMoveUp(s.idx)}
                  disabled={i === 0}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-200 disabled:opacity-20 transition"
                  title="上移"
                >
                  <svg width="12" height="12" viewBox="0 0 12 12"><path d="M6 3L2 8h8L6 3z" fill="currentColor"/></svg>
                </button>
                <button
                  type="button"
                  onClick={() => handleMoveDown(s.idx)}
                  disabled={i === placedSteps.length - 1}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-200 disabled:opacity-20 transition"
                  title="下移"
                >
                  <svg width="12" height="12" viewBox="0 0 12 12"><path d="M6 9l4-5H2l4 5z" fill="currentColor"/></svg>
                </button>
                <button
                  type="button"
                  onClick={() => handleToggle(s.idx)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-50 hover:text-red-500 transition"
                  title="移除"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Unplaced steps */}
      {unplacedSteps.length > 0 && (
        <div>
          <p className="text-[10px] text-slate-400 mb-1.5">点击添加步骤：</p>
          <div className="flex flex-wrap gap-2">
            {unplacedSteps.map((s) => (
              <button
                key={s.idx}
                type="button"
                onClick={() => handleToggle(s.idx)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium border-2 border-dashed border-slate-300 text-slate-500 hover:border-slate-400 hover:text-slate-700 hover:bg-slate-50 transition"
              >
                + {s.text}
              </button>
            ))}
          </div>
        </div>
      )}

      <p className="text-[10px] text-slate-400 mt-2">
        点击下方步骤添加到序列 · 点击已排序步骤可移除 · 使用上下箭头调整顺序
      </p>
    </div>
  );
}
