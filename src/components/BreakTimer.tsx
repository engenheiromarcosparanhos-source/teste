import React, { useState, useEffect, useRef } from 'react';
import { TimerMode } from '../types';
import { playGentleBell } from '../utils/audio';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Eye, 
  Coffee, 
  Sparkles, 
  CheckCircle2, 
  Bell, 
  Activity,
  ArrowRight
} from 'lucide-react';

interface BreakTimerProps {
  isSoundEnabled: boolean;
  onBreakCompleted: (mode: TimerMode) => void;
  onStartStretchRoutine: () => void;
  timerMode: TimerMode;
  setTimerMode: (mode: TimerMode) => void;
  setNavBadgeTime: (timeStr: string) => void;
  setTimerRunningState: (running: boolean) => void;
}

interface TimerPreset {
  id: TimerMode;
  name: string;
  focusMinutes: number;
  breakSeconds: number;
  description: string;
  focusTitle: string;
  breakTitle: string;
  actionAdvice: string;
}

const PRESETS: Record<TimerMode, TimerPreset> = {
  '20_20_20': {
    id: '20_20_20',
    name: 'Regra 20-20-20 (Visão)',
    focusMinutes: 20,
    breakSeconds: 20,
    description: 'A cada 20 minutos, desvie o olhar para um objeto a 6 metros de distância por 20 segundos.',
    focusTitle: 'Foco no Trabalho',
    breakTitle: 'Descanse Seus Olhos!',
    actionAdvice: 'Olhe para o ponto mais distante da sala ou pela janela (6 metros). Pisque 10 vezes lentamente para hidratar a córnea.',
  },
  'micro_break': {
    id: 'micro_break',
    name: 'Micropausa (Postura & Punhos)',
    focusMinutes: 45,
    breakSeconds: 120, // 2 minutes
    description: 'Pausa rápida a cada 45 minutos para soltar punhos, ombros e descomprimir a lombar.',
    focusTitle: 'Trabalhando com Postura',
    breakTitle: 'Hora da Micropausa!',
    actionAdvice: 'Tire as mãos do teclado e mouse. Solte os ombros para baixo, faça círculos com os punhos e respire profundamente.',
  },
  'labor_stretch': {
    id: 'labor_stretch',
    name: 'Pausa Ativa (Ginástica Laboral)',
    focusMinutes: 60,
    breakSeconds: 300, // 5 minutes
    description: 'Pausa profunda a cada 60 minutos para levantar da cadeira, caminhar, beber água e alongar o corpo todo.',
    focusTitle: 'Jornada Focada',
    breakTitle: 'Levante-se da Cadeira!',
    actionAdvice: 'Levante-se agora mesmo! Beba um copo de água, ative as panturrilhas e faça uma sequência de alongamento rápido.',
  },
};

export const BreakTimer: React.FC<BreakTimerProps> = ({
  isSoundEnabled,
  onBreakCompleted,
  onStartStretchRoutine,
  timerMode,
  setTimerMode,
  setNavBadgeTime,
  setTimerRunningState,
}) => {
  const currentPreset = PRESETS[timerMode];
  const [isBreakPhase, setIsBreakPhase] = useState<boolean>(false);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(currentPreset.focusMinutes * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [sessionBreaksCount, setSessionBreaksCount] = useState<number>(0);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // When timerMode changes, reset timer
  useEffect(() => {
    setIsRunning(false);
    setIsBreakPhase(false);
    setSecondsRemaining(PRESETS[timerMode].focusMinutes * 60);
  }, [timerMode]);

  // Sync running state to parent for navbar indicator
  useEffect(() => {
    setTimerRunningState(isRunning);
    const m = Math.floor(secondsRemaining / 60);
    const s = secondsRemaining % 60;
    setNavBadgeTime(`${m}:${s < 10 ? '0' : ''}${s}`);
  }, [isRunning, secondsRemaining, setNavBadgeTime, setTimerRunningState]);

  // Timer Tick
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            // Timer expired!
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, isBreakPhase, timerMode]);

  const handleTimerComplete = () => {
    if (isSoundEnabled) {
      playGentleBell();
    }

    if (!isBreakPhase) {
      // Transition from focus to break phase
      setIsBreakPhase(true);
      setSecondsRemaining(currentPreset.breakSeconds);
    } else {
      // Transition from break phase back to focus
      setIsBreakPhase(false);
      setSecondsRemaining(currentPreset.focusMinutes * 60);
      setSessionBreaksCount((c) => c + 1);
      onBreakCompleted(timerMode);
    }
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setIsBreakPhase(false);
    setSecondsRemaining(currentPreset.focusMinutes * 60);
  };

  const triggerInstantEyeRest = () => {
    setIsRunning(true);
    setIsBreakPhase(true);
    setSecondsRemaining(20);
  };

  // Format time
  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const timeFormatted = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  // Progress percentage calculation
  const totalPhaseSeconds = isBreakPhase 
    ? currentPreset.breakSeconds 
    : currentPreset.focusMinutes * 60;
  const progressRatio = Math.max(0, Math.min(1, 1 - secondsRemaining / totalPhaseSeconds));
  const strokeDashoffset = 283 * (1 - progressRatio);

  return (
    <div className="space-y-8">
      {/* Intro Header */}
      <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              Gestão de Fadiga & Pausas Ativas • NR-17
            </span>
            <h2 className="text-2xl font-bold text-stone-900 mt-2">
              Temporizador Ergonômico de Postura e Visão
            </h2>
            <p className="text-sm text-stone-600 mt-1 max-w-2xl">
              Trabalhar sem pausas causa estase venosa, sobrecarga nos discos da coluna e espasmo nos músculos oculares. Escolha um protocolo comprovado para guiar suas pausas ativas.
            </p>
          </div>

          {/* Instant 20s eye rest button */}
          <button
            id="instant-eye-rest-btn"
            type="button"
            onClick={triggerInstantEyeRest}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-50 border border-sky-200 text-sky-800 hover:bg-sky-100 font-semibold text-xs transition-colors self-start md:self-center"
          >
            <Eye className="w-4 h-4 text-sky-600" />
            <span>Pausa Imediata dos Olhos (20s)</span>
          </button>
        </div>

        {/* Preset Selector Tabs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-6 pt-6 border-t border-stone-100">
          {(Object.keys(PRESETS) as TimerMode[]).map((modeKey) => {
            const p = PRESETS[modeKey];
            const isSelected = timerMode === modeKey;
            return (
              <button
                key={modeKey}
                id={`preset-${modeKey}`}
                type="button"
                onClick={() => setTimerMode(modeKey)}
                className={`p-4 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'bg-emerald-50/80 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                    : 'bg-stone-50 border-stone-200 hover:bg-stone-100/80 text-stone-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold ${isSelected ? 'text-emerald-800' : 'text-stone-800'}`}>
                    {p.name}
                  </span>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-white border border-stone-200 text-stone-600">
                    {p.focusMinutes}m / {p.breakSeconds < 60 ? `${p.breakSeconds}s` : `${p.breakSeconds / 60}m`}
                  </span>
                </div>
                <p className="text-xs text-stone-500 mt-1 leading-snug line-clamp-2">
                  {p.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Timer Display */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Circular Countdown Card */}
        <div className="lg:col-span-6 bg-white rounded-2xl p-8 border border-stone-200 shadow-sm flex flex-col items-center justify-center text-center">
          {/* Phase Badge */}
          <div className="mb-4">
            <span
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2 border ${
                isBreakPhase
                  ? 'bg-amber-100 text-amber-900 border-amber-300 animate-bounce'
                  : isRunning
                  ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                  : 'bg-stone-100 text-stone-700 border-stone-300'
              }`}
            >
              {isBreakPhase ? <Coffee className="w-3.5 h-3.5 text-amber-700" /> : <Activity className="w-3.5 h-3.5 text-emerald-700" />}
              {isBreakPhase ? currentPreset.breakTitle : isRunning ? currentPreset.focusTitle : 'Temporizador Parado'}
            </span>
          </div>

          {/* SVG Circular Progress Ring */}
          <div className="relative w-64 h-64 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              {/* Background circle */}
              <circle
                cx="50"
                cy="50"
                r="45"
                className="stroke-stone-100"
                strokeWidth="8"
                fill="transparent"
              />
              {/* Animated Progress circle */}
              <circle
                cx="50"
                cy="50"
                r="45"
                className={`transition-all duration-1000 ease-linear ${
                  isBreakPhase ? 'stroke-amber-500' : 'stroke-emerald-600'
                }`}
                strokeWidth="8"
                strokeDasharray="283"
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>

            {/* Center Time Digits */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl font-extrabold text-stone-900 font-mono tracking-tight">
                {timeFormatted}
              </span>
              <span className="text-xs font-semibold text-stone-500 mt-1 uppercase tracking-wider">
                {isBreakPhase ? 'Tempo de Pausa' : 'Tempo de Foco'}
              </span>
            </div>
          </div>

          {/* Controls buttons */}
          <div className="flex items-center gap-3 mt-8">
            <button
              id="reset-timer-btn"
              type="button"
              onClick={resetTimer}
              title="Reiniciar tempo"
              className="p-3 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-100 transition-colors"
            >
              <RotateCcw className="w-5 h-5" />
            </button>

            <button
              id="toggle-timer-btn"
              type="button"
              onClick={toggleTimer}
              className={`flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-sm shadow-sm transition-all transform active:scale-95 ${
                isRunning
                  ? 'bg-stone-800 text-white hover:bg-stone-900'
                  : isBreakPhase
                  ? 'bg-amber-600 text-white hover:bg-amber-700'
                  : 'bg-emerald-600 text-white hover:bg-emerald-700'
              }`}
            >
              {isRunning ? (
                <>
                  <Pause className="w-5 h-5" />
                  <span>Pausar</span>
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  <span>{secondsRemaining < totalPhaseSeconds ? 'Continuar' : 'Iniciar'}</span>
                </>
              )}
            </button>

            {/* Quick sound indicator */}
            <div 
              title={isSoundEnabled ? 'Sinal sonoro ativo' : 'Sinal sonoro desligado'} 
              className={`p-3 rounded-xl border ${isSoundEnabled ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-stone-50 border-stone-200 text-stone-400'}`}
            >
              <Bell className="w-5 h-5" />
            </div>
          </div>

          <p className="text-xs text-stone-400 mt-4">
            Dica: Deixe esta aba aberta durante seu expediente para receber os avisos sonoros.
          </p>
        </div>

        {/* Phase Context & Active Advice Card */}
        <div className="lg:col-span-6 space-y-4">
          {/* Active Instructions Card */}
          <div className={`rounded-2xl p-6 border transition-all ${
            isBreakPhase 
              ? 'bg-amber-50/90 border-amber-300 ring-2 ring-amber-400/30' 
              : 'bg-white border-stone-200'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className={`w-5 h-5 ${isBreakPhase ? 'text-amber-700' : 'text-emerald-600'}`} />
              <h3 className="font-bold text-stone-900 text-base">
                {isBreakPhase ? 'Instruções para a Pausa Ativa Agora' : 'Orientações durante a Etapa de Foco'}
              </h3>
            </div>

            <p className="text-sm text-stone-700 leading-relaxed">
              {isBreakPhase ? currentPreset.actionAdvice : (
                <>
                  Mantenha a postura neutra enquanto trabalha: 
                  ombros baixos, pés firmes e queixo recolhido. Quando o temporizador soar, afaste-se imediatamente da tela para descansar seus olhos e circulação.
                </>
              )}
            </p>

            {/* Button to jump into guided stretches during break */}
            <div className="mt-4 pt-4 border-t border-stone-200/70 flex items-center justify-between">
              <span className="text-xs text-stone-500">
                Quer alongar agora com instruções guiadas?
              </span>
              <button
                type="button"
                onClick={onStartStretchRoutine}
                className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 hover:bg-emerald-100 transition-colors"
              >
                <span>Alongamentos Rápidos</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Today's Stats & Habit Tracker */}
          <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm">
            <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-3">
              Seu Progresso de Bem-Estar Hoje
            </h4>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-stone-50 border border-stone-200">
                <span className="text-xs text-stone-500 block">Pausas Completadas</span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-3xl font-extrabold text-emerald-700 font-mono">
                    {sessionBreaksCount}
                  </span>
                  <span className="text-xs text-stone-500">ciclos</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-stone-50 border border-stone-200">
                <span className="text-xs text-stone-500 block">Status de Prevenção</span>
                <div className="flex items-center gap-1.5 mt-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="text-xs font-bold text-stone-800">
                    {sessionBreaksCount >= 6 ? 'Excelente (Protegido)' : sessionBreaksCount >= 3 ? 'Bom Ritmo' : 'Iniciando Dia'}
                  </span>
                </div>
              </div>
            </div>

            <p className="text-xs text-stone-500 mt-4 leading-relaxed">
              * A NR-17 preconiza a introdução de pausas ergonômicas regulares não acumuláveis para atividades de digitação contínua e esforço estático visual.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
