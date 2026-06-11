export interface ChoiceQuestion {
  id: string; type: "choice"; lesson: string; appName: string;
  question: string; options: string[]; answer: number; points: number;
}

export interface TrueFalseQuestion {
  id: string; type: "truefalse"; lesson: string; appName: string;
  question: string; answer: boolean; points: number;
}

export interface MatchQuestion {
  id: string; type: "match"; lesson: string; appName: string;
  instruction: string;
  scenarios: { id: string; text: string }[];
  tools: { id: string; name: string }[];
  correctMapping: Record<string, string>;
  points: number;
}

export interface MultiSelectQuestion {
  id: string; type: "multiselect"; lesson: string; appName: string;
  question: string; options: string[]; answer: number[]; points: number;
}

export interface OrderingQuestion {
  id: string; type: "ordering"; lesson: string; appName: string;
  instruction: string; steps: string[]; correctOrder: number[]; points: number;
}

export type ExamQuestion = ChoiceQuestion | TrueFalseQuestion | MatchQuestion | MultiSelectQuestion | OrderingQuestion;

export const questions: ExamQuestion[] = [
  { id:"Q01",type:"choice",lesson:"16",appName:"market",question:"编码在数据管理中起到什么作用？",options:["让数据变得更多","为数据建立联系，方便识别和管理","让数据自动删除","让数据变得更复杂"],answer:1,points:2 },
  { id:"Q02",type:"choice",lesson:"16",appName:"market",question:"以下哪个是生活中编码应用的例子？",options:["阅读课外书","超市商品的条形码","在操场上跑步","唱一首儿歌"],answer:1,points:2 },
  { id:"Q03",type:"choice",lesson:"16",appName:"market",question:"顾客在超市购物时，最关心商品的哪些信息？",options:["超市员工的姓名","商品的价格、生产日期和保质期","超市的占地面积","货架的颜色"],answer:1,points:2 },
  { id:"Q04",type:"choice",lesson:"18",appName:"weather",question:"在大量气温数据中快速找到最高气温，最好的方法是？",options:["一页页地翻看","使用数字化工具的排序功能","用计算器一个个计算","全部抄到纸上慢慢找"],answer:1,points:2 },
  { id:"Q05",type:"choice",lesson:"18",appName:"weather",question:"计算一组气温数据平均值的方法是？",options:["把所有气温加在一起","取最高和最低气温的中间值","所有气温之和除以天数","按从高到低排列"],answer:2,points:2 },
  { id:"Q06",type:"choice",lesson:"18",appName:"weather",question:"使用数字化工具管理数据比人工管理的最大优势是什么？",options:["看起来更漂亮","更快、更准确，不易出错","完全不需要学习","只能处理少量数据"],answer:1,points:2 },
  { id:"Q07",type:"choice",lesson:"19",appName:"security",question:"以下哪种行为最可能导致个人数据泄露？",options:["定期更换密码","随意扫描不明来源的二维码","给重要文档加密","安装杀毒软件"],answer:1,points:2 },
  { id:"Q08",type:"choice",lesson:"19",appName:"security",question:"关于数据安全与国家安全的说法，正确的是？",options:["数据安全与国家安全毫无关系","数据安全是国家安全的重要组成部分","只有军队需要关心数据安全","数据安全只和成年人有关"],answer:1,points:2 },
  { id:"Q09",type:"choice",lesson:"20",appName:"protect",question:"给文档加密的主要目的是什么？",options:["让文档变得更好看","加快文档打开的速度","保护文档数据不被未经授权的人查看","自动修正文档中的错别字"],answer:2,points:2 },
  { id:"Q10",type:"choice",lesson:"20",appName:"protect",question:"以下哪项不是保护数据的正确方法？",options:["定期备份数据","使用强密码","安装杀毒软件","把密码告诉所有人"],answer:3,points:2 },
  { id:"Q11",type:"choice",lesson:"22",appName:"chart",question:"条形图最适合用来展示什么？",options:["数据随时间的变化趋势","不同类别数据之间的数量比较","文本中的关键词","人物之间的关系网络"],answer:1,points:2 },
  { id:"Q12",type:"choice",lesson:"22",appName:"chart",question:"折线图最适合用来展示什么？",options:["各部分占整体的比例","各类别之间的简单对比","数据随时间变化的趋势和规律","人物之间的关系网络"],answer:2,points:2 },
  { id:"Q13",type:"choice",lesson:"22",appName:"chart",question:"饼图最适合用来展示什么？",options:["数据随时间的变化趋势","各部分在整体中所占的大小关系","多角度指标的评分对比","文本中词语的出现频率"],answer:1,points:2 },
  { id:"Q14",type:"choice",lesson:"24",appName:"wordcloud",question:"词云图主要用来分析什么类型的数据？",options:["数字数据","文本数据","图片数据","声音数据"],answer:1,points:2 },
  { id:"Q15",type:"choice",lesson:"24",appName:"wordcloud",question:"词云图中，一个词语显示得越大，说明什么？",options:["这个词笔画更多","这个词在文本中出现的次数越多","这个词读起来更好听","这个词更难写"],answer:1,points:2 },
  { id:"Q16",type:"choice",lesson:"25",appName:"kg",question:"知识图谱中的每个方形或圆形（节点）代表什么？",options:["一段文字","一个人、物品或概念","一个数字","一种颜色"],answer:1,points:2 },
  { id:"Q17",type:"choice",lesson:"25",appName:"kg",question:"知识图谱中连接节点的线段代表什么？",options:["距离的远近","时间的长短","两个节点之间的关系","数据的大小"],answer:2,points:2 },
  { id:"Q18",type:"choice",lesson:"26",appName:"shenzhen",question:"在表达观点时，使用数据和可视化图表的好处是？",options:["让文章变得更长","更真实、直观，更有说服力","让内容更难理解","不再需要任何文字说明"],answer:1,points:2 },
  { id:"Q19",type:"truefalse",lesson:"16",appName:"market",question:"商品条形码是一种编码，能帮助超市快速准确地管理商品数据。",answer:true,points:2 },
  { id:"Q20",type:"truefalse",lesson:"18",appName:"weather",question:"人工计算大量数据的平均值比使用数字化工具计算更准确。",answer:false,points:2 },
  { id:"Q21",type:"truefalse",lesson:"19",appName:"security",question:"数据安全是成年人的事，和小学生没有关系。",answer:false,points:2 },
  { id:"Q22",type:"truefalse",lesson:"20",appName:"protect",question:"定期备份数据是保护数据安全的一种有效方法。",answer:true,points:2 },
  { id:"Q23",type:"truefalse",lesson:"22",appName:"chart",question:"折线图可以直观地呈现数据随时间变化的趋势和规律。",answer:true,points:2 },
  { id:"Q24",type:"truefalse",lesson:"22",appName:"chart",question:"条形图能够直观地反映不同类别数据之间的数量关系。",answer:true,points:2 },
  { id:"Q25",type:"truefalse",lesson:"24",appName:"wordcloud",question:"词云图可以直观地展示文本中哪些词语出现得最多。",answer:true,points:2 },
  { id:"Q26",type:"truefalse",lesson:"25",appName:"kg",question:"知识图谱只能用来表示人物之间的关系。",answer:false,points:2 },
  { id:"Q27",type:"truefalse",lesson:"26",appName:"shenzhen",question:"用数据支撑观点时，数据的来源是否可靠并不重要。",answer:false,points:2 },
  { id:"Q28",type:"truefalse",lesson:"all",appName:"summary",question:"任何一种可视化图表都适合用来展示所有类型的数据。",answer:false,points:2 },
  { id:"Q29",type:"match",lesson:"22",appName:"chart",instruction:"请为以下场景选择最合适的数据可视化工具。",scenarios:[{"id":"s1","text":"比较四个班级期末考试的平均分"}],tools:[{"id":"bar","name":"条形图"},{"id":"line","name":"折线图"},{"id":"pie","name":"饼图"},{"id":"wordcloud","name":"词云图"},{"id":"kg","name":"知识图谱"}],correctMapping:{"s1":"bar"},points:2 },
  { id:"Q30",type:"match",lesson:"22",appName:"chart",instruction:"请为以下场景选择最合适的数据可视化工具。",scenarios:[{"id":"s1","text":"展示某城市一年中每月平均气温的变化情况"}],tools:[{"id":"bar","name":"条形图"},{"id":"line","name":"折线图"},{"id":"pie","name":"饼图"},{"id":"wordcloud","name":"词云图"},{"id":"kg","name":"知识图谱"}],correctMapping:{"s1":"line"},points:2 },
  { id:"Q31",type:"match",lesson:"24",appName:"wordcloud",instruction:"请为以下场景选择最合适的数据可视化工具。",scenarios:[{"id":"s1","text":"分析一篇作文中出现次数最多的词语"}],tools:[{"id":"bar","name":"条形图"},{"id":"line","name":"折线图"},{"id":"pie","name":"饼图"},{"id":"wordcloud","name":"词云图"},{"id":"kg","name":"知识图谱"}],correctMapping:{"s1":"wordcloud"},points:2 },
  { id:"Q32",type:"match",lesson:"25",appName:"kg",instruction:"请为以下场景选择最合适的数据可视化工具。",scenarios:[{"id":"s1","text":"展示《西游记》中唐僧师徒四人及他们法宝之间的关系"}],tools:[{"id":"bar","name":"条形图"},{"id":"line","name":"折线图"},{"id":"pie","name":"饼图"},{"id":"wordcloud","name":"词云图"},{"id":"kg","name":"知识图谱"}],correctMapping:{"s1":"kg"},points:2 },
  { id:"Q33",type:"match",lesson:"22",appName:"chart",instruction:"请为以下场景选择最合适的数据可视化工具。",scenarios:[{"id":"s1","text":"展示全班同学最喜欢的运动项目各占多少"}],tools:[{"id":"bar","name":"条形图"},{"id":"line","name":"折线图"},{"id":"pie","name":"饼图"},{"id":"wordcloud","name":"词云图"},{"id":"kg","name":"知识图谱"}],correctMapping:{"s1":"pie"},points:2 },
  { id:"Q34",type:"multiselect",lesson:"16",appName:"market",question:"以下哪些属于数据管理的方式？（多选）",options:["查找数据","删除所有数据","筛选数据","将数据全部随机打乱"],answer:[0,2],points:2 },
  { id:"Q35",type:"multiselect",lesson:"19",appName:"security",question:"以下哪些做法有助于保护个人数据安全？（多选）",options:["使用生日作为密码","安装杀毒软件并定期更新","定期备份重要数据","在公共WiFi上随意登录账号"],answer:[1,2],points:2 },
  { id:"Q36",type:"multiselect",lesson:"22",appName:"chart",question:"以下哪些是常见的数据可视化图表类型？（多选）",options:["条形图","折线图","饼图","字母表"],answer:[0,1,2],points:2 },
  { id:"Q37",type:"multiselect",lesson:"24",appName:"wordcloud",question:"制作词云图需要完成以下哪些步骤？（多选）",options:["将文本分割成词语","用相机拍一张照片","统计每个词语出现的次数","保留关键词语去掉无效词"],answer:[0,2,3],points:2 },
  { id:"Q38",type:"multiselect",lesson:"25",appName:"kg",question:"以下哪些是数字化工具能够帮助我们完成的事情？（多选）",options:["对数据进行排序","计算数据的平均值","代替我们吃饭睡觉","制作可视化图表"],answer:[0,1,3],points:2 },
  { id:"Q39",type:"ordering",lesson:"24",appName:"wordcloud",instruction:"请将制作词云图的步骤按正确顺序排列。",steps:["选取一段文字","将文本分割成词语","保留关键词语","统计每个词语出现的次数","生成词云图"],correctOrder:[0,1,2,3,4],points:2 },
  { id:"Q40",type:"ordering",lesson:"22",appName:"chart",instruction:"请将用数字化工具绘制折线图的步骤按正确顺序排列。",steps:["收集需要的数据","将数据录入电子表格","选中需要的数据区域","选择插入折线图","观察分析数据趋势"],correctOrder:[0,1,2,3,4],points:2 },
  { id:"Q41",type:"choice",lesson:"17",appName:"filter",question:"在电子表格中，使用筛选功能的作用是什么？",options:["把符合条件的数据显示出来，隐藏不符合的","把所有数据都删掉","让数据变得更多","改变数据的颜色"],answer:0,points:2 },
  { id:"Q42",type:"choice",lesson:"17",appName:"filter",question:"在超市管理系统中，店长想快速找出库存少于10件的商品，应该使用什么功能？",options:["数据加密","数据筛选","数据备份","制作图表"],answer:1,points:2 },
  { id:"Q43",type:"choice",lesson:"21",appName:"barchart",question:"展示不同类别之间数量对比关系，最合适的图表是？",options:["折线图","条形图","词云图","雷达图"],answer:1,points:2 },
  { id:"Q44",type:"truefalse",lesson:"21",appName:"barchart",question:"条形图中柱子的高低可以直观反映不同类别的数量多少。",answer:true,points:2 },
  { id:"Q45",type:"choice",lesson:"23",appName:"radar",question:"要综合比较几个城市在经济、交通、教育、环境四个维度的表现，最适合用哪种图表？",options:["折线图","饼图","雷达图","词云图"],answer:2,points:2 },
  { id:"Q46",type:"truefalse",lesson:"23",appName:"radar",question:"雷达图能从多个角度综合展示数据，方便进行多维度对比。",answer:true,points:2 },
  { id:"Q47",type:"choice",lesson:"22",appName:"shenzhen",question:"在分析深圳2012-2024年人口数据变化趋势时，最合适使用哪种图表？",options:["饼图","折线图","词云图","知识图谱"],answer:1,points:2 },
  { id:"Q48",type:"multiselect",lesson:"22",appName:"shenzhen",question:"以下哪些是数据分析的正确步骤？（多选）",options:["确定分析目标","收集和整理数据","不做任何分析直接下结论","选择合适的图表呈现结果"],answer:[0,1,3],points:2 },
  { id:"Q49",type:"ordering",lesson:"24",appName:"wordcloud2",instruction:"请将使用词云工具分析文章的正确步骤按顺序排列。",steps:["导入或粘贴文章文本","对文本进行分词处理","过滤掉无意义的停用词","统计每个词语的出现频率","生成词云图并分析结果"],correctOrder:[0,1,2,3,4],points:2 },
  { id:"Q50",type:"multiselect",lesson:"26",appName:"shenzhen",question:"用数据支撑自己的观点时，以下哪些做法是正确的？（多选）",options:["确保数据来源可靠","只选择对自己有利的数据","使用图表让数据更直观","承认数据的局限性"],answer:[0,2,3],points:2 },
];
export const EXAM_DURATION = 30 * 60;
export const TOTAL_POINTS = 100;
