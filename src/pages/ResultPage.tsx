﻿﻿import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { questions } from "../questions";
import { Trophy, Clock, CheckCircle, XCircle, ArrowLeft, RotateCcw } from "lucide-react";

interface ResultData {
  session: {
    studentName: string;
    className: string;
    score: number;
    totalPoints: number;
    correctCount: number;
    totalQuestions: number;
    timeUsed: number;
    submitTime: string;
  };
  answers: Array<{
    question_id: string;
    question_type: string;
    is_correct: number;
    points: number;
    max_points: number;
  }>;
}

export default function ResultPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState<ResultData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Try from sessionStorage first
    const cached = sessionStorage.getItem("examResult");
    if (cached) {
      try {
        setResult(JSON.parse(cached));
        setLoading(false);
        return;
      } catch {}
    }

    // Fetch from server
    fetch(`/api/result/${sessionId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.session) {
          setResult(data);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [sessionId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-500">正在统计成绩...</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <p className="text-slate-500 mb-4">未找到考试记录</p>
          <button onClick={() => navigate("/")} className="text-blue-600 hover:underline text-sm">返回首页</button>
        </div>
      </div>
    );
  }

  const { session, answers } = result;
  const scorePercent = Math.round((session.score / session.totalPoints) * 100);
  const minutes = Math.floor(session.timeUsed / 60);
  const seconds = session.timeUsed % 60;

  // Build lookup for question details
  const questionMap = new Map(questions.map((q) => [q.id, q]));

  return (
    <div className="min-h-screen bg-slate-50 py-6 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Score card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 text-center mb-6">
          <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 ${scorePercent >= 90 ? "bg-green-100" : scorePercent >= 60 ? "bg-amber-100" : "bg-red-100"}`}>
            <Trophy className={`w-10 h-10 ${
              scorePercent >= 90 ? 'text-green-600' : scorePercent >= 60 ? 'text-amber-600' : 'text-red-600'
            }`} />
          </div>
          <h1 className="text-3xl font-bold text-slate-800 mb-1">
            {session.score.toFixed(1)} 分
          </h1>
          <p className="text-slate-500 mb-4">
            答对 {session.correctCount}/{session.totalQuestions} 题
          </p>
          <div className="flex justify-center gap-6 text-sm">
            <div className="flex items-center gap-1.5 text-slate-500">
              <Clock className="w-4 h-4" />
              用时 {minutes}分{seconds}秒
            </div>
            <div className="flex items-center gap-1.5 text-slate-500">
              <CheckCircle className="w-4 h-4 text-green-500" />
              正确 {session.correctCount} 题
            </div>
            <div className="flex items-center gap-1.5 text-slate-500">
              <XCircle className="w-4 h-4 text-red-400" />
              错误 {session.totalQuestions - session.correctCount} 题
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-4">
            {session.studentName} · {session.className} · 提交于 {new Date(session.submitTime).toLocaleString("zh-CN")}
          </p>
        </div>

        {/* Answer review */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-lg font-bold text-slate-800 mb-4">答题详情</h2>
          <div className="space-y-3">
            {answers.map((a, idx) => {
              const q = questionMap.get(a.question_id);
              const isCorrect = a.is_correct === 1;
              return (
                <div
                  key={a.question_id}
                  className={`flex items-start gap-3 p-3 rounded-lg border ${
                    isCorrect ? "border-green-200 bg-green-50/50" : "border-red-200 bg-red-50/50"
                  }`}
                >
                  <div className={`flex-shrink-0 mt-0.5 ${isCorrect ? "text-green-500" : "text-red-500"}`}>
                    {isCorrect ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-bold text-slate-400">#{idx + 1}</span>
                      <span className="text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
                        {q?.lesson}·{q?.appName}
                      </span>
                      <span className="text-xs text-slate-400 ml-auto">
                        {a.points}/{a.max_points}分
                      </span>
                    </div>
                    <p className="text-sm text-slate-700 truncate">
                      {(q as any)?.question || (q as any)?.instruction || ""}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-center gap-3 mt-6">
          <button
            onClick={() => {
              sessionStorage.clear();
              navigate("/");
            }}
            className="flex items-center gap-1.5 px-5 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" /> 返回首页
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-5 py-2.5 bg-slate-100 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-200 transition text-sm font-medium"
          >
            <RotateCcw className="w-4 h-4" /> 打印成绩
          </button>
        </div>
      </div>
    </div>
  );
}
