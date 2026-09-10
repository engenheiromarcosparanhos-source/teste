import React, { useState } from 'react';
import { 
  UserErgoProfile, 
  PostureMode, 
  PrimaryDevice 
} from '../types';
import { calculateErgonomics } from '../data/ergonomicsData';
import { 
  Info, 
  Sparkles, 
  Check, 
  HelpCircle,
  Copy,
  Sliders,
  Monitor,
  Footprints
} from 'lucide-react';

interface WorkstationCalculatorProps {
  profile: UserErgoProfile;
  setProfile: React.Dispatch<React.SetStateAction<UserErgoProfile>>;
  onAskAiWithProfile: (summaryText: string) => void;
}

export const WorkstationCalculator: React.FC<WorkstationCalculatorProps> = ({
  profile,
  setProfile,
  onAskAiWithProfile,
}) => {
  const [copied, setCopied] = useState(false);
  const calculations = calculateErgonomics(profile);

  const handleHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val)) {
      setProfile((prev) => ({ ...prev, heightCm: val }));
    }
  };

  const handleHeelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val)) {
      setProfile((prev) => ({ ...prev, shoeHeelCm: val }));
    }
  };

  const handlePostureMode = (mode: PostureMode) => {
    setProfile((prev) => ({ ...prev, postureMode: mode }));
  };

  const handleDeskType = (type: 'fixed' | 'adjustable') => {
    setProfile((prev) => ({ ...prev, deskType: type }));
  };

  const handlePrimaryDevice = (device: PrimaryDevice) => {
    setProfile((prev) => ({ ...prev, primaryDevice: device }));
  };

  const generateSummaryText = () => {
    return `Configuração Ergonômica Ideal (Altura: ${profile.heightCm} cm, Calçado: ${profile.shoeHeelCm} cm):
- Altura do assento da cadeira: ${calculations.chairSeatHeight} cm do chão
- Altura da mesa de trabalho (sentado): ${calculations.deskHeightSitting} cm
- Altura da mesa (em pé): ${calculations.deskHeightStanding} cm
- Topo do monitor: ${calculations.monitorTopHeightSitting} cm do chão (ao nível dos olhos)
- Distância dos olhos à tela: ${calculations.monitorDistanceCm.min} a ${calculations.monitorDistanceCm.max} cm
- Apoio de braço: ${calculations.armrestHeightAboveSeat} cm acima do assento
- Apoio para pés: ${calculations.needsFootrestRecommendation ? 'Recomendado (mesa fixa padrão 75cm)' : 'Dispensável se mesa for regulável'}`;
  };

  const copyAdjustments = () => {
    navigator.clipboard.writeText(generateSummaryText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-8">
      {/* Top Header & Intro */}
      <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              Antropometria Ocupacional • NR-17 & ISO 9241-5
            </span>
            <h2 className="text-2xl font-bold text-stone-900 mt-2">
              Calculadora de Medidas Ideais do Posto de Trabalho
            </h2>
            <p className="text-sm text-stone-600 mt-1 max-w-2xl">
              Informe sua estatura para calcular com precisão milimétrica as alturas ergonômicas de sua cadeira, mesa, tela e apoios, prevenindo dores no pescoço, ombros e coluna.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="copy-measurements-btn"
              type="button"
              onClick={copyAdjustments}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl bg-stone-100 text-stone-700 hover:bg-stone-200 transition-colors border border-stone-300"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copiado!' : 'Copiar Medidas'}</span>
            </button>

            <button
              id="ask-ai-profile-btn"
              type="button"
              onClick={() => onAskAiWithProfile(generateSummaryText())}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-sm"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Avaliar com IA</span>
            </button>
          </div>
        </div>

        {/* Inputs row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-stone-100">
          {/* Height input */}
          <div className="bg-stone-50 p-4 rounded-xl border border-stone-200">
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="user-height-input" className="text-xs font-semibold text-stone-700">
                Sua Altura Total
              </label>
              <span className="text-sm font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded">
                {profile.heightCm} cm
              </span>
            </div>
            <input
              id="user-height-input"
              type="range"
              min="140"
              max="210"
              step="1"
              value={profile.heightCm}
              onChange={handleHeightChange}
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-stone-600 mt-1">
              <span>140 cm</span>
              <span>175 cm</span>
              <span>210 cm</span>
            </div>
          </div>

          {/* Shoe heel input */}
          <div className="bg-stone-50 p-4 rounded-xl border border-stone-200">
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="user-heel-input" className="text-xs font-semibold text-stone-700">
                Solado do Calçado
              </label>
              <span className="text-sm font-bold text-stone-800 bg-stone-200/80 px-2 py-0.5 rounded">
                {profile.shoeHeelCm} cm
              </span>
            </div>
            <input
              id="user-heel-input"
              type="range"
              min="0"
              max="6"
              step="1"
              value={profile.shoeHeelCm}
              onChange={handleHeelChange}
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-stone-600 mt-1">
              <span>Descalço (0cm)</span>
              <span>Tênis (2-3cm)</span>
              <span>Salto (5-6cm)</span>
            </div>
          </div>

          {/* Posture mode */}
          <div className="bg-stone-50 p-4 rounded-xl border border-stone-200">
            <span className="block text-xs font-semibold text-stone-700 mb-2">
              Modo de Trabalho
            </span>
            <div className="grid grid-cols-3 gap-1">
              {[
                { id: 'sitting', label: 'Sentado' },
                { id: 'standing', label: 'Em Pé' },
                { id: 'sit_stand', label: 'Híbrido' },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => handlePostureMode(m.id as PostureMode)}
                  className={`py-1.5 px-2 text-xs font-medium rounded-lg transition-colors text-center ${
                    profile.postureMode === m.id
                      ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                      : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Desk Type */}
          <div className="bg-stone-50 p-4 rounded-xl border border-stone-200">
            <span className="block text-xs font-semibold text-stone-700 mb-2">
              Tipo de Mesa
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => handleDeskType('fixed')}
                className={`py-1.5 px-2 text-xs font-medium rounded-lg transition-colors text-center ${
                  profile.deskType === 'fixed'
                    ? 'bg-emerald-600 text-white font-semibold'
                    : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-100'
                }`}
              >
                Fixa (~75 cm)
              </button>
              <button
                type="button"
                onClick={() => handleDeskType('adjustable')}
                className={`py-1.5 px-2 text-xs font-medium rounded-lg transition-colors text-center ${
                  profile.deskType === 'adjustable'
                    ? 'bg-emerald-600 text-white font-semibold'
                    : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-100'
                }`}
              >
                Regulável
              </button>
            </div>
          </div>
        </div>

        {/* Primary device choice */}
        <div className="mt-4 pt-4 border-t border-stone-100 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-stone-600">Dispositivo principal:</span>
          {[
            { id: 'laptop_with_peripherals', label: 'Notebook em Suporte + Teclado/Mouse (Recomendado)' },
            { id: 'desktop_single', label: 'Monitor Desktop' },
            { id: 'desktop_dual', label: '2 Monitores' },
            { id: 'laptop_only', label: 'Notebook Direto na Mesa (Risco Cervical)' },
          ].map((dev) => (
            <button
              key={dev.id}
              type="button"
              onClick={() => handlePrimaryDevice(dev.id as PrimaryDevice)}
              className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                profile.primaryDevice === dev.id
                  ? 'bg-emerald-100 border-emerald-400 text-emerald-900 font-semibold'
                  : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
              }`}
            >
              {dev.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Results Grid: Diagram + Dynamic Measurements */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Visual Workstation Interactive Diagram (SVG) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-stone-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-stone-900 text-lg flex items-center gap-2">
                <Sliders className="w-5 h-5 text-emerald-600" />
                Diagrama Biomecânico do Posto
              </h3>
              <span className="text-xs text-stone-600 font-medium bg-stone-100 px-2.5 py-1 rounded-md">
                Ângulos a 90° recomendados
              </span>
            </div>

            {/* SVG Visual Representation */}
            <div className="relative w-full bg-gradient-to-b from-stone-50 to-emerald-50/30 rounded-xl p-4 border border-stone-200 flex items-center justify-center overflow-hidden">
              <svg 
                viewBox="0 0 540 380" 
                className="w-full max-w-lg h-auto select-none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Floor reference line */}
                <line x1="20" y1="350" x2="520" y2="350" stroke="#78716c" strokeWidth="4" strokeLinecap="round" />
                <text x="25" y="370" fill="#78716c" fontSize="11" fontWeight="600">PISO DE REFERÊNCIA (0 cm)</text>

                {/* Desk */}
                <g id="desk-group">
                  {/* Desk top surface */}
                  <rect x="290" y={350 - calculations.deskHeightSitting * 3} width="210" height="12" rx="3" fill="#44403c" />
                  {/* Desk legs */}
                  <rect x="310" y={350 - calculations.deskHeightSitting * 3 + 12} width="14" height={calculations.deskHeightSitting * 3 - 12} fill="#78716c" />
                  <rect x="470" y={350 - calculations.deskHeightSitting * 3 + 12} width="14" height={calculations.deskHeightSitting * 3 - 12} fill="#78716c" />

                  {/* Desk height dimension callout */}
                  <line x1="515" y1="350" x2="515" y2={350 - calculations.deskHeightSitting * 3} stroke="#059669" strokeWidth="2" strokeDasharray="3,3" />
                  <circle cx="515" cy={350 - calculations.deskHeightSitting * 3} r="3" fill="#059669" />
                  <rect x="430" y={350 - calculations.deskHeightSitting * 3 - 22} width="82" height="18" rx="4" fill="#059669" />
                  <text x="471" y={350 - calculations.deskHeightSitting * 3 - 9} fill="#ffffff" fontSize="10" fontWeight="bold" textAnchor="middle">
                    Mesa: {calculations.deskHeightSitting} cm
                  </text>
                </g>

                {/* Monitor / Laptop on Stand */}
                <g id="monitor-group">
                  {/* Monitor Stand */}
                  <rect x="400" y={350 - calculations.deskHeightSitting * 3 - 55} width="8" height="55" fill="#57534e" />
                  <rect x="375" y={350 - calculations.deskHeightSitting * 3 - 6} width="58" height="6" rx="2" fill="#292524" />
                  {/* Screen */}
                  <rect x="390" y={350 - calculations.monitorTopHeightSitting * 2.3} width="12" height="85" rx="3" fill="#1c1917" />
                  <rect x="388" y={350 - calculations.monitorTopHeightSitting * 2.3 + 4} width="3" height="77" fill="#38bdf8" />

                  {/* Eye line to top of screen */}
                  <line 
                    x1="185" 
                    y1={350 - calculations.eyeLevelSitting * 2.25} 
                    x2="388" 
                    y2={350 - calculations.monitorTopHeightSitting * 2.3 + 4} 
                    stroke="#0284c7" 
                    strokeWidth="2" 
                    strokeDasharray="4,4" 
                  />
                  <rect x="235" y={350 - calculations.eyeLevelSitting * 2.25 - 20} width="115" height="18" rx="4" fill="#0284c7" />
                  <text x="292" y={350 - calculations.eyeLevelSitting * 2.25 - 7} fill="#ffffff" fontSize="10" fontWeight="bold" textAnchor="middle">
                    Linha dos Olhos (0° a -15°)
                  </text>
                </g>

                {/* Keyboard and Mouse */}
                <rect x="330" y={350 - calculations.deskHeightSitting * 3 - 6} width="45" height="6" rx="2" fill="#1c1917" />
                <ellipse cx="320" cy={350 - calculations.deskHeightSitting * 3 - 3} rx="6" ry="3" fill="#57534e" />

                {/* Ergonomic Office Chair */}
                <g id="chair-group">
                  {/* Chair Base & Gas Cylinder */}
                  <ellipse cx="160" cy="346" rx="35" ry="5" fill="#44403c" />
                  <rect x="157" y={350 - calculations.chairSeatHeight * 3 + 15} width="6" height={calculations.chairSeatHeight * 3 - 20} fill="#78716c" />
                  
                  {/* Seat Cushion */}
                  <rect x="120" y={350 - calculations.chairSeatHeight * 3} width="85" height="14" rx="4" fill="#059669" />
                  
                  {/* Chair Backrest with Lumbar Curve */}
                  <path 
                    d={`M 120 ${350 - calculations.chairSeatHeight * 3} Q 105 ${350 - calculations.chairSeatHeight * 3 - 45} 115 ${350 - calculations.chairSeatHeight * 3 - 100}`} 
                    fill="none" 
                    stroke="#059669" 
                    strokeWidth="14" 
                    strokeLinecap="round" 
                  />
                  
                  {/* Armrest */}
                  <rect 
                    x="150" 
                    y={350 - calculations.chairSeatHeight * 3 - calculations.armrestHeightAboveSeat * 3} 
                    width="42" 
                    height="8" 
                    rx="3" 
                    fill="#1f2937" 
                  />
                  <rect 
                    x="168" 
                    y={350 - calculations.chairSeatHeight * 3 - calculations.armrestHeightAboveSeat * 3 + 8} 
                    width="6" 
                    height={calculations.armrestHeightAboveSeat * 3 - 8} 
                    fill="#4b5563" 
                  />

                  {/* Chair Seat Height Dimension */}
                  <line x1="85" y1="350" x2="85" y2={350 - calculations.chairSeatHeight * 3} stroke="#059669" strokeWidth="2" strokeDasharray="3,3" />
                  <circle cx="85" cy={350 - calculations.chairSeatHeight * 3} r="3" fill="#059669" />
                  <rect x="35" y={350 - calculations.chairSeatHeight * 3 / 2 - 10} width="85" height="18" rx="4" fill="#059669" />
                  <text x="77" y={350 - calculations.chairSeatHeight * 3 / 2 + 3} fill="#ffffff" fontSize="10" fontWeight="bold" textAnchor="middle">
                    Assento: {calculations.chairSeatHeight} cm
                  </text>
                </g>

                {/* Human Seated Posture (Simplified Biomechanical Mannequin) */}
                <g id="human-posture">
                  {/* Head */}
                  <circle cx="170" cy={350 - calculations.chairSeatHeight * 3 - 95} r="18" fill="#e7e5e4" stroke="#44403c" strokeWidth="2" />
                  {/* Torso */}
                  <line 
                    x1="168" 
                    y1={350 - calculations.chairSeatHeight * 3 - 75} 
                    x2="160" 
                    y2={350 - calculations.chairSeatHeight * 3 + 2} 
                    stroke="#44403c" 
                    strokeWidth="10" 
                    strokeLinecap="round" 
                  />
                  {/* Thigh (horizontal ~ 90°-100°) */}
                  <line 
                    x1="160" 
                    y1={350 - calculations.chairSeatHeight * 3 + 2} 
                    x2="235" 
                    y2={350 - calculations.chairSeatHeight * 3 + 2} 
                    stroke="#44403c" 
                    strokeWidth="9" 
                    strokeLinecap="round" 
                  />
                  {/* Lower Leg (vertical ~ 90°) */}
                  <line 
                    x1="235" 
                    y1={350 - calculations.chairSeatHeight * 3 + 2} 
                    x2="238" 
                    y2="345" 
                    stroke="#44403c" 
                    strokeWidth="8" 
                    strokeLinecap="round" 
                  />
                  {/* Foot */}
                  <ellipse cx="248" cy="346" rx="16" ry="5" fill="#1c1917" />

                  {/* Arm & Forearm (Elbow at 90°) */}
                  {/* Upper Arm */}
                  <line 
                    x1="172" 
                    y1={350 - calculations.chairSeatHeight * 3 - 60} 
                    x2="175" 
                    y2={350 - calculations.deskHeightSitting * 3 + 6} 
                    stroke="#1c1917" 
                    strokeWidth="6" 
                    strokeLinecap="round" 
                  />
                  {/* Forearm resting neutrally towards keyboard */}
                  <line 
                    x1="175" 
                    y1={350 - calculations.deskHeightSitting * 3 + 6} 
                    x2="328" 
                    y2={350 - calculations.deskHeightSitting * 3 - 2} 
                    stroke="#1c1917" 
                    strokeWidth="6" 
                    strokeLinecap="round" 
                  />

                  {/* 90° Angle indicator at elbow */}
                  <circle cx="175" cy={350 - calculations.deskHeightSitting * 3 + 6} r="10" fill="none" stroke="#f59e0b" strokeWidth="2" strokeDasharray="2,2" />
                  <text x="195" y={350 - calculations.deskHeightSitting * 3 + 2} fill="#d97706" fontSize="9" fontWeight="bold">90°-100°</text>

                  {/* 90° Angle indicator at knee */}
                  <circle cx="235" cy={350 - calculations.chairSeatHeight * 3 + 2} r="10" fill="none" stroke="#f59e0b" strokeWidth="2" strokeDasharray="2,2" />
                  <text x="250" y={350 - calculations.chairSeatHeight * 3 + 4} fill="#d97706" fontSize="9" fontWeight="bold">90°</text>
                </g>

                {/* Footrest if needed */}
                {calculations.needsFootrestRecommendation && (
                  <g id="footrest-callout">
                    <polygon points="228,348 268,338 274,348 228,348" fill="#d97706" />
                    <text x="245" y="328" fill="#b45309" fontSize="9" fontWeight="bold" textAnchor="middle">
                      Apoio p/ pés
                    </text>
                  </g>
                )}
              </svg>
            </div>
          </div>

          {/* Footrest alert message if applicable */}
          <div className={`mt-4 p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${
            calculations.needsFootrestRecommendation 
              ? 'bg-amber-50 border-amber-200 text-amber-900' 
              : 'bg-emerald-50 border-emerald-200 text-emerald-900'
          }`}>
            <Footprints className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">
                {calculations.needsFootrestRecommendation ? 'Apoio para Pés Necessário:' : 'Pés no Piso Sem Restrições:'}
              </span>
              <p className="mt-0.5 leading-relaxed">{calculations.footrestExplanation}</p>
            </div>
          </div>
        </div>

        {/* Detailed Ergonomic Measurement Cards */}
        <div className="lg:col-span-5 space-y-3.5">
          {/* Chair Height Card */}
          <div className="bg-white rounded-xl p-4 border border-stone-200 shadow-xs hover:border-emerald-300 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">1. Assento da Cadeira</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                Piso ao assento
              </span>
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-extrabold text-stone-900">{calculations.chairSeatHeight}</span>
              <span className="text-sm font-semibold text-stone-500">cm</span>
            </div>
            <p className="text-xs text-stone-600 mt-1">
              Regule a alavanca do pistão até seus joelhos formarem 90° e toda a sola do pé encostar no chão sem pressão atrás da coxa.
            </p>
          </div>

          {/* Desk Height Card */}
          <div className="bg-white rounded-xl p-4 border border-stone-200 shadow-xs hover:border-emerald-300 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">2. Altura da Mesa de Trabalho</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-stone-100 text-stone-800">
                {profile.postureMode === 'standing' ? 'Em pé' : 'Sentado'}
              </span>
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-extrabold text-stone-900">
                {profile.postureMode === 'standing' ? calculations.deskHeightStanding : calculations.deskHeightSitting}
              </span>
              <span className="text-sm font-semibold text-stone-500">cm</span>
              {profile.deskType === 'fixed' && (
                <span className="text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 ml-auto">
                  Mesa fixa: ~75 cm
                </span>
              )}
            </div>
            <p className="text-xs text-stone-600 mt-1">
              Os cotovelos devem descansar na mesma linha da mesa (90° a 100°), com os antebraços apoiados sem erguer os ombros.
            </p>
          </div>

          {/* Monitor Height Card */}
          <div className="bg-white rounded-xl p-4 border border-stone-200 shadow-xs hover:border-emerald-300 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">3. Topo do Monitor / Tela</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-sky-100 text-sky-800">
                Alinhado aos olhos
              </span>
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-extrabold text-stone-900">
                {profile.postureMode === 'standing' ? calculations.monitorTopHeightStanding : calculations.monitorTopHeightSitting}
              </span>
              <span className="text-sm font-semibold text-stone-500">cm do chão</span>
            </div>
            <p className="text-xs text-stone-600 mt-1">
              A borda superior do monitor deve coincidir com a linha horizontal dos seus olhos. O olhar desce naturalmente 15° sem dobrar o pescoço.
            </p>
          </div>

          {/* Screen Distance Card */}
          <div className="bg-white rounded-xl p-4 border border-stone-200 shadow-xs hover:border-emerald-300 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">4. Distância da Tela</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-stone-100 text-stone-700">
                Comprimento do braço
              </span>
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-extrabold text-stone-900">
                {calculations.monitorDistanceCm.min} a {calculations.monitorDistanceCm.max}
              </span>
              <span className="text-sm font-semibold text-stone-500">cm</span>
            </div>
            <p className="text-xs text-stone-600 mt-1">
              Estenda o braço para frente: a ponta dos dedos deve quase tocar a tela. Se as letras estiverem pequenas, aumente o zoom da tela, não projete a cabeça.
            </p>
          </div>

          {/* Armrest Card */}
          <div className="bg-white rounded-xl p-4 border border-stone-200 shadow-xs hover:border-emerald-300 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">5. Apoios de Braço</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-stone-100 text-stone-700">
                Acima do assento
              </span>
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-extrabold text-stone-900">{calculations.armrestHeightAboveSeat}</span>
              <span className="text-sm font-semibold text-stone-500">cm</span>
            </div>
            <p className="text-xs text-stone-600 mt-1">
              Ajuste para sustentarem os cotovelos sem empurrar os ombros para cima. Devem caber sob a mesa para você sentar perto do teclado.
            </p>
          </div>
        </div>
      </div>

      {/* Practical Setup Guidance Guide for Common Scenarios */}
      <div className="bg-stone-900 text-stone-100 rounded-2xl p-6 border border-stone-800 shadow-lg">
        <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
          <Monitor className="w-5 h-5 text-emerald-400" />
          Guia de Adaptação Rápida para o seu Posto
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-stone-800/80 p-4 rounded-xl border border-stone-700">
            <h4 className="text-sm font-bold text-amber-400 mb-1">Se você usa Notebook:</h4>
            <p className="text-xs text-stone-300 leading-relaxed">
              O notebook nunca deve ser usado diretamente sobre a mesa por mais de 1 hora. Use um suporte articulado ou pilha de livros para subir a tela na linha dos olhos e conecte <strong>teclado e mouse externos</strong>.
            </p>
          </div>

          <div className="bg-stone-800/80 p-4 rounded-xl border border-stone-700">
            <h4 className="text-sm font-bold text-emerald-400 mb-1">Se a mesa for muito alta:</h4>
            <p className="text-xs text-stone-300 leading-relaxed">
              Suba a cadeira até os cotovelos formarem 90° com o tampo da mesa. Em seguida, coloque uma caixa firme ou <strong>apoio ergonômico com inclinação de 15°</strong> sob os pés para não trancar o retorno venoso.
            </p>
          </div>

          <div className="bg-stone-800/80 p-4 rounded-xl border border-stone-700">
            <h4 className="text-sm font-bold text-sky-400 mb-1">Se a cadeira não tem apoio lombar:</h4>
            <p className="text-xs text-stone-300 leading-relaxed">
              Enrole uma toalha de banho média formando um rolo cilíndrico de cerca de 10 cm de diâmetro e posicione na curvatura da sua cintura (lombar). Isso restaura a lordose fisiológica e elimina pressão nos discos.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
