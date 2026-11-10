import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  Send,
  Sparkles,
  RotateCcw,
  Copy,
  Check,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Scale,
  ShieldCheck,
  Home,
  ChevronDown,
  Info,
  Loader2,
} from 'lucide-react';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  source?: string;
}

export interface PropertyChatContext {
  neighborhood?: string;
  ward?: string;
  bedrooms?: number;
  currentLease?: number;
  airbnbPrice?: number;
  isPrimaryResidence?: boolean;
  isHosted?: boolean;
}

interface ProConChatbotProps {
  context?: PropertyChatContext;
  onNavigateToCalculator?: () => void;
  onNavigateToRegulations?: () => void;
  isEmbedded?: boolean;
  onClose?: () => void;
}

const DEFAULT_PROMPTS = [
  {
    icon: Scale,
    title: 'Why does lease win?',
    text: 'Why does a long-term lease win over Airbnb unhosted for my property?',
  },
  {
    icon: Home,
    title: 'What if I host 365 days?',
    text: 'What if I host 365 days (e.g. English basement or on-site hosted) compared to a lease?',
  },
  {
    icon: ShieldCheck,
    title: 'What licenses do I need?',
    text: 'What licenses and legal requirements do I need to operate short-term rental legally in DC?',
  },
  {
    icon: AlertTriangle,
    title: 'How does TOPA affect my home?',
    text: 'How does the Tenant Opportunity to Purchase Act (TOPA) affect my property if I do a long-term lease?',
  },
];

export const ProConChatbot: React.FC<ProConChatbotProps> = ({
  context,
  onNavigateToCalculator,
  onNavigateToRegulations,
  isEmbedded = false,
  onClose,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome',
      role: 'assistant',
      content: `### Welcome to the DC Rental Intelligence Pro/Con Advisor

I'm your dedicated housing strategist, calibrated specifically for Washington D.C.'s 2026 Short-Term Rental Regulations (Law 22-307) and tenant housing laws.

${
  context?.neighborhood
    ? `**Active Context:** Currently analyzing your **${context.bedrooms ?? 1}-bedroom** in **${context.neighborhood}** (${context.ward ?? 'Ward 2'}) with a **$${(context.currentLease ?? 2450).toLocaleString()}/mo** long-term lease baseline vs. **$${(context.airbnbPrice ?? 210).toLocaleString()}/nt** estimated Airbnb rate.`
    : `Tell me about your property, or pick an inquiry below to weigh the strategic, financial, and regulatory trade-offs!`
}

How can I help you evaluate your rental options today?`,
      timestamp: new Date(),
      source: 'dc-rental-intelligence-engine',
    },
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showContextBar, setShowContextBar] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSendMessage = async (textToSend?: string) => {
    const messageContent = (textToSend || input).trim();
    if (!messageContent || loading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: messageContent,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          context,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const data = await response.json();
      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.content || 'Unable to generate response.',
        timestamp: new Date(),
        source: data.source || 'gemini-3.8-flash',
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error('Chat error:', err);
      // Fallback response in case server is unreachable
      const fallbackMsg: ChatMessage = {
        id: `fallback-${Date.now()}`,
        role: 'assistant',
        content: `### ⚖️ Quick Pro/Con Breakdown for ${context?.neighborhood || 'Washington, D.C.'}

**Short-Term Rental (Airbnb) Pros:**
- Peak nightly earnings during spring/fall events.
- Complete personal flexibility to block dates.
- No long-term tenant court possession risk.

**Short-Term Rental (Airbnb) Cons:**
- **Strict 90-Day Unhosted Cap** under DC Law 22-307 unless host stays on-site overnight.
- 15–20% operational costs for cleanings and supplies.
- 14.95% DC transient accommodation tax.

**Long-Term Lease Pros:**
- Guaranteed 12-month steady cash flow without seasonal vacancy.
- Zero statutory night caps.
- Tenant covers most utility costs.

**Long-Term Lease Cons:**
- Locked-in rent rate under DC lease terms.
- Subject to DC tenant eviction protections and TOPA procedures.`,
        timestamp: new Date(),
        source: 'offline-failsafe',
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleReset = () => {
    setMessages([
      {
        id: 'welcome-reset',
        role: 'assistant',
        content: `Conversation refreshed. What specific property question or scenario would you like to analyze?`,
        timestamp: new Date(),
        source: 'dc-rental-intelligence-engine',
      },
    ]);
  };

  // Helper to format assistant markdown nicely with highlighted headings and lists
  const renderFormattedContent = (content: string) => {
    const lines = content.split('\n');
    return (
      <div className="space-y-2.5 text-xs sm:text-sm leading-relaxed text-[#2A2320]">
        {lines.map((line, idx) => {
          const trimmed = line.trim();

          // Section header (h3 or h4)
          if (trimmed.startsWith('###')) {
            return (
              <h4 key={idx} className="text-base font-bold text-[#2A2320] mt-3 mb-1 border-b border-[#E6DFD5] pb-1 flex items-center space-x-1.5">
                <span>{trimmed.replace(/^#+\s*/, '')}</span>
              </h4>
            );
          }
          if (trimmed.startsWith('####')) {
            const isPros = trimmed.toLowerCase().includes('pro');
            const isCons = trimmed.toLowerCase().includes('con');
            return (
              <h5
                key={idx}
                className={`text-xs font-bold uppercase tracking-wider mt-2.5 mb-1 px-2 py-0.5 rounded-md inline-flex items-center space-x-1 ${
                  isPros
                    ? 'bg-[#4A6B5D]/15 text-[#375347] border border-[#4A6B5D]/30'
                    : isCons
                    ? 'bg-[#E08E6D]/20 text-[#C97251] border border-[#E08E6D]/40'
                    : 'bg-[#E6DFD5]/40 text-[#2A2320]'
                }`}
              >
                <span>{trimmed.replace(/^#+\s*/, '')}</span>
              </h5>
            );
          }

          // Horizontal rule
          if (trimmed === '---') {
            return <hr key={idx} className="my-2 border-[#E6DFD5]" />;
          }

          // Bullet points
          if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            const bulletText = trimmed.replace(/^[-*]\s*/, '');
            // Highlight bold lead
            const parts = bulletText.split(/(\*\*.*?\*\*)/g);
            return (
              <div key={idx} className="flex items-start space-x-2 pl-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#E08E6D] mt-2 shrink-0" />
                <p className="flex-1 text-[#2A2320]">
                  {parts.map((p, pIdx) => {
                    if (p.startsWith('**') && p.endsWith('**')) {
                      return (
                        <strong key={pIdx} className="font-semibold text-[#2A2320]">
                          {p.slice(2, -2)}
                        </strong>
                      );
                    }
                    return p;
                  })}
                </p>
              </div>
            );
          }

          // Regular paragraph
          if (trimmed.length > 0) {
            const parts = trimmed.split(/(\*\*.*?\*\*)/g);
            return (
              <p key={idx} className="text-[#3A3330]">
                {parts.map((p, pIdx) => {
                  if (p.startsWith('**') && p.endsWith('**')) {
                    return (
                      <strong key={pIdx} className="font-semibold text-[#2A2320]">
                        {p.slice(2, -2)}
                      </strong>
                    );
                  }
                  return p;
                })}
              </p>
            );
          }

          return null;
        })}
      </div>
    );
  };

  return (
    <div
      className={`flex flex-col bg-[#FAF7F2] border border-[#E6DFD5] rounded-2xl shadow-xs overflow-hidden ${
        isEmbedded ? 'h-[620px]' : 'min-h-[720px]'
      }`}
    >
      {/* 1. Header Toolbar */}
      <div className="bg-[#FAF7F2] border-b border-[#E6DFD5] p-3.5 sm:p-4 flex items-center justify-between gap-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#E08E6D]/15 border border-[#E08E6D]/40 flex items-center justify-center text-[#C97251] shadow-xs">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm sm:text-base font-bold text-[#2A2320]">
                DC Rental Pro/Con Advisor
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#4A6B5D]/15 text-[#375347] border border-[#4A6B5D]/30 flex items-center space-x-1">
                <Sparkles className="w-2.5 h-2.5" />
                <span>AI-Powered</span>
              </span>
            </div>
            <p className="text-[11px] text-[#5A524C] truncate">
              Objective trade-off analysis · Law 22-307 & TOPA calibrated
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-1.5">
          <button
            type="button"
            onClick={handleReset}
            className="p-1.5 text-[#5A524C] hover:text-[#2A2320] hover:bg-[#F4EFE6] rounded-lg transition-colors cursor-pointer"
            title="Clear & restart conversation"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-[#5A524C] hover:text-[#2A2320] hover:bg-[#F4EFE6] rounded-lg transition-colors cursor-pointer"
              title="Close chatbot"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* 2. Active Context Banner */}
      {context?.neighborhood && (
        <div className="bg-[#FAF0EB]/70 border-b border-[#E08E6D]/30 px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-2 text-[#5A524C]">
            <Info className="w-3.5 h-3.5 text-[#E08E6D] shrink-0" />
            <span>
              Analyzing: <strong className="text-[#2A2320]">{context.neighborhood}</strong> ({context.ward || 'DC'}) ·{' '}
              <strong className="text-[#2A2320]">{context.bedrooms || 1} Bed</strong> · Lease:{' '}
              <strong className="text-[#4A6B5D]">${(context.currentLease || 2450).toLocaleString()}/mo</strong> · Airbnb:{' '}
              <strong className="text-[#E08E6D]">${(context.airbnbPrice || 210).toLocaleString()}/nt</strong>
            </span>
          </div>

          <div className="flex items-center space-x-2 text-[11px]">
            {onNavigateToCalculator && (
              <button
                type="button"
                onClick={onNavigateToCalculator}
                className="text-[#E08E6D] hover:underline font-semibold flex items-center space-x-1 cursor-pointer"
              >
                <span>Open Calculator</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* 3. Message Stream */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[92%] sm:max-w-[85%] rounded-2xl p-3.5 sm:p-4 shadow-xs relative group ${
                m.role === 'user'
                  ? 'bg-[#2A2320] text-white rounded-br-xs'
                  : 'bg-[#FFFFFF] border border-[#E6DFD5] text-[#2A2320] rounded-bl-xs'
              }`}
            >
              {m.role === 'user' ? (
                <p className="text-xs sm:text-sm whitespace-pre-wrap leading-relaxed">{m.content}</p>
              ) : (
                <>
                  {renderFormattedContent(m.content)}
                  {/* Action Bar for Assistant Messages */}
                  <div className="mt-3 pt-2 border-t border-[#E6DFD5]/60 flex flex-wrap items-center justify-between text-[11px] text-[#5A524C] gap-2">
                    <span className="text-[10px] uppercase tracking-wider text-[#5A524C]/70 font-mono">
                      {m.source === 'gemini-3.8-flash' ? 'Gemini 3.8 Flash' : 'DC Intelligence Engine'}
                    </span>

                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => handleCopy(m.id, m.content)}
                        className="hover:text-[#2A2320] flex items-center space-x-1 transition-colors cursor-pointer"
                        title="Copy answer"
                      >
                        {copiedId === m.id ? (
                          <>
                            <Check className="w-3 h-3 text-[#4A6B5D]" />
                            <span className="text-[#4A6B5D] font-semibold">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>

                      {onNavigateToCalculator && (
                        <button
                          type="button"
                          onClick={onNavigateToCalculator}
                          className="hover:text-[#E08E6D] font-medium flex items-center space-x-0.5 cursor-pointer ml-1"
                        >
                          <span>Compare Profit</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
            <span className="text-[10px] text-[#5A524C] mt-1 px-1 font-mono">
              {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        ))}

        {loading && (
          <div className="flex items-start space-x-2">
            <div className="bg-[#FFFFFF] border border-[#E6DFD5] rounded-2xl rounded-bl-xs p-3.5 shadow-xs flex items-center space-x-2.5 text-xs text-[#5A524C]">
              <Loader2 className="w-4 h-4 text-[#E08E6D] animate-spin" />
              <span>Weighing DC housing laws, occupancy caps, and revenue models...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 4. Suggested Inquiry Pills (Only show if few messages) */}
      {messages.length <= 3 && (
        <div className="px-4 py-2 bg-[#FAF7F2] border-t border-[#E6DFD5]/70">
          <p className="text-[11px] font-semibold text-[#5A524C] mb-1.5 flex items-center space-x-1">
            <Sparkles className="w-3 h-3 text-[#E08E6D]" />
            <span>Suggested Questions:</span>
          </p>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {DEFAULT_PROMPTS.map((prompt, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSendMessage(prompt.text)}
                disabled={loading}
                className="whitespace-nowrap px-3 py-1.5 bg-[#FAF0EB] hover:bg-[#E08E6D]/20 text-[#2A2320] text-xs rounded-xl border border-[#E08E6D]/30 transition-all font-medium cursor-pointer shrink-0 disabled:opacity-50"
              >
                {prompt.title}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 5. Input Bar */}
      <div className="p-3 sm:p-4 bg-[#FFFFFF] border-t border-[#E6DFD5]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center space-x-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about pros/cons, 90-day unhosted cap, TOPA, or English basements..."
            disabled={loading}
            className="flex-1 bg-[#FAF7F2] border border-[#E6DFD5] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-[#2A2320] placeholder-[#746B63]/60 focus:outline-none focus:border-[#E08E6D] transition-colors"
          />

          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="px-4 py-2.5 bg-[#E08E6D] hover:bg-[#C97251] disabled:opacity-40 text-white rounded-xl text-xs sm:text-sm font-semibold flex items-center space-x-1.5 transition-all shadow-xs cursor-pointer"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Send</span>
                <Send className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        <p className="text-[10px] text-[#5A524C] mt-2 text-center">
          Pro/Con Advisor provides economic & regulatory orientation. Consult a licensed DC attorney and tax CPA for binding legal counsel.
        </p>
      </div>
    </div>
  );
};
