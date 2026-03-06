/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, 
  ChevronRight, 
  Home, 
  User, 
  Stethoscope, 
  Plus, 
  Camera, 
  Image as ImageIcon, 
  Mic, 
  CheckCircle2, 
  AlertTriangle, 
  Calendar,
  Activity,
  MessageSquare,
  FileText,
  Search,
  Settings,
  Edit2,
  ChevronLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI, Type } from "@google/genai";

// --- Types ---

type Screen = 'HOME' | 'CREATE_PROFILE_1' | 'CREATE_PROFILE_2' | 'CREATE_PROFILE_3' | 'SYMPTOM_CHECK' | 'USER_CENTER' | 'PROFILE_DETAILS' | 'EDIT_PROFILE' | 'MEDICAL_RECORDS';

interface UserProfile {
  name: string;
  gender: string;
  birthDate: string;
  age: string;
  history: string;
  allergies: string;
  medications: string;
  emergencyContact: string;
  smoking: string;
  exercise: string;
  diet: string[];
  reactions: string;
  recentTreatments: string;
}

interface MedicalRecord {
  id: string;
  date: string;
  title: string;
  type: string;
  image?: string;
}

// --- Components ---

const BottomNav = ({ active, onNavigate }: { active: string, onNavigate: (screen: Screen) => void }) => (
  <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-slate-200 px-6 py-3 flex justify-between items-center z-50">
    <button 
      onClick={() => onNavigate('HOME')}
      className={`flex flex-col items-center gap-1 ${active === 'HOME' ? 'text-blue-600' : 'text-slate-400'}`}
    >
      <Home size={24} />
      <span className="text-[10px] font-medium">首页</span>
    </button>
    <button 
      onClick={() => onNavigate('SYMPTOM_CHECK')}
      className={`flex flex-col items-center gap-1 ${active === 'SYMPTOM_CHECK' ? 'text-blue-600' : 'text-slate-400'}`}
    >
      <Stethoscope size={24} />
      <span className="text-[10px] font-medium">就诊助手</span>
    </button>
    <button 
      onClick={() => onNavigate('USER_CENTER')}
      className={`flex flex-col items-center gap-1 ${active === 'USER_CENTER' ? 'text-blue-600' : 'text-slate-400'}`}
    >
      <User size={24} />
      <span className="text-[10px] font-medium">个人中心</span>
    </button>
  </div>
);

const Header = ({ title, onBack, showBack = true }: { title: string, onBack?: () => void, showBack?: boolean }) => (
  <header className="flex items-center px-4 py-4 sticky top-0 bg-white/80 backdrop-blur-md z-40 border-b border-slate-100">
    {showBack && (
      <button onClick={onBack} className="p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
        <ChevronLeft size={24} />
      </button>
    )}
    <h1 className={`text-lg font-bold text-slate-900 flex-1 text-center ${!showBack ? 'pr-0' : 'pr-8'}`}>
      {title}
    </h1>
  </header>
);

// --- Screens ---

const HomeScreen = ({ onNavigate }: { onNavigate: (screen: Screen) => void }) => (
  <div className="pb-24">
    <header className="p-6 bg-white">
      <h1 className="text-2xl font-bold text-slate-900">首页</h1>
    </header>

    <div className="px-4 space-y-4">
      {/* Welcome Card */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">欢迎您</h2>
          <p className="text-slate-500 text-sm mt-1">祝您身体健康，生活愉快！</p>
        </div>
        <button 
          onClick={() => onNavigate('PROFILE_DETAILS')}
          className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-sm font-bold hover:bg-blue-100 transition-colors"
        >
          我的档案
        </button>
      </div>

      {/* Create Profile Card */}
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100">
        <div 
          className="aspect-[16/9] bg-cover bg-center"
          style={{ backgroundImage: 'url("https://picsum.photos/seed/medical/800/450")' }}
        />
        <div className="p-5 space-y-4">
          <div>
            <h3 className="text-xl font-bold text-slate-900">建立医疗档案</h3>
            <p className="text-slate-500 text-sm mt-2 leading-relaxed">
              首次使用请完善您的症状与病史信息，我们将为您提供更精准的就诊建议
            </p>
          </div>
          <button 
            onClick={() => onNavigate('CREATE_PROFILE_1')}
            className="w-full bg-blue-600 text-white h-12 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-200 active:scale-[0.98] transition-all"
          >
            <Activity size={20} />
            开始建立档案
          </button>
        </div>
      </div>

      {/* Consultation Card */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
            <Plus size={24} />
          </div>
          <h3 className="text-xl font-bold text-slate-900">就诊咨询</h3>
        </div>
        <p className="text-slate-500 text-sm leading-relaxed">
          描述您的症状，我们会为您推荐对应的就诊科室，并提供基础的就诊准备建议
        </p>
        <button 
          onClick={() => onNavigate('SYMPTOM_CHECK')}
          className="w-full bg-slate-100 text-slate-900 h-12 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-200 active:scale-[0.98] transition-all"
        >
          <MessageSquare size={20} />
          开始咨询
        </button>
      </div>
    </div>
  </div>
);

const CreateProfileStep1 = ({ data, onNext, onBack }: { data: UserProfile, onNext: (d: Partial<UserProfile>) => void, onBack: () => void }) => {
  const [age, setAge] = useState(data.age);
  const [history, setHistory] = useState(data.history);
  const [allergies, setAllergies] = useState(data.allergies);
  
  const options = ['无', '高血压', '糖尿病', '冠心病'];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header title="建立档案" onBack={onBack} />
      <main className="flex-1 p-5 space-y-8 pb-32">
        <section>
          <div className="flex justify-between items-end mb-3">
            <h2 className="text-2xl font-bold text-slate-900">核心健康信息</h2>
            <span className="text-blue-600 font-bold text-sm">1/3</span>
          </div>
          <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
            <div className="h-full bg-blue-600 w-1/3 rounded-full" />
          </div>
          <p className="text-slate-500 text-sm mt-3">请如实填写，以便为您提供更精准的医疗建议</p>
        </section>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-slate-900 font-bold">年龄</label>
            <div className="relative">
              <input 
                type="number" 
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="请输入您的年龄" 
                className="w-full h-14 px-4 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
              />
              <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-slate-900 font-bold">基础病史</label>
            <p className="text-xs text-slate-500">选择常见病史或在下方输入</p>
            <div className="flex flex-wrap gap-2">
              {options.map(opt => (
                <button
                  key={opt}
                  onClick={() => setHistory(prev => prev.includes(opt) ? prev.replace(opt, '').replace(/,\s*,/, ',').trim() : (prev && prev !== '无' ? prev + ', ' + opt : opt))}
                  className={`px-4 py-2 rounded-full border text-sm font-medium transition-all ${
                    history.includes(opt) 
                      ? 'border-blue-600 bg-blue-50 text-blue-600' 
                      : 'border-slate-200 bg-white text-slate-600'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
            <textarea 
              value={history}
              onChange={(e) => setHistory(e.target.value)}
              placeholder="如有其他病史，请详细描述..."
              className="w-full min-h-[100px] p-4 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all resize-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-slate-900 font-bold">过敏史</label>
            <div className="relative">
              <input 
                type="text" 
                value={allergies}
                onChange={(e) => setAllergies(e.target.value)}
                placeholder="如：青霉素、花粉等，若无请填无" 
                className="w-full h-14 px-4 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
              />
              <AlertTriangle className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            </div>
          </div>
        </div>
      </main>
      <footer className="fixed bottom-0 left-0 right-0 p-5 bg-white/80 backdrop-blur-md border-t border-slate-100">
        <button 
          onClick={() => onNext({ age, history, allergies })}
          className="w-full bg-blue-600 text-white h-14 rounded-xl font-bold shadow-lg shadow-blue-200 active:scale-[0.98] transition-all"
        >
          下一步
        </button>
      </footer>
    </div>
  );
};

const CreateProfileStep2 = ({ data, onNext, onBack }: { data: UserProfile, onNext: (d: Partial<UserProfile>) => void, onBack: () => void }) => {
  const [smoking, setSmoking] = useState(data.smoking);
  const [exercise, setExercise] = useState(data.exercise);
  const [diet, setDiet] = useState<string[]>(data.diet);

  const dietOptions = ['清淡', '辛辣', '高糖/甜食', '素食', '重口味/高盐', '油腻'];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header title="建立档案" onBack={onBack} />
      <main className="flex-1 p-5 space-y-8 pb-32">
        <section>
          <div className="flex justify-between items-end mb-3">
            <h2 className="text-2xl font-bold text-slate-900">完善生活方式</h2>
            <span className="text-blue-600 font-bold text-sm">2/3</span>
          </div>
          <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
            <div className="h-full bg-blue-600 w-2/3 rounded-full" />
          </div>
          <p className="text-slate-500 text-sm mt-3">为了提供更精准的医疗建议，请真实填写您的日常生活状态。</p>
        </section>

        <div className="space-y-8">
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900">吸烟饮酒频率</h3>
            <div className="flex bg-slate-100 p-1 rounded-xl h-12">
              {['从不', '偶尔', '经常'].map((label, idx) => {
                const val = ['none', 'occasional', 'frequent'][idx];
                return (
                  <button
                    key={val}
                    onClick={() => setSmoking(val)}
                    className={`flex-1 rounded-lg text-sm font-bold transition-all ${
                      smoking === val ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900">日常运动情况</h3>
            <div className="flex bg-slate-100 p-1 rounded-xl h-12">
              {['不运动', '偶尔', '经常'].map((label, idx) => {
                const val = ['none', 'occasional', 'frequent'][idx];
                return (
                  <button
                    key={val}
                    onClick={() => setExercise(val)}
                    className={`flex-1 rounded-lg text-sm font-bold transition-all ${
                      exercise === val ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900">饮食偏好 (多选)</h3>
            <div className="flex flex-wrap gap-2">
              {dietOptions.map(opt => (
                <button
                  key={opt}
                  onClick={() => {
                    if (diet.includes(opt)) {
                      setDiet(diet.filter(d => d !== opt));
                    } else {
                      setDiet([...diet, opt]);
                    }
                  }}
                  className={`px-4 py-2 rounded-full border text-sm font-medium transition-all ${
                    diet.includes(opt) 
                      ? 'border-blue-600 bg-blue-600 text-white' 
                      : 'border-slate-200 bg-white text-slate-600'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>
      <footer className="fixed bottom-0 left-0 right-0 p-5 bg-white/80 backdrop-blur-md border-t border-slate-100 flex gap-4">
        <button 
          onClick={onBack}
          className="flex-1 bg-slate-100 text-slate-700 h-14 rounded-xl font-bold active:scale-[0.98] transition-all"
        >
          上一步
        </button>
        <button 
          onClick={() => onNext({ smoking, exercise, diet })}
          className="flex-[2] bg-blue-600 text-white h-14 rounded-xl font-bold shadow-lg shadow-blue-200 active:scale-[0.98] transition-all"
        >
          下一步
        </button>
      </footer>
    </div>
  );
};

const CreateProfileStep3 = ({ data, onComplete, onBack }: { data: UserProfile, onComplete: (d: Partial<UserProfile>) => void, onBack: () => void }) => {
  const [medications, setMedications] = useState(data.medications);
  const [reactions, setReactions] = useState(data.reactions);
  const [recentTreatments, setRecentTreatments] = useState(data.recentTreatments);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header title="建立档案" onBack={onBack} />
      <main className="flex-1 p-5 space-y-8 pb-32">
        <section>
          <div className="flex justify-between items-end mb-3">
            <h2 className="text-2xl font-bold text-slate-900">诊疗与用药反馈</h2>
            <span className="text-blue-600 font-bold text-sm">3/3</span>
          </div>
          <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
            <div className="h-full bg-blue-600 w-full rounded-full" />
          </div>
          <p className="text-slate-500 text-sm mt-3">请提供您的用药情况及近期诊疗信息</p>
        </section>

        <div className="space-y-8">
          <div className="space-y-3">
            <label className="text-slate-900 font-bold">1. 正在服用的药物</label>
            <div className="relative">
              <textarea 
                value={medications}
                onChange={(e) => setMedications(e.target.value)}
                placeholder="请输入您目前正在服用的药物名称、剂量及频率（例如：阿司匹林，每日一次，100mg）"
                className="w-full min-h-[120px] p-4 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all resize-none"
              />
              <FileText className="absolute right-4 bottom-4 text-slate-400" size={20} />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-slate-900 font-bold">2. 用药不良反应</label>
            <div className="relative">
              <textarea 
                value={reactions}
                onChange={(e) => setReactions(e.target.value)}
                placeholder="请描述是否有过敏史或服药后的副作用（如无，请填“无”）"
                className="w-full min-h-[120px] p-4 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all resize-none"
              />
              <AlertTriangle className="absolute right-4 bottom-4 text-slate-400" size={20} />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-slate-900 font-bold">3. 近期治疗情况</label>
            <div className="relative">
              <textarea 
                value={recentTreatments}
                onChange={(e) => setRecentTreatments(e.target.value)}
                placeholder="请描述您最近是否接受过其他治疗（包括手术、理疗、心理治疗等）"
                className="w-full min-h-[120px] p-4 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all resize-none"
              />
              <CheckCircle2 className="absolute right-4 bottom-4 text-slate-400" size={20} />
            </div>
          </div>

          <div className="flex items-start gap-3">
            <input type="checkbox" id="consent" className="mt-1 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
            <label htmlFor="consent" className="text-xs text-slate-500 leading-relaxed">
              我确认以上提供的信息真实有效，并同意将此信息存储在我的个人健康档案中。
            </label>
          </div>
        </div>
      </main>
      <footer className="fixed bottom-0 left-0 right-0 p-5 bg-white/80 backdrop-blur-md border-t border-slate-100">
        <button 
          onClick={() => onComplete({ medications, reactions, recentTreatments })}
          className="w-full bg-blue-600 text-white h-14 rounded-xl font-bold shadow-lg shadow-blue-200 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          完成并保存
          <CheckCircle2 size={20} />
        </button>
        <p className="text-center text-slate-400 text-[10px] mt-3">您的信息将被严格加密保护</p>
      </footer>
    </div>
  );
};

const SymptomCheckScreen = ({ onBack }: { onBack: () => void }) => {
  const [symptoms, setSymptoms] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<{ department: string, reason: string } | null>(null);

  const handleAnalyze = async () => {
    if (!symptoms) return;
    setIsAnalyzing(true);
    setShowResult(false);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `请根据以下症状推荐就诊科室并给出理由：\n\n症状：${symptoms}`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              department: {
                type: Type.STRING,
                description: "推荐的就诊科室名称，例如：神经内科、呼吸内科等",
              },
              reason: {
                type: Type.STRING,
                description: "推荐该科室的理由，描述应专业且亲切",
              },
            },
            required: ["department", "reason"],
          },
        },
      });

      const responseText = response.text || '{}';
      let cleanJson = responseText.trim();
      if (cleanJson.includes('```')) {
        const match = cleanJson.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (match) cleanJson = match[1];
      }
      
      const result = JSON.parse(cleanJson);
      setAnalysisResult(result);
      setShowResult(true);
    } catch (error) {
      console.error('AI Analysis failed:', error);
      alert('分析失败，请稍后重试');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-24">
      <Header title="症状自查" onBack={onBack} />
      <main className="flex-1 p-5 space-y-6">
        <section>
          <h2 className="text-2xl font-bold text-slate-900">您目前有哪些症状？</h2>
          <p className="text-slate-500 text-sm mt-1">描述越详细，AI 推荐的科室越准确。</p>
        </section>

        <div className="relative">
          <textarea 
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            placeholder="请输入您的症状，如“头痛”或“腰痛”"
            className="w-full min-h-[180px] p-5 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all resize-none text-base leading-relaxed"
          />
          <button className="absolute bottom-4 right-4 text-slate-400 p-2 hover:bg-slate-50 rounded-full">
            <Mic size={24} />
          </button>
        </div>

        <button 
          onClick={handleAnalyze}
          disabled={!symptoms || isAnalyzing}
          className={`w-full h-14 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
            !symptoms || isAnalyzing 
              ? 'bg-slate-200 text-slate-400' 
              : 'bg-blue-600 text-white shadow-lg shadow-blue-200 active:scale-[0.98]'
          }`}
        >
          {isAnalyzing ? 'AI 正在分析中...' : '开始分析'}
        </button>

        <AnimatePresence>
          {showResult && analysisResult && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-blue-50 border border-blue-100 rounded-2xl p-6 space-y-5"
            >
              <div className="flex items-center gap-2 text-blue-600">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
                <h4 className="text-xs font-bold uppercase tracking-widest">AI 分析结果</h4>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white shrink-0">
                  <Activity size={32} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-blue-600/60 uppercase tracking-wider">推荐科室</p>
                  <h5 className="text-2xl font-bold text-slate-900">{analysisResult.department}</h5>
                </div>
              </div>

              <div className="pt-4 border-t border-blue-100 space-y-2">
                <p className="text-sm font-bold text-slate-800">推荐理由</p>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {analysisResult.reason}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <section className="space-y-3">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">常用标签</p>
          <div className="flex flex-wrap gap-2">
            {['+ 头痛', '+ 发烧', '+ 疲劳', '+ 头晕'].map(tag => (
              <button 
                key={tag}
                onClick={() => setSymptoms(prev => prev + (prev ? ' ' : '') + tag.replace('+ ', ''))}
                className="px-4 py-2 bg-white border border-slate-200 rounded-full text-xs font-medium text-slate-600 hover:border-blue-500 hover:text-blue-600 transition-all"
              >
                {tag}
              </button>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

const UserCenterScreen = ({ profile, onNavigate }: { profile: UserProfile, onNavigate: (screen: Screen) => void }) => {
  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <Header title="个人中心" showBack={false} />
      <main className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Profile Summary */}
        <section 
          onClick={() => onNavigate('EDIT_PROFILE')}
          className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 relative active:bg-slate-50 transition-all cursor-pointer group"
        >
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm">
                <User size={48} className="text-slate-300" />
              </div>
              <div className="absolute bottom-0 right-0 bg-blue-600 text-white p-1 rounded-full border-2 border-white">
                <Camera size={14} />
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-baseline gap-2">
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">{profile.name}</h2>
                <Edit2 size={14} className="text-slate-400" />
              </div>
              <div className="mt-1 flex items-center gap-2 text-slate-500">
                <span className="text-sm bg-slate-50 px-2 py-0.5 rounded">{profile.gender}</span>
                <span className="text-slate-300">|</span>
                <span className="text-sm">{profile.birthDate}生</span>
              </div>
            </div>
          </div>
          <div className="absolute top-5 right-5 text-blue-600 opacity-40 group-hover:opacity-100 transition-opacity">
            <ChevronRight size={24} />
          </div>
        </section>

        {/* Health Management */}
        <section>
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">健康核心管理</h2>
            <span className="text-[10px] text-slate-400">点击可修改</span>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden divide-y divide-slate-50">
            {[
              { label: '基础病史', value: profile.history || '无' },
              { label: '过敏史', value: profile.allergies || '无' },
              { label: '当前用药', value: profile.medications || '无' }
            ].map((item, idx) => (
              <div 
                key={idx} 
                onClick={() => onNavigate('EDIT_PROFILE')}
                className="p-4 flex items-center justify-between cursor-pointer active:bg-slate-50 transition-colors"
              >
                <div className="flex-1">
                  <p className="text-xs text-slate-400 mb-1">{item.label}</p>
                  <p className="font-medium text-slate-800">{item.value}</p>
                </div>
                <Edit2 size={18} className="text-slate-300" />
              </div>
            ))}
          </div>
        </section>

        {/* Record Management */}
        <section>
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">病历资料</h2>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <button 
              onClick={() => onNavigate('MEDICAL_RECORDS')}
              className="w-full p-4 flex items-center gap-4 active:bg-slate-50 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                <Plus size={24} />
              </div>
              <div className="flex-1 text-left">
                <p className="text-[15px] font-bold text-slate-800">我的病历库</p>
                <p className="text-xs text-slate-400 mt-0.5">查看及管理所有上传的检查报告</p>
              </div>
              <ChevronRight size={20} className="text-slate-300" />
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};

const MedicalRecordsScreen = ({ records, onAdd, onDelete, onBack }: { records: MedicalRecord[], onAdd: (r: Omit<MedicalRecord, 'id'>) => void, onDelete: (id: string) => void, onBack: () => void }) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
  const [newRecord, setNewRecord] = useState({ title: '血液报告', date: '2023-10-27', image: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePreview = (record: MedicalRecord) => {
    setSelectedRecord(record);
    setShowModal(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewRecord(prev => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-24">
      <Header title="病历管理" onBack={onBack} />
      <main className="flex-1 p-4 space-y-6">
        <section className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
          <div className="space-y-4">
            <button 
              onClick={() => fileInputRef.current?.click()}
              className={`w-full flex flex-col items-center justify-center gap-3 py-4 border-2 border-dashed rounded-xl transition-all ${
                newRecord.image ? 'border-green-500 bg-green-50 text-green-600' : 'border-blue-600/30 bg-blue-50 text-blue-600'
              }`}
            >
              {newRecord.image ? (
                <>
                  <CheckCircle2 size={30} />
                  <span className="font-bold text-sm">图片已选择</span>
                </>
              ) : (
                <>
                  <ImageIcon size={30} />
                  <span className="font-bold">从相册选择上传</span>
                </>
              )}
            </button>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
            
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-500 ml-1">报告日期</label>
                <div className="relative flex items-center bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
                  <Calendar size={20} className="text-slate-400 mr-3" />
                  <input 
                    type="date" 
                    value={newRecord.date}
                    onChange={(e) => setNewRecord({...newRecord, date: e.target.value})}
                    className="bg-transparent border-none p-0 focus:ring-0 text-base font-medium w-full text-slate-800"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-500 ml-1">检验类型</label>
                <div className="relative flex items-center bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
                  <Activity size={20} className="text-slate-400 mr-3" />
                  <select 
                    value={newRecord.title}
                    onChange={(e) => setNewRecord({...newRecord, title: e.target.value})}
                    className="bg-transparent border-none p-0 focus:ring-0 text-base font-medium w-full text-slate-800 appearance-none"
                  >
                    <option>血液报告</option>
                    <option>CT报告</option>
                    <option>超声报告</option>
                    <option>核磁报告</option>
                    <option>尿液报告</option>
                    <option>其他</option>
                  </select>
                  <ChevronRight size={20} className="text-slate-400 absolute right-4 rotate-90" />
                </div>
              </div>
            </div>
            <button 
              onClick={() => {
                if (!newRecord.image) {
                  alert('请先选择病历图片');
                  return;
                }
                const formattedDate = newRecord.date.replace(/-/g, '年').replace(/(\d{4})年(\d{2})年(\d{2})/, '$1年$2月$3日');
                onAdd({ ...newRecord, date: formattedDate, type: 'report' });
                setNewRecord({ title: '血液报告', date: '2023-10-27', image: '' });
                alert('病历已成功保存');
              }}
              className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-lg shadow-lg shadow-blue-200 active:scale-[0.98] transition-all"
            >
              保存病历
            </button>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">已上传病历</h2>
          <div className="space-y-2">
            {records.map(record => (
              <div 
                key={record.id}
                className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4 active:bg-slate-50 transition-all"
                onClick={() => handlePreview(record)}
              >
                <div className="w-12 h-12 shrink-0 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <FileText size={24} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-[15px] text-slate-800 truncate">{record.title}</h3>
                  <p className="text-sm text-slate-400 mt-0.5">{record.date}</p>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); onDelete(record.id); }}
                  className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                >
                  <Plus size={20} className="rotate-45" />
                </button>
              </div>
            ))}
          </div>
        </section>
      </main>

      <AnimatePresence>
        {showModal && selectedRecord && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          >
            <button 
              onClick={() => setShowModal(false)}
              className="absolute top-6 right-6 text-white active:scale-90 transition-all"
            >
              <Plus size={32} className="rotate-45" />
            </button>
            <div className="w-full max-w-sm aspect-[3/4] bg-slate-800 rounded-lg overflow-hidden relative shadow-2xl">
              <div className="absolute inset-0 flex items-center justify-center text-slate-500 flex-col gap-2">
                <ImageIcon size={64} className="opacity-20" />
                <span className="text-sm opacity-50">报告图片预览</span>
              </div>
              <img 
                src={selectedRecord.image || "https://picsum.photos/seed/medical-report/800/1000"} 
                alt="Report Preview" 
                className="w-full h-full object-contain relative z-10"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="absolute bottom-10 text-center">
              <p className="text-white font-bold text-lg">{selectedRecord.title}</p>
              <p className="text-slate-400 text-sm">{selectedRecord.date}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ProfileDetailsScreen = ({ profile, onNavigate, onBack }: { profile: UserProfile, onNavigate: (screen: Screen) => void, onBack: () => void }) => (
  <div className="min-h-screen bg-slate-50">
    <Header title="我的健康档案" onBack={onBack} />
    <main className="p-4 space-y-6">
      {[
        {
          title: '核心健康',
          items: [
            { label: '年龄', value: profile.age + '岁' },
            { label: '基础病史', value: profile.history || '无' },
            { label: '过敏史', value: profile.allergies || '无' }
          ]
        },
        {
          title: '生活习惯',
          items: [
            { label: '吸烟饮酒', value: profile.smoking === 'none' ? '不吸烟' : profile.smoking === 'occasional' ? '偶尔' : '经常' },
            { label: '日常运动', value: profile.exercise === 'none' ? '不运动' : profile.exercise === 'occasional' ? '偶尔' : '经常' },
            { label: '饮食偏好', value: profile.diet.join('、') || '无' }
          ]
        },
        {
          title: '诊疗与用药',
          items: [
            { label: '正在服用的药物', value: profile.medications || '无' },
            { label: '用药不良反应', value: profile.reactions || '无' },
            { label: '近期治疗情况', value: profile.recentTreatments || '无' }
          ]
        }
      ].map((section, sIdx) => (
        <section key={sIdx} className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900">{section.title}</h3>
            <button 
              onClick={() => onNavigate('EDIT_PROFILE')}
              className="flex items-center gap-1 text-blue-600 text-sm font-bold"
            >
              <Edit2 size={16} />
              编辑
            </button>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 divide-y divide-slate-50">
            {section.items.map((item, iIdx) => (
              <div key={iIdx} className="py-4 first:pt-0 last:pb-0">
                <p className="text-xs text-slate-400 mb-1">{item.label}</p>
                <p className="font-bold text-slate-800">{item.value}</p>
              </div>
            ))}
          </div>
        </section>
      ))}
    </main>
  </div>
);

const EditProfileScreen = ({ profile, onSave, onBack }: { profile: UserProfile, onSave: (p: UserProfile) => void, onBack: () => void }) => {
  const [formData, setFormData] = useState(profile);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header title="编辑个人信息" onBack={onBack} />
      <main className="flex-1 p-5 space-y-6 pb-32 overflow-y-auto">
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">基本信息</h3>
          <div className="space-y-4 bg-white p-5 rounded-2xl border border-slate-100">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500">姓名</label>
              <input 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full h-12 px-4 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500">性别</label>
                <select 
                  value={formData.gender}
                  onChange={(e) => setFormData({...formData, gender: e.target.value})}
                  className="w-full h-12 px-4 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                >
                  <option value="男">男</option>
                  <option value="女">女</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500">年龄</label>
                <input 
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData({...formData, age: e.target.value})}
                  className="w-full h-12 px-4 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500">出生年月</label>
              <input 
                type="month"
                value={formData.birthDate.replace('年', '-').replace('月', '')}
                onChange={(e) => {
                  const [y, m] = e.target.value.split('-');
                  setFormData({...formData, birthDate: `${y}年${m}月`});
                }}
                className="w-full h-12 px-4 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">健康核心</h3>
          <div className="space-y-4 bg-white p-5 rounded-2xl border border-slate-100">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500">基础病史</label>
              <textarea 
                value={formData.history}
                onChange={(e) => setFormData({...formData, history: e.target.value})}
                className="w-full min-h-[80px] p-4 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all resize-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500">过敏史</label>
              <input 
                value={formData.allergies}
                onChange={(e) => setFormData({...formData, allergies: e.target.value})}
                className="w-full h-12 px-4 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500">当前用药</label>
              <textarea 
                value={formData.medications}
                onChange={(e) => setFormData({...formData, medications: e.target.value})}
                className="w-full min-h-[80px] p-4 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all resize-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500">紧急联系人</label>
              <input 
                value={formData.emergencyContact}
                onChange={(e) => setFormData({...formData, emergencyContact: e.target.value})}
                className="w-full h-12 px-4 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">生活习惯</h3>
          <div className="space-y-4 bg-white p-5 rounded-2xl border border-slate-100">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500">吸烟饮酒</label>
              <select 
                value={formData.smoking}
                onChange={(e) => setFormData({...formData, smoking: e.target.value})}
                className="w-full h-12 px-4 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
              >
                <option value="none">从不</option>
                <option value="occasional">偶尔</option>
                <option value="frequent">经常</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500">日常运动</label>
              <select 
                value={formData.exercise}
                onChange={(e) => setFormData({...formData, exercise: e.target.value})}
                className="w-full h-12 px-4 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
              >
                <option value="none">不运动</option>
                <option value="occasional">偶尔</option>
                <option value="frequent">经常</option>
              </select>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">诊疗与用药反馈</h3>
          <div className="space-y-4 bg-white p-5 rounded-2xl border border-slate-100">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500">用药不良反应</label>
              <textarea 
                value={formData.reactions}
                onChange={(e) => setFormData({...formData, reactions: e.target.value})}
                className="w-full min-h-[80px] p-4 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all resize-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500">近期治疗情况</label>
              <textarea 
                value={formData.recentTreatments}
                onChange={(e) => setFormData({...formData, recentTreatments: e.target.value})}
                className="w-full min-h-[80px] p-4 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all resize-none"
              />
            </div>
          </div>
        </div>
      </main>
      <footer className="fixed bottom-0 left-0 right-0 p-5 bg-white/80 backdrop-blur-md border-t border-slate-100">
        <button 
          onClick={() => onSave(formData)}
          className="w-full bg-blue-600 text-white h-14 rounded-xl font-bold shadow-lg shadow-blue-200 active:scale-[0.98] transition-all"
        >
          保存修改
        </button>
      </footer>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('HOME');
  
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('healthguard_user_profile');
    return saved ? JSON.parse(saved) : {
      name: '张先生',
      gender: '男',
      birthDate: '1991年05月',
      age: '32',
      history: '高血压 (轻度)',
      allergies: '青霉素过敏',
      medications: '硝苯地平控释片 (每日一次)',
      emergencyContact: '李女士 (妻子) 138****1234',
      smoking: 'occasional',
      exercise: 'occasional',
      diet: ['清淡', '素食'],
      reactions: '无明显不良反应',
      recentTreatments: '上个月进行过常规体检'
    };
  });

  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>(() => {
    const saved = localStorage.getItem('healthguard_medical_records');
    return saved ? JSON.parse(saved) : [
      { id: '1', title: '血液报告', date: '2023年10月12日', type: 'lab', image: 'https://picsum.photos/seed/blood/800/1000' },
      { id: '2', title: 'CT报告', date: '2023年08月20日', type: 'report', image: 'https://picsum.photos/seed/ct/800/1000' },
      { id: '3', title: '核磁报告', date: '2023年06月15日', type: 'report', image: 'https://picsum.photos/seed/mri/800/1000' },
    ];
  });

  useEffect(() => {
    localStorage.setItem('healthguard_user_profile', JSON.stringify(userProfile));
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem('healthguard_medical_records', JSON.stringify(medicalRecords));
  }, [medicalRecords]);

  const renderScreen = () => {
    switch (currentScreen) {
      case 'HOME':
        return <HomeScreen onNavigate={setCurrentScreen} />;
      case 'CREATE_PROFILE_1':
        return <CreateProfileStep1 data={userProfile} onNext={(d) => { setUserProfile(prev => ({...prev, ...d})); setCurrentScreen('CREATE_PROFILE_2'); }} onBack={() => setCurrentScreen('HOME')} />;
      case 'CREATE_PROFILE_2':
        return <CreateProfileStep2 data={userProfile} onNext={(d) => { setUserProfile(prev => ({...prev, ...d})); setCurrentScreen('CREATE_PROFILE_3'); }} onBack={() => setCurrentScreen('CREATE_PROFILE_1')} />;
      case 'CREATE_PROFILE_3':
        return <CreateProfileStep3 data={userProfile} onComplete={(d) => { setUserProfile(prev => ({...prev, ...d})); setCurrentScreen('PROFILE_DETAILS'); }} onBack={() => setCurrentScreen('CREATE_PROFILE_2')} />;
      case 'SYMPTOM_CHECK':
        return <SymptomCheckScreen onBack={() => setCurrentScreen('HOME')} />;
      case 'USER_CENTER':
        return <UserCenterScreen profile={userProfile} onNavigate={setCurrentScreen} />;
      case 'PROFILE_DETAILS':
        return <ProfileDetailsScreen profile={userProfile} onNavigate={setCurrentScreen} onBack={() => setCurrentScreen('USER_CENTER')} />;
      case 'MEDICAL_RECORDS':
        return (
          <MedicalRecordsScreen 
            records={medicalRecords} 
            onAdd={(r) => setMedicalRecords([...medicalRecords, { ...r, id: Date.now().toString() }])}
            onDelete={(id) => setMedicalRecords(medicalRecords.filter(r => r.id !== id))}
            onBack={() => setCurrentScreen('USER_CENTER')} 
          />
        );
      case 'EDIT_PROFILE':
        return (
          <EditProfileScreen 
            profile={userProfile} 
            onSave={(p) => {
              setUserProfile(p);
              setCurrentScreen('USER_CENTER');
            }} 
            onBack={() => setCurrentScreen('USER_CENTER')} 
          />
        );
      default:
        return <HomeScreen onNavigate={setCurrentScreen} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-600">
      <div className="max-w-md mx-auto bg-white min-h-screen shadow-2xl relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentScreen}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
          >
            {renderScreen()}
          </motion.div>
        </AnimatePresence>

        {/* Show Bottom Nav only on main screens */}
        {['HOME', 'SYMPTOM_CHECK', 'USER_CENTER', 'MEDICAL_RECORDS'].includes(currentScreen) && (
          <BottomNav active={['USER_CENTER', 'MEDICAL_RECORDS'].includes(currentScreen) ? 'USER_CENTER' : currentScreen} onNavigate={setCurrentScreen} />
        )}
      </div>
    </div>
  );
}
