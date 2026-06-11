import re

with open("server.ts", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update Question interface to support fillblank and ordering
old_interface = "interface Question {\n  id: string;\n  type: string;\n  answer: number | boolean | Record<string, string>;\n  points: number;\n}"
new_interface = """interface Question {
  id: string;
  type: string;
  answer: number | boolean | Record<string, string> | number[] | string;
  points: number;
  acceptAnswers?: string[];
}"""
content = content.replace(old_interface, new_interface)

# 2. Update total_questions from 35 to 40
content = content.replace("total_questions INTEGER DEFAULT 35", "total_questions INTEGER DEFAULT 40")

# 3. Replace QUESTIONS array
old_q = "const QUESTIONS: Question[] = ["
old_end = "];"
start = content.find(old_q)
end = content.find(old_end, start) + len(old_end)
new_qs = """const QUESTIONS: Question[] = [
  { id: "Q01", type: "choice", answer: 1, points: 2.5 },
  { id: "Q02", type: "choice", answer: 1, points: 2.5 },
  { id: "Q03", type: "choice", answer: 1, points: 2.5 },
  { id: "Q04", type: "choice", answer: 1, points: 2.5 },
  { id: "Q05", type: "choice", answer: 2, points: 2.5 },
  { id: "Q06", type: "choice", answer: 1, points: 2.5 },
  { id: "Q07", type: "choice", answer: 1, points: 2.5 },
  { id: "Q08", type: "choice", answer: 1, points: 2.5 },
  { id: "Q09", type: "choice", answer: 2, points: 2.5 },
  { id: "Q10", type: "choice", answer: 3, points: 2.5 },
  { id: "Q11", type: "choice", answer: 1, points: 2.5 },
  { id: "Q12", type: "choice", answer: 2, points: 2.5 },
  { id: "Q13", type: "choice", answer: 1, points: 2.5 },
  { id: "Q14", type: "choice", answer: 1, points: 2.5 },
  { id: "Q15", type: "choice", answer: 1, points: 2.5 },
  { id: "Q16", type: "choice", answer: 1, points: 2.5 },
  { id: "Q17", type: "choice", answer: 2, points: 2.5 },
  { id: "Q18", type: "choice", answer: 1, points: 2.5 },
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
  { id: "Q29", type: "match", answer: { s1: "bar" }, points: 4 },
  { id: "Q30", type: "match", answer: { s1: "line" }, points: 4 },
  { id: "Q31", type: "match", answer: { s1: "wordcloud" }, points: 4 },
  { id: "Q32", type: "match", answer: { s1: "kg" }, points: 4 },
  { id: "Q33", type: "match", answer: { s1: "pie" }, points: 4 },
  { id: "Q34", type: "fillblank", answer: "条形码", points: 2, acceptAnswers: ["条形码","条码"] },
  { id: "Q35", type: "fillblank", answer: "降序", points: 2, acceptAnswers: ["降序"] },
  { id: "Q36", type: "fillblank", answer: "大", points: 2, acceptAnswers: ["大"] },
  { id: "Q37", type: "fillblank", answer: "节点", points: 2, acceptAnswers: ["节点"] },
  { id: "Q38", type: "fillblank", answer: "真实", points: 2, acceptAnswers: ["真实","可靠","真实可靠"] },
  { id: "Q39", type: "ordering", answer: [0,1,2,3,4], points: 2.5 },
  { id: "Q40", type: "ordering", answer: [0,1,2,3,4], points: 2.5 },
];"""
content = content[:start] + new_qs + content[end:]

# 4. Add grading logic for fillblank and ordering
old_grading = '} else if (q.type === "match") {\n        const mapping = correctAnswer as Record<string, string>;\n        if (typeof studentAnswer === "object" && studentAnswer !== null) {\n          isCorrect = Object.keys(mapping).every(k => studentAnswer[k] === mapping[k]);\n        }\n        studentAnswerStr = JSON.stringify(studentAnswer || {});\n      }'

new_grading = '''} else if (q.type === "match") {
        const mapping = correctAnswer as Record<string, string>;
        if (typeof studentAnswer === "object" && studentAnswer !== null) {
          isCorrect = Object.keys(mapping).every(k => studentAnswer[k] === mapping[k]);
        }
        studentAnswerStr = JSON.stringify(studentAnswer || {});
      } else if (q.type === "fillblank") {
        const sa = String(studentAnswer || "").trim();
        const accAnswers: string[] = (q as any).acceptAnswers || [String(correctAnswer)];
        isCorrect = accAnswers.some((a: string) => sa === a);
        studentAnswerStr = sa;
      } else if (q.type === "ordering") {
        const correctOrder = correctAnswer as number[];
        if (Array.isArray(studentAnswer)) {
          isCorrect = correctOrder.length === studentAnswer.length &&
            correctOrder.every((v: number, i: number) => v === studentAnswer[i]);
        }
        studentAnswerStr = JSON.stringify(studentAnswer || []);
      }'''

content = content.replace(old_grading, new_grading)

with open("server.ts", "w", encoding="utf-8") as f:
    f.write(content)
print("server.ts patched successfully")
