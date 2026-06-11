import { useEffect, useState, useCallback } from "react";
import { BarChart3, Download, RefreshCw, Users, TrendingUp, AlertCircle, Trash2, Award, Clock, Monitor, CheckCircle2, Circle, X } from "lucide-react";

interface ClassStat {
  class_name: string;
  total_exams: number;
  avg_score: number | null;
  max_score: number | null;
  min_score: number | null;
  avg_time_seconds: number | null;
  above90: number;
  above80: number;
  above60: number;
  below60: number;
}

interface QuestionStat {
  question_id: string;
  question_type: string;
  total_answers: number;
  correct_answers: number;
  accuracy_pct: number;
}

interface StudentResult {
  name: string;
  class_name: string;
  score: number;
  total_points: number;
  correct_count: number;
  total_questions: number;
  time_used_seconds: number;
  submit_time: string;
}

interface StatsData {
  classStats: ClassStat[];
  questionStats: QuestionStat[];
  allResults: StudentResult[];
}

interface RosterStudent {
  name: string;
  submitted: boolean;
  score: number | null;
  correctCount: number | null;
  timeUsed: number | null;
  submitTime: string | null;
}

interface ClassRoster {
  total: number;
  submitted: number;
  students: RosterStudent[];
}

interface RosterData {
  [className: string]: ClassRoster;
}

const CLASS_LABELS: Record<string, string> = {
  "401": "四(1)班",
  "402": "四(2)班",
  "403": "四(3)班",
  "404": "四(4)班",
};

const CLASS_ORDER = ["401", "402", "403", "404"];

export default function AdminPage() {
  const [data, setData] = useState<StatsData | null>(null);
  const [roster, setRoster] = useState<RosterData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"overview" | "questions" | "students" | "dashboard" | "reset">("overview");
  const [resetName, setResetName] = useState("");
  const [resetClass, setResetClass] = useState("");
  const [resetMsg, setResetMsg] = useState("");

  const fetchData = useCallback(() => {
    setLoading(true);
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const fetchRoster = useCallback(() => {
    fetch("/api/admin/roster")
      .then((r) => r.json())
      .then(setRoster)
      .catch(console.error);
  }, []);

  useEffect(() => { fetchData(); fetchRoster(); }, [fetchData, fetchRoster]);

  const refreshAll = () => { fetchData(); fetchRoster(); };

  const handleExport = () => {
    window.open("/api/admin/export", "_blank");
  };

  const handleReset = async () => {
    if (!resetName.trim() || !resetClass) {
      setResetMsg("请填写姓名和班级");
      return;
    }
    const res = await fetch("/api/admin/reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: resetName.trim(), className: resetClass }),
    });
    const result = await res.json();
    setResetMsg(result.message || result.error || "");
    if (result.success) {
      setResetName("");
      setResetClass("");
      fetchData();
      fetchRoster();
    }
  };

  const tabs = [
    { id: "dashboard" as const, label: "数据大屏", icon: Monitor },
    { id: "overview" as const, label: "班级概览", icon: BarChart3 },
    { id: "questions" as const, label: "逐题分析", icon: TrendingUp },
    { id: "students" as const, label: "学生成绩", icon: Users },
    { id: "reset" as const, label: "重置管理", icon: Trash2 },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Award className="w-7 h-7 text-blue-600" />
            <div>
              <h1 className="text-xl font-bold text-slate-800">教师管理面板</h1>
              <p className="text-xs text-slate-400">四年级信息科技期末考试 · 成绩统计</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExport}
              className="flex items-center gap-1.5 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition"
            >
              <Download className="w-4 h-4" /> 导出Excel
            </button>
            <button
              onClick={refreshAll}
              className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition text-sm"
            >
              <RefreshCw className="w-4 h-4" /> 刷新
            </button>
          </div>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto flex overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-5 py-3 text-sm font-medium border-b-2 transition whitespace-nowrap ${
                tab === t.id
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              <t.icon className="w-4 h-4" /> {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-6">
        {tab === "dashboard" && <DashboardTab roster={roster} onRefresh={refreshAll} />}
        {tab !== "dashboard" && (
          loading ? (
            <div className="text-center py-20">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-slate-400">加载统计数据...</p>
            </div>
          ) : !data || data.classStats.length === 0 ? (
            <div className="text-center py-20">
              <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">暂无考试数据</p>
              <p className="text-sm text-slate-400 mt-1">等待学生完成考试后，数据将显示在这里</p>
            </div>
          ) : (
            <>
              {tab === "overview" && <OverviewTab data={data} />}
              {tab === "questions" && <QuestionsTab data={data} />}
              {tab === "students" && <StudentsTab data={data} />}
              {tab === "reset" && (
                <div className="bg-white rounded-xl border border-slate-200 p-6 max-w-md">
                  <h3 className="font-bold text-slate-800 mb-4">重置学生考试记录</h3>
                  <p className="text-sm text-slate-500 mb-4">允许指定学生重新参加考试（将清除其所有考试记录）</p>
                  <input
                    type="text"
                    placeholder="学生姓名"
                    value={resetName}
                    onChange={(e) => setResetName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <select
                    value={resetClass}
                    onChange={(e) => setResetClass(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="">选择班级</option>
                    {Array.from({ length: 4 }, (_, i) => (
                      <option key={i} value={`四(${i + 1})班`}>四({i + 1})班</option>
                    ))}
                  </select>
                  <button
                    onClick={handleReset}
                    className="w-full py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-semibold transition"
                  >
                    确认重置
                  </button>
                  {resetMsg && (
                    <p className={`mt-3 text-sm ${resetMsg.includes("成功") ? "text-green-600" : "text-red-600"}`}>
                      {resetMsg}
                    </p>
                  )}
                </div>
              )}
            </>
          )
        )}
      </div>
    </div>
  );
}

// ====== Dashboard Tab ======
function DashboardTab({ roster, onRefresh }: { roster: RosterData | null; onRefresh: () => void }) {
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [resetTarget, setResetTarget] = useState<{name:string; cls:string} | null>(null);
  const [resetMsg, setResetMsg] = useState("");

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(onRefresh, 10000);
    return () => clearInterval(interval);
  }, [autoRefresh, onRefresh]);

  if (!roster || Object.keys(roster).length === 0) {
    return (
      <div className="text-center py-20">
        <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <p className="text-slate-500">名单数据加载中...</p>
      </div>
    );
  }

  // Compute totals
  let totalStudents = 0;
  let totalSubmitted = 0;
  for (const cls of CLASS_ORDER) {
    const c = roster[cls];
    if (c) {
      totalStudents += c.total;
      totalSubmitted += c.submitted;
    }
  }
  const totalUnsubmitted = totalStudents - totalSubmitted;
  const overallPct = totalStudents > 0 ? Math.round((totalSubmitted / totalStudents) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Overall summary bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Monitor className="w-5 h-5 text-blue-600" />
            提交状态总览
          </h2>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1.5 text-xs text-slate-500 cursor-pointer">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="w-3.5 h-3.5"
              />
              自动刷新 (10s)
            </label>
            <button
              onClick={onRefresh}
              className="flex items-center gap-1 px-2 py-1 text-xs text-slate-500 hover:text-slate-700 transition"
            >
              <RefreshCw className="w-3 h-3" /> 手动刷新
            </button>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-4">
          <SummaryItem label="学生总数" value={totalStudents} color="slate" />
          <SummaryItem label="已提交" value={totalSubmitted} color="green" />
          <SummaryItem label="未提交" value={totalUnsubmitted} color="red" />
          <SummaryItem label="完成率" value={`${overallPct}%`} color="blue" />
        </div>
      </div>

      {/* Per-class boards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {CLASS_ORDER.map((cls) => {
          const classData = roster[cls];
          if (!classData) return null;
          const pct = classData.total > 0 ? Math.round((classData.submitted / classData.total) * 100) : 0;
          return (
            <div key={cls} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              {/* Class header */}
              <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between" style={{ backgroundColor: pct === 100 ? "#f0fdf4" : "#f8fafc" }}>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-slate-800">{CLASS_LABELS[cls]}</span>
                  <span className="text-xs text-slate-400">({classData.submitted}/{classData.total})</span>
                </div>
                <div className="flex items-center gap-2">
                  {/* Progress bar */}
                  <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${pct === 100 ? "bg-green-500" : "bg-blue-500"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className={`text-sm font-bold ${pct === 100 ? "text-green-600" : "text-blue-600"}`}>{pct}%</span>
                </div>
              </div>
              {/* Student name grid */}
              <div className="p-4">
                <div className="flex flex-wrap gap-2">
                  {classData.students.map((s) => (
                    <div
                      key={s.name}
                      onClick={(e) => { e.stopPropagation(); if (s.submitted) setResetTarget({name: s.name, cls: cls}); }}
                      title={s.submitted ? `${s.name} · ${s.score?.toFixed(1)}分 · ${s.submitTime ? new Date(s.submitTime).toLocaleTimeString("zh-CN", {hour:"2-digit",minute:"2-digit"}) : ""}` : `${s.name} · 未提交`}
                      className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer hover:ring-2 hover:ring-blue-300 ${
                        s.submitted
                          ? "bg-green-100 text-green-700 border border-green-200 shadow-sm"
                          : "bg-slate-100 text-slate-400 border border-slate-200"
                      }`}
                    >
                      {s.submitted ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                      ) : (
                        <Circle className="w-3.5 h-3.5 text-slate-300" />
                      )}
                      {s.name}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Reset confirmation modal */}
      {resetTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setResetTarget(null)}>
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-800">确认重置</h3>
              <button onClick={() => setResetTarget(null)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <p className="text-sm text-slate-600 mb-2">
              将清除 <span className="font-bold text-red-600">{resetTarget.name}</span>（{CLASS_LABELS[resetTarget.cls] || resetTarget.cls}）的所有考试记录，该学生可以重新参加考试。
            </p>
            <p className="text-xs text-amber-600 mb-4">此操作不可撤销！</p>
            {resetMsg && (
              <p className={`text-sm mb-3 ${resetMsg.includes("成功") ? "text-green-600" : "text-red-600"}`}>{resetMsg}</p>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => { setResetTarget(null); setResetMsg(""); }}
                className="flex-1 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition text-sm"
              >取消</button>
              <button
                onClick={async () => {
                  setResetMsg("");
                  const res = await fetch("/api/admin/reset", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name: resetTarget.name, className: resetTarget.cls }),
                  });
                  const result = await res.json();
                  if (result.success) {
                    setResetMsg(result.message || "重置成功");
                    setTimeout(() => { setResetTarget(null); setResetMsg(""); onRefresh(); }, 800);
                  } else {
                    setResetMsg(result.error || "重置失败");
                  }
                }}
                className="flex-1 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-semibold transition"
              >确认重置</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryItem({ label, value, color }: { label: string; value: string | number; color: string }) {
  const colorMap: Record<string, string> = {
    slate: "bg-slate-100 text-slate-700",
    green: "bg-green-50 text-green-700",
    red: "bg-red-50 text-red-700",
    blue: "bg-blue-50 text-blue-700",
  };
  return (
    <div className={`rounded-lg p-3 text-center ${colorMap[color] || colorMap.slate}`}>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs mt-0.5 opacity-70">{label}</p>
    </div>
  );
}

// ====== Overview Tab ======
function OverviewTab({ data }: { data: StatsData }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Users} label="参加人数" value={data.allResults.length} color="blue" />
        <StatCard
          icon={Award}
          label="平均分"
          value={data.allResults.length > 0
            ? (data.allResults.reduce((s, r) => s + r.score, 0) / data.allResults.length).toFixed(1)
            : "-"}
          color="green"
        />
        <StatCard
          icon={TrendingUp}
          label="最高分"
          value={data.allResults.length > 0 ? Math.max(...data.allResults.map((r) => r.score)).toFixed(1) : "-"}
          color="purple"
        />
        <StatCard
          icon={Clock}
          label="平均用时"
          value={data.allResults.length > 0
            ? `${Math.round(data.allResults.reduce((s, r) => s + r.time_used_seconds, 0) / data.allResults.length / 60)}分`
            : "-"}
          color="amber"
        />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h3 className="font-bold text-slate-800">各班成绩分布</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-500">
                <th className="text-left px-6 py-3 font-medium">班级</th>
                <th className="text-center px-4 py-3 font-medium">人数</th>
                <th className="text-center px-4 py-3 font-medium">平均分</th>
                <th className="text-center px-4 py-3 font-medium">最高分</th>
                <th className="text-center px-4 py-3 font-medium">最低分</th>
                <th className="text-center px-4 py-3 font-medium">90分+</th>
                <th className="text-center px-4 py-3 font-medium">80-89</th>
                <th className="text-center px-4 py-3 font-medium">60-79</th>
                <th className="text-center px-4 py-3 font-medium">&lt;60</th>
              </tr>
            </thead>
            <tbody>
              {data.classStats.map((cs) => (
                <tr key={cs.class_name} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="px-6 py-3 font-medium text-slate-700">{cs.class_name}</td>
                  <td className="px-4 py-3 text-center">{cs.total_exams}</td>
                  <td className="px-4 py-3 text-center font-semibold text-blue-600">{cs.avg_score ?? "-"}</td>
                  <td className="px-4 py-3 text-center text-green-600">{cs.max_score ?? "-"}</td>
                  <td className="px-4 py-3 text-center text-red-500">{cs.min_score ?? "-"}</td>
                  <td className="px-4 py-3 text-center">{cs.above90}</td>
                  <td className="px-4 py-3 text-center">{cs.above80}</td>
                  <td className="px-4 py-3 text-center">{cs.above60}</td>
                  <td className="px-4 py-3 text-center">{cs.below60}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function QuestionsTab({ data }: { data: StatsData }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100">
        <h3 className="font-bold text-slate-800">逐题正确率分析</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 text-slate-500">
              <th className="text-left px-6 py-3 font-medium">题号</th>
              <th className="text-left px-4 py-3 font-medium">类型</th>
              <th className="text-center px-4 py-3 font-medium">答题数</th>
              <th className="text-center px-4 py-3 font-medium">正确数</th>
              <th className="text-left px-4 py-3 font-medium">正确率</th>
            </tr>
          </thead>
          <tbody>
            {data.questionStats.map((qs) => {
              const isLow = qs.accuracy_pct < 60;
              const isHigh = qs.accuracy_pct >= 80;
              return (
                <tr key={qs.question_id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="px-6 py-3 font-medium text-slate-700">{qs.question_id}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                      qs.question_type === "choice" ? "bg-blue-100 text-blue-700" :
                      qs.question_type === "truefalse" ? "bg-amber-100 text-amber-700" :
                      "bg-teal-100 text-teal-700"
                    }`}>
                      {qs.question_type === "choice" ? "选择" : qs.question_type === "truefalse" ? "判断" : "匹配"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">{qs.total_answers}</td>
                  <td className="px-4 py-3 text-center">{qs.correct_answers}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden max-w-[120px]">
                        <div
                          className={`h-full rounded-full transition-all ${
                            isLow ? "bg-red-400" : isHigh ? "bg-green-400" : "bg-amber-400"
                          }`}
                          style={{ width: `${qs.accuracy_pct}%` }}
                        />
                      </div>
                      <span className={`text-xs font-semibold ${
                        isLow ? "text-red-600" : isHigh ? "text-green-600" : "text-amber-600"
                      }`}>
                        {qs.accuracy_pct}%
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StudentsTab({ data }: { data: StatsData }) {
  const [filterClass, setFilterClass] = useState("全部");

  const filtered = filterClass === "全部"
    ? data.allResults
    : data.allResults.filter((r) => r.class_name === filterClass);

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <h3 className="font-bold text-slate-800">学生成绩明细</h3>
        <select
          value={filterClass}
          onChange={(e) => setFilterClass(e.target.value)}
          className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="全部">全部班级</option>
          {CLASS_ORDER.map((c) => (
            <option key={c} value={c}>{CLASS_LABELS[c]}</option>
          ))}
        </select>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 text-slate-500">
              <th className="text-left px-6 py-3 font-medium">排名</th>
              <th className="text-left px-4 py-3 font-medium">姓名</th>
              <th className="text-left px-4 py-3 font-medium">班级</th>
              <th className="text-center px-4 py-3 font-medium">得分</th>
              <th className="text-center px-4 py-3 font-medium">正确率</th>
              <th className="text-center px-4 py-3 font-medium">用时</th>
              <th className="text-left px-4 py-3 font-medium">提交时间</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-slate-400">该班级暂无考试记录</td>
              </tr>
            ) : (
              filtered.map((r, idx) => (
              <tr key={idx} className="border-t border-slate-100 hover:bg-slate-50">
                <td className="px-6 py-3">
                  <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                    idx < 3 ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-500"
                  }`}>
                    {idx + 1}
                  </span>
                </td>
                <td className="px-4 py-3 font-medium text-slate-700">{r.name}</td>
                <td className="px-4 py-3 text-slate-500">{r.class_name}</td>
                <td className="px-4 py-3 text-center font-semibold text-blue-600">{r.score.toFixed(1)}</td>
                <td className="px-4 py-3 text-center">
                  {Math.round((r.correct_count / r.total_questions) * 100)}%
                </td>
                <td className="px-4 py-3 text-center text-slate-500">
                  {Math.floor(r.time_used_seconds / 60)}分{r.time_used_seconds % 60}秒
                </td>
                <td className="px-4 py-3 text-slate-400 text-xs">
                  {new Date(r.submit_time).toLocaleString("zh-CN")}
                </td>
              </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: {
  icon: any;
  label: string;
  value: string | number;
  color: "blue" | "green" | "purple" | "amber";
}) {
  const colors = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    purple: "bg-purple-50 text-purple-600",
    amber: "bg-amber-50 text-amber-600",
  };
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colors[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs text-slate-400">{label}</p>
          <p className="text-xl font-bold text-slate-800">{value}</p>
        </div>
      </div>
    </div>
  );
}