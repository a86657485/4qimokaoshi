﻿import type { LessonTheme } from "../../themes";

interface Props {
  fbq: any;
  answer: string | undefined;
  onChange: (val: string) => void;
  theme: LessonTheme;
}

export default function FillBlankInput({ fbq, answer, onChange, theme }: Props) {
  return (
    <div>
      <p className="text-sm text-slate-700 mb-3">{fbq.question}</p>
      <input
        type="text"
        value={answer || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder="在此输入答案..."
        className="w-full px-4 py-3 border-2 rounded-xl text-base text-slate-800 placeholder-slate-300 focus:outline-none transition"
        style={{ borderColor: answer ? theme.color : "#e2e8f0" }}
        autoComplete="off"
      />
      <p className="text-[10px] text-slate-400 mt-1">请输入缺失的词语</p>
    </div>
  );
}
