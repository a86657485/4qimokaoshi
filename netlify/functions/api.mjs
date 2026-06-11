import { getStore } from "@netlify/blobs";
import { readFileSync } from "fs";
import { join } from "path";

// ── Student roster ──
let studentRoster = {};
try {
  studentRoster = JSON.parse(readFileSync(join(process.cwd(), "public", "students.json"), "utf-8"));
} catch {}

// ── Question bank ──
const QUESTIONS = JSON.parse(readFileSync(join(process.cwd(), "netlify", "functions", "questions.json"), "utf-8"));

// ── Locked classes ──
const LOCKED = ["401", "403"];

// ── Helpers ──
const store = getStore("exam-data");
async function load(key) { try { const r = await store.get(key); return r ? JSON.parse(r) : null; } catch { return null; } }
async function save(key, v) { await store.set(key, JSON.stringify(v)); }

function json(res, data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } });
}

// ── Grading ──
function gradeOne(q, studentAnswer) {
  const correct = q.answer;
  let isCorrect = false;
  let sa = studentAnswer;
  if (q.type === "choice") { isCorrect = (typeof sa === "number" ? sa : parseInt(sa)) === correct; }
  else if (q.type === "truefalse") { isCorrect = (typeof sa === "boolean" ? sa : sa === "true") === correct; }
  else if (q.type === "match") { if (typeof sa === "object" && sa) isCorrect = Object.keys(correct).every(k => sa[k] === correct[k]); }
  else if (q.type === "multiselect") { if (Array.isArray(sa)) { const a = [...sa].sort(), b = [...correct].sort(); isCorrect = a.length === b.length && a.every((v, i) => v === b[i]); } }
  else if (q.type === "ordering") { if (Array.isArray(sa)) isCorrect = correct.length === sa.length && correct.every((v, i) => v === sa[i]); }
  return { isCorrect, points: isCorrect ? q.points : 0, maxPoints: q.points };
}

// ── Main handler ──
export default async function handler(req) {
  const url = new URL(req.url);
  const path = url.pathname;
  const method = req.method;

  // CORS preflight
  if (method === "OPTIONS") return new Response(null, { headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET,POST,OPTIONS", "Access-Control-Allow-Headers": "Content-Type" } });

  try {
    // POST /api/login
    if (path === "/api/login" && method === "POST") {
      const { name, className } = await req.json();
      if (!name || !className || !name.trim() || !className.trim()) return json(null, { error: "请输入姓名和班级" }, 400);
      const n = name.trim(), c = className.trim();
      if (LOCKED.includes(c)) return json(null, { error: "401班、403班考试已结束，数据已锁定，无法登录。" }, 403);

      let students = await load("students") || [];
      let student = students.find(s => s.name === n && s.class_name === c);
      if (!student) { student = { id: Date.now(), name: n, class_name: c, created_at: new Date().toISOString() }; students.push(student); await save("students", students); }

      let sessions = await load("sessions") || [];
      let active = sessions.find(s => s.student_id === student.id && s.status === "in_progress");
      if (active) return json(null, { success: true, sessionId: active.id, student: { name: student.name, className: student.class_name }, resumed: true, startTime: active.start_time });

      const session = { id: Date.now(), student_id: student.id, start_time: new Date().toISOString(), submit_time: null, score: 0, total_points: 100, correct_count: 0, total_questions: 50, status: "in_progress", time_used_seconds: 0 };
      sessions.push(session); await save("sessions", sessions);
      return json(null, { success: true, sessionId: session.id, student: { name: student.name, className: student.class_name }, resumed: false, startTime: session.start_time });
    }

    // POST /api/submit
    if (path === "/api/submit" && method === "POST") {
      const { sessionId, answers: studentAnswers, timeUsed } = await req.json();
      let sessions = await load("sessions") || [];
      const si = sessions.findIndex(s => s.id === sessionId && s.status === "in_progress");
      if (si < 0) return json(null, { error: "考试已结束或不存在" }, 400);

      let totalScore = 0, correctCount = 0;
      const answerResults = [];
      let allAnswers = await load("answers") || [];

      for (const q of QUESTIONS) {
        const sa = studentAnswers[q.id];
        const result = gradeOne(q, sa);
        if (result.isCorrect) correctCount++;
        totalScore += result.points;
        allAnswers.push({ session_id: sessionId, question_id: q.id, question_type: q.type, student_answer: JSON.stringify(sa || null), correct_answer: JSON.stringify(q.answer), is_correct: result.isCorrect ? 1 : 0, points: result.points, max_points: result.maxPoints });
        answerResults.push({ questionId: q.id, type: q.type, isCorrect: result.isCorrect, points: result.points, maxPoints: result.maxPoints });
      }

      sessions[si].status = "completed";
      sessions[si].submit_time = new Date().toISOString();
      sessions[si].score = totalScore;
      sessions[si].correct_count = correctCount;
      sessions[si].time_used_seconds = timeUsed || 0;
      await save("sessions", sessions);
      await save("answers", allAnswers);

      return json(null, { success: true, score: totalScore, totalPoints: 100, correctCount, totalQuestions: 50, timeUsed: timeUsed || 0, answers: answerResults });
    }

    // POST /api/save-progress
    if (path === "/api/save-progress" && method === "POST") {
      const { sessionId, answers } = await req.json();
      let progress = await load("progress") || {};
      progress[String(sessionId)] = { answers: JSON.stringify(answers), updated_at: new Date().toISOString() };
      await save("progress", progress);
      return json(null, { success: true });
    }

    // GET /api/progress/:id
    if (path.startsWith("/api/progress/") && method === "GET") {
      const sid = path.split("/").pop();
      let progress = await load("progress") || {};
      const p = progress[sid];
      return json(null, { answers: p ? JSON.parse(p.answers) : {} });
    }

    // GET /api/result/:id
    if (path.startsWith("/api/result/") && method === "GET") {
      const sid = parseInt(path.split("/").pop());
      let sessions = await load("sessions") || [];
      let students = await load("students") || [];
      const session = sessions.find(s => s.id === sid && s.status === "completed");
      if (!session) return json(null, { error: "未找到考试记录" }, 404);
      const student = students.find(s => s.id === session.student_id) || { name: "?", class_name: "?" };
      let allAnswers = await load("answers") || [];
      const ans = allAnswers.filter(a => a.session_id === sid);
      return json(null, { session: { id: session.id, studentName: student.name, className: student.class_name, score: session.score, totalPoints: session.total_points, correctCount: session.correct_count, totalQuestions: session.total_questions, timeUsed: session.time_used_seconds, submitTime: session.submit_time }, answers: ans });
    }

    // GET /api/admin/stats
    if (path === "/api/admin/stats" && method === "GET") {
      let sessions = await load("sessions") || [];
      sessions = sessions.filter(s => s.status === "completed");
      let students = await load("students") || [];
      let allAnswers = await load("answers") || [];

      const classMap = {};
      for (const s of sessions) {
        const stu = students.find(st => st.id === s.student_id) || { class_name: "?" };
        const c = stu.class_name;
        if (!classMap[c]) classMap[c] = [];
        classMap[c].push(s);
      }
      const classStats = Object.entries(classMap).map(([cn, ss]) => ({
        class_name: cn, total_exams: ss.length,
        avg_score: Math.round(ss.reduce((a,b) => a + b.score, 0) / ss.length * 10) / 10,
        max_score: Math.max(...ss.map(s => s.score)),
        min_score: Math.min(...ss.map(s => s.score)),
        avg_time_seconds: Math.round(ss.reduce((a,b) => a + b.time_used_seconds, 0) / ss.length),
        above90: ss.filter(s => s.score >= 90).length,
        above80: ss.filter(s => s.score >= 80 && s.score < 90).length,
        above60: ss.filter(s => s.score >= 60 && s.score < 80).length,
        below60: ss.filter(s => s.score < 60).length,
      })).sort((a,b) => a.class_name.localeCompare(b.class_name));

      const qMap = {};
      for (const a of allAnswers) {
        if (!qMap[a.question_id]) qMap[a.question_id] = { total: 0, correct: 0 };
        qMap[a.question_id].total++;
        if (a.is_correct) qMap[a.question_id].correct++;
      }
      const questionStats = Object.entries(qMap).map(([qid, d]) => ({
        question_id: qid, question_type: QUESTIONS.find(q => q.id === qid)?.type || "?",
        total_answers: d.total, correct_answers: d.correct,
        accuracy_pct: Math.round(d.correct / d.total * 1000) / 10
      })).sort((a,b) => a.question_id.localeCompare(b.question_id));

      const allResults = sessions.map(s => {
        const stu = students.find(st => st.id === s.student_id) || { name: "?", class_name: "?" };
        return { name: stu.name, class_name: stu.class_name, score: s.score, total_points: s.total_points, correct_count: s.correct_count, total_questions: s.total_questions, time_used_seconds: s.time_used_seconds, submit_time: s.submit_time };
      }).sort((a,b) => b.score - a.score);

      return json(null, { classStats, questionStats, allResults });
    }

    // GET /api/admin/roster
    if (path === "/api/admin/roster" && method === "GET") {
      const className = url.searchParams.get("class");
      let sessions = await load("sessions") || [];
      sessions = sessions.filter(s => s.status === "completed");
      let students = await load("students") || [];
      const result = {};
      for (const [cls, roster] of Object.entries(studentRoster)) {
        if (className && cls !== className) continue;
        const submittedMap = {};
        for (const s of sessions) {
          const stu = students.find(st => st.id === s.student_id);
          if (stu && stu.class_name === cls) submittedMap[stu.name] = s;
        }
        result[cls] = { total: roster.length, submitted: Object.keys(submittedMap).length, students: roster.map(name => { const sub = submittedMap[name]; return { name, submitted: !!sub, score: sub ? sub.score : null, correctCount: sub ? sub.correct_count : null, timeUsed: sub ? sub.time_used_seconds : null, submitTime: sub ? sub.submit_time : null }; }) };
      }
      return json(null, result);
    }

    // GET /api/students
    if (path === "/api/students" && method === "GET") {
      const className = url.searchParams.get("class");
      if (!className) return json(null, Object.keys(studentRoster));
      return json(null, studentRoster[className] || []);
    }

    // GET /api/admin/export
    if (path === "/api/admin/export" && method === "GET") {
      let sessions = await load("sessions") || [];
      sessions = sessions.filter(s => s.status === "completed");
      let students = await load("students") || [];
      const rows = sessions.map(s => {
        const stu = students.find(st => st.id === s.student_id) || { name: "?", class_name: "?" };
        return { "姓名": stu.name, "班级": stu.class_name, "得分": s.score, "正确题数": s.correct_count, "总题数": s.total_questions, "用时秒": s.time_used_seconds, "提交时间": s.submit_time };
      }).sort((a,b) => b["得分"] - a["得分"]);
      const headers = rows.length ? Object.keys(rows[0]) : [];
      const csv = "\uFEFF" + headers.join(",") + "\n" + rows.map(r => headers.map(h => `"${r[h] ?? ''}"`).join(",")).join("\n");
      return new Response(csv, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": "attachment; filename=exam_results.csv" } });
    }

    // POST /api/admin/reset
    if (path === "/api/admin/reset" && method === "POST") {
      const { name, className } = await req.json();
      if (!name || !className) return json(null, { error: "请输入姓名和班级" }, 400);
      const c = className.trim();
      if (LOCKED.includes(c)) return json(null, { error: "401班、403班数据已锁定，不允许重置。" }, 403);
      let students = await load("students") || [];
      const student = students.find(s => s.name === name.trim() && s.class_name === c);
      if (!student) return json(null, { error: "未找到该学生" }, 404);
      let sessions = await load("sessions") || [];
      const sids = sessions.filter(s => s.student_id === student.id).map(s => s.id);
      sessions = sessions.filter(s => !sids.includes(s.id));
      let allAnswers = await load("answers") || [];
      allAnswers = allAnswers.filter(a => !sids.includes(a.session_id));
      await save("sessions", sessions);
      await save("answers", allAnswers);
      return json(null, { success: true, message: `已重置 ${name}(${className}) 的考试记录` });
    }

    return json(null, { error: "Not found" }, 404);
  } catch (e) {
    console.error(e);
    return json(null, { error: "服务器内部错误" }, 500);
  }
}
