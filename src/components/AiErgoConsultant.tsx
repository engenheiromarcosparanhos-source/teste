import React, { useState } from 'react';
import { UserErgoProfile } from '../types';
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  Loader2, 
  CheckCircle, 
  AlertCircle, 
  Lightbulb,
  Trash2
} from 'lucide-react';

interface AiErgoConsultantProps {
  userProfile: UserErgoProfile;
  initialPrompt?: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

const QUICK_PROMPTS = [
  'Uso notebook o dia todo na mesa de jantar. Como adaptar sem gastar muito?',
  'Sinto dor no pescoço e queimação no trapézio toda tarde.',
  'Qual a diferença entre LER e DORT e como prevenir na digitação?',
  'Como regular minha cadeira e apoios de braço para não forçar os ombros?',
  'Trabalhar em pé (standing desk) realmente ajuda a coluna? Como começar?',
  'Sinto formigamento nos punhos e dedos ao usar o mouse.',
];

export const AiErgoConsultant: React.FC<AiErgoConsultantProps> = ({
  userProfile,
  initialPrompt,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Olá! Sou seu **Consultor Ergonômico Inteligente**, guiado pelas normas da **NR-17** e biomecânica preventiva.\n\nVocê pode me perguntar sobre regulagens de cadeira, dores no pescoço/lombar, adaptações para home office, prevenção de LER/DORT ou soluções caseiras.\n\nComo posso ajudar a melhorar sua saúde e conforto no posto de trabalho hoje?`,
      timestamp: 'Agora',
    },
  ]);

  const [inputQuery, setInputQuery] = useState<string>(initialPrompt || '');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const sendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputQuery).trim();
    if (!query || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputQuery('');
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const response = await fetch('/api/ergonomia/consultar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pergunta: query,
          contexto: {
            alturaUsuario: `${userProfile.heightCm} cm`,
            calcado: `${userProfile.shoeHeelCm} cm`,
            modoTrabalho: userProfile.postureMode,
            tipoMesa: userProfile.deskType,
            dispositivo: userProfile.primaryDevice,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Erro na resposta do servidor (${response.status})`);
      }

      const data = await response.json();
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.resposta || 'Não foi possível obter uma resposta adequada.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err: any) {
      console.error('Erro ao consultar IA ergonômica:', err);
      setErrorMsg('Não foi possível conectar com o assistente no momento. Tente novamente em instantes.');
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: `Chat limpo. Estou pronto para ajudar com dúvidas sobre seu posto de trabalho ou dores posturais!`,
        timestamp: 'Agora',
      },
    ]);
  };

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              Consultoria Especializada em Ergonomia • NR-17
            </span>
            <h2 className="text-2xl font-bold text-stone-900 mt-2">
              Assistente de Ergonomia & Postura
            </h2>
            <p className="text-sm text-stone-600 mt-1 max-w-2xl">
              Tire dúvidas específicas sobre seu posto, relate dores musculares para receber adaptações imediatas e aprenda a ajustar seus equipamentos.
            </p>
          </div>

          <button
            type="button"
            onClick={clearChat}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200 text-stone-500 hover:text-stone-800 text-xs font-semibold hover:bg-stone-50 transition-colors self-start sm:self-center"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Limpar conversa</span>
          </button>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="mt-4 pt-4 border-t border-stone-100">
          <span className="text-xs font-bold text-stone-500 flex items-center gap-1.5 mb-2">
            <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
            Dúvidas frequentes (clique para perguntar):
          </span>
          <div className="flex flex-wrap gap-2">
            {QUICK_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => sendMessage(prompt)}
                className="text-xs text-stone-700 bg-stone-50 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-200 border border-stone-200 px-3 py-1.5 rounded-lg transition-all text-left"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chat Messages Container */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm flex flex-col h-[520px] overflow-hidden">
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {messages.map((msg) => {
            const isBot = msg.role === 'assistant';
            return (
              <div
                key={msg.id}
                className={`flex items-start gap-3 ${isBot ? '' : 'flex-row-reverse'}`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                    isBot
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : 'bg-stone-800 text-white'
                  }`}
                >
                  {isBot ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>

                <div
                  className={`max-w-2xl rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                    isBot
                      ? 'bg-stone-50 border border-stone-200 text-stone-800 whitespace-pre-line'
                      : 'bg-emerald-600 text-white shadow-xs'
                  }`}
                >
                  {msg.content}
                  <span
                    className={`block text-[10px] mt-2 font-mono ${
                      isBot ? 'text-stone-400' : 'text-emerald-200 text-right'
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 flex items-center gap-2 text-xs text-stone-600">
                <Loader2 className="w-4 h-4 text-emerald-600 animate-spin" />
                <span>Analisando parâmetros ergonômicos e diretrizes da NR-17...</span>
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-stone-50 border-t border-stone-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Descreva sua dor ou faça uma pergunta sobre ergonomia..."
              disabled={isLoading}
              className="flex-1 px-4 py-3 text-xs sm:text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
            />

            <button
              type="submit"
              disabled={isLoading || !inputQuery.trim()}
              className="px-5 py-3 rounded-xl bg-emerald-600 text-white font-bold text-xs sm:text-sm hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 shrink-0 shadow-xs"
            >
              <span>Enviar</span>
              <Send className="w-4 h-4" />
            </button>
          </form>
          <span className="text-[11px] text-stone-500 block mt-2 text-center">
            Suas respostas consideram sua altura configurada ({userProfile.heightCm} cm) e tipo de mesa.
          </span>
        </div>
      </div>
    </div>
  );
};
