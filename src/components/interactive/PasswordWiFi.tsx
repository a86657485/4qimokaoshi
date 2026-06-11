
const PASSWORDS = [
  { pwd: "123456", strength: 0, label: "极弱", color: "#ef4444" },
  { pwd: "password", strength: 1, label: "弱", color: "#f97316" },
  { pwd: "XiaoMing2014", strength: 3, label: "中", color: "#eab308" },
  { pwd: "Xm_2014@Safe!", strength: 5, label: "强", color: "#22c55e" },
];

const WIFI_LIST = [
  { name: "Starbucks_Free", safe: false, emoji: "☕" },
  { name: "School_WiFi_5G", safe: true, emoji: "🏫" },
  { name: "Free_Internet_Here", safe: false, emoji: "⚠️" },
  { name: "Classroom_Network", safe: true, emoji: "📚" },
];

export default function PasswordWiFi() {
  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border-2 border-green-200 space-y-4">
      {/* Password strength */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">🔑</span>
          <span className="text-sm font-bold text-green-800">密码安全性检测</span>
        </div>
        <div className="space-y-1.5">
          {PASSWORDS.map((p, i) => (
            <div key={i} className="flex items-center gap-2 bg-white rounded-lg p-2 border border-slate-200">
              <code className="text-xs text-slate-600 w-28 truncate">{p.pwd}</code>
              <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{
                  width: `${(p.strength / 5) * 100}%`,
                  backgroundColor: p.color,
                }} />
              </div>
              <span className="text-[10px] font-bold w-8 text-right" style={{ color: p.color }}>
                {p.label}
              </span>
            </div>
          ))}
        </div>
        <div className="text-[10px] text-green-500 mt-1">
          密码越长、包含字符种类越多 = 越安全
        </div>
      </div>

      {/* WiFi scanner */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">📶</span>
          <span className="text-sm font-bold text-green-800">WiFi安全扫描</span>
        </div>
        <div className="space-y-1.5">
          {WIFI_LIST.map((w, i) => (
            <div key={i} className="flex items-center gap-2 bg-white rounded-lg p-2 border border-slate-200">
              <span className="text-base">{w.emoji}</span>
              <span className="text-xs text-slate-600 flex-1">{w.name}</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                w.safe ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
              }`}>
                {w.safe ? "🔒 安全" : "⚠️ 可疑"}
              </span>
            </div>
          ))}
        </div>
        <div className="text-[10px] text-green-500 mt-1">
          来源不明的免费WiFi可能窃取你的信息！
        </div>
      </div>
    </div>
  );
}
