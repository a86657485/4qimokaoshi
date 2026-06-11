﻿﻿import express from "express";
import cors from "cors";
import Database from "better-sqlite3";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { existsSync, mkdirSync, readFileSync } from "fs";
import XLSX from "xlsx";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// Load student roster
let studentRoster: Record<string, string[]> = {};
try {
  const rosterPath = join(__dirname, "public", "students.json");
  if (existsSync(rosterPath)) {
    studentRoster = JSON.parse(readFileSync(rosterPath, "utf-8"));
    console.log("Student roster loaded:", Object.keys(studentRoster).length, "classes");
  }
} catch (e) {
  console.log("No student roster found");
}


const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));

// Database setup
const dbPath = process.env.DB_PATH || "exam.db";
const db = new Database(dbPath);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    class_name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(name, class_name)
  );

  CREATE TABLE IF NOT EXISTS exam_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL REFERENCES students(id),
    start_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    submit_time DATETIME,
    score REAL DEFAULT 0,
    total_points REAL DEFAULT 100,
    correct_count INTEGER DEFAULT 0,
    total_questions INTEGER DEFAULT 50,
    status TEXT DEFAULT 'in_progress',
    time_used_seconds INTEGER DEFAULT 0,
    UNIQUE(student_id, status)
  );

  CREATE TABLE IF NOT EXISTS exam_progress (
    session_id INTEGER NOT NULL REFERENCES exam_sessions(id),
    answers_json TEXT NOT NULL DEFAULT '{}',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (session_id)
  );

  CREATE TABLE IF NOT EXISTS answers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id INTEGER NOT NULL REFERENCES exam_sessions(id),
    question_id TEXT NOT NULL,
    question_type TEXT NOT NULL,
    student_answer TEXT,
    correct_answer TEXT NOT NULL,
    is_correct INTEGER DEFAULT 0,
    points REAL DEFAULT 0,
    max_points REAL DEFAULT 0
  );
`);

// Prepared statements
const registerStudent = db.prepare(
  "INSERT OR IGNORE INTO students (name, class_name) VALUES (?, ?)"
);
const getStudent = db.prepare(
  "SELECT id, name, class_name FROM students WHERE name = ? AND class_name = ?"
);
const createSession = db.prepare(
  "INSERT INTO exam_sessions (student_id, status) VALUES (?, 'in_progress')"
);
const getActiveSession = db.prepare(
  `SELECT es.*, s.name, s.class_name 
   FROM exam_sessions es 
   JOIN students s ON es.student_id = s.id 
   WHERE s.name = ? AND s.class_name = ? AND es.status = 'in_progress'`
);
const insertAnswer = db.prepare(
  `INSERT INTO answers (session_id, question_id, question_type, student_answer, correct_answer, is_correct, points, max_points)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
);
const finishSession = db.prepare(
  `UPDATE exam_sessions SET status = 'completed', submit_time = CURRENT_TIMESTAMP, 
   score = ?, correct_count = ?, time_used_seconds = ? WHERE id = ?`
);
const getSessionAnswers = db.prepare(
  "SELECT * FROM answers WHERE session_id = ? ORDER BY id"
);

// Question bank (imported on server side for grading)
interface Question {
  id: string;
  type: string;
  answer: number | boolean | Record<string, string> | number[] | string;
  points: number;
  acceptAnswers?: string[];
}

const QUESTIONS: Question[] = [
  { id: "Q01", type: "choice", answer: 1, points: 2 },
  { id: "Q02", type: "choice", answer: 1, points: 2 },
  { id: "Q03", type: "choice", answer: 1, points: 2 },
  { id: "Q04", type: "choice", answer: 1, points: 2 },
  { id: "Q05", type: "choice", answer: 2, points: 2 },
  { id: "Q06", type: "choice", answer: 1, points: 2 },
  { id: "Q07", type: "choice", answer: 1, points: 2 },
  { id: "Q08", type: "choice", answer: 1, points: 2 },
  { id: "Q09", type: "choice", answer: 2, points: 2 },
  { id: "Q10", type: "choice", answer: 3, points: 2 },
  { id: "Q11", type: "choice", answer: 1, points: 2 },
  { id: "Q12", type: "choice", answer: 2, points: 2 },
  { id: "Q13", type: "choice", answer: 1, points: 2 },
  { id: "Q14", type: "choice", answer: 1, points: 2 },
  { id: "Q15", type: "choice", answer: 1, points: 2 },
  { id: "Q16", type: "choice", answer: 1, points: 2 },
  { id: "Q17", type: "choice", answer: 2, points: 2 },
  { id: "Q18", type: "choice", answer: 1, points: 2 },
  { id: "Q19", type: "truefalse", answer: true, points: 2 },
  { id: "Q20", type: "truefalse", answer: false, points: 2 },
  { id: "Q21", type: "truefalse", answer: false, points: 2 },
  { id: "Q22", type: "truefalse", answer: true, points: 2 },
  { id: "Q23", type: "truefalse", answer: true, points: 2 },
  { id: "Q24", type: "truefalse", answer: true, points: 2 },
  { id: "Q25", type: "truefalse", answer: true, points: 2 },
  { id: "Q26", type: "truefalse", answer: false, points: 2 },
  { id: "Q27", type: "truefalse", answer: false, points: 2 },
  { id: "Q28", type: "truefalse", answer: false, points: 2 },
  { id: "Q29", type: "match", answer: { s1: "bar" }, points: 2 },
  { id: "Q30", type: "match", answer: { s1: "line" }, points: 2 },
  { id: "Q31", type: "match", answer: { s1: "wordcloud" }, points: 2 },
  { id: "Q32", type: "match", answer: { s1: "kg" }, points: 2 },
  { id: "Q33", type: "match", answer: { s1: "pie" }, points: 2 },
  { id: "Q34", type: "multiselect", answer: [0,2], points: 2 },
  { id: "Q35", type: "multiselect", answer: [1,2], points: 2 },
  { id: "Q36", type: "multiselect", answer: [0,1,2], points: 2 },
  { id: "Q37", type: "multiselect", answer: [0,2,3], points: 2 },
  { id: "Q38", type: "multiselect", answer: [0,1,3], points: 2 },
{ id: "Q39", type: "ordering", answer: [0,1,2,3,4], points: 2 },
  { id: "Q40", type: "ordering", answer: [0,1,2,3,4], points: 2 },
  { id: "Q41", type: "choice", answer: 0, points: 2 },
  { id: "Q42", type: "choice", answer: 1, points: 2 },
  { id: "Q43", type: "choice", answer: 1, points: 2 },
  { id: "Q44", type: "truefalse", answer: true, points: 2 },
  { id: "Q45", type: "choice", answer: 2, points: 2 },
  { id: "Q46", type: "truefalse", answer: true, points: 2 },
  { id: "Q47", type: "choice", answer: 1, points: 2 },
  { id: "Q48", type: "multiselect", answer: [0,1,3], points: 2 },
  { id: "Q49", type: "ordering", answer: [0,1,2,3,4], points: 2 },
  { id: "Q50", type: "multiselect", answer: [0,2,3], points: 2 },
];

// ===== API Routes =====

// Student login / registration
app.post("/api/login", (req, res) => {
  const { name, className } = req.body;
  if (!name || !className || name.trim().length === 0 || className.trim().length === 0) {
    return res.status(400).json({ error: "请输入姓名和班级" });
  }

  const cleanName = name.trim();
  const cleanClass = className.trim();

  // 403班数据已锁定，不允许新登录
  if (cleanClass === '401' || cleanClass === '403') {
    return res.status(403).json({ error: '401班、403班考试已结束，数据已锁定，无法登录。' });
  }

  // Check if already has active session
  const existing = getActiveSession.get(cleanName, cleanClass);
  if (existing) {
    return res.json({ 
      success: true, 
      sessionId: existing.id, 
      student: { name: existing.name, className: existing.class_name },
      resumed: true,
      startTime: existing.start_time,
    });
  }

  // Register or get student
  registerStudent.run(cleanName, cleanClass);
  const student = getStudent.get(cleanName, cleanClass) as any;
  
  // Create new session
  const result = createSession.run(student.id);
  
  res.json({
    success: true,
    sessionId: result.lastInsertRowid,
    student: { name: student.name, className: student.class_name },
    resumed: false,
    startTime: new Date().toISOString(),
  });
});

// Submit answers
app.post("/api/submit", (req, res) => {
  const { sessionId, answers: studentAnswers, timeUsed } = req.body;
  
  if (!sessionId || !studentAnswers) {
    return res.status(400).json({ error: "缺少必要参数" });
  }

  const session = db.prepare("SELECT * FROM exam_sessions WHERE id = ? AND status = 'in_progress'").get(sessionId) as any;
  if (!session) {
    return res.status(400).json({ error: "考试已结束或不存在" });
  }

  let totalScore = 0;
  let correctCount = 0;
  const answerResults: any[] = [];

  const insertAns = db.prepare(
    `INSERT INTO answers (session_id, question_id, question_type, student_answer, correct_answer, is_correct, points, max_points) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  );

  const insertAll = db.transaction(() => {
    for (const q of QUESTIONS) {
      const studentAnswer = studentAnswers[q.id];
      const correctAnswer = q.answer;
      let isCorrect = false;
      let studentAnswerStr = "";

      if (q.type === "choice") {
        const sa = typeof studentAnswer === "number" ? studentAnswer : parseInt(studentAnswer);
        isCorrect = sa === correctAnswer;
        studentAnswerStr = String(sa);
      } else if (q.type === "truefalse") {
        const sa = typeof studentAnswer === "boolean" ? studentAnswer : studentAnswer === "true";
        isCorrect = sa === correctAnswer;
        studentAnswerStr = String(sa);
      } else if (q.type === "match") {
        const mapping = correctAnswer as Record<string, string>;
        if (typeof studentAnswer === "object" && studentAnswer !== null) {
          isCorrect = Object.keys(mapping).every(k => studentAnswer[k] === mapping[k]);
        }
        studentAnswerStr = JSON.stringify(studentAnswer || {});
      } else if (q.type === "multiselect") {
        const correctIndices = correctAnswer as number[];
        if (Array.isArray(studentAnswer)) {
          const sorted_student = [...studentAnswer].sort();
          const sorted_correct = [...correctIndices].sort();
          isCorrect = sorted_student.length === sorted_correct.length &&
            sorted_student.every((v: number, i: number) => v === sorted_correct[i]);
        }
        studentAnswerStr = JSON.stringify(studentAnswer || []);
      } else if (q.type === "ordering") {
        const correctOrder = correctAnswer as number[];
        if (Array.isArray(studentAnswer)) {
          isCorrect = correctOrder.length === studentAnswer.length &&
            correctOrder.every((v: number, i: number) => v === studentAnswer[i]);
        }
        studentAnswerStr = JSON.stringify(studentAnswer || []);
      }

      const earnedPoints = isCorrect ? q.points : 0;
      if (isCorrect) correctCount++;
      totalScore += earnedPoints;

      insertAns.run(
        sessionId, q.id, q.type, studentAnswerStr,
        JSON.stringify(correctAnswer), isCorrect ? 1 : 0, earnedPoints, q.points
      );

      answerResults.push({
        questionId: q.id,
        type: q.type,
        isCorrect,
        points: earnedPoints,
        maxPoints: q.points,
      });
    }

    finishSession.run(totalScore, correctCount, timeUsed || 0, sessionId);
  });

  insertAll();

  res.json({
    success: true,
    score: totalScore,
    totalPoints: 100,
    correctCount,
    totalQuestions: 50,
    timeUsed: timeUsed || 0,
    answers: answerResults,
  });
});

// Get session results
app.get("/api/result/:sessionId", (req, res) => {
  const session = db.prepare(
    `SELECT es.*, s.name, s.class_name 
     FROM exam_sessions es 
     JOIN students s ON es.student_id = s.id 
     WHERE es.id = ? AND es.status = 'completed'`
  ).get(req.params.sessionId) as any;

  if (!session) {
    return res.status(404).json({ error: "未找到考试记录" });
  }

  const answers = getSessionAnswers.all(req.params.sessionId);

  res.json({
    session: {
      id: session.id,
      studentName: session.name,
      className: session.class_name,
      score: session.score,
      totalPoints: session.total_points,
      correctCount: session.correct_count,
      totalQuestions: session.total_questions,
      timeUsed: session.time_used_seconds,
      submitTime: session.submit_time,
    },
    answers,
  });
});

// Admin: class statistics
app.get("/api/admin/stats", (req, res) => {
  const classStats = db.prepare(`
    SELECT 
      s.class_name,
      COUNT(*) as total_exams,
      ROUND(AVG(es.score), 1) as avg_score,
      MAX(es.score) as max_score,
      MIN(es.score) as min_score,
      ROUND(AVG(es.time_used_seconds), 0) as avg_time_seconds,
      COUNT(CASE WHEN es.score >= 90 THEN 1 END) as above90,
      COUNT(CASE WHEN es.score >= 80 AND es.score < 90 THEN 1 END) as above80,
      COUNT(CASE WHEN es.score >= 60 AND es.score < 80 THEN 1 END) as above60,
      COUNT(CASE WHEN es.score < 60 THEN 1 END) as below60
    FROM exam_sessions es
    JOIN students s ON es.student_id = s.id
    WHERE es.status = 'completed'
    GROUP BY s.class_name
    ORDER BY s.class_name
  `).all();

  // Question-by-question accuracy
  const questionStats = db.prepare(`
    SELECT 
      question_id,
      question_type,
      COUNT(*) as total_answers,
      SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) as correct_answers,
      ROUND(SUM(CASE WHEN is_correct = 1 THEN 1.0 ELSE 0 END) / COUNT(*) * 100, 1) as accuracy_pct
    FROM answers
    GROUP BY question_id
    ORDER BY question_id
  `).all();

  // All student results
  const allResults = db.prepare(`
    SELECT 
      s.name,
      s.class_name,
      es.score,
      es.total_points,
      es.correct_count,
      es.total_questions,
      es.time_used_seconds,
      es.submit_time
    FROM exam_sessions es
    JOIN students s ON es.student_id = s.id
    WHERE es.status = 'completed'
    ORDER BY es.score DESC
  `).all();

  res.json({ classStats, questionStats, allResults });
});

// Admin: export CSV
app.get("/api/admin/export", (req, res) => {
  const results = db.prepare(`
    SELECT 
      s.name as 姓名,
      s.class_name as 班级,
      es.score as 得分,
      es.correct_count as 正确题数,
      es.total_questions as 总题数,
      es.time_used_seconds as 用时秒,
      es.submit_time as 提交时间
    FROM exam_sessions es
    JOIN students s ON es.student_id = s.id
    WHERE es.status = 'completed'
    ORDER BY es.score DESC
  `).all() as any[];

  const headers = Object.keys(results[0] || {});
  const csvRows = [headers.join(",")];
  for (const row of results) {
    csvRows.push(headers.map(h => `"${row[h] ?? ''}"`).join(","));
  }

  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename=exam_results_${new Date().toISOString().slice(0,10)}.csv`);
  // Add BOM for Excel Chinese support
  res.send("\uFEFF" + csvRows.join("\n"));
});

// Admin: reset a student (allow retake)
app.post("/api/admin/reset", (req, res) => {
  const { name, className } = req.body;
  if (!name || !className) {
    return res.status(400).json({ error: "请输入姓名和班级" });
  }
  
  const student = getStudent.get(name.trim(), className.trim()) as any;
  if (!student) {
    return res.status(404).json({ error: "未找到该学生" });
  }
  // 403班数据已锁定，不允许重置
  if (className.trim() === "401" || className.trim() === "403") {
    return res.status(403).json({ error: "401班、403班数据已锁定，不允许重置。" });
  }

  // Delete answers and session for this student
  const sessions = db.prepare("SELECT id FROM exam_sessions WHERE student_id = ?").all(student.id) as any[];
  for (const s of sessions) {
    db.prepare("DELETE FROM answers WHERE session_id = ?").run(s.id);
  }
  db.prepare("DELETE FROM exam_sessions WHERE student_id = ?").run(student.id);

  res.json({ success: true, message: `已重置 ${name}(${className}) 的考试记录` });
});


// Admin: get class roster with submission status
app.get("/api/admin/roster", (req, res) => {
  const className = req.query.class as string;
  
  const submitted = db.prepare(
    `SELECT s.name, s.class_name, es.score, es.correct_count, es.time_used_seconds, es.submit_time
     FROM exam_sessions es
     JOIN students s ON es.student_id = s.id
     WHERE es.status = 'completed'`
  ).all() as any[];

  const result: Record<string, any> = {};
  
  for (const cls of Object.keys(studentRoster)) {
    if (className && cls !== className) continue;
    const roster = studentRoster[cls] || [];
    const submittedMap = new Map<string, any>();
    for (const sub of submitted) {
      if (sub.class_name === cls) {
        submittedMap.set(sub.name, sub);
      }
    }
    
    result[cls] = {
      total: roster.length,
      submitted: submittedMap.size,
      students: roster.map(name => {
        const sub = submittedMap.get(name);
        return {
          name,
          submitted: !!sub,
          score: sub ? sub.score : null,
          correctCount: sub ? sub.correct_count : null,
          timeUsed: sub ? sub.time_used_seconds : null,
          submitTime: sub ? sub.submit_time : null,
        };
      }),
    };
  }

  res.json(result);
});

// Get student list for a class (login dropdown)
app.get("/api/students", (req, res) => {
  const className = req.query.class as string;
  if (!className) {
    return res.json(Object.keys(studentRoster));
  }
  const names = studentRoster[className] || [];
  res.json(names);
});

// Save exam progress (auto-save during exam)
app.post("/api/save-progress", (req, res) => {
  const { sessionId, answers } = req.body;
  if (!sessionId || !answers) {
    return res.status(400).json({ error: "缺少参数" });
  }
  const session = db.prepare("SELECT id FROM exam_sessions WHERE id = ? AND status = 'in_progress'").get(sessionId);
  if (!session) {
    return res.status(400).json({ error: "考试已结束或不存在" });
  }
  db.prepare("INSERT OR REPLACE INTO exam_progress (session_id, answers_json, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)").run(sessionId, JSON.stringify(answers));
  res.json({ success: true });
});

// Get exam progress (for resuming)
app.get("/api/progress/:sessionId", (req, res) => {
  const row = db.prepare("SELECT answers_json FROM exam_progress WHERE session_id = ?").get(req.params.sessionId) as any;
  res.json({ answers: row ? JSON.parse(row.answers_json) : {} });
});

// Serve static files in production
const distPath = join(__dirname, "dist");
if (existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) return next();
    res.sendFile(join(distPath, "index.html"));
  });
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`\n========================================`);
  console.log(`  四年级信息科技期末考试服务器已启动`);
  console.log(`  学生考试: http://localhost:${PORT}`);
  console.log(`  教师管理: http://localhost:${PORT}/admin`);
  console.log(`  局域网访问: http://<本机IP>:${PORT}`);
  console.log(`========================================\n`);
});
