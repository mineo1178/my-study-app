import React, { useState, useEffect, useRef } from 'react';
import { 
  Clock, 
  Play, 
  Pause, 
  Edit2, 
  Plus, 
  Trash2, 
  BarChart2, 
  CheckCircle, 
  Circle, 
  ChevronDown,
  ChevronUp,
  Award,
  X,
  Zap,
  Book,
  Layers,
  ArrowLeft,
  List,
  Save,
  History,
  MoreHorizontal,
  LayoutDashboard,
  PlayCircle,
  PauseCircle,
  TrendingUp,
  Filter,
  Calendar as CalendarIcon,
  AlertTriangle,
  Search
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Legend } from 'recharts';

/**
 * Constants & Config
 */
const SUBJECT_CONFIG = {
  math: { 
    id: 'math', label: '算数', short: '算', 
    color: 'text-blue-600', 
    bg: 'bg-blue-500',
    lightBg: 'bg-blue-50',
    border: 'border-blue-200',
    hex: '#2563eb',
  },
  japanese: { 
    id: 'japanese', label: '国語', short: '国', 
    color: 'text-rose-600', 
    bg: 'bg-rose-500',
    lightBg: 'bg-rose-50',
    border: 'border-rose-200',
    hex: '#e11d48',
  },
  science: { 
    id: 'science', label: '理科', short: '理', 
    color: 'text-amber-600', 
    bg: 'bg-amber-500',
    lightBg: 'bg-amber-50',
    border: 'border-amber-200',
    hex: '#d97706',
  },
  social: { 
    id: 'social', label: '社会', short: '社', 
    color: 'text-emerald-600', 
    bg: 'bg-emerald-500',
    lightBg: 'bg-emerald-50',
    border: 'border-emerald-200',
    hex: '#059669',
  },
};

const TEST_TYPE_CONFIG = {
  kumiwake: { label: '組分け', color: 'text-purple-700', activeClass: 'bg-purple-600 text-white border-purple-600' },
  curriculum: { label: 'カリテ', color: 'text-slate-700', activeClass: 'bg-slate-600 text-white border-slate-600' },
  hantei: { label: '判定', color: 'text-orange-700', activeClass: 'bg-orange-600 text-white border-orange-600' },
};

// 早稲アカ4年生カリキュラム（プリセット: 最新版）
const CURRICULUM_PRESETS = {
  math: [
    { category: '予習シリーズ', items: ['類題', '基本問題', '練習問題'] },
    { category: '演習問題集', items: ['基本問題', '練習問題', 'トレーニング', '実戦演習'] },
    { category: '計算', items: ['①', '②', '③', '④', '⑤', '⑥', '⑦'] },
    { category: 'プリント', items: ['ミニテスト STANDARD', 'ミニテスト ADVANCE', '基礎力強化プリント'] },
  ],
  japanese: [
    { category: '予習シリーズ', items: ['基本問題', '発展問題', '言語知識'] },
    { category: '漢字とことば', items: ['漢字練習', '漢字確認', 'ことば'] },
    { category: '演習問題集', items: ['演習問題集'] },
    { category: 'プリント', items: ['漢字', 'ことば'] },
  ],
  science: [
    { category: '予習シリーズ', items: ['要点チェック'] },
    { category: '演習問題集', items: ['まとめてみよう', '練習問題', '発展問題'] },
    { category: '練成問題集', items: ['トレーニング', '基本問題', '練習問題'] },
    { category: 'プリント', items: ['確認テスト', 'まとめプリント 穴埋め編', 'まとめプリント まとめプリント'] },
  ],
  social: [
    { category: '予習シリーズ', items: ['要点チェック'] },
    { category: '演習問題集', items: ['まとめてみよう', '練習問題', '発展問題'] },
    { category: '練成問題集', items: ['トレーニング', '基本問題', '練習問題'] },
    { category: 'プリント', items: ['確認テスト', 'ジャンプアップ問題'] },
  ]
};

const formatTime = (seconds) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h${m}m`;
  return `${m}m${s}s`;
};

// Initial Data
const INITIAL_TASKS = [
  { 
    id: '1', 
    unit: '第14回', 
    subject: 'math', 
    category: '計算', 
    title: '①', 
    materialName: '計算 - ①', 
    status: 'completed', 
    currentDuration: 0, 
    currentMemo: '', 
    history: [{ id: 'h1', date: '05/18', duration: 900, memo: '全問正解！' }], 
    createdAt: '05/18' 
  },
  { 
    id: '2', 
    unit: '第14回', 
    subject: 'math', 
    category: '予習シリーズ', 
    title: '基本問題', 
    materialName: '予習シリーズ - 基本問題', 
    status: 'in_progress', 
    currentDuration: 1200, 
    currentMemo: '問3でつまづいた', 
    history: [], 
    createdAt: '05/18' 
  },
];

// 画像データに基づくテストデータ
const INITIAL_TESTS = [
  // --- カリキュラムテスト（下） ---
  {
    id: 't20251206', date: '2025/12/06', name: 'カリ下13-14', type: 'curriculum',
    subjects: {
      math: { score: 46, avg: 57.6, dev: 42.2, rank: '1665/2216' },
      japanese: { score: 76, avg: 73.6, dev: 51.7, rank: '1019/2216' },
      science: { score: 34, avg: 37.3, dev: 45.4, rank: '1537/2216' },
      social: { score: 38, avg: 40.9, dev: 44.4, rank: '1602/2216' },
    },
    total4: { score: 194, avg: 209.6, dev: 44.2, rank: '1615/2216' }
  },
  {
    id: 't20251122', date: '2025/11/22', name: 'カリ下11-12', type: 'curriculum',
    subjects: {
      math: { score: 46, avg: 54.5, dev: 44.8, rank: '1416/2133' },
      japanese: { score: 75, avg: 65.9, dev: 57.2, rank: '488/2133' },
      science: { score: 38, avg: 41.6, dev: 44.5, rank: '1574/2133' },
      social: { score: 46, avg: 41.0, dev: 58.8, rank: '225/2133' },
    },
    total4: { score: 205, avg: 203.2, dev: 50.6, rank: '1036/2133' }
  },
  {
    id: 't20251101', date: '2025/11/01', name: 'カリ下8-9', type: 'curriculum',
    subjects: {
      math: { score: 69, avg: 55.3, dev: 58.5, rank: '349/2281' },
      japanese: { score: 77, avg: 70.0, dev: 55.8, rank: '652/2281' },
      science: { score: 50, avg: 42.5, dev: 62.7, rank: '1/2281' },
      social: { score: 38, avg: 38.3, dev: 49.3, rank: '1140/2281' },
    },
    total4: { score: 234, avg: 206.3, dev: 60.1, rank: '329/2281' }
  },
  {
    id: 't20251018', date: '2025/10/18', name: 'カリ下6-7', type: 'curriculum',
    subjects: {
      math: { score: 90, avg: 65.4, dev: 67.1, rank: '28/2329' },
      japanese: { score: 75, avg: 64.5, dev: 57.6, rank: '502/2329' },
      science: { score: 40, avg: 35.1, dev: 56.2, rank: '637/2329' },
      social: { score: 48, avg: 43.7, dev: 58.0, rank: '261/2329' },
    },
    total4: { score: 253, avg: 208.9, dev: 66.7, rank: '80/2329' }
  },
  {
    id: 't20250927', date: '2025/09/27', name: 'カリ下3-4', type: 'curriculum',
    subjects: {
      math: { score: 73, avg: 62.6, dev: 57.1, rank: '514/2161' },
      japanese: { score: 61, avg: 71.1, dev: 42.4, rank: '1659/2161' },
      science: { score: 36, avg: 41.7, dev: 41.2, rank: '1770/2161' },
      social: { score: 46, avg: 40.9, dev: 58.5, rank: '250/2161' },
    },
    total4: { score: 216, avg: 216.5, dev: 49.7, rank: '1108/2161' }
  },
  {
    id: 't20250913', date: '2025/09/13', name: 'カリ下1-2', type: 'curriculum',
    subjects: {
      math: { score: 69, avg: 67.0, dev: 51.3, rank: '907/2150' },
      japanese: { score: 77, avg: 69.6, dev: 56.5, rank: '530/2150' },
      science: { score: 43, avg: 41.3, dev: 52.7, rank: '862/2150' },
      social: { score: 48, avg: 44.0, dev: 58.0, rank: '221/2150' },
    },
    total4: { score: 237, avg: 222.0, dev: 56.4, rank: '559/2150' }
  },

  // --- カリキュラムテスト（上） ---
  {
    id: 't20250705', date: '2025/07/05', name: 'カリ上18-19', type: 'curriculum',
    subjects: {
      math: { score: 74, avg: 68.3, dev: 53.9, rank: '753/2185' },
      japanese: { score: 88, avg: 82.1, dev: 54.7, rank: '770/2185' },
      science: { score: 38, avg: 35.8, dev: 52.9, rank: '829/2185' },
      social: { score: 40, avg: 38.1, dev: 53.0, rank: '761/2185' },
    },
    total4: { score: 240, avg: 224.5, dev: 55.9, rank: '622/2185' }
  },
  {
    id: 't20250621', date: '2025/06/21', name: 'カリ上16-17', type: 'curriculum',
    subjects: {
      math: { score: 74, avg: 65.0, dev: 56.0, rank: '535/2147' },
      japanese: { score: 47, avg: 66.6, dev: 34.1, rank: '1982/2147' },
      science: { score: 36, avg: 35.9, dev: 50.0, rank: '1085/2147' },
      social: { score: 40, avg: 39.6, dev: 50.5, rank: '993/2147' },
    },
    total4: { score: 197, avg: 207.4, dev: 45.9, rank: '1417/2147' }
  },
  {
    id: 't20250531', date: '2025/05/31', name: 'カリ上13-14', type: 'curriculum',
    subjects: {
      math: { score: 80, avg: 61.7, dev: 62.5, rank: '156/2131' },
      japanese: { score: 62, avg: 59.6, dev: 51.8, rank: '899/2131' },
      science: { score: 37, avg: 37.9, dev: 48.5, rank: '1205/2131' },
      social: { score: 46, avg: 37.7, dev: 62.2, rank: '106/2131' },
    },
    total4: { score: 225, avg: 197.0, dev: 60.5, rank: '277/2131' }
  },
  {
    id: 't20250517', date: '2025/05/17', name: 'カリ上11-12', type: 'curriculum',
    subjects: {
      math: { score: 69, avg: 60.3, dev: 56.0, rank: '534/2175' },
      japanese: { score: 39, avg: 63.8, dev: 32.1, rank: '2055/2175' },
      science: { score: 41, avg: 29.5, dev: 65.2, rank: '105/2175' },
      social: { score: 32, avg: 35.4, dev: 44.7, rank: '1462/2175' },
    },
    total4: { score: 181, avg: 189.1, dev: 47.0, rank: '1344/2175' }
  },
  {
    id: 't20250419', date: '2025/04/19', name: 'カリ上8-9', type: 'curriculum',
    subjects: {
      math: { score: 83, avg: 61.9, dev: 64.3, rank: '178/2159' },
      japanese: { score: 96, avg: 78.2, dev: 63.8, rank: '83/2159' },
      science: { score: 37, avg: 36.7, dev: 50.3, rank: '1031/2159' },
      social: { score: 48, avg: 42.1, dev: 59.5, rank: '156/2159' },
    },
    total4: { score: 264, avg: 219.1, dev: 65.6, rank: '84/2159' }
  },
  {
    id: 't20250322', date: '2025/03/22', name: 'カリ上6-7', type: 'curriculum',
    subjects: {
      math: { score: 88, avg: 70.8, dev: 61.1, rank: '295/2010' },
      japanese: { score: 84, avg: 63.7, dev: 62.5, rank: '183/2010' },
      science: { score: 29, avg: 31.9, dev: 45.2, rank: '1332/2010' },
      social: { score: 46, avg: 37.2, dev: 63.2, rank: '55/2010' },
    },
    total4: { score: 247, avg: 203.8, dev: 65.4, rank: '102/2010' }
  },
  {
    id: 't20250301', date: '2025/03/01', name: 'カリ上3-4', type: 'curriculum',
    subjects: {
      math: { score: 94, avg: 75.5, dev: 62.1, rank: '166/1937' },
      japanese: { score: 71, avg: 70.1, dev: 50.5, rank: '986/1937' },
      science: { score: 42, avg: 37.1, dev: 55.8, rank: '538/1937' },
      social: { score: 46, avg: 40.2, dev: 58.0, rank: '261/1937' },
    },
    total4: { score: 253, avg: 223.0, dev: 58.9, rank: '341/1937' }
  },
  {
    id: 't20250215', date: '2025/02/15', name: 'カリ上1-2', type: 'curriculum',
    subjects: {
      math: { score: 88, avg: 69.8, dev: 61.1, rank: '233/1934' },
      japanese: { score: 88, avg: 79.3, dev: 56.5, rank: '486/1934' },
      science: { score: 47, avg: 37.0, dev: 64.2, rank: '63/1934' },
      social: { score: 50, avg: 38.7, dev: 65.4, rank: '1/1934' },
    },
    total4: { score: 273, avg: 224.9, dev: 65.2, rank: '46/1934' }
  },

  // --- 公開組分けテスト ---
  {
    id: 't20251109', date: '2025/11/09', name: '4年公開組分-07', type: 'kumiwake',
    subjects: {
      math: { score: 90, avg: 97.1, dev: 48.1, rank: '6082/10342' },
      japanese: { score: 75, avg: 69.4, dev: 52.3, rank: '4080/10342' },
      science: { score: 70, avg: 62.9, dev: 53.8, rank: '3805/10069' },
      social: { score: 87, avg: 60.7, dev: 61.4, rank: '1279/10001' },
    },
    total4: { score: 322, avg: 290.7, dev: 53.4, rank: '3844/10001' }
  },
  {
    id: 't20251005', date: '2025/10/05', name: '4年公開組分-06', type: 'kumiwake',
    subjects: {
      math: { score: 72, avg: 90.9, dev: 44.6, rank: '7317/10413' },
      japanese: { score: 98, avg: 85.8, dev: 54.8, rank: '3473/10413' },
      science: { score: 76, avg: 77.8, dev: 48.9, rank: '6301/10152' },
      social: { score: 81, avg: 66.8, dev: 55.9, rank: '3457/10075' },
    },
    total4: { score: 327, avg: 322.1, dev: 50.5, rank: '5210/10075' }
  },
  {
    id: 't20250831', date: '2025/08/31', name: '4年公開組分-05', type: 'kumiwake',
    subjects: {
      math: { score: 108, avg: 102.9, dev: 51.1, rank: '4812/10431' },
      japanese: { score: 95, avg: 81.0, dev: 55.1, rank: '3397/10431' },
      science: { score: 66, avg: 58.3, dev: 54.2, rank: '3497/10172' },
      social: { score: 84, avg: 60.8, dev: 59.2, rank: '2048/10095' },
    },
    total4: { score: 353, avg: 303.7, dev: 55.0, rank: '3370/10095' }
  },
  {
    id: 't20250712', date: '2025/07/12', name: '4年公開組分-04', type: 'kumiwake',
    subjects: {
      math: { score: 98, avg: 111.1, dev: 46.3, rank: '6478/10008' },
      japanese: { score: 92, avg: 84.0, dev: 53.1, rank: '3945/10008' },
      science: { score: 62, avg: 65.1, dev: 48.4, rank: '5732/9754' },
      social: { score: 73, avg: 58.5, dev: 56.8, rank: '2624/9691' },
    },
    total4: { score: 325, avg: 319.1, dev: 50.6, rank: '4922/9691' }
  },
  {
    id: 't20250426', date: '2025/04/26', name: '4年公開組分-02', type: 'kumiwake',
    subjects: {
      math: { score: 108, avg: 104.3, dev: 51.0, rank: '4593/9951' },
      japanese: { score: 95, avg: 93.7, dev: 50.5, rank: '5057/9951' },
      science: { score: 63, avg: 62.5, dev: 50.2, rank: '5024/9702' },
      social: { score: 50, avg: 61.3, dev: 44.7, rank: '6766/9632' },
    },
    total4: { score: 316, avg: 322.4, dev: 49.2, rank: '5367/9632' }
  },
  {
    id: 't20250308', date: '2025/03/08', name: '4年公開組分-01', type: 'kumiwake',
    subjects: {
      math: { score: 104, avg: 111.4, dev: 47.9, rank: '5673/9334' },
      japanese: { score: 81, avg: 79.0, dev: 50.7, rank: '4463/9334' },
      science: { score: 86, avg: 69.7, dev: 59.6, rank: '1386/9112' },
      social: { score: 77, avg: 66.2, dev: 55.7, rank: '2859/9057' },
    },
    total4: { score: 348, avg: 326.7, dev: 52.5, rank: '3946/9057' }
  },
];

/**
 * Component: Stopwatch
 */
const Stopwatch = React.memo(({ 
  time, 
  onChange,
  onStartStop,
  variant = 'modal'
}) => {
  const [running, setRunning] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editVal, setEditVal] = useState('');
  
  const timeRef = useRef(time);

  useEffect(() => {
    if (!running) {
      timeRef.current = time;
    }
  }, [time, running]);

  useEffect(() => {
    let interval;
    if (running) {
      interval = setInterval(() => {
        const next = timeRef.current + 1;
        timeRef.current = next;
        onChange(next);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [running]);

  const toggleTimer = (e) => {
    e?.stopPropagation();
    const nextState = !running;
    setRunning(nextState);
    onStartStop(nextState);
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditVal(Math.floor(timeRef.current / 60).toString());
    setRunning(false);
    onStartStop(false);
  };

  const saveEdit = () => {
    const val = parseInt(editVal) || 0;
    const newTime = val * 60;
    timeRef.current = newTime;
    onChange(newTime);
    setIsEditing(false);
  };

  if (variant === 'card') {
    return (
      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
        {timeRef.current > 0 && (
          <span className={`font-mono text-xs font-bold ${running ? 'text-blue-600' : 'text-slate-400'}`}>
            {formatTime(timeRef.current)}
          </span>
        )}
        <button 
          onClick={toggleTimer}
          className={`p-1.5 rounded-full transition-all ${
            running 
              ? 'bg-red-50 text-red-500 hover:bg-red-100 ring-2 ring-red-100' 
              : 'bg-slate-50 text-blue-500 hover:bg-blue-50 hover:text-blue-600'
          }`}
        >
          {running ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
        </button>
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="flex items-center justify-center bg-slate-100 rounded-2xl py-2 px-4 w-full h-16">
        <input 
          type="number" 
          value={editVal}
          onChange={(e) => setEditVal(e.target.value)}
          className="w-20 text-center bg-transparent text-3xl font-black text-slate-800 focus:outline-none"
          autoFocus
        />
        <span className="text-sm font-bold text-slate-500 mr-4 mt-2">分</span>
        <button onClick={saveEdit} className="bg-green-500 text-white p-2 rounded-full shadow-md active:scale-95">
          <CheckCircle size={20} />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between bg-slate-50 rounded-2xl p-2 pr-4 w-full h-16 border border-slate-100 shadow-inner">
      <div className="flex-1 text-center">
        <span className={`font-mono text-3xl font-black tracking-widest ${running ? 'text-blue-600' : 'text-slate-700'}`}>
          {formatTime(timeRef.current)}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={handleEdit} className="text-slate-300 hover:text-slate-500 p-2 transition-colors">
          <Edit2 size={18} />
        </button>
        <button 
          onClick={toggleTimer}
          className={`w-10 h-10 flex items-center justify-center rounded-full shadow-lg active:scale-95 transition-all ${
            running ? 'bg-red-500 text-white shadow-red-200 ring-2 ring-red-100' : 'bg-blue-600 text-white shadow-blue-200 ring-2 ring-blue-100'
          }`}
        >
          {running ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
        </button>
      </div>
    </div>
  );
});
Stopwatch.displayName = 'Stopwatch';

/**
 * Component: Delete Confirmation Modal
 */
const DeleteConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-6 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl scale-100 animate-in zoom-in-95">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle size={32} />
          </div>
          <h3 className="text-xl font-black text-slate-800 mb-2">{title}</h3>
          <p className="text-slate-500 text-sm">{message}</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 py-3 rounded-xl font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            キャンセル
          </button>
          <button 
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex-1 py-3 rounded-xl font-bold text-white bg-red-500 hover:bg-red-600 shadow-lg shadow-red-200 transition-colors"
          >
            削除する
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Component: New Unit Creator Modal
 */
const CreateUnitOverlay = ({ 
  isOpen, 
  onClose, 
  onCreate
}) => {
  const [unitNumber, setUnitNumber] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-black text-slate-800 flex items-center">
            <Layers className="mr-2 text-blue-600" /> 新しい回を追加
          </h3>
          <button onClick={onClose} className="p-2 bg-slate-100 text-slate-400 rounded-full hover:bg-slate-200"><X size={20} /></button>
        </div>
        
        <div className="mb-6 bg-slate-50 rounded-2xl p-4 border border-slate-100">
          <label className="block text-xs font-bold text-slate-400 mb-2 text-center uppercase tracking-wider">Unit Number</label>
          <div className="flex items-center justify-center gap-3">
            <span className="text-2xl font-black text-slate-300">第</span>
            <input
              type="number"
              value={unitNumber}
              onChange={(e) => setUnitNumber(e.target.value)}
              placeholder="?"
              className="w-24 bg-white border-2 border-blue-100 rounded-xl px-2 py-3 text-3xl font-black text-center text-blue-600 focus:ring-4 focus:ring-blue-50 focus:border-blue-500 focus:outline-none transition-all placeholder-blue-100"
              autoFocus
            />
            <span className="text-2xl font-black text-slate-300">回</span>
          </div>
        </div>

        <button
          onClick={() => {
            const num = parseInt(unitNumber);
            if (num > 0) {
              onCreate(num);
              setUnitNumber('');
              onClose();
            }
          }}
          disabled={!unitNumber}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-200 active:scale-95 transition-transform disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2"
        >
          <Zap size={20} fill="currentColor"/> カリキュラムを作成
        </button>
      </div>
    </div>
  );
};

/**
 * Component: Add Test Result Modal
 */
const AddTestResultOverlay = ({ 
  isOpen, 
  onClose, 
  onAdd 
}) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0].replace(/-/g, '/'));
  const [name, setName] = useState('');
  const [type, setType] = useState('curriculum');
  const [scores, setScores] = useState({ math: '', japanese: '', science: '', social: '' });
  const [avgs, setAvgs] = useState({ math: '', japanese: '', science: '', social: '' });
  const [devs, setDevs] = useState({ math: '', japanese: '', science: '', social: '' });
  const [total, setTotal] = useState({ score: '', avg: '', dev: '', rank: '' });

  if (!isOpen) return null;

  const handleSubmit = () => {
    const newTest = {
      id: Date.now().toString(),
      date,
      name,
      type,
      subjects: {
        math: { score: Number(scores.math), avg: Number(avgs.math), dev: Number(devs.math) },
        japanese: { score: Number(scores.japanese), avg: Number(avgs.japanese), dev: Number(devs.japanese) },
        science: { score: Number(scores.science), avg: Number(avgs.science), dev: Number(devs.science) },
        social: { score: Number(scores.social), avg: Number(avgs.social), dev: Number(devs.social) },
      },
      total4: { score: Number(total.score), avg: Number(total.avg), dev: Number(total.dev), rank: total.rank }
    };
    onAdd(newTest);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-black text-slate-800">テスト結果を追加</h3>
          <button onClick={onClose}><X size={24} className="text-slate-400" /></button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">実施日</label>
              <input type="text" value={date} onChange={e => setDate(e.target.value)} className="w-full bg-slate-50 border rounded-xl px-3 py-2 font-bold" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">種類</label>
              <select value={type} onChange={e => setType(e.target.value)} className="w-full bg-slate-50 border rounded-xl px-3 py-2 font-bold">
                <option value="curriculum">カリテ</option>
                <option value="kumiwake">組分け</option>
                <option value="hantei">判定</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1">テスト名</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="例: 第13-14回 カリキュラムテスト" className="w-full bg-slate-50 border rounded-xl px-3 py-2 font-bold" />
          </div>

          <div className="border-t border-slate-100 pt-4">
            <div className="grid grid-cols-4 gap-2 text-center text-xs font-bold text-slate-400 mb-2">
              <div>教科</div>
              <div>得点</div>
              <div>平均</div>
              <div>偏差値</div>
            </div>
            {['math', 'japanese', 'science', 'social'].map(subj => (
              <div key={subj} className="grid grid-cols-4 gap-2 mb-2 items-center">
                <div className={`text-xs font-bold ${SUBJECT_CONFIG[subj].color}`}>{SUBJECT_CONFIG[subj].label}</div>
                <input type="number" placeholder="-" className="bg-slate-50 border rounded-lg px-2 py-1 text-center" value={scores[subj]} onChange={e => setScores({...scores, [subj]: e.target.value})} />
                <input type="number" placeholder="-" className="bg-slate-50 border rounded-lg px-2 py-1 text-center" value={avgs[subj]} onChange={e => setAvgs({...avgs, [subj]: e.target.value})} />
                <input type="number" placeholder="-" className="bg-slate-50 border rounded-lg px-2 py-1 text-center" value={devs[subj]} onChange={e => setDevs({...devs, [subj]: e.target.value})} />
              </div>
            ))}
          </div>

          <div className="border-t border-slate-100 pt-4 bg-slate-50 rounded-xl p-3">
            <h4 className="text-xs font-bold text-slate-500 mb-2">4教科合計</h4>
            <div className="grid grid-cols-4 gap-2">
              <input type="number" placeholder="合計点" className="bg-white border rounded-lg px-2 py-1 text-center" value={total.score} onChange={e => setTotal({...total, score: e.target.value})} />
              <input type="number" placeholder="平均" className="bg-white border rounded-lg px-2 py-1 text-center" value={total.avg} onChange={e => setTotal({...total, avg: e.target.value})} />
              <input type="number" placeholder="偏差値" className="bg-white border rounded-lg px-2 py-1 text-center" value={total.dev} onChange={e => setTotal({...total, dev: e.target.value})} />
              <input type="text" placeholder="順位" className="bg-white border rounded-lg px-2 py-1 text-center" value={total.rank} onChange={e => setTotal({...total, rank: e.target.value})} />
            </div>
          </div>

          <button onClick={handleSubmit} className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl shadow-lg mt-4">
            追加する
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Component: Task Detail Modal
 */
const TaskDetailModal = ({
  task,
  isOpen,
  onClose,
  onUpdate,
  onSaveHistory,
  onDelete
}) => {
  if (!isOpen || !task) return null;

  const conf = SUBJECT_CONFIG[task.subject];

  const getStatusColor = (status) => {
    switch(status) {
      case 'completed': return 'bg-green-500 text-white border-green-500';
      case 'in_progress': return 'bg-blue-500 text-white border-blue-500';
      default: return 'bg-white text-slate-400 border-slate-200';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div className="relative bg-white w-full max-w-md h-[92vh] sm:h-[85vh] sm:rounded-3xl rounded-t-3xl shadow-2xl flex flex-col animate-in slide-in-from-bottom-10 duration-300">
        
        <div className="w-full flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-12 h-1.5 bg-slate-200 rounded-full" />
        </div>

        <div className="px-6 py-4 border-b border-slate-50 flex justify-between items-start shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-[10px] font-black px-2 py-0.5 rounded ${conf.lightBg} ${conf.color} border ${conf.border}`}>
                {conf.label}
              </span>
              <span className="text-xs font-bold text-slate-400">{task.unit} - {task.category}</span>
            </div>
            <h3 className="text-xl font-black text-slate-800 leading-tight pr-4">{task.title}</h3>
          </div>
          <button onClick={onClose} className="p-2 bg-slate-100 rounded-full text-slate-400 hover:bg-slate-200 flex-shrink-0">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8 scroll-smooth">
          
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">現在の状態</label>
            <div className="flex gap-2">
              {[
                { id: 'not_started', label: '未着手', icon: Circle },
                { id: 'in_progress', label: '勉強中', icon: Zap },
                { id: 'completed', label: '完了', icon: CheckCircle },
              ].map(s => (
                <button
                  key={s.id}
                  onClick={() => onUpdate({ status: s.id })}
                  className={`flex-1 py-3 rounded-xl font-bold text-xs flex flex-col items-center justify-center gap-1 border-2 transition-all ${
                    task.status === s.id 
                      ? getStatusColor(s.id) 
                      : 'bg-slate-50 text-slate-400 border-transparent hover:bg-slate-100'
                  }`}
                >
                  <s.icon size={20} />
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-end px-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Clock size={12} /> ストップウォッチ
              </label>
            </div>
            <Stopwatch 
              time={task.currentDuration} 
              onChange={(t) => onUpdate({ currentDuration: t })}
              onStartStop={(running) => {
                if (running && task.status === 'not_started') {
                  onUpdate({ status: 'in_progress' });
                }
              }}
              variant="modal"
            />
          </div>

          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
              メモ・ふりかえり
            </label>
            <textarea
              value={task.currentMemo}
              onChange={(e) => onUpdate({ currentMemo: e.target.value })}
              placeholder="ここにつまづいた、次はこうする、計算ミスした...など"
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none h-24"
            />
          </div>

          <button
            onClick={() => onSaveHistory()}
            disabled={task.currentDuration === 0}
            className="w-full bg-slate-800 text-white font-bold py-4 rounded-2xl shadow-lg shadow-slate-200 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:shadow-none"
          >
            <Save size={20} />
            記録を保存して履歴に追加
          </button>

          <div className="space-y-3 pt-6 border-t border-slate-100">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1 flex items-center gap-1">
              <History size={12} /> 学習履歴 ({task.history.length})
            </label>
            
            {task.history.length === 0 ? (
              <div className="text-center py-8 text-slate-300 text-sm font-bold bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                まだ記録がありません
              </div>
            ) : (
              <div className="space-y-3">
                {[...task.history].reverse().map((h, i) => (
                  <div key={h.id} className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex gap-4">
                    <div className="flex flex-col items-center justify-center px-2 border-r border-slate-100 min-w-[3.5rem]">
                      <span className="text-[10px] font-bold text-slate-400">回目</span>
                      <span className="text-xl font-black text-slate-700">{task.history.length - i}</span>
                    </div>
                    <div className="flex-1 min-w-0 py-0.5">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded">{h.date}</span>
                        <span className="text-sm font-bold text-blue-600 font-mono flex items-center gap-1">
                           <Clock size={12} />
                           {formatTime(h.duration)}
                        </span>
                      </div>
                      {h.memo && (
                        <p className="text-sm text-slate-600 leading-snug break-words bg-slate-50 p-2 rounded-lg">{h.memo}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="h-20 sm:hidden"></div>
        </div>

        <div className="p-4 border-t border-slate-50 bg-white sm:rounded-b-3xl shrink-0 flex flex-col gap-3 pb-safe-bottom">
           <div className="flex justify-between items-center gap-3">
             <button 
               onClick={onDelete}
               className="text-red-400 hover:text-red-500 p-3 rounded-xl hover:bg-red-50 transition-colors flex items-center justify-center gap-2 text-xs font-bold flex-1 border border-transparent hover:border-red-100"
             >
               <Trash2 size={16} /> 削除
             </button>
             <button 
               onClick={onClose}
               className="w-full bg-slate-100 text-slate-500 font-bold py-3 rounded-xl hover:bg-slate-200 transition-colors flex-1"
             >
               閉じる
             </button>
           </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Component: Daily View (Dashboard)
 */
const DailyView = ({
  tasks,
  updateTask,
  cycleStatus,
  saveHistory,
  deleteTask,
  deleteUnit,
  setTasks,
  setAddModalOpen,
  selectedUnit,
  setSelectedUnit,
  unitsWithTasks,
  setDeleteConfirmation
}) => {
  const [detailTaskId, setDetailTaskId] = useState(null);
  
  const getSubjectStats = (unitTasks, subject) => {
    const targetTasks = subject 
      ? unitTasks.filter(t => t.subject === subject)
      : unitTasks;
    
    if (targetTasks.length === 0) return { progress: 0, totalTime: 0 };

    const completed = targetTasks.filter(t => t.status === 'completed').length;
    const progress = Math.round((completed / targetTasks.length) * 100);

    const totalTime = targetTasks.reduce((acc, curr) => {
      const historyTotal = curr.history.reduce((hAcc, h) => hAcc + h.duration, 0);
      return acc + historyTotal + curr.currentDuration;
    }, 0);

    return { progress, totalTime };
  };

  const { progress: overallProgress, totalTime: overallTime } = getSubjectStats(
    selectedUnit ? tasks.filter(t => t.unit === selectedUnit) : []
  );

  return (
    <div className="flex flex-col h-full bg-slate-50/50">
      
      {/* 1. Header Navigation */}
      <div className="bg-white/90 backdrop-blur-md sticky top-0 z-20 px-4 py-3 border-b border-slate-100 shadow-sm">
        <div className="flex gap-3">
          <button 
            onClick={() => setSelectedUnit(null)}
            className={`flex-1 py-3 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all ${
              !selectedUnit 
                ? 'bg-slate-800 text-white shadow-lg shadow-slate-300' 
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}
          >
            <LayoutDashboard size={18} /> 全体サマリー
          </button>

          <div className="flex-1 relative">
            <select
              value={selectedUnit || ''}
              onChange={(e) => {
                  if (e.target.value === 'NEW') {
                      setAddModalOpen(true);
                  } else {
                      setSelectedUnit(e.target.value);
                  }
              }}
              className={`w-full h-full appearance-none rounded-2xl font-black text-sm pl-4 pr-10 focus:outline-none transition-all cursor-pointer ${
                selectedUnit 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
                  : 'bg-white border-2 border-slate-100 text-slate-400'
              }`}
            >
              <option value="" disabled>回を選択...</option>
              <optgroup label="学習中の回">
                  {unitsWithTasks.map(w => <option key={w} value={w} className="text-slate-800 bg-white">{w}</option>)}
              </optgroup>
              <optgroup label="アクション">
                  <option value="NEW" className="text-blue-600 bg-white">+ 新しい回を追加</option>
              </optgroup>
            </select>
            <ChevronDown 
              className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none ${selectedUnit ? 'text-white' : 'text-slate-300'}`} 
              size={18} 
              strokeWidth={3} 
            />
          </div>
        </div>
      </div>

      <div className="pb-28 pt-4 px-4 space-y-6 flex-1">
        
        {/* === Single Unit Detail View === */}
        {selectedUnit ? (
          (() => {
            const unitTasks = tasks.filter(t => t.unit === selectedUnit);
            
            return (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
                
                {/* Stats Card: 4-Subject Overall Progress */}
                <div className="bg-white rounded-3xl p-6 shadow-lg shadow-slate-200/50 border border-slate-100 relative">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteConfirmation(selectedUnit);
                    }}
                    className="absolute top-4 right-4 p-2 text-slate-300 hover:text-red-400 hover:bg-red-50 rounded-full transition-colors z-10"
                  >
                    <Trash2 size={18} />
                  </button>

                  <div className="flex justify-between items-end mb-4">
                    <div>
                      <div className="text-slate-400 font-bold text-xs uppercase tracking-wider mb-1">
                        Total Progress
                      </div>
                      <div className="text-3xl font-black text-slate-800 tracking-tight flex items-baseline gap-2">
                        {overallProgress}<span className="text-sm font-bold text-slate-400">%</span>
                      </div>
                    </div>
                    <div className="text-right mr-8">
                      <div className="text-slate-400 font-bold text-xs uppercase tracking-wider mb-1">
                        Total Time
                      </div>
                      <div className="text-xl font-black text-blue-600 font-mono">
                        {Math.floor(overallTime / 3600)}<span className="text-xs text-slate-400 mx-0.5">h</span>
                        {Math.floor((overallTime % 3600) / 60)}<span className="text-xs text-slate-400 ml-0.5">m</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Detailed Progress Bars */}
                  <div className="space-y-3 pt-4 border-t border-slate-100">
                    {Object.keys(SUBJECT_CONFIG).map(subj => {
                      const { progress: p, totalTime: t } = getSubjectStats(unitTasks, subj);
                      const conf = SUBJECT_CONFIG[subj];
                      return (
                        <div key={subj} className="flex items-center gap-3">
                          <span className={`text-[10px] font-bold w-8 ${conf.color}`}>{conf.short}</span>
                          <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                             <div 
                               className={`h-full ${conf.bg}`} 
                               style={{ width: `${p}%` }}
                             />
                          </div>
                          <span className="text-xs font-bold text-slate-400 w-16 text-right font-mono">
                             {Math.floor(t / 60)}m
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Empty State */}
                {unitTasks.length === 0 && (
                  <div className="text-center py-16 px-6">
                    <p className="text-slate-500 font-bold">まだタスクがありません</p>
                  </div>
                )}

                {/* Task Lists Grouped by Subject & Category */}
                <div className="space-y-12">
                  {Object.keys(SUBJECT_CONFIG).map(subj => {
                    const subjTasks = unitTasks.filter(t => t.subject === subj);
                    const conf = SUBJECT_CONFIG[subj];
                    
                    if (subjTasks.length === 0) return null;

                    // Group by category
                    const tasksByCategory = {};
                    subjTasks.forEach(task => {
                        if (!tasksByCategory[task.category]) tasksByCategory[task.category] = [];
                        tasksByCategory[task.category].push(task);
                    });

                    return (
                      <div key={subj} className="relative">
                        {/* Subject Header */}
                        <div className="flex items-center gap-3 mb-4 px-2">
                           <div className={`w-3 h-8 rounded-full ${conf.bg}`} />
                           <h3 className={`font-black text-2xl ${conf.color}`}>
                             {conf.label}
                           </h3>
                        </div>
                        
                        <div className="space-y-6">
                          {Object.keys(tasksByCategory).map(cat => (
                            <div key={cat} className="pl-2">
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 pl-2 border-l-2 border-slate-200">
                                    {cat}
                                </h4>
                                <div className="grid grid-cols-1 gap-3">
                                {tasksByCategory[cat].map(task => {
                                    const isDone = task.status === 'completed';
                                    const isDoing = task.status === 'in_progress';
                                    const statusIcon = (() => {
                                        switch(task.status) {
                                            case 'completed': return <CheckCircle size={24} className="text-green-500" fill="#f0fdf4" />;
                                            case 'in_progress': return <Zap size={24} className="text-blue-500" fill="currentColor" />;
                                            default: return <Circle size={24} className="text-slate-200" />;
                                        }
                                    })();

                                    return (
                                    <div 
                                        key={task.id}
                                        className={`group bg-white rounded-2xl p-3 shadow-sm border border-slate-100 transition-all hover:shadow-md relative overflow-hidden flex items-center justify-between gap-3 ${
                                            isDone ? 'opacity-60 bg-slate-50' : ''
                                        } ${isDoing ? 'ring-2 ring-blue-100 border-blue-200' : ''}`}
                                    >
                                        {/* Status Toggle (Left) */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                cycleStatus(task);
                                            }}
                                            className="p-2 -ml-1 rounded-full active:scale-90 transition-transform"
                                        >
                                            {statusIcon}
                                        </button>

                                        {/* Main Content (Click to open details) */}
                                        <div 
                                            className="flex-1 min-w-0 py-2 cursor-pointer"
                                            onClick={() => setDetailTaskId(task.id)}
                                        >
                                            <h4 className={`font-bold text-base text-slate-800 leading-tight ${isDone ? 'line-through text-slate-400' : ''}`}>
                                                {task.title}
                                            </h4>
                                            
                                            {/* Indicators */}
                                            <div className="flex items-center gap-2 mt-1">
                                                {task.history.length > 0 && (
                                                    <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded flex items-center gap-1">
                                                        <History size={10} /> {task.history.length}
                                                    </span>
                                                )}
                                                {task.currentDuration > 0 && (
                                                    <span className="text-[10px] font-bold text-blue-500 flex items-center gap-1 font-mono">
                                                        <Clock size={10} /> {formatTime(task.currentDuration)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Quick Actions (Right) */}
                                        <div className="flex items-center">
                                            <Stopwatch 
                                                time={task.currentDuration} 
                                                onChange={(t) => updateTask(task.id, { currentDuration: t })}
                                                onStartStop={(running) => {
                                                    if (running && task.status === 'not_started') {
                                                        updateTask(task.id, { status: 'in_progress' });
                                                    }
                                                }}
                                                variant="card"
                                            />
                                        </div>
                                    </div>
                                    );
                                })}
                                </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()
        ) : (
          // === All Units Summary View ===
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            {unitsWithTasks.length === 0 && (
              <div className="text-center py-24 px-8">
                <div className="bg-white w-24 h-24 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-slate-100">
                   <Layers size={40} className="text-blue-500" />
                </div>
                <h3 className="text-xl font-black text-slate-800 mb-2">まだ記録がありません</h3>
                <p className="text-slate-400 text-sm mb-8">
                  上の「＋新しい回を追加」から<br/>最初のカリキュラムを作成しましょう
                </p>
              </div>
            )}

            {unitsWithTasks.map(unit => {
              const unitTasks = tasks.filter(t => t.unit === unit);
              const { progress: overallProgress, totalTime } = getSubjectStats(unitTasks);
              
              return (
                <div 
                  key={unit}
                  onClick={() => setSelectedUnit(unit)}
                  className="bg-white rounded-3xl p-6 shadow-lg shadow-slate-200/40 border border-slate-100 active:scale-[0.98] transition-all cursor-pointer hover:border-blue-200 group relative"
                >
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteConfirmation(unit);
                    }}
                    className="absolute top-4 right-4 p-2 text-slate-300 hover:text-red-400 hover:bg-red-50 rounded-full transition-colors z-10"
                  >
                    <Trash2 size={18} />
                  </button>

                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                      <div className="bg-slate-50 p-3 rounded-2xl group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                         <Layers size={24} className="text-slate-400 group-hover:text-blue-500" />
                      </div>
                      <div className="font-black text-xl text-slate-800">{unit}</div>
                    </div>
                    <div className="text-xs font-bold text-slate-400 font-mono mr-8">
                       {Math.floor(totalTime / 3600)}h {Math.floor((totalTime % 3600) / 60)}m
                    </div>
                  </div>

                  <div className="mb-6">
                    <div className="flex justify-between text-xs font-bold mb-2">
                      <span className="text-slate-400">PROGRESS</span>
                      <span className="text-slate-800">{overallProgress}%</span>
                    </div>
                    <div className="h-4 bg-slate-100 rounded-full overflow-hidden p-1">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-500 shadow-sm"
                        style={{ width: `${overallProgress}%` }}
                      />
                    </div>
                  </div>

                  {/* Subject Mini Bars */}
                  <div className="grid grid-cols-4 gap-4">
                    {Object.keys(SUBJECT_CONFIG).map(subj => {
                      const { progress: prog, totalTime: t } = getSubjectStats(unitTasks, subj);
                      const conf = SUBJECT_CONFIG[subj];
                      return (
                        <div key={subj} className="flex flex-col gap-1.5">
                          <div className="flex justify-between items-end">
                            <span className={`text-[10px] font-black ${conf.color}`}>{conf.short}</span>
                          </div>
                          <div className="h-2 bg-slate-50 rounded-full overflow-hidden">
                              <div 
                                className={`h-full ${conf.bg} opacity-80`}
                                style={{ width: `${prog}%` }}
                              />
                          </div>
                          <div className="text-[10px] text-slate-400 text-center font-mono mt-0.5">
                            {Math.floor(t / 60)}m
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {detailTaskId && (
        <TaskDetailModal 
          task={tasks.find(t => t.id === detailTaskId) || null}
          isOpen={!!detailTaskId}
          onClose={() => setDetailTaskId(null)}
          onUpdate={(updates) => updateTask(detailTaskId, updates)}
          onSaveHistory={() => {
             const t = tasks.find(t => t.id === detailTaskId);
             if (t) saveHistory(t);
          }}
          onDelete={() => {
             if (confirm('本当にこのタスクを削除しますか？')) {
               deleteTask(detailTaskId);
               setDetailTaskId(null);
             }
          }}
        />
      )}
    </div>
  );
};

/**
 * Component: Tests View (Revised)
 */
const TestsView = ({ 
  tests,
  onAddTest
}) => {
  const [filterType, setFilterType] = useState('all');
  const [selectedSubjects, setSelectedSubjects] = useState(['4ko']);
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [expandedTestId, setExpandedTestId] = useState(null);

  // Default dates
  useEffect(() => {
    const dates = tests.map(t => new Date(t.date).getTime());
    if (dates.length > 0) {
      const minDate = new Date(Math.min(...dates));
      const maxDate = new Date(Math.max(...dates));
      setStartDate(minDate.toISOString().split('T')[0]);
      setEndDate(maxDate.toISOString().split('T')[0]);
    }
  }, [tests]);

  const toggleSubject = (subj) => {
    if (selectedSubjects.includes(subj)) {
      setSelectedSubjects(prev => prev.filter(s => s !== subj));
    } else {
      setSelectedSubjects(prev => [...prev, subj]);
    }
  };

  const getFilteredTests = () => {
    let filtered = [...tests];
    
    if (filterType !== 'all') {
      filtered = filtered.filter(t => t.type === filterType);
    }

    if (startDate && endDate) {
      filtered = filtered.filter(t => {
        const d = new Date(t.date).getTime();
        const start = new Date(startDate).getTime();
        const end = new Date(endDate).getTime();
        return d >= start && d <= end;
      });
    }
    
    return filtered;
  };

  const filteredTests = getFilteredTests();

  const getChartData = () => {
    const sorted = [...filteredTests].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return sorted.map(t => {
      const dateStr = t.date.slice(5); 
      const dataPoint = {
        name: dateStr,
        fullDate: t.date,
        testName: t.name,
        type: t.type
      };

      if (selectedSubjects.includes('4ko')) dataPoint['4ko'] = t.total4.dev;
      if (selectedSubjects.includes('math')) dataPoint['math'] = t.subjects.math.dev;
      if (selectedSubjects.includes('japanese')) dataPoint['japanese'] = t.subjects.japanese.dev;
      if (selectedSubjects.includes('science')) dataPoint['science'] = t.subjects.science.dev;
      if (selectedSubjects.includes('social')) dataPoint['social'] = t.subjects.social.dev;

      return dataPoint;
    });
  };

  const chartData = getChartData();
  const tableData = [...filteredTests].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="flex flex-col h-full bg-slate-50/50">
       <div className="bg-white/90 backdrop-blur-md sticky top-0 z-20 px-4 py-3 border-b border-slate-100 shadow-sm space-y-3">
        {/* Date Filter */}
        <div className="flex gap-2 items-center bg-white p-2 rounded-xl shadow-sm border border-slate-100">
            <CalendarIcon size={16} className="text-slate-400" />
            <input 
            type="date" 
            value={startDate} 
            onChange={e => setStartDate(e.target.value)} 
            className="text-xs font-bold text-slate-600 bg-transparent outline-none w-24" 
            />
            <span className="text-slate-300 font-bold">-</span>
            <input 
            type="date" 
            value={endDate} 
            onChange={e => setEndDate(e.target.value)} 
            className="text-xs font-bold text-slate-600 bg-transparent outline-none w-24" 
            />
        </div>

        {/* Type Filter & Add Button */}
        <div className="flex justify-between items-center gap-2">
            <div className="flex flex-wrap gap-2 flex-1">
                <button 
                onClick={() => setFilterType('all')} 
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${filterType === 'all' ? 'bg-slate-800 text-white border-slate-800' : 'bg-white border-slate-200 text-slate-500'}`}
                >
                全て
                </button>
                {Object.entries(TEST_TYPE_CONFIG).map(([key, config]) => (
                <button 
                    key={key}
                    onClick={() => setFilterType(key)} 
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${filterType === key ? config.activeClass : 'bg-white border-slate-200 text-slate-500'}`}
                >
                    {config.label}
                </button>
                ))}
            </div>
            <button 
            onClick={() => setAddModalOpen(true)}
            className="bg-blue-50 text-blue-600 p-2 rounded-xl hover:bg-blue-100 flex-shrink-0"
            >
            <Plus size={20} />
            </button>
        </div>

        {/* Subject Filter (Multiple Select) */}
        <div className="flex flex-wrap gap-2 bg-slate-100 p-1.5 rounded-xl">
            {['4ko', 'math', 'japanese', 'science', 'social'].map((key) => (
            <button
                key={key}
                onClick={() => toggleSubject(key)}
                className={`flex-1 py-2 px-1 rounded-lg text-[10px] sm:text-xs font-bold transition-all min-w-[2.5rem] ${
                selectedSubjects.includes(key)
                    ? 'bg-white text-blue-600 shadow-sm ring-1 ring-black/5' 
                    : 'text-slate-400 hover:text-slate-600'
                }`}
            >
                {key === '4ko' ? '4科' : SUBJECT_CONFIG[key].short}
            </button>
            ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-8 scroll-smooth pb-28">
        {/* Chart */}
        <div className="bg-white p-4 rounded-3xl shadow-lg shadow-slate-100 border border-slate-100 h-64 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{fontSize: 10, fill: '#94a3b8'}} tickLine={false} axisLine={false} dy={10} />
                <YAxis domain={['auto', 'auto']} tick={{fontSize: 10, fill: '#94a3b8'}} tickLine={false} axisLine={false} />
                <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '12px' }}
                cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '3 3' }}
                />
                <ReferenceLine y={50} stroke="#cbd5e1" strokeDasharray="3 3" />
                <ReferenceLine y={60} stroke="#fecaca" strokeDasharray="3 3" />
                
                {selectedSubjects.includes('4ko') && (
                <Line type="monotone" dataKey="4ko" name="4科" stroke="#334155" strokeWidth={3} dot={{r:4, fill: '#334155'}} activeDot={{r:6}} />
                )}
                {selectedSubjects.includes('math') && (
                <Line type="monotone" dataKey="math" name="算数" stroke={SUBJECT_CONFIG.math.hex} strokeWidth={2} dot={false} activeDot={{r:4}} />
                )}
                {selectedSubjects.includes('japanese') && (
                <Line type="monotone" dataKey="japanese" name="国語" stroke={SUBJECT_CONFIG.japanese.hex} strokeWidth={2} dot={false} activeDot={{r:4}} />
                )}
                {selectedSubjects.includes('science') && (
                <Line type="monotone" dataKey="science" name="理科" stroke={SUBJECT_CONFIG.science.hex} strokeWidth={2} dot={false} activeDot={{r:4}} />
                )}
                {selectedSubjects.includes('social') && (
                <Line type="monotone" dataKey="social" name="社会" stroke={SUBJECT_CONFIG.social.hex} strokeWidth={2} dot={false} activeDot={{r:4}} />
                )}
            </LineChart>
            </ResponsiveContainer>
        </div>

        {/* History Table (Simplified - Deviation Only) */}
        <div>
            <h3 className="font-black text-slate-700 flex items-center gap-2 mb-3 px-1">
            <TrendingUp className="text-blue-500" size={20}/> テスト履歴
            </h3>
            
            <div className="w-full bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <table className="w-full text-center text-xs">
                    <thead>
                        <tr className="text-slate-400 bg-slate-50/50">
                            <th className="py-3 pl-3 text-left font-bold w-1/3">テスト名</th>
                            <th className="py-3 font-bold">4科</th>
                            {['math', 'japanese', 'science', 'social'].map(subj => (
                                <th key={subj} className={`py-3 font-bold ${SUBJECT_CONFIG[subj].color}`}>
                                    {SUBJECT_CONFIG[subj].short}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {tableData.map((test) => {
                            const isExpanded = expandedTestId === test.id;
                            return (
                            <React.Fragment key={test.id}>
                                <tr 
                                    onClick={() => setExpandedTestId(isExpanded ? null : test.id)}
                                    className="border-t border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer"
                                >
                                    <td className="py-3 pl-3 text-left">
                                        <div className="text-[10px] text-slate-400 font-bold">{test.date}</div>
                                        <div className="font-bold text-slate-700 line-clamp-1">{test.name}</div>
                                    </td>
                                    <td className="py-3 font-black text-slate-700 bg-slate-50/30">{test.total4.dev}</td>
                                    {['math', 'japanese', 'science', 'social'].map(subj => (
                                        <td key={subj} className={`py-3 font-bold ${test.subjects[subj].dev >= 60 ? 'text-rose-500' : 'text-slate-500'}`}>
                                            {test.subjects[subj].dev}
                                        </td>
                                    ))}
                                </tr>
                                
                                {/* Expanded Detail Row */}
                                {isExpanded && (
                                    <tr className="bg-slate-50/50 border-t border-slate-50">
                                        <td colSpan="6" className="p-4">
                                            <div className="grid grid-cols-1 gap-2">
                                                <div className="bg-white p-2 rounded-lg border border-slate-100 flex justify-between items-center text-xs mb-1">
                                                    <span className="font-bold text-slate-600">4科詳細</span>
                                                    <div className="flex gap-3">
                                                        <span><span className="text-slate-400">得点:</span> <b>{test.total4.score}</b></span>
                                                        <span><span className="text-slate-400">平均:</span> {test.total4.avg}</span>
                                                        <span><span className="text-slate-400">順位:</span> {test.total4.rank}</span>
                                                    </div>
                                                </div>
                                                
                                                {['math', 'japanese', 'science', 'social'].map(subj => {
                                                    const data = test.subjects[subj];
                                                    return (
                                                        <div key={subj} className="flex justify-between items-center text-xs px-2 py-1 border-b border-slate-100 last:border-0">
                                                            <div className="flex items-center gap-2 w-16">
                                                                <div className={`w-1 h-3 rounded-full ${SUBJECT_CONFIG[subj].bg}`}></div>
                                                                <span className="font-bold text-slate-600">{SUBJECT_CONFIG[subj].label}</span>
                                                            </div>
                                                            <div className="flex-1 flex justify-end gap-4 text-right">
                                                                <span className="w-12"><span className="text-[9px] text-slate-400">得</span> <b>{data.score}</b></span>
                                                                <span className="w-12"><span className="text-[9px] text-slate-400">平</span> {data.avg}</span>
                                                                <span className="w-16"><span className="text-[9px] text-slate-400">順</span> {data.rank || '-'}</span>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
      </div>

      <AddTestResultOverlay 
        isOpen={isAddModalOpen} 
        onClose={() => setAddModalOpen(false)} 
        onAdd={onAddTest} 
      />
    </div>
  );
};

/**
 * Main Application
 */
export default function StudyAppMobile() {
  const [activeTab, setActiveTab] = useState('daily');
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [tests, setTests] = useState(INITIAL_TESTS);
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);

  const unitsWithTasks = Array.from(new Set(tasks.map(t => t.unit))).sort((a, b) => {
    const numA = parseInt(a.replace('第', '').replace('回', ''));
    const numB = parseInt(b.replace('第', '').replace('回', ''));
    return numB - numA;
  });

  const addUnitWithPresets = (unitNumber) => {
    const unitName = `第${unitNumber}回`;
    const newTasks = [];
    Object.keys(SUBJECT_CONFIG).forEach(subject => {
        CURRICULUM_PRESETS[subject].forEach(preset => {
            preset.items.forEach((item, index) => {
                newTasks.push({
                    id: Date.now().toString() + Math.random().toString(36).substr(2, 9) + index,
                    unit: unitName,
                    subject: subject,
                    category: preset.category,
                    title: item,
                    materialName: `${preset.category} - ${item}`,
                    status: 'not_started',
                    currentDuration: 0,
                    currentMemo: '',
                    history: [],
                    createdAt: new Date().toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })
                });
            });
        });
    });
    setTasks(prev => [...newTasks, ...prev]);
    setSelectedUnit(unitName);
  };

  const deleteUnit = (unit) => {
    setTasks(prev => prev.filter(t => t.unit !== unit));
    if (selectedUnit === unit) {
        setSelectedUnit(null);
    }
  };

  const updateTask = (id, updates) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const cycleStatus = (task) => {
    const next = task.status === 'not_started' ? 'in_progress' : task.status === 'in_progress' ? 'completed' : 'not_started';
    updateTask(task.id, { status: next });
  };

  const saveHistory = (task) => {
    if (task.currentDuration === 0) return;
    const newHistory = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' }),
      duration: task.currentDuration,
      memo: task.currentMemo
    };
    updateTask(task.id, {
      history: [...task.history, newHistory],
      currentDuration: 0,
      currentMemo: '',
    });
  };

  const deleteTask = (id) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const addTestResult = (test) => {
    setTests(prev => [test, ...prev]);
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 font-sans text-slate-900 max-w-md mx-auto shadow-2xl overflow-hidden relative">
      <header className="bg-white/80 backdrop-blur-xl pt-safe-top sticky top-0 z-30">
        <div className="h-16 flex items-center justify-between px-6">
          <h1 className="font-black text-xl text-slate-800 tracking-tight">Level Up Study<span className="ml-2 text-[10px] bg-slate-100 text-slate-500 px-2 py-1 rounded-full font-bold align-middle">4年生</span></h1>
          <div className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1.5 rounded-full">{new Date().toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric', weekday: 'short' })}</div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto overscroll-contain no-scrollbar flex flex-col">
        {activeTab === 'daily' ? (
          <DailyView 
            tasks={tasks} 
            updateTask={updateTask} 
            cycleStatus={cycleStatus}
            saveHistory={saveHistory}
            deleteTask={deleteTask}
            deleteUnit={deleteUnit}
            setTasks={setTasks} 
            setAddModalOpen={setAddModalOpen} 
            selectedUnit={selectedUnit}
            setSelectedUnit={setSelectedUnit}
            unitsWithTasks={unitsWithTasks}
            setDeleteConfirmation={setDeleteConfirmation}
          />
        ) : (
          <TestsView tests={tests} onAddTest={addTestResult} />
        )}
      </main>

      <nav className="bg-white/90 backdrop-blur-lg border-t border-slate-100 fixed bottom-0 left-0 right-0 z-40 pb-safe-bottom max-w-md mx-auto rounded-t-3xl shadow-[0_-5px_20px_rgba(0,0,0,0.03)]">
        <div className="h-20 flex justify-around items-center px-4">
          <button onClick={() => setActiveTab('daily')} className={`flex-1 flex flex-col items-center justify-center h-full space-y-1 transition-all duration-300 ${activeTab === 'daily' ? 'text-blue-600 -translate-y-1' : 'text-slate-300 hover:text-slate-400'}`}>
            <div className={`p-1.5 rounded-xl ${activeTab === 'daily' ? 'bg-blue-50' : ''}`}><Zap size={26} strokeWidth={activeTab === 'daily' ? 3 : 2.5} fill={activeTab === 'daily' ? "currentColor" : "none"} /></div><span className="text-[10px] font-black">学習</span>
          </button>
          <button onClick={() => setActiveTab('tests')} className={`flex-1 flex flex-col items-center justify-center h-full space-y-1 transition-all duration-300 ${activeTab === 'tests' ? 'text-blue-600 -translate-y-1' : 'text-slate-300 hover:text-slate-400'}`}>
             <div className={`p-1.5 rounded-xl ${activeTab === 'tests' ? 'bg-blue-50' : ''}`}><Award size={26} strokeWidth={activeTab === 'tests' ? 3 : 2.5} /></div><span className="text-[10px] font-black">成績</span>
          </button>
        </div>
      </nav>

      <CreateUnitOverlay isOpen={isAddModalOpen} onClose={() => setAddModalOpen(false)} onCreate={addUnitWithPresets} />
      <DeleteConfirmModal isOpen={!!deleteConfirmation} onClose={() => setDeleteConfirmation(null)} onConfirm={() => { if (deleteConfirmation) { deleteUnit(deleteConfirmation); }}} title="学習データの削除" message={`${deleteConfirmation} の全ての学習データを削除しますか？この操作は取り消せません。`} />
    </div>
  );
}