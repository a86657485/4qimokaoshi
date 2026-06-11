export interface LessonTheme {
  id: string; lesson: string; appName: string; worldName: string; worldIcon: string;
  color: string; bgGradient: string; borderColor: string; accentColor: string;
  mascot: string; mascotLabel: string; sceneEmoji: string; questionEmoji: string;
}

export const LESSON_THEMES: LessonTheme[] = [
  { id:"L16",lesson:"16",appName:"超市数据管理",worldName:"超市数据管理",worldIcon:"🛒",color:"#3b82f6",bgGradient:"from-blue-50 via-white to-blue-50",borderColor:"border-blue-300",accentColor:"bg-blue-500",mascot:"🛒",mascotLabel:"超市助手",sceneEmoji:"🏪",questionEmoji:"❓" },
  { id:"L18",lesson:"18",appName:"气象数据小侦探",worldName:"气象数据小侦探",worldIcon:"🌤️",color:"#06b6d4",bgGradient:"from-cyan-50 via-white to-cyan-50",borderColor:"border-cyan-300",accentColor:"bg-cyan-500",mascot:"🌤️",mascotLabel:"数据侦探",sceneEmoji:"🌡️",questionEmoji:"❓" },
  { id:"L19",lesson:"19",appName:"数据安全保卫战",worldName:"shield",worldIcon:"🛡️",color:"#ef4444",bgGradient:"from-red-50 via-white to-red-50",borderColor:"border-red-300",accentColor:"bg-red-500",mascot:"🛡️",mascotLabel:"安全卫士",sceneEmoji:"🔒",questionEmoji:"❓" },
  { id:"L20",lesson:"20",appName:"保护数据小妙招",worldName:"forest",worldIcon:"🌳",color:"#22c55e",bgGradient:"from-green-50 via-white to-green-50",borderColor:"border-green-300",accentColor:"bg-green-500",mascot:"🌳",mascotLabel:"安全卫士",sceneEmoji:"🌿",questionEmoji:"❓" },
  { id:"L22",lesson:"22",appName:"数据分析",worldName:"data",worldIcon:"📊",color:"#8b5cf6",bgGradient:"from-violet-50 via-white to-violet-50",borderColor:"border-violet-300",accentColor:"bg-violet-500",mascot:"📊",mascotLabel:"数据分析师",sceneEmoji:"💻",questionEmoji:"❓" },
  { id:"L24",lesson:"24",appName:"词云图大冒险",worldName:"cloud",worldIcon:"☁️",color:"#d946ef",bgGradient:"from-fuchsia-50 via-white to-fuchsia-50",borderColor:"border-fuchsia-300",accentColor:"bg-fuchsia-500",mascot:"☁️",mascotLabel:"悟空向导",sceneEmoji:"📝",questionEmoji:"❓" },
  { id:"L25",lesson:"25",appName:"知识图谱来帮忙",worldName:"stars",worldIcon:"⭐",color:"#f97316",bgGradient:"from-orange-50 via-white to-orange-50",borderColor:"border-orange-300",accentColor:"bg-orange-500",mascot:"⭐",mascotLabel:"知识精灵",sceneEmoji:"🧠",questionEmoji:"❓" },
  { id:"L26",lesson:"26",appName:"深圳数据寻宝",worldName:"island",worldIcon:"🏝️",color:"#f59e0b",bgGradient:"from-amber-50 via-white to-amber-50",borderColor:"border-amber-300",accentColor:"bg-amber-500",mascot:"🏝️",mascotLabel:"寻宝向导",sceneEmoji:"🗺️",questionEmoji:"❓" },
  { id:"L17",lesson:"17",appName:"查找筛选小能手",worldName:"查找筛选小能手",worldIcon:"🔍",color:"#10b981",bgGradient:"from-emerald-50 via-white to-emerald-50",borderColor:"border-emerald-300",accentColor:"bg-emerald-500",mascot:"🔍",mascotLabel:"筛选专家",sceneEmoji:"🔎",questionEmoji:"❓" },
  { id:"L21",lesson:"21",appName:"数量关系大发现",worldName:"数量关系大发现",worldIcon:"📏",color:"#6366f1",bgGradient:"from-indigo-50 via-white to-indigo-50",borderColor:"border-indigo-300",accentColor:"bg-indigo-500",mascot:"📏",mascotLabel:"数据观察员",sceneEmoji:"📊",questionEmoji:"❓" },
  { id:"L23",lesson:"23",appName:"多角度大比拼",worldName:"多角度大比拼",worldIcon:"🎯",color:"#ec4899",bgGradient:"from-pink-50 via-white to-pink-50",borderColor:"border-pink-300",accentColor:"bg-pink-500",mascot:"🎯",mascotLabel:"全能分析师",sceneEmoji:"🕸️",questionEmoji:"❓" },
];

export const QUESTION_THEME_MAP: Record<string, string> = {
  Q01:"L16",Q02:"L16",Q03:"L16",
  Q04:"L18",Q05:"L18",Q06:"L18",
  Q07:"L19",Q08:"L19",
  Q09:"L20",Q10:"L20",
  Q11:"L22",Q12:"L22",Q13:"L22",
  Q14:"L24",Q15:"L24",
  Q16:"L25",Q17:"L25",
  Q18:"L26",
  Q19:"L16",Q20:"L18",Q21:"L19",Q22:"L20",
  Q23:"L22",Q24:"L22",Q25:"L24",Q26:"L25",Q27:"L26",Q28:"L22",
  Q29:"L22",Q30:"L22",Q31:"L24",Q32:"L25",Q33:"L22",
  Q34:"L16",Q35:"L18",Q36:"L24",Q37:"L25",Q38:"L26",Q39:"L24",Q40:"L22",
  Q41:"L17",Q42:"L17",
  Q43:"L21",Q44:"L21",
  Q45:"L23",Q46:"L23",
  Q47:"L22",Q48:"L22",
  Q49:"L24",Q50:"L26",
};

export function getThemeForQuestion(questionId: string): LessonTheme {
  const themeId = QUESTION_THEME_MAP[questionId] || "L16";
  return LESSON_THEMES.find(t => t.id === themeId) || LESSON_THEMES[0];
}

export interface AdventureWorld {
  id: string; name: string; icon: string; color: string;
  questionIds: string[]; unlocked: boolean; completed: boolean;
}

export function getAdventureWorlds(answeredIds: Set<string>): AdventureWorld[] {
  const groups = [
    { id:"L16",name:"超市数据管理",icon:"🛒",color:"#3b82f6",ids:["Q01","Q02","Q03","Q19","Q34"] },
    { id:"L18",name:"气象数据小侦探",icon:"🌤️",color:"#06b6d4",ids:["Q04","Q05","Q06","Q20","Q35"] },
    { id:"L19",name:"数据安全保卫战",icon:"🛡️",color:"#ef4444",ids:["Q07","Q08","Q21"] },
    { id:"L20",name:"保护数据小妙招",icon:"🌳",color:"#22c55e",ids:["Q09","Q10","Q22"] },
    { id:"L22",name:"数据分析",icon:"📊",color:"#8b5cf6",ids:["Q11","Q12","Q13","Q23","Q24","Q28","Q29","Q30","Q33","Q40","Q47","Q48"] },
    { id:"L24",name:"词云图大冒险",icon:"☁️",color:"#d946ef",ids:["Q14","Q15","Q25","Q31","Q36","Q39","Q49"] },
    { id:"L25",name:"知识图谱来帮忙",icon:"⭐",color:"#f97316",ids:["Q16","Q17","Q26","Q32","Q37"] },
    { id:"L26",name:"深圳数据寻宝",icon:"🏝️",color:"#f59e0b",ids:["Q18","Q27","Q38","Q50"] },
    { id:"L17",name:"查找筛选小能手",icon:"🔍",color:"#10b981",ids:["Q41","Q42"] },
    { id:"L21",name:"数量关系大发现",icon:"📏",color:"#6366f1",ids:["Q43","Q44"] },
    { id:"L23",name:"多角度大比拼",icon:"🎯",color:"#ec4899",ids:["Q45","Q46"] },
  ];
  return groups.map((g, idx) => ({
    ...g, questionIds: g.ids,
    unlocked: idx === 0 || g.ids.some(id => answeredIds.has(id)) ||
      groups.slice(0, idx).some(prev => prev.ids.every(id => answeredIds.has(id))),
    completed: g.ids.every(id => answeredIds.has(id)),
  }));
}
