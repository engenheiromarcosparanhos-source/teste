import React from 'react';
import { 
  Calculator, 
  Clock, 
  Activity, 
  CheckSquare, 
  AlertCircle, 
  Sparkles,
  Volume2,
  VolumeX,
  ShieldCheck
} from 'lucide-react';

export type ActiveTab = 'calculator' | 'timer' | 'stretches' | 'checklist' | 'discomfort' | 'ai_advisor';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isSoundEnabled: boolean;
  setIsSoundEnabled: (enabled: boolean) => void;
  breaksCompletedCount: number;
  timerActive: boolean;
  timerFormatted: string;
}

interface NavItem {
  id: ActiveTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  highlight?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  isSoundEnabled,
  setIsSoundEnabled,
  breaksCompletedCount,
  timerActive,
  timerFormatted,
}) => {
  const navItems: NavItem[] = [
    { id: 'calculator', label: 'Calculadora de Alturas', icon: Calculator },
    { id: 'timer', label: 'Pausas & 20-20-20', icon: Clock, badge: timerActive ? timerFormatted : undefined },
    { id: 'stretches', label: 'Ginástica & Alongamentos', icon: Activity },
    { id: 'checklist', label: 'Checklist NR-17', icon: CheckSquare },
    { id: 'discomfort', label: 'Mapa de Desconforto', icon: AlertCircle },
    { id: 'ai_advisor', label: 'Consultoria IA', icon: Sparkles, highlight: true },
  ];

  return (
    <header className="sticky top-0 z-40 bg-stone-900 text-stone-100 border-b border-stone-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight text-white">Ergonomia Viva</h1>
                <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/60">
                  NR-17 & Postura
                </span>
              </div>
              <p className="text-xs text-stone-400 hidden sm:block">
                Posto de trabalho inteligente, prevenção de LER/DORT e bem-estar
              </p>
            </div>
          </div>

          {/* Quick status & Sound toggle */}
          <div className="flex items-center gap-3">
            {/* Breaks counter badge */}
            <div 
              title="Pausas ativas realizadas hoje"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-stone-800 border border-stone-700 text-xs text-stone-300"
            >
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-medium">{breaksCompletedCount}</span>
              <span className="hidden md:inline text-stone-400">pausas hoje</span>
            </div>

            {/* Sound toggle button */}
            <button
              id="sound-toggle-btn"
              type="button"
              onClick={() => setIsSoundEnabled(!isSoundEnabled)}
              title={isSoundEnabled ? 'Som ativado (clique para silenciar)' : 'Som desativado'}
              className={`p-2 rounded-lg border transition-colors ${
                isSoundEnabled 
                  ? 'bg-stone-800 border-stone-700 text-emerald-400 hover:bg-stone-700' 
                  : 'bg-stone-800/50 border-stone-800 text-stone-500 hover:text-stone-300'
              }`}
            >
              {isSoundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Tab Navigation Menu */}
        <nav className="flex space-x-1 overflow-x-auto py-2 border-t border-stone-800/80 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                id={`nav-tab-${item.id}`}
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3 py-2 text-xs sm:text-sm font-medium rounded-lg whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-sm font-semibold'
                    : 'text-stone-300 hover:bg-stone-800 hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : item.highlight ? 'text-amber-400' : 'text-stone-400'}`} />
                <span>{item.label}</span>
                {item.badge && (
                  <span className="ml-1 px-1.5 py-0.5 text-[10px] rounded-full bg-emerald-800 text-emerald-200 border border-emerald-600 font-mono">
                    {item.badge}
                  </span>
                )}
                {item.highlight && !isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
