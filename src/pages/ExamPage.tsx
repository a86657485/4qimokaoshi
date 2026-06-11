﻿﻿import { useState, useCallback, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { questions, EXAM_DURATION, type ChoiceQuestion, type TrueFalseQuestion, type MatchQuestion, type MultiSelectQuestion, type OrderingQuestion } from '../questions';
import { getThemeForQuestion, getAdventureWorlds, type LessonTheme } from '../themes';
import Timer from '../components/Timer';
import SupermarketShelf from '../components/interactive/SupermarketShelf';
import DataChart from '../components/interactive/DataChart';
import WordCloud from '../components/interactive/WordCloud';
import KnowledgeGraph from '../components/interactive/KnowledgeGraph';
import WeatherStation from '../components/interactive/WeatherStation';
import SecurityCheck from '../components/interactive/SecurityCheck';
import PasswordWiFi from '../components/interactive/PasswordWiFi';
import MultiSelectInput from "../components/interactive/MultiSelectInput";
import OrderingInput from "../components/interactive/OrderingInput";
import ShenzhenMap from '../components/interactive/ShenzhenMap';
import { ArrowLeft, ArrowRight, Star, Map, ChevronLeft, Trophy, Sparkles } from 'lucide-react';

type Answers = Record<string, number | boolean | Record<string, string> | number[]>;

export default function ExamPage() {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>(() => {
    try {
      const saved = localStorage.getItem("exam_answers_" + sessionId);
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  });
  const [submitting, setSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [started, setStarted] = useState(false);
  const [timeOver, setTimeOver] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const [stars, setStars] = useState<Set<number>>(new Set());
  const sessionId = sessionStorage.getItem('sessionId');
  const studentName = sessionStorage.getItem('studentName');
  const 题 = questions;

  useEffect(() => {
    if (!sessionId || !studentName) { navigate('/', { replace: true }); return; }
    const t = setTimeout(() => setStarted(true), 500);
    return () => clearTimeout(t);
  }, [sessionId, studentName, navigate]);

  // Sync progress to server every 5 seconds
  useEffect(() => {
    if (!sessionId || Object.keys(answers).length === 0) return;
    const timer = setInterval(() => {
      fetch('/api/save-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: Number(sessionId), answers }),
      }).catch(() => {});
    }, 5000);
    return () => clearInterval(timer);
  }, [sessionId, answers]);

  // On mount, load server progress and merge with localStorage
  useEffect(() => {
    if (!sessionId) return;
    fetch('/api/progress/' + sessionId)
      .then(r => r.json())
      .then(data => {
        if (data.answers && Object.keys(data.answers).length > 0) {
          setAnswers(prev => {
            // Server data wins for conflicts, merge with existing
            const merged = { ...data.answers, ...prev };
            try { localStorage.setItem('exam_answers_' + sessionId, JSON.stringify(merged)); } catch {}
            return merged;
          });
        }
      })
      .catch(() => {});
  }, [sessionId]);

  const 已答Indices = useMemo(() => {
    const set = new Set<number>();
    题.forEach((q, i) => {
      if (answers[q.id] !== undefined && answers[q.id] !== null) {
        if (q.type === 'match') {
          const a = answers[q.id] as Record<string, string> | undefined;
          if (a && Object.keys(a).length > 0) set.add(i);
        } else { set.add(i); }
      }
    });
    return set;
  }, [answers]);

  const 已答Ids = useMemo(() => {
    const set = new Set<string>();
    题.forEach((q) => { if (answers[q.id] !== undefined && answers[q.id] !== null) set.add(q.id); });
    return set;
  }, [answers]);

  const un已答Count = 题.length - 已答Indices.size;
  const worlds = useMemo(() => getAdventureWorlds(已答Ids), [已答Ids]);
  const currentTheme = getThemeForQuestion(题[currentIndex].id);
  const currentWorld = worlds.find((w) => w.questionIds.includes(题[currentIndex].id));

  const setAnswer = useCallback((questionId: string, value: number | boolean | Record<string, string> | number[]) => {
    setAnswers((prev) => {
      const nextAnswers = { ...prev, [questionId]: value };
        try { localStorage.setItem("exam_answers_" + sessionId, JSON.stringify(nextAnswers)); } catch {}
      const q = 题.find(qq => qq.id === questionId);
      if (q) {
        const theme = getThemeForQuestion(questionId);
        const worldQs = worlds.find(w => w.id === theme.id)?.questionIds || [];
        if (worldQs.every(id => nextAnswers[id] !== undefined && nextAnswers[id] !== null)) {
          const worldIdx = worlds.findIndex(w => w.id === theme.id);
          if (worldIdx >= 0 && !stars.has(worldIdx)) {
            setStars(prev => new Set([...prev, worldIdx]));
          }
        }
      }
      return nextAnswers;
    });
  }, [worlds, stars]);

  const handleSubmit = useCallback(async () => {
    if (submitting) return;
    setSubmitting(true);
    const startTimeStr = sessionStorage.getItem('startTime');
    const startTime = startTimeStr ? new Date(startTimeStr).getTime() : Date.now();
    const timeUsed = Math.floor((Date.now() - startTime) / 1000);
    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: Number(sessionId), answers, timeUsed }),
      });
      const data = await res.json();
      if (!res.ok) { alert(data.error || 'submit failed'); return; }
      sessionStorage.setItem('examResult', JSON.stringify(data));
      localStorage.removeItem("exam_answers_" + sessionId);
      fetch('/api/save-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: Number(sessionId), answers: {} }),
      }).catch(() => {});
      navigate('/result/' + sessionId, { replace: true });
    } catch { alert('network error'); }
    finally { setSubmitting(false); }
  }, [submitting, answers, sessionId, navigate]);

  const handleTimeUp = useCallback(() => { setTimeOver(true); handleSubmit(); }, [handleSubmit]);

  const goTo = useCallback((index: number) => {
    if (index >= 0 && index < 题.length && index !== currentIndex) {
      setTransitioning(true);
      setTimeout(() => { setCurrentIndex(index); setTransitioning(false); }, 150);
    }
  }, [currentIndex]);

  if (!sessionId) return null;
  const q = 题[currentIndex];

  const sceneContent = (() => {
    switch (true) {
      case ['Q01','Q02','Q03'].includes(q.id): return <SupermarketShelf />;
      case ['Q04','Q05','Q06'].includes(q.id): return <WeatherStation />;
      case ['Q07','Q08'].includes(q.id): return <SecurityCheck />;
      case ['Q09','Q10'].includes(q.id): return <PasswordWiFi />;
      case q.id === 'Q11': return <DataChart type='bar' title='title' data={[{label:'A',value:156},{label:'B',value:132},{label:'C',value:98},{label:'D',value:87},{label:'E',value:145}]} />;
      case q.id === 'Q12': return <DataChart type='line' title='title' data={[{label:'1',value:32},{label:'2',value:28},{label:'3',value:35},{label:'4',value:42},{label:'5',value:38},{label:'6',value:45},{label:'7',value:52},{label:'8',value:48},{label:'9',value:55},{label:'10',value:60},{label:'11',value:58},{label:'12',value:68}]} />;
      case q.id === 'Q13': return <DataChart type='pie' title='title' data={[{label:'A',value:448},{label:'B',value:398},{label:'C',value:253},{label:'D',value:180},{label:'E',value:155},{label:'F',value:325}]} />;
      case ['Q14','Q15','Q33'].includes(q.id): return <WordCloud />;
      case ['Q16','Q17','Q34'].includes(q.id): return <KnowledgeGraph />;
      case ['Q18','Q19'].includes(q.id): return <ShenzhenMap />;
      case q.id === 'Q31': return <DataChart type='bar' title='title' data={[{label:'A',value:12},{label:'B',value:18},{label:'C',value:8},{label:'D',value:15},{label:'E',value:20}]} />;
      case q.id === 'Q32': return <DataChart type='line' title='title' data={[{label:'1',value:78},{label:'2',value:82},{label:'3',value:88},{label:'4',value:85},{label:'5',value:92}]} />;
      case q.id === 'Q35': return <DataChart type='pie' title='title' data={[{label:'A',value:150},{label:'B',value:80},{label:'C',value:60},{label:'D',value:110}]} />;
      case ['Q41','Q42'].includes(q.id): return <DataChart type='bar' title='title' data={[{label:'已筛选',value:45},{label:'未筛选',value:55}]} />;
      case ['Q43','Q44'].includes(q.id): return <DataChart type='bar' title='title' data={[{label:'一年级',value:210},{label:'二年级',value:195},{label:'三年级',value:230},{label:'四年级',value:185},{label:'五年级',value:220},{label:'六年级',value:205}]} />;
      case ['Q45','Q46'].includes(q.id): return <DataChart type='pie' title='title' data={[{label:'经济',value:85},{label:'交通',value:72},{label:'教育',value:90},{label:'环境',value:68}]} />;
      case ['Q47','Q48'].includes(q.id): return <DataChart type='line' title='title' data={[{label:'2012',value:1196},{label:'2014',value:1318},{label:'2016',value:1495},{label:'2018',value:1666},{label:'2020',value:1763},{label:'2022',value:1766},{label:'2024',value:1799}]} />;
      case ['Q49'].includes(q.id): return <WordCloud />;
      case ['Q50'].includes(q.id): return <ShenzhenMap />;
      default: return null;
    }
  })();

  return (
    <div className={'min-h-screen flex flex-col bg-gradient-to-br ' + currentTheme.bgGradient}>
      <div className='bg-white/80 backdrop-blur-sm border-b-2 shadow-sm px-4 py-2 flex items-center justify-between sticky top-0 z-20' style={{ borderColor: currentTheme.color + '40' }}>
        <div className='flex items-center gap-2'>
          <span className='text-2xl'>{currentTheme.mascot}</span>
          <div><h1 className='text-sm font-bold text-slate-800 leading-tight'><span className='text-slate-400 font-normal text-xs'>数据大冒险</span><br />{currentWorld?.name || currentTheme.worldName}</h1></div>
          <span className='text-xs px-2 py-0.5 rounded-full font-bold text-white' style={{ backgroundColor: currentTheme.color }}>第{currentIndex + 1}/{题.length}</span>
        </div>
        <div className='flex items-center gap-3'>
          <Timer totalSeconds={EXAM_DURATION} onTimeUp={handleTimeUp} running={started && !timeOver} />
          <button onClick={() => setShowMap(true)} className='flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border-2 transition hover:shadow-md' style={{ borderColor: currentTheme.color, color: currentTheme.color }}><Map className='w-3.5 h-3.5' /> 地图</button>
          <button onClick={() => setShowConfirm(true)} disabled={submitting || timeOver} className='flex items-center gap-1 px-3 py-1.5 bg-green-500 hover:bg-green-600 disabled:bg-slate-400 text-white rounded-lg text-xs font-bold transition shadow-sm'><Trophy className='w-3.5 h-3.5' /> 交卷</button>
        </div>
      </div>
      <div className='h-1.5 bg-slate-200'><div className='h-full transition-all duration-500 rounded-r' style={{ width: ((已答Indices.size / 题.length) * 100) + '%', backgroundColor: currentTheme.color }} /></div>
      <div className='flex-1 flex overflow-hidden'>
        <div className='flex-1 p-3 md:p-5 overflow-auto'>
          <div className='max-w-2xl mx-auto'>
            <div className='text-center mb-3 transition-all duration-150' style={{ opacity: transitioning ? 0 : 1 }}>
              <div className='text-4xl mb-1'>{currentTheme.sceneEmoji}</div>
              <div className='inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-2' style={{ backgroundColor: currentTheme.color + '18', color: currentTheme.color }}><span>{currentTheme.worldIcon}</span>{currentTheme.appName}<span className='opacity-50'>.</span><span>{currentTheme.lesson}</span></div>
            </div>
            {sceneContent && <div className='mb-4'>{sceneContent}</div>}
            <div className='bg-white rounded-2xl border-2 shadow-lg overflow-hidden transition-all duration-150' style={{ borderColor: currentTheme.color + '40', opacity: transitioning ? 0 : 1 }}>
              <div className='px-5 py-3 flex items-center gap-3 border-b' style={{ borderColor: currentTheme.color + '20', background: currentTheme.color + '08' }}>
                <div className='w-10 h-10 rounded-xl flex items-center justify-center text-white text-lg font-bold shadow-sm' style={{ backgroundColor: currentTheme.color }}>{currentIndex + 1}</div>
                <div className='flex-1'><div className='flex items-center gap-2'><span className='text-xs font-semibold px-2 py-0.5 rounded-full' style={{ backgroundColor: currentTheme.color + '18', color: currentTheme.color }}>{q.type === 'choice' ? 'choice' : q.type === 'truefalse' ? 'truefalse' : 'match'}</span><span className='text-xs text-slate-400'>{q.points}分</span></div></div>
                <span className='text-2xl'>{currentTheme.questionEmoji}</span>
              </div>
              <div className='px-5 py-4'><p className='text-base text-slate-800 leading-relaxed'>{(q.type !== 'match' && q.type !== 'ordering') ? (q as ChoiceQuestion | TrueFalseQuestion | MultiSelectQuestion).question : (q as MatchQuestion | OrderingQuestion).instruction}</p></div>
              <div className='px-5 pb-5'>
                {q.type === 'choice' && (
                  <div className='space-y-2'>
                    {q.options.map((opt, idx) => {
                      const 请选择ed = answers[q.id] === idx;
                      const letters = ['A','B','C','D'];
                      return (
                        <button key={idx} onClick={() => setAnswer(q.id, idx)} className='w-full text-left px-4 py-3 rounded-xl border-2 transition-all flex items-center gap-3 group' style={请选择ed ? { borderColor: currentTheme.color, backgroundColor: currentTheme.color + '12' } : { borderColor: '#e2e8f0' }}>
                          <span className='w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold transition-all flex-shrink-0' style={请选择ed ? { backgroundColor: currentTheme.color, color: 'white' } : { backgroundColor: '#f1f5f9', color: '#94a3b8' }}>{letters[idx]}</span>
                          <span className='text-sm' style={{ color: 请选择ed ? '#1e293b' : '#475569' }}>{opt}</span>
                          {请选择ed && <span className='ml-auto text-lg'>{currentTheme.mascot}</span>}
                        </button>
                      );
                    })}
                  </div>
                )}
                {q.type === 'truefalse' && (
                  <div className='flex gap-3'>
                    {[{ value: true, label: 'true', emoji: 'O', bc: '#22c55e', bg: '#f0fdf4' }, { value: false, label: 'false', emoji: 'X', bc: '#ef4444', bg: '#fef2f2' }].map((opt) => {
                      const 请选择ed = answers[q.id] === opt.value;
                      return (
                        <button key={String(opt.value)} onClick={() => setAnswer(q.id, opt.value)} className='flex-1 py-5 rounded-xl border-2 transition-all flex flex-col items-center gap-2' style={请选择ed ? { borderColor: opt.bc, backgroundColor: opt.bg } : { borderColor: '#e2e8f0' }}>
                          <span className='text-3xl'>{opt.emoji}</span>
                          <span className='text-sm font-bold' style={{ color: 请选择ed ? opt.bc : '#94a3b8' }}>{opt.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
                {q.type === 'match' && <MatchAnswer mq={q as MatchQuestion} answer={answers[q.id] as Record<string, string> | undefined} onChange={(val) => setAnswer(q.id, val)} theme={currentTheme} />}
                {q.type === 'multiselect' && <MultiSelectInput msq={q as MultiSelectQuestion} answer={answers[q.id] as number[] | undefined} onChange={(val) => setAnswer(q.id, val)} theme={currentTheme} />}
                {q.type === 'ordering' && <OrderingInput oq={q as OrderingQuestion} answer={answers[q.id] as number[] | undefined} onChange={(val) => setAnswer(q.id, val)} theme={currentTheme} />}
              </div>
            </div>
            <div className='text-center mt-3 mb-2'><span className='text-2xl'>{currentTheme.mascot}</span><p className='text-xs text-slate-400 mt-0.5'>{currentTheme.mascotLabel} 为你加油！ {已答Indices.size}/{题.length} 已答</p></div>
            <div className='flex justify-between items-center max-w-2xl mx-auto mb-4'>
              <button onClick={() => goTo(currentIndex - 1)} disabled={currentIndex === 0} className='flex items-center gap-1 px-4 py-2 rounded-xl border-2 text-sm font-semibold transition disabled:opacity-20 bg-white hover:shadow-sm' style={{ borderColor: currentTheme.color + '40', color: currentTheme.color }}><ArrowLeft className='w-4 h-4' /> 上一关</button>
              <span className='text-xs text-slate-400'>{currentIndex + 1}/{题.length}</span>
              <button onClick={() => goTo(currentIndex + 1)} disabled={currentIndex === 题.length - 1} className='flex items-center gap-1 px-4 py-2 rounded-xl border-2 text-sm font-semibold transition disabled:opacity-20 bg-white hover:shadow-sm' style={{ borderColor: currentTheme.color + '40', color: currentTheme.color }}>下一关 <ArrowRight className='w-4 h-4' /></button>
            </div>
          </div>
        </div>
      </div>
      {showMap && <MapModal worlds={worlds} 已答Ids={已答Ids} 题={题} currentIndex={currentIndex} un已答Count={un已答Count} onClose={() => setShowMap(false)} onGoTo={(i: number) => { goTo(i); setShowMap(false); }} />}
      {stars.size > 0 && <div className='fixed top-20 left-1/2 -translate-x-1/2 z-30 pointer-events-none'><div className='animate-bounce text-center'><Sparkles className='w-8 h-8 text-amber-400 mx-auto' /><span className='text-sm font-bold text-amber-600'>世界完成！</span></div></div>}
      {showConfirm && <ConfirmModal 已答Indices={已答Indices} 题={题} worlds={worlds} stars={stars} un已答Count={un已答Count} 交卷ting={submitting} onCancel={() => setShowConfirm(false)} onSubmit={() => { setShowConfirm(false); handleSubmit(); }} />}
    </div>
  );
}

function MatchAnswer({ mq, answer, onChange, theme }: { mq: MatchQuestion; answer: Record<string, string> | undefined; onChange: (val: Record<string, string>) => void; theme: LessonTheme }) {
  const currentAnswer = answer || {};
  return (
    <div className='space-y-4'>
      {mq.scenarios.map((scenario) => {
        const selected = currentAnswer[scenario.id] || '';
        return (
          <div key={scenario.id} className='rounded-xl p-4 border-2' style={{ borderColor: theme.color + '30', backgroundColor: theme.color + '06' }}>
            <p className='text-sm text-slate-700 font-medium mb-3'>任务：{scenario.text}</p>
            <div className='flex flex-wrap gap-2'>
              {mq.tools.map((tool) => {
                const isSelected = selected === tool.id;
                return (
                  <button
                    key={tool.id}
                    type="button"
                    onClick={() => onChange({ ...currentAnswer, [scenario.id]: isSelected ? '' : tool.id })}
                    className={'px-3 py-2 rounded-lg text-xs font-semibold transition-all border-2 ' + (isSelected ? 'text-white shadow-sm' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:bg-slate-50')}
                    style={isSelected ? { backgroundColor: theme.color, borderColor: theme.color } : {}}
                  >
                    {tool.name}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function MapModal({ worlds, 已答Ids, 题, currentIndex, un已答Count, onClose, onGoTo }: any) {
  return (
    <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4' onClick={onClose}>
      <div className='bg-white rounded-2xl shadow-2xl p-6 max-w-lg w-full max-h-[80vh] overflow-auto' onClick={e => e.stopPropagation()}>
        <div className='flex items-center justify-between mb-4'><h2 className='text-lg font-bold text-slate-800 flex items-center gap-2'><Map className='w-5 h-5 text-blue-600' /> adventure 地图</h2><button onClick={onClose} className='text-slate-400 hover:text-slate-600'><ChevronLeft className='w-5 h-5' /></button></div>
        <p className='text-xs text-slate-500 mb-4'>11个世界，50道关卡。 已答 {已答Ids.size} 题</p>
        <div className='space-y-3'>
          {worlds.map((world: any, idx: number) => (
            <div key={world.id} className={'rounded-xl border-2 p-4 transition-all ' + (world.completed ? 'bg-green-50 border-green-300' : world.unlocked ? 'bg-white border-slate-200 hover:shadow-md cursor-pointer' : 'bg-slate-50 border-slate-200 opacity-50')}
              onClick={() => { if (world.unlocked) { const firstQIdx = 题.findIndex((q: any) => world.questionIds.includes(q.id)); if (firstQIdx >= 0) onGoTo(firstQIdx); } }}>
              <div className='flex items-center gap-3'>
                <div className='w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-sm' style={{ backgroundColor: world.completed ? '#22c55e' : world.unlocked ? world.color : '#cbd5e1' }}>{world.completed ? '*' : world.icon}</div>
                <div className='flex-1'><div className='font-bold text-sm text-slate-800'>{world.name}</div><div className='text-xs text-slate-400'>{world.questionIds.length} 题</div></div>
                <div className='text-right'>{world.completed ? <Star className='w-5 h-5 text-amber-400 fill-amber-400' /> : <span className='text-xs text-slate-400'>{world.questionIds.filter((id: string) => 已答Ids.has(id)).length}/{world.questionIds.length}</span>}</div>
              </div>
              <div className='flex gap-1.5 mt-3'>
                {world.questionIds.map((qid: string) => {
                  const idx = 题.findIndex((qq: any) => qq.id === qid);
                  const isAnswered = 已答Ids.has(qid);
                  const isCurrent = idx === currentIndex;
                  return <div key={qid} onClick={(e: any) => { e.stopPropagation(); if (idx >= 0) onGoTo(idx); }} className={'w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold cursor-pointer transition ' + (isCurrent ? 'ring-2 ring-offset-1' : '')} style={{ backgroundColor: isAnswered ? world.color : '#e2e8f0', color: isAnswered ? 'white' : '#94a3b8' }}>{idx + 1}</div>;
                })}
              </div>
            </div>
          ))}
        </div>
        {un已答Count > 0 && <div className='mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700 text-center'>warning: <strong>{un已答Count}</strong> levels 未挑战!</div>}
      </div>
    </div>
  );
}

function ConfirmModal({ 已答Indices, 题, worlds, stars, un已答Count, 交卷ting, onCancel, onSubmit }: any) {
  return (
    <div className='fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4'>
      <div className='bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full'>
        <div className='text-center mb-4'><span className='text-4xl'>完成</span><h3 className='text-lg font-bold text-slate-800 mt-2'>确认交卷吗？</h3></div>
        <div className='bg-slate-50 rounded-xl p-4 mb-4'>
          <div className='flex justify-between text-sm mb-1'><span className='text-slate-500'>已完成</span><span className='font-bold text-slate-800'>{已答Indices.size}/{题.length}</span></div>
          <div className='flex justify-between text-sm mb-1'><span className='text-slate-500'>已解锁世界</span><span className='font-bold text-slate-800'>{worlds.filter((w: any) => w.unlocked).length}/{worlds.length}</span></div>
          <div className='flex justify-between text-sm'><span className='text-slate-500'>星星</span><span className='font-bold text-amber-500'>{stars.size} *</span></div>
        </div>
        {un已答Count > 0 && <p className='text-sm text-red-500 mb-4 text-center'><strong>{un已答Count}</strong> 未挑战关卡将得0分！</p>}
        <div className='flex gap-3'>
          <button onClick={onCancel} className='flex-1 py-2.5 border-2 border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition text-sm font-semibold'>继续答题</button>
          <button onClick={onSubmit} disabled={交卷ting} className='flex-1 py-2.5 bg-green-500 hover:bg-green-600 disabled:bg-slate-400 text-white rounded-xl transition text-sm font-bold flex items-center justify-center gap-1'>{交卷ting ? <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' /> : 'trophy 交卷'}</button>
        </div>
      </div>
    </div>
  );
}
