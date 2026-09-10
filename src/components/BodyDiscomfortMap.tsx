import React, { useState } from 'react';
import { BodyPart, DiscomfortRecord } from '../types';
import { DISCOMFORT_DATABASE } from '../data/ergonomicsData';
import { 
  AlertCircle, 
  Activity, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight,
  HelpCircle
} from 'lucide-react';

interface BodyDiscomfortMapProps {
  onAskAiWithDiscomfort: (summary: string) => void;
  onGoToStretchesForPart: (part: BodyPart) => void;
}

export const BodyDiscomfortMap: React.FC<BodyDiscomfortMapProps> = ({
  onAskAiWithDiscomfort,
  onGoToStretchesForPart,
}) => {
  const [selectedPart, setSelectedPart] = useState<BodyPart>('neck');
  const [severities, setSeverities] = useState<Partial<Record<BodyPart, number>>>({
    neck: 2,
    lower_back: 3,
  });

  const bodyPartsList: { id: BodyPart; label: string; iconCoords: { x: number; y: number } }[] = [
    { id: 'eyes', label: 'Olhos & Visão', iconCoords: { x: 50, y: 15 } },
    { id: 'neck', label: 'Pescoço & Cervical', iconCoords: { x: 50, y: 24 } },
    { id: 'shoulders', label: 'Ombros & Trapézio', iconCoords: { x: 50, y: 32 } },
    { id: 'upper_back', label: 'Costas Superior (Torácica)', iconCoords: { x: 50, y: 40 } },
    { id: 'lower_back', label: 'Lombar & Cintura', iconCoords: { x: 50, y: 52 } },
    { id: 'wrists', label: 'Punhos & Mãos (Anti-LER)', iconCoords: { x: 20, y: 54 } },
    { id: 'legs', label: 'Pernas & Circulação', iconCoords: { x: 50, y: 78 } },
  ];

  const currentInfo = DISCOMFORT_DATABASE[selectedPart];
  const currentSeverity = severities[selectedPart] || 0;

  const handleSetSeverity = (part: BodyPart, level: number) => {
    setSeverities((prev) => ({
      ...prev,
      [part]: prev[part] === level ? 0 : level,
    }));
  };

  const generateDiscomfortSummary = () => {
    const activeComplaints = Object.entries(severities)
      .filter(([_, level]) => typeof level === 'number' && level > 0)
      .map(([partKey, level]) => {
        const info = DISCOMFORT_DATABASE[partKey as BodyPart];
        return `- ${info.name}: Intensidade ${level}/5`;
      })
      .join('\n');

    return `Avaliação de Desconforto Físico e Postural:
Regiões com queixa relatada:
${activeComplaints || '- Nenhuma queixa grave selecionada.'}

Região selecionada para aprofundamento: ${currentInfo.name}
Causas ergonômicas típicas: ${currentInfo.causes.join('; ')}
Ações imediatas recomendadas: ${currentInfo.remedies.join('; ')}`;
  };

  return (
    <div className="space-y-8">
      {/* Intro Header */}
      <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              Mapeamento de Sintomas & LER/DORT
            </span>
            <h2 className="text-2xl font-bold text-stone-900 mt-2">
              Mapa Corporal de Desconforto Ocupacional
            </h2>
            <p className="text-sm text-stone-600 mt-1 max-w-2xl">
              Clique nas regiões anatômicas onde você sente dor, queimação, fadiga ou tensão muscular ao final do dia para descobrir a causa ergonômica raiz e o ajuste necessário.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onAskAiWithDiscomfort(generateDiscomfortSummary())}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors shadow-xs self-start lg:self-center"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Consultar Solução com IA</span>
          </button>
        </div>
      </div>

      {/* Main Interactive Map & Diagnostic Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Visual Silhouette & Hotspots */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-stone-200 shadow-sm flex flex-col items-center">
          <span className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-4">
            Selecione a região dolorida
          </span>

          {/* SVG Silhouette with interactive click points */}
          <div className="relative w-64 h-96 bg-stone-50 rounded-2xl border border-stone-200 p-4 flex items-center justify-center select-none overflow-hidden">
            <svg
              viewBox="0 0 200 360"
              className="w-full h-full"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Human Anatomical Silhouette Path */}
              {/* Head */}
              <circle cx="100" cy="40" r="22" fill="#d6d3d1" stroke="#a8a29e" strokeWidth="2" />
              {/* Neck */}
              <path d="M 92 62 L 92 78 L 108 78 L 108 62 Z" fill="#d6d3d1" />
              {/* Torso & Shoulders */}
              <path
                d="M 55 88 Q 100 80 145 88 L 135 180 Q 100 185 65 180 Z"
                fill="#e7e5e4"
                stroke="#a8a29e"
                strokeWidth="2"
              />
              {/* Arms */}
              {/* Left Arm */}
              <path d="M 55 88 L 35 150 L 30 195 L 40 195 L 48 150 L 62 105 Z" fill="#d6d3d1" />
              {/* Right Arm */}
              <path d="M 145 88 L 165 150 L 170 195 L 160 195 L 152 150 L 138 105 Z" fill="#d6d3d1" />
              {/* Pelvis & Legs */}
              <path
                d="M 68 180 L 132 180 L 128 260 L 125 340 L 108 340 L 103 240 L 97 240 L 92 340 L 75 340 L 72 260 Z"
                fill="#e7e5e4"
                stroke="#a8a29e"
                strokeWidth="2"
              />

              {/* Hotspots for each body part */}
              {/* Eyes */}
              <g 
                className="cursor-pointer" 
                onClick={() => setSelectedPart('eyes')}
              >
                <circle 
                  cx="100" 
                  cy="36" 
                  r={selectedPart === 'eyes' ? 9 : 7} 
                  fill={selectedPart === 'eyes' ? '#0284c7' : severities.eyes ? '#f43f5e' : '#78716c'} 
                  stroke="#ffffff" 
                  strokeWidth="2" 
                />
              </g>

              {/* Neck */}
              <g 
                className="cursor-pointer" 
                onClick={() => setSelectedPart('neck')}
              >
                <circle 
                  cx="100" 
                  cy="70" 
                  r={selectedPart === 'neck' ? 10 : 8} 
                  fill={selectedPart === 'neck' ? '#059669' : severities.neck ? '#f43f5e' : '#78716c'} 
                  stroke="#ffffff" 
                  strokeWidth="2" 
                />
              </g>

              {/* Shoulders */}
              <g 
                className="cursor-pointer" 
                onClick={() => setSelectedPart('shoulders')}
              >
                <circle 
                  cx="70" 
                  cy="92" 
                  r={selectedPart === 'shoulders' ? 10 : 8} 
                  fill={selectedPart === 'shoulders' ? '#059669' : severities.shoulders ? '#f43f5e' : '#78716c'} 
                  stroke="#ffffff" 
                  strokeWidth="2" 
                />
                <circle 
                  cx="130" 
                  cy="92" 
                  r={selectedPart === 'shoulders' ? 10 : 8} 
                  fill={selectedPart === 'shoulders' ? '#059669' : severities.shoulders ? '#f43f5e' : '#78716c'} 
                  stroke="#ffffff" 
                  strokeWidth="2" 
                />
              </g>

              {/* Upper Back */}
              <g 
                className="cursor-pointer" 
                onClick={() => setSelectedPart('upper_back')}
              >
                <circle 
                  cx="100" 
                  cy="120" 
                  r={selectedPart === 'upper_back' ? 10 : 8} 
                  fill={selectedPart === 'upper_back' ? '#059669' : severities.upper_back ? '#f43f5e' : '#78716c'} 
                  stroke="#ffffff" 
                  strokeWidth="2" 
                />
              </g>

              {/* Lower Back */}
              <g 
                className="cursor-pointer" 
                onClick={() => setSelectedPart('lower_back')}
              >
                <circle 
                  cx="100" 
                  cy="165" 
                  r={selectedPart === 'lower_back' ? 10 : 8} 
                  fill={selectedPart === 'lower_back' ? '#059669' : severities.lower_back ? '#f43f5e' : '#78716c'} 
                  stroke="#ffffff" 
                  strokeWidth="2" 
                />
              </g>

              {/* Wrists */}
              <g 
                className="cursor-pointer" 
                onClick={() => setSelectedPart('wrists')}
              >
                <circle 
                  cx="35" 
                  cy="195" 
                  r={selectedPart === 'wrists' ? 10 : 8} 
                  fill={selectedPart === 'wrists' ? '#059669' : severities.wrists ? '#f43f5e' : '#78716c'} 
                  stroke="#ffffff" 
                  strokeWidth="2" 
                />
                <circle 
                  cx="165" 
                  cy="195" 
                  r={selectedPart === 'wrists' ? 10 : 8} 
                  fill={selectedPart === 'wrists' ? '#059669' : severities.wrists ? '#f43f5e' : '#78716c'} 
                  stroke="#ffffff" 
                  strokeWidth="2" 
                />
              </g>

              {/* Legs */}
              <g 
                className="cursor-pointer" 
                onClick={() => setSelectedPart('legs')}
              >
                <circle 
                  cx="85" 
                  cy="290" 
                  r={selectedPart === 'legs' ? 10 : 8} 
                  fill={selectedPart === 'legs' ? '#059669' : severities.legs ? '#f43f5e' : '#78716c'} 
                  stroke="#ffffff" 
                  strokeWidth="2" 
                />
                <circle 
                  cx="115" 
                  cy="290" 
                  r={selectedPart === 'legs' ? 10 : 8} 
                  fill={selectedPart === 'legs' ? '#059669' : severities.legs ? '#f43f5e' : '#78716c'} 
                  stroke="#ffffff" 
                  strokeWidth="2" 
                />
              </g>
            </svg>
          </div>

          {/* Quick Body Part Pill Selector */}
          <div className="flex flex-wrap justify-center gap-1.5 mt-4 w-full">
            {bodyPartsList.map((bp) => {
              const isSel = selectedPart === bp.id;
              const hasSev = (severities[bp.id] || 0) > 0;
              return (
                <button
                  key={bp.id}
                  type="button"
                  onClick={() => setSelectedPart(bp.id)}
                  className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                    isSel
                      ? 'bg-emerald-600 text-white border-emerald-600 font-bold'
                      : hasSev
                      ? 'bg-rose-50 text-rose-800 border-rose-200 font-semibold'
                      : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  {bp.label}
                  {hasSev && <span className="ml-1 text-[10px] text-rose-600 font-bold">({severities[bp.id]}/5)</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Detailed Diagnosis & Ergonomic Remedies Card */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm">
            {/* Header with Severity selector */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100">
              <div>
                <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
                  Diagnóstico Ergonômico de Posto
                </span>
                <h3 className="text-xl font-bold text-stone-900 mt-0.5">
                  {currentInfo.name}
                </h3>
              </div>

              {/* Severity scale (1 to 5) */}
              <div className="flex items-center gap-1.5 bg-stone-50 px-3 py-1.5 rounded-xl border border-stone-200">
                <span className="text-xs font-bold text-stone-600 mr-1">Intensidade:</span>
                {[1, 2, 3, 4, 5].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => handleSetSeverity(selectedPart, lvl)}
                    className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                      currentSeverity >= lvl
                        ? 'bg-rose-500 text-white shadow-xs'
                        : 'bg-white border border-stone-300 text-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* Why does it hurt? (Ergonomic Causes) */}
            <div className="mt-5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-rose-700 flex items-center gap-1.5 mb-2">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                Por que dói? Principais causas no posto de trabalho:
              </h4>
              <ul className="space-y-2 text-xs sm:text-sm text-stone-700">
                {currentInfo.causes.map((cause, idx) => (
                  <li key={idx} className="flex items-start gap-2 bg-stone-50 p-2.5 rounded-lg border border-stone-100">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-2 shrink-0" />
                    <span>{cause}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* How to fix immediately? (Remedies) */}
            <div className="mt-6">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5 mb-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                O que fazer agora para corrigir:
              </h4>
              <ul className="space-y-2 text-xs sm:text-sm text-stone-700">
                {currentInfo.remedies.map((remedy, idx) => (
                  <li key={idx} className="flex items-start gap-2 bg-emerald-50/50 p-2.5 rounded-lg border border-emerald-100">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-2 shrink-0" />
                    <span>{remedy}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Quick Actions */}
            <div className="mt-6 pt-6 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => onGoToStretchesForPart(selectedPart)}
                className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 px-3.5 py-2 rounded-xl border border-emerald-200 hover:bg-emerald-100 transition-colors"
              >
                <Activity className="w-4 h-4" />
                <span>Ver Alongamentos para {currentInfo.name}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <p className="text-[11px] text-stone-500">
                * Se a dor for contínua por mais de 7 dias com dormência, consulte um médico ortopedista.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
