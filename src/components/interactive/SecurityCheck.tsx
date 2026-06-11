import { useState } from "react";

const SCENARIOS = [
  {
    title: "注册新账号",
    detail: "网站要求填写：姓名、手机号、家庭住址、身份证号",
    risk: "high",
    emoji: "⚠️",
    tip: "家庭住址和身份证号属于高度敏感信息，不应随意填写！",
  },
  {
    title: "使用昵称聊天",
    detail: "只用昵称'阳光少年'在网上和朋友聊天",
    risk: "low",
    emoji: "✅",
    tip: "使用昵称代替真实姓名，是保护隐私的好习惯。",
  },
  {
    title: "AI换脸视频",
    detail: "收到一个视频，显示'老师'让你转账交费",
    risk: "high",
    emoji: "⚠️",
    tip: "AI可以伪造人脸和声音！一定要通过电话核实身份。",
  },
];

export default function SecurityCheck() {
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-4 border-2 border-red-200">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">🛡️</span>
        <span className="text-sm font-bold text-red-800">数据安全检测中心</span>
        <span className="text-[10px] text-red-400 ml-auto">点击查看风险等级</span>
      </div>
      <div className="space-y-2">
        {SCENARIOS.map((s, i) => (
          <button
            key={i}
            onClick={() => setSelected(i)}
            className={`w-full text-left p-3 rounded-xl border-2 transition-all ${
              selected === i
                ? s.risk === "high" ? "border-red-400 bg-red-50" : "border-green-400 bg-green-50"
                : "border-slate-200 bg-white hover:border-slate-300"
            }`}>
            <div className="flex items-center gap-2">
              <span className="text-lg">{s.emoji}</span>
              <div className="flex-1">
                <div className="text-sm font-bold text-slate-700">{s.title}</div>
                <div className="text-xs text-slate-500">{s.detail}</div>
              </div>
              {selected === i && (
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  s.risk === "high" ? "bg-red-500 text-white" : "bg-green-500 text-white"
                }`}>
                  {s.risk === "high" ? "高风险" : "低风险"}
                </span>
              )}
            </div>
            {selected === i && (
              <div className="mt-2 pt-2 border-t border-slate-200 text-xs text-slate-600">
                💡 {s.tip}
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
