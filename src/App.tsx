import React, { useState, useEffect } from 'react';
import { UserErgoProfile, ChecklistItem, BodyPart, TimerMode } from './types';
import { INITIAL_CHECKLIST } from './data/ergonomicsData';
import { Navbar, ActiveTab } from './components/Navbar';
import { WorkstationCalculator } from './components/WorkstationCalculator';
import { BreakTimer } from './components/BreakTimer';
import { GuidedStretches } from './components/GuidedStretches';
import { WorkstationChecklist } from './components/WorkstationChecklist';
import { BodyDiscomfortMap } from './components/BodyDiscomfortMap';
import { AiErgoConsultant } from './components/AiErgoConsultant';
import { playGentleBell } from './utils/audio';
import { ShieldCheck, HeartPulse, CheckCircle2 } from 'lucide-react';

const STORAGE_KEYS = {
  PROFILE: 'ergo_app_profile_v1',
  CHECKLIST: 'ergo_app_checklist_v1',
  SOUND: 'ergo_app_sound_v1',
  BREAKS_COUNT: 'ergo_app_breaks_count_v1',
  BREAKS_DATE: 'ergo_app_breaks_date_v1',
};

const DEFAULT_PROFILE: UserErgoProfile = {
  heightCm: 172,
  postureMode: 'sitting',
  shoeHeelCm: 2,
  dailyWorkHours: 8,
  deskType: 'fixed',
  hasFootrest: false,
  primaryDevice: 'laptop_with_peripherals',
};

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('calculator');
  const [aiCustomPrompt, setAiCustomPrompt] = useState<string>('');

  // Sound settings
  const [isSoundEnabled, setIsSoundEnabled] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEYS.SOUND);
      return saved !== null ? saved === 'true' : true;
    }
    return true;
  });

  // User profile
  const [profile, setProfile] = useState<UserErgoProfile>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEYS.PROFILE);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // ignore error
        }
      }
    }
    return DEFAULT_PROFILE;
  });

  // Checklist state
  const [checklist, setChecklist] = useState<ChecklistItem[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEYS.CHECKLIST);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // ignore error
        }
      }
    }
    return INITIAL_CHECKLIST;
  });

  // Timer running indicators for Navbar
  const [timerActive, setTimerActive] = useState<boolean>(false);
  const [timerFormatted, setTimerFormatted] = useState<string>('20:00');
  const [timerMode, setTimerMode] = useState<TimerMode>('20_20_20');

  // Daily breaks counter
  const [breaksCompletedCount, setBreaksCompletedCount] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const today = new Date().toISOString().split('T')[0];
      const savedDate = localStorage.getItem(STORAGE_KEYS.BREAKS_DATE);
      if (savedDate === today) {
        const count = localStorage.getItem(STORAGE_KEYS.BREAKS_COUNT);
        return count ? parseInt(count, 10) : 0;
      }
    }
    return 0;
  });

  // Toast notification for completed stretch or break
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Persist Profile
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  }, [profile]);

  // Persist Checklist
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CHECKLIST, JSON.stringify(checklist));
  }, [checklist]);

  // Persist Sound
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SOUND, String(isSoundEnabled));
  }, [isSoundEnabled]);

  // Handle break completed
  const handleBreakCompleted = (mode: TimerMode) => {
    const today = new Date().toISOString().split('T')[0];
    const newCount = breaksCompletedCount + 1;
    setBreaksCompletedCount(newCount);
    localStorage.setItem(STORAGE_KEYS.BREAKS_DATE, today);
    localStorage.setItem(STORAGE_KEYS.BREAKS_COUNT, String(newCount));
    showToast('Excelente! Você completou uma pausa ativa ergonômica.');
  };

  const handleFinishedRoutine = () => {
    handleBreakCompleted(timerMode);
    showToast('Alongamento concluído! Músculos e articulações agradecem.');
  };

  // Cross-tab actions
  const handleAskAiWithProfile = (summaryText: string) => {
    setAiCustomPrompt(`Olá, analise minha configuração ergonômica atual:\n\n${summaryText}\n\nQuais recomendações práticas você me dá para evitar fadiga ou dor?`);
    setActiveTab('ai_advisor');
  };

  const handleAskAiWithChecklist = (checklistSummary: string) => {
    setAiCustomPrompt(`Gostaria de um parecer ergonômico detalhado com base no checklist da NR-17 que respondi:\n\n${checklistSummary}\n\nComo priorizar as correções?`);
    setActiveTab('ai_advisor');
  };

  const handleAskAiWithDiscomfort = (discomfortSummary: string) => {
    setAiCustomPrompt(`Estou sentindo desconforto físico no meu posto de trabalho:\n\n${discomfortSummary}\n\nO que devo ajustar primeiro nos meus equipamentos para aliviar essa dor?`);
    setActiveTab('ai_advisor');
  };

  const handleGoToStretchesForPart = (_part: BodyPart) => {
    setActiveTab('stretches');
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col selection:bg-emerald-200 selection:text-emerald-900">
      {/* Toast alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-stone-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-stone-700 flex items-center gap-3 animate-fade-in text-xs font-semibold">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isSoundEnabled={isSoundEnabled}
        setIsSoundEnabled={setIsSoundEnabled}
        breaksCompletedCount={breaksCompletedCount}
        timerActive={timerActive}
        timerFormatted={timerFormatted}
      />

      {/* Main Container Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'calculator' && (
          <WorkstationCalculator
            profile={profile}
            setProfile={setProfile}
            onAskAiWithProfile={handleAskAiWithProfile}
          />
        )}

        {activeTab === 'timer' && (
          <BreakTimer
            isSoundEnabled={isSoundEnabled}
            onBreakCompleted={handleBreakCompleted}
            onStartStretchRoutine={() => setActiveTab('stretches')}
            timerMode={timerMode}
            setTimerMode={setTimerMode}
            setNavBadgeTime={setTimerFormatted}
            setTimerRunningState={setTimerActive}
          />
        )}

        {activeTab === 'stretches' && (
          <GuidedStretches
            isSoundEnabled={isSoundEnabled}
            onFinishedRoutine={handleFinishedRoutine}
          />
        )}

        {activeTab === 'checklist' && (
          <WorkstationChecklist
            checklist={checklist}
            setChecklist={setChecklist}
            onAskAiWithChecklist={handleAskAiWithChecklist}
          />
        )}

        {activeTab === 'discomfort' && (
          <BodyDiscomfortMap
            onAskAiWithDiscomfort={handleAskAiWithDiscomfort}
            onGoToStretchesForPart={handleGoToStretchesForPart}
          />
        )}

        {activeTab === 'ai_advisor' && (
          <AiErgoConsultant
            userProfile={profile}
            initialPrompt={aiCustomPrompt}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-stone-900 text-stone-400 border-t border-stone-800 py-8 mt-auto text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div>
            <div className="flex items-center justify-center md:justify-start gap-2 text-stone-200 font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Ergonomia Viva • Saúde Ocupacional</span>
            </div>
            <p className="text-stone-400 mt-1">
              Baseado nas diretrizes da NR-17 (MTE Brasil), ISO 9241-5 e OSHA para postos de trabalho e prevenção de LER/DORT.
            </p>
          </div>

          <div className="flex items-center justify-center gap-4 text-stone-400">
            <span>Regra 20-20-20</span>
            <span>•</span>
            <span>Antropometria Computacional</span>
            <span>•</span>
            <span>Pausas Ativas</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
