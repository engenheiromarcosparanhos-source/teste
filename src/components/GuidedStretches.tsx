import React, { useState, useEffect, useRef } from 'react';
import { STRETCH_EXERCISES } from '../data/ergonomicsData';
import { BodyPart, StretchExercise } from '../types';
import { playGentleBell, playShortClick } from '../utils/audio';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Check, 
  ChevronRight, 
  ShieldAlert, 
  Activity, 
  Sparkles,
  HeartPulse,
  Flame
} from 'lucide-react';

interface GuidedStretchesProps {
  isSoundEnabled: boolean;
  onFinishedRoutine: () => void;
}

export const GuidedStretches: React.FC<GuidedStretchesProps> = ({
  isSoundEnabled,
  onFinishedRoutine,
}) => {
  const [selectedBodyPart, setSelectedBodyPart] = useState<string>('all');
  const [activeExercise, setActiveExercise] = useState<StretchExercise | null>(null);

  // Guided Routine state
  const [isRoutineRunning, setIsRoutineRunning] = useState<boolean>(false);
  const [routineIndex, setRoutineIndex] = useState<number>(0);
  const [routineSecondsLeft, setRoutineSecondsLeft] = useState<number>(25);
  const routineTimerRef = useRef<NodeJS.Timeout | null>(null);

  // The 4 essential express workplace exercises
  const expressRoutineList = [
    STRETCH_EXERCISES[0], // Pescoço lateral
    STRETCH_EXERCISES[2], // Abertura Peitoral
    STRETCH_EXERCISES[3], // Punhos e mãos (anti-LER)
    STRETCH_EXERCISES[5], // Olhos 20-20-20
  ];

  const currentRoutineExercise = expressRoutineList[routineIndex];

  // Routine timer countdown
  useEffect(() => {
    if (isRoutineRunning) {
      routineTimerRef.current = setInterval(() => {
        setRoutineSecondsLeft((prev) => {
          if (prev <= 1) {
            handleRoutineStepNext();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (routineTimerRef.current) {
      clearInterval(routineTimerRef.current);
    }

    return () => {
      if (routineTimerRef.current) clearInterval(routineTimerRef.current);
    };
  }, [isRoutineRunning, routineIndex]);

  const handleRoutineStepNext = () => {
    if (isSoundEnabled) {
      playGentleBell();
    }

    if (routineIndex < expressRoutineList.length - 1) {
      const nextIndex = routineIndex + 1;
      setRoutineIndex(nextIndex);
      setRoutineSecondsLeft(expressRoutineList[nextIndex].durationSec);
    } else {
      // Completed routine
      setIsRoutineRunning(false);
      setRoutineIndex(0);
      setRoutineSecondsLeft(expressRoutineList[0].durationSec);
      onFinishedRoutine();
    }
  };

  const startExpressRoutine = () => {
    if (isSoundEnabled) playShortClick();
    setRoutineIndex(0);
    setRoutineSecondsLeft(expressRoutineList[0].durationSec);
    setIsRoutineRunning(true);
    setActiveExercise(null);
  };

  const stopExpressRoutine = () => {
    setIsRoutineRunning(false);
  };

  const filteredExercises = selectedBodyPart === 'all'
    ? STRETCH_EXERCISES
    : STRETCH_EXERCISES.filter((ex) => ex.bodyPart === selectedBodyPart);

  return (
    <div className="space-y-8">
      {/* Header with Express Routine Banner */}
      <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              Ginástica Laboral Preventiva • Alívio de Tensão
            </span>
            <h2 className="text-2xl font-bold text-stone-900 mt-2">
              Exercícios Guiados para Fazer na Cadeira
            </h2>
            <p className="text-sm text-stone-600 mt-1 max-w-2xl">
              Alongamentos biomecânicos desenvolvidos por ergonomistas para restaurar a oxigenação muscular, reduzir a compressão intervertebral e prevenir LER/DORT em menos de 2 minutos.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              id="start-express-routine-btn"
              type="button"
              onClick={isRoutineRunning ? stopExpressRoutine : startExpressRoutine}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm shadow-sm transition-all transform active:scale-95 ${
                isRoutineRunning
                  ? 'bg-stone-800 text-white hover:bg-stone-900'
                  : 'bg-emerald-600 text-white hover:bg-emerald-700'
              }`}
            >
              {isRoutineRunning ? (
                <>
                  <Pause className="w-4 h-4" />
                  <span>Pausar Rotina</span>
                </>
              ) : (
                <>
                  <Flame className="w-4 h-4 text-amber-300" />
                  <span>Iniciar Rotina Express (2 min)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Active Express Routine Player Bar (Visible when running) */}
      {isRoutineRunning && (
        <div className="bg-gradient-to-r from-emerald-900 to-stone-900 text-white rounded-2xl p-6 border border-emerald-700 shadow-xl animate-fade-in">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-800/80 border border-emerald-500/50 flex flex-col items-center justify-center font-mono shrink-0">
                <span className="text-2xl font-black text-emerald-300 leading-none">
                  {routineSecondsLeft}
                </span>
                <span className="text-[10px] uppercase font-bold text-emerald-100">seg</span>
              </div>

              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-300">
                  <span>Exercício {routineIndex + 1} de {expressRoutineList.length}</span>
                  <span>•</span>
                  <span>{currentRoutineExercise.targetArea}</span>
                </div>
                <h3 className="text-xl font-bold text-white mt-0.5">
                  {currentRoutineExercise.title}
                </h3>
                <p className="text-xs text-stone-300 mt-1 max-w-xl">
                  {currentRoutineExercise.steps[0]} {currentRoutineExercise.steps[1]}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end md:self-center">
              <button
                type="button"
                onClick={handleRoutineStepNext}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-stone-900 text-xs font-bold hover:bg-stone-100 transition-colors"
              >
                <span>Próximo</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters by Body Part */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
        <span className="text-xs font-semibold text-stone-500 mr-2 shrink-0">Filtrar por foco:</span>
        {[
          { id: 'all', label: 'Todos os Exercícios' },
          { id: 'neck', label: 'Pescoço & Cervical' },
          { id: 'shoulders', label: 'Ombros & Peitoral' },
          { id: 'wrists', label: 'Punhos & Mãos (Anti-LER)' },
          { id: 'lower_back', label: 'Coluna & Lombar' },
          { id: 'eyes', label: 'Olhos & Visão' },
          { id: 'legs', label: 'Pernas & Circulação' },
        ].map((btn) => (
          <button
            key={btn.id}
            type="button"
            onClick={() => setSelectedBodyPart(btn.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              selectedBodyPart === btn.id
                ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
            }`}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* Grid of Exercises Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredExercises.map((exercise) => {
          const isSelected = activeExercise?.id === exercise.id;
          return (
            <div
              key={exercise.id}
              className={`bg-white rounded-2xl border transition-all duration-200 flex flex-col justify-between overflow-hidden ${
                isSelected
                  ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-md'
                  : 'border-stone-200 hover:border-stone-300 shadow-xs'
              }`}
            >
              <div className="p-6">
                {/* Category Badge & Duration */}
                <div className="flex items-center justify-between text-xs mb-3">
                  <span className="font-semibold px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700">
                    {exercise.targetArea}
                  </span>
                  <span className="font-mono font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                    ~{exercise.durationSec}s
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-base font-bold text-stone-900 leading-snug">
                  {exercise.title}
                </h3>

                {/* Benefits */}
                <p className="text-xs text-stone-600 mt-2 line-clamp-2">
                  {exercise.benefits}
                </p>

                {/* Reps */}
                <div className="mt-3 flex items-center gap-1.5 text-xs text-stone-500">
                  <HeartPulse className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{exercise.repsText}</span>
                </div>

                {/* Step preview or full steps */}
                <div className="mt-4 pt-4 border-t border-stone-100 space-y-2">
                  <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
                    Como executar:
                  </span>
                  <ol className="space-y-1.5 text-xs text-stone-700 list-decimal list-inside leading-relaxed">
                    {exercise.steps.slice(0, 3).map((step, idx) => (
                      <li key={idx} className="pl-1">{step}</li>
                    ))}
                  </ol>
                  {exercise.steps.length > 3 && (
                    <span className="text-[11px] text-emerald-700 font-medium">
                      + {exercise.steps.length - 3} etapas detalhadas
                    </span>
                  )}
                </div>

                {/* Safety tip */}
                <div className="mt-4 p-2.5 rounded-lg bg-stone-50 border border-stone-200 text-[11px] text-stone-600 flex items-start gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>{exercise.safetyTip}</span>
                </div>
              </div>

              {/* Action button */}
              <div className="p-4 bg-stone-50 border-t border-stone-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    if (isSoundEnabled) playShortClick();
                    setActiveExercise(isSelected ? null : exercise);
                  }}
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-800"
                >
                  {isSelected ? 'Ocultar detalhes' : 'Ver guia completo'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (isSoundEnabled) playGentleBell();
                    onFinishedRoutine();
                  }}
                  title="Marcar como feito agora"
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 text-xs font-semibold transition-colors"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Feito!</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
