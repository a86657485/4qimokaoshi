import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { GraduationCap, Users, ArrowRight, AlertCircle, Search, List } from "lucide-react";

const CLASSES = [
  "401", "402", "403", "404",
];

const CLASS_LABELS: Record<string, string> = {
  "401": "四(1)班",
  "402": "四(2)班",
  "403": "四(3)班",
  "404": "四(4)班",
};

export default function LoginPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [className, setClassName] = useState("");
  const [students, setStudents] = useState<string[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  // Fetch student list when class changes
  useEffect(() => {
    if (!className) {
      setStudents([]);
      return;
    }
    setLoadingStudents(true);
    fetch(`/api/students?class=${encodeURIComponent(className)}`)
      .then((r) => r.json())
      .then((names: string[]) => setStudents(names))
      .catch(() => setStudents([]))
      .finally(() => setLoadingStudents(false));
  }, [className]);

  const handleSelectName = (selectedName: string) => {
    setName(selectedName);
    setShowDropdown(false);
    setError("");
  };

  const handleLogin = async () => {
    if (!name.trim() || !className) {
      setError("请填写姓名并选择班级");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), className }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "登录失败");
        return;
      }

      if (data.resumed) {
        sessionStorage.setItem("examResumed", "true");
      }

      sessionStorage.setItem("sessionId", String(data.sessionId));
      sessionStorage.setItem("studentName", data.student.name);
      sessionStorage.setItem("className", data.student.className);
      sessionStorage.setItem("startTime", data.startTime);
      navigate("/exam");
    } catch {
      setError("无法连接服务器，请确认服务器已启动");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4 shadow-lg shadow-blue-200">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">四年级信息科技</h1>
          <h2 className="text-xl font-bold text-blue-600">期末在线考试</h2>
        </div>

        {/* Info card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 mb-5">
          <div className="flex items-start gap-3 mb-4">
            <div className="mt-0.5 text-amber-500 flex-shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div className="text-sm text-slate-600">
              <p className="font-medium text-slate-700 mb-2">考试须知</p>
              <ul className="space-y-1.5">
                <li>· 共 <span className="font-semibold text-slate-800">50</span> 道题，满分 <span className="font-semibold text-slate-800">100</span> 分</li>
                <li>· 考试时间 <span className="font-semibold text-slate-800">30</span> 分钟</li>
                <li>· 全部为客观题，系统自动批改</li>
                <li>· 每位同学只能提交一次</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Login form */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            <Users className="w-4 h-4 inline mr-1" />所在班级
          </label>
          <select
            value={className}
            onChange={(e) => { setClassName(e.target.value); setName(""); setError(""); }}
            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition mb-4 bg-white"
          >
            <option value="">请选择班级</option>
            {CLASSES.map((c) => (
              <option key={c} value={c}>{CLASS_LABELS[c]}</option>
            ))}
          </select>

          <label className="block text-sm font-medium text-slate-700 mb-1.5">你的姓名</label>

          {/* Name selection dropdown */}
          {className && students.length > 0 && (
            <div className="relative mb-3">
              <button
                type="button"
                onClick={() => setShowDropdown(!showDropdown)}
                className="w-full flex items-center justify-between px-4 py-2.5 border border-blue-300 bg-blue-50 rounded-lg text-sm text-blue-700 hover:bg-blue-100 transition"
              >
                <span className="flex items-center gap-2">
                  <List className="w-4 h-4" />
                  {loadingStudents ? "加载名单中..." : `从${CLASS_LABELS[className]}名单中选择`}
                </span>
                <span className="text-blue-400">{showDropdown ? "▲" : "▼"}</span>
              </button>

              {showDropdown && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  <div className="p-2">
                    {students.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => handleSelectName(s)}
                        className={`w-full text-left px-3 py-2 rounded-md text-sm transition ${name === s ? "bg-blue-100 text-blue-700 font-semibold" : "text-slate-700 hover:bg-slate-50"}`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Manual input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); setError(""); }}
              placeholder="或直接输入姓名"
              className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            />
          </div>

          {name && className && students.length > 0 && !students.includes(name) && (
            <p className="text-xs text-amber-600 mt-1.5 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              该姓名不在{CLASS_LABELS[className]}名单中，将作为新增学生处理
            </p>
          )}

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full mt-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition shadow-sm hover:shadow-md"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                开始考试 <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>

        <p className="text-center text-xs text-slate-400 mt-4">
          四年级信息科技 · 第16-26课期末考试
        </p>
      </div>
    </div>
  );
}
