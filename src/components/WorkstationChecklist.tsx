import React, { useState } from 'react';
import { ChecklistCategory, ChecklistItem } from '../types';
import { 
  CheckSquare, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  AlertTriangle, 
  ShieldCheck, 
  RotateCcw, 
  Sparkles,
  ChevronDown,
  ChevronUp,
  FileCheck
} from 'lucide-react';

interface WorkstationChecklistProps {
  checklist: ChecklistItem[];
  setChecklist: React.Dispatch<React.SetStateAction<ChecklistItem[]>>;
  onAskAiWithChecklist: (summary: string) => void;
}

export const WorkstationChecklist: React.FC<WorkstationChecklistProps> = ({
  checklist,
  setChecklist,
  onAskAiWithChecklist,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showCriticalOnly, setShowCriticalOnly] = useState<boolean>(false);
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);

  const handleStatusChange = (id: string, newStatus: 'ok' | 'needs_fix') => {
    setChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
    );
  };

  const handleMarkAllOk = () => {
    setChecklist((prev) => prev.map((item) => ({ ...item, status: 'ok' })));
  };

  const handleResetChecklist = () => {
    setChecklist((prev) => prev.map((item) => ({ ...item, status: 'unanswered' })));
  };

  // Score Calculation
  const totalItems = checklist.length;
  const okItems = checklist.filter((i) => i.status === 'ok').length;
  const fixItems = checklist.filter((i) => i.status === 'needs_fix').length;
  const answeredCount = okItems + fixItems;

  const scorePercentage = answeredCount > 0 ? Math.round((okItems / totalItems) * 100) : 0;

  // Rating badge
  let ratingLabel = 'Não Avaliado';
  let ratingColor = 'text-stone-600 bg-stone-100 border-stone-300';
  if (answeredCount > 0) {
    if (scorePercentage >= 85) {
      ratingLabel = 'Excelente (Conforme NR-17)';
      ratingColor = 'text-emerald-800 bg-emerald-100 border-emerald-300';
    } else if (scorePercentage >= 70) {
      ratingLabel = 'Bom (Requer Pequenos Ajustes)';
      ratingColor = 'text-blue-800 bg-blue-100 border-blue-300';
    } else if (scorePercentage >= 50) {
      ratingLabel = 'Atenção (Risco Ergonômico Moderado)';
      ratingColor = 'text-amber-800 bg-amber-100 border-amber-300';
    } else {
      ratingLabel = 'Crítico (Alto Risco de LER/DORT)';
      ratingColor = 'text-rose-800 bg-rose-100 border-rose-300';
    }
  }

  // Filtering
  const filteredItems = checklist.filter((item) => {
    if (showCriticalOnly && item.status !== 'needs_fix') return false;
    if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
    return true;
  });

  const generateReportSummary = () => {
    const issues = checklist
      .filter((i) => i.status === 'needs_fix')
      .map((i) => `- [${i.title}]: ${i.tip}`)
      .join('\n');

    return `Relatório de Auditoria Ergonômica NR-17:
- Pontuação do Posto: ${scorePercentage}% (${okItems} de ${totalItems} itens conformes)
- Classificação: ${ratingLabel}

Itens que precisam de correção urgente:
${issues || 'Nenhum ponto crítico pendente. Posto em conformidade!'}`;
  };

  return (
    <div className="space-y-8">
      {/* Score and Header Card */}
      <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              Auditoria de Conformidade • NR-17 Brasil
            </span>
            <h2 className="text-2xl font-bold text-stone-900 mt-2">
              Checklist Ergonômico do Posto de Trabalho
            </h2>
            <p className="text-sm text-stone-600 mt-1 max-w-2xl">
              Avalie cada elemento do seu ambiente de trabalho para identificar armadilhas posturais que geram tendinites, bursites e contraturas musculares crônicas.
            </p>
          </div>

          {/* Quick Score Circle / Gauge */}
          <div className="flex items-center gap-4 bg-stone-50 p-4 rounded-2xl border border-stone-200 shrink-0">
            <div className="text-center">
              <span className="text-3xl font-extrabold text-stone-900 font-mono">
                {scorePercentage}%
              </span>
              <span className="text-[11px] text-stone-500 block uppercase font-bold">
                Conformidade
              </span>
            </div>

            <div className="h-10 w-px bg-stone-300" />

            <div>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-md border block text-center ${ratingColor}`}>
                {ratingLabel}
              </span>
              <span className="text-[11px] text-stone-500 mt-1 block text-center">
                {okItems} conformes • {fixItems} para corrigir
              </span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-6 pt-6 border-t border-stone-100">
          <div className="flex justify-between text-xs text-stone-500 mb-1.5 font-medium">
            <span>Progresso da Avaliação ({answeredCount} de {totalItems} respondidos)</span>
            <span>{Math.round((answeredCount / totalItems) * 100)}% concluído</span>
          </div>
          <div className="w-full h-2.5 bg-stone-100 rounded-full overflow-hidden flex">
            <div
              className="bg-emerald-600 transition-all duration-300"
              style={{ width: `${(okItems / totalItems) * 100}%` }}
              title="Itens conformes"
            />
            <div
              className="bg-rose-500 transition-all duration-300"
              style={{ width: `${(fixItems / totalItems) * 100}%` }}
              title="Itens precisando de correção"
            />
          </div>
        </div>

        {/* Actions Bar */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 pt-4 border-t border-stone-100">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleMarkAllOk}
              className="text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 px-3 py-1.5 rounded-lg transition-colors"
            >
              Marcar todos como Conformes
            </button>
            <button
              type="button"
              onClick={handleResetChecklist}
              className="text-xs font-semibold text-stone-600 hover:text-stone-900 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Resetar</span>
            </button>
          </div>

          <button
            id="ask-ai-checklist-btn"
            type="button"
            onClick={() => onAskAiWithChecklist(generateReportSummary())}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors shadow-xs"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Gerar Parecer Ergonômico com IA</span>
          </button>
        </div>
      </div>

      {/* Category Pills and Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'all', label: 'Todos os Itens' },
            { id: 'screen', label: 'Monitor & Visão' },
            { id: 'chair', label: 'Cadeira & Assento' },
            { id: 'desk_peripherals', label: 'Mesa & Periféricos' },
            { id: 'body_posture', label: 'Postura Corporal' },
            { id: 'environment', label: 'Ambiente & Luz' },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-emerald-600 text-white font-semibold'
                  : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Toggle show critical only */}
        <button
          type="button"
          onClick={() => setShowCriticalOnly(!showCriticalOnly)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
            showCriticalOnly
              ? 'bg-rose-50 border-rose-300 text-rose-800'
              : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
          <span>Apenas pendências ({fixItems})</span>
        </button>
      </div>

      {/* List of Checklist Questions */}
      <div className="space-y-3">
        {filteredItems.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 border border-stone-200 text-center">
            <FileCheck className="w-12 h-12 text-emerald-600 mx-auto mb-2 opacity-80" />
            <h4 className="text-base font-bold text-stone-900">Nenhum item nesta visualização</h4>
            <p className="text-xs text-stone-500 mt-1">
              Todos os itens deste filtro estão conformes ou desmarcados.
            </p>
          </div>
        ) : (
          filteredItems.map((item) => {
            const isExpanded = expandedItemId === item.id;
            return (
              <div
                key={item.id}
                className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden ${
                  item.status === 'ok'
                    ? 'border-emerald-200 bg-emerald-50/20'
                    : item.status === 'needs_fix'
                    ? 'border-rose-200 bg-rose-50/20'
                    : 'border-stone-200'
                }`}
              >
                <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-stone-600 bg-stone-100 px-2 py-0.5 rounded">
                        {item.nr17Ref || 'Diretriz NR-17'}
                      </span>
                      {item.importance === 'high' && (
                        <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">
                          Crítico
                        </span>
                      )}
                    </div>

                    <h4 className="text-sm font-bold text-stone-900 mt-1">
                      {item.title}
                    </h4>
                    <p className="text-xs text-stone-600 mt-0.5 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  {/* Yes / No Toggle Buttons */}
                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <button
                      type="button"
                      onClick={() => handleStatusChange(item.id, 'ok')}
                      className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
                        item.status === 'ok'
                          ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                          : 'bg-white border-stone-200 text-stone-700 hover:bg-emerald-50 hover:text-emerald-800'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Conforme</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleStatusChange(item.id, 'needs_fix')}
                      className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
                        item.status === 'needs_fix'
                          ? 'bg-rose-600 border-rose-600 text-white shadow-xs'
                          : 'bg-white border-stone-200 text-stone-700 hover:bg-rose-50 hover:text-rose-800'
                      }`}
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Precisa Ajuste</span>
                    </button>

                    {/* Expand Tip Button */}
                    <button
                      type="button"
                      onClick={() => setExpandedItemId(isExpanded ? null : item.id)}
                      className="p-2 rounded-xl border border-stone-200 text-stone-500 hover:bg-stone-100 transition-colors"
                      title="Ver orientação prática"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Practical Tip Accordion */}
                {isExpanded && (
                  <div className="px-5 py-3.5 bg-stone-50 border-t border-stone-200 text-xs text-stone-700 flex items-start gap-2.5">
                    <HelpCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block text-stone-900">
                        Como resolver na prática:
                      </span>
                      <p className="mt-0.5 leading-relaxed">{item.tip}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
