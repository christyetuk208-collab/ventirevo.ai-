import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Sparkles,
  Send,
  Plus,
  RotateCcw,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Brain,
  ShieldCheck,
  ChevronDown,
  ArrowRight,
  Layers,
  Zap,
  Clock,
  ExternalLink,
  MessageSquare,
  Trash2,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { AIConversation, AIMessage, AICitation } from '../../types';

interface AskVenturevoViewProps {
  initialPrompt?: string;
  onNavigateToGrowth?: () => void;
}

export const AskVenturevoView: React.FC<AskVenturevoViewProps> = ({ initialPrompt, onNavigateToGrowth }) => {
  const { user, token, activeBusiness, activeProfile } = useAuth();
  const [conversations, setConversations] = useState<AIConversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [inputPrompt, setInputPrompt] = useState(initialPrompt || '');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [taskAddedMessageId, setTaskAddedMessageId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingText]);

  // Load conversations
  const fetchConversations = async () => {
    if (!token || !activeBusiness) return;
    try {
      const res = await fetch(`/api/businesses/${activeBusiness.id}/conversations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setConversations(data);
        if (data.length > 0 && !activeConvId) {
          setActiveConvId(data[0].id);
          fetchMessages(data[0].id);
        }
      }
    } catch (e) {
      console.error('Error fetching conversations:', e);
    }
  };

  const fetchMessages = async (convId: string) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/conversations/${convId}/messages`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch (e) {
      console.error('Error fetching messages:', e);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [activeBusiness, token]);

  const handleSelectConversation = (convId: string) => {
    setActiveConvId(convId);
    fetchMessages(convId);
  };

  const handleNewConversation = async () => {
    if (!token || !activeBusiness) return;
    try {
      const res = await fetch(`/api/businesses/${activeBusiness.id}/conversations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title: 'New Growth Strategy Session' }),
      });
      if (res.ok) {
        const newConv = await res.json();
        setConversations((prev) => [newConv, ...prev]);
        setActiveConvId(newConv.id);
        setMessages([]);
      }
    } catch (e) {
      console.error('Error creating conversation:', e);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputPrompt;
    if (!text.trim() || isStreaming || !token || !activeBusiness) return;

    setError(null);
    setInputPrompt('');
    setIsStreaming(true);
    setStreamingText('');

    const userMsg: AIMessage = {
      id: `temp_user_${Date.now()}`,
      conversation_id: activeConvId || 'temp',
      role: 'user',
      content: text,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const response = await fetch('/api/ai/chat/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          business_id: activeBusiness.id,
          conversation_id: activeConvId,
          message: text,
        }),
      });

      if (!response.ok) {
        throw new Error('Server returned an error for the AI stream');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';
      let accumulatedText = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const eventData = JSON.parse(line.slice(6));
                if (eventData.type === 'start' && eventData.conversation_id) {
                  setActiveConvId(eventData.conversation_id);
                } else if (eventData.type === 'chunk' && eventData.text) {
                  accumulatedText += eventData.text;
                  setStreamingText(accumulatedText);
                } else if (eventData.type === 'done' && eventData.message) {
                  setMessages((prev) => [...prev, eventData.message]);
                  setStreamingText('');
                  fetchConversations();
                }
              } catch (e) {
                // Ignore parse errors on partial chunks
              }
            }
          }
        }
      }
    } catch (err: any) {
      console.error('Chat error:', err);
      // Non-streaming fallback
      try {
        const fallbackRes = await fetch('/api/ai/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            business_id: activeBusiness.id,
            conversation_id: activeConvId,
            message: text,
          }),
        });
        if (fallbackRes.ok) {
          const data = await fallbackRes.json();
          setMessages((prev) => [...prev, data.message]);
          setActiveConvId(data.conversation_id);
        } else {
          setError('Strategic engine temporarily unavailable. Please try again.');
        }
      } catch (fallbackErr: any) {
        setError(fallbackErr.message || 'Strategic engine communication failed.');
      }
    } finally {
      setIsStreaming(false);
      setStreamingText('');
    }
  };

  const handleConvertActionToTask = async (action: any) => {
    if (!token || !activeBusiness || !action) return;
    try {
      const res = await fetch(`/api/businesses/${activeBusiness.id}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: action.title,
          description: action.description,
          category: action.action_type || 'sales',
          priority: 'highest_leverage',
          leverage_score: action.leverage_score || 90,
          estimated_hours: 4,
        }),
      });
      if (res.ok) {
        setTaskAddedMessageId(action.title);
        setTimeout(() => setTaskAddedMessageId(null), 4000);
      }
    } catch (e) {
      console.error('Error adding task:', e);
    }
  };

  const strategicPrompts = [
    'How do I lower customer acquisition cost (CAC) for our current offer?',
    'Evaluate our current pricing model against industry unit economics.',
    'Formulate a 1-week validation test for a zero-risk pilot offer.',
    'Diagnose the primary bottleneck preventing faster sales conversions.',
  ];

  return (
    <div className="flex h-[calc(100vh-8.5rem)] md:h-[calc(100vh-7rem)] rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 overflow-hidden shadow-xl transition-colors">
      {/* Left Conversations Sidebar (Collapsible on mobile) */}
      <div className="hidden md:flex flex-col w-64 border-r border-neutral-200 dark:border-neutral-800/80 bg-neutral-50/80 dark:bg-neutral-900/60 p-3 flex-shrink-0 transition-colors">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800/80">
          <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-800 dark:text-neutral-200">
            <MessageSquare className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span>Strategy Sessions</span>
          </div>

          <button
            onClick={handleNewConversation}
            className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/15 hover:bg-emerald-100 dark:hover:bg-emerald-500/25 text-emerald-600 dark:text-emerald-400 transition-colors"
            title="New Session"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-1 mt-2.5 pr-0.5">
          {conversations.map((c) => (
            <button
              key={c.id}
              onClick={() => handleSelectConversation(c.id)}
              className={`w-full text-left p-2.5 rounded-xl text-xs transition-all ${
                c.id === activeConvId
                  ? 'bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-800/50 text-emerald-800 dark:text-emerald-200 font-semibold shadow-sm'
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800/80 hover:text-neutral-900 dark:hover:text-neutral-200 border border-transparent'
              }`}
            >
              <p className="truncate leading-snug">{c.title}</p>
              <span className="text-[10px] text-neutral-400 dark:text-neutral-500 mt-1 block">
                {new Date(c.updated_at).toLocaleDateString()}
              </span>
            </button>
          ))}
          {conversations.length === 0 && (
            <div className="text-center py-8 text-neutral-400 dark:text-neutral-500 text-xs italic">
              No previous strategy sessions yet.
            </div>
          )}
        </div>

        {/* Business Memory Context Pill */}
        <div className="mt-auto pt-2 border-t border-neutral-200 dark:border-neutral-800/60">
          <div className="p-2 rounded-xl bg-white dark:bg-neutral-950/80 border border-neutral-200 dark:border-neutral-800/80 text-[11px] text-neutral-600 dark:text-neutral-400 shadow-sm">
            <div className="flex items-center gap-1.5 font-semibold text-emerald-600 dark:text-emerald-400">
              <Brain className="h-3 w-3" />
              <span>Corridor Memory Injected</span>
            </div>
            <p className="text-[10px] text-neutral-500 mt-0.5">
              Target: {activeProfile?.industry || 'Active business'}
            </p>
          </div>
        </div>
      </div>

      {/* Main Chat Workspace */}
      <div className="flex-1 flex flex-col bg-white dark:bg-neutral-950 overflow-hidden transition-colors">
        {/* Top Context Bar */}
        <div className="px-4 py-2.5 border-b border-neutral-200 dark:border-neutral-800/80 bg-neutral-50 dark:bg-neutral-900/40 flex items-center justify-between gap-2 text-xs transition-colors">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-bold text-neutral-900 dark:text-neutral-200">
              Ventirevo AI Growth Strategist & Coach
            </span>
            <span className="text-neutral-400 dark:text-neutral-500 hidden sm:inline">•</span>
            <span className="text-neutral-500 dark:text-neutral-400 hidden sm:inline truncate max-w-xs">
              Context: {activeBusiness?.name}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleNewConversation}
              className="md:hidden py-1 px-2.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-[11px] font-semibold flex items-center gap-1"
            >
              <Plus className="h-3 w-3" /> New
            </button>
          </div>
        </div>

        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {messages.length === 0 && !isStreaming && (
            <div className="max-w-2xl mx-auto text-center py-8 space-y-4">
              <div className="inline-flex h-12 w-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 p-[1px] shadow-lg shadow-emerald-500/10 items-center justify-center">
                <div className="h-full w-full bg-neutral-900 dark:bg-neutral-950 rounded-[15px] flex items-center justify-center">
                  <Sparkles className="h-6 w-6 text-emerald-400" />
                </div>
              </div>

              <div>
                <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 font-display">
                  Ventirevo Sovereign GPS & Strategy Consultation
                </h2>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-md mx-auto mt-1 leading-relaxed">
                  Ventirevo analyzes your verified corridor location, market economics, foot traffic, and constraints to recommend high-leverage revenue actions with zero fluff.
                </p>
              </div>

              {/* Quick Strategy Prompts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 text-left">
                {strategicPrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(prompt)}
                    className="p-3 rounded-xl border border-neutral-200 dark:border-neutral-800/90 bg-neutral-50 dark:bg-neutral-900/60 hover:bg-neutral-100 dark:hover:bg-neutral-850 hover:border-emerald-500 dark:hover:border-emerald-700/60 text-xs text-neutral-800 dark:text-neutral-300 transition-all flex items-start gap-2 group shadow-sm"
                  >
                    <ArrowRight className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5 group-hover:translate-x-0.5 transition-transform" />
                    <span>{prompt}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m) => {
            const isUser = m.role === 'user';
            return (
              <div
                key={m.id}
                className={`flex gap-3 max-w-3xl ${isUser ? 'ml-auto justify-end' : 'mr-auto justify-start'}`}
              >
                {!isUser && (
                  <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 p-[1px] flex-shrink-0 flex items-center justify-center shadow-md shadow-emerald-500/10">
                    <div className="h-full w-full bg-neutral-950 rounded-[11px] flex items-center justify-center">
                      <Sparkles className="h-4 w-4 text-emerald-400" />
                    </div>
                  </div>
                )}

                <div className={`space-y-3 ${isUser ? 'max-w-xl' : 'w-full'}`}>
                  <div
                    className={`rounded-2xl p-4 sm:p-5 text-xs sm:text-sm leading-relaxed ${
                      isUser
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-medium rounded-tr-sm shadow-md'
                        : 'bg-neutral-50 dark:bg-neutral-900/80 border border-neutral-200 dark:border-neutral-800/90 text-neutral-800 dark:text-neutral-200 rounded-tl-sm shadow-sm'
                    }`}
                  >
                    {isUser ? (
                      <p className="whitespace-pre-wrap">{m.content}</p>
                    ) : (
                      <div className="prose prose-neutral dark:prose-invert prose-xs max-w-none space-y-3">
                        <ReactMarkdown>{m.content}</ReactMarkdown>
                      </div>
                    )}
                  </div>

                  {/* Assistant Breakdown Badges & Citations */}
                  {!isUser && (
                    <div className="space-y-3 pl-1">
                      {/* Evidence Categorization Matrix */}
                      {(m.verified_facts?.length || m.estimates?.length || m.assumptions?.length || m.hypotheses?.length) && (
                        <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800/80 space-y-2 shadow-sm">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
                            <ShieldCheck className="h-3 w-3 text-emerald-600 dark:text-emerald-400" /> Information Classification Matrix
                          </span>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                            {m.verified_facts && m.verified_facts.length > 0 && (
                              <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 text-emerald-800 dark:text-emerald-300">
                                <span className="font-bold block text-[10px] uppercase">Verified Facts</span>
                                <ul className="list-disc list-inside mt-0.5 space-y-0.5 text-[10px] text-emerald-900 dark:text-emerald-200/90">
                                  {m.verified_facts.map((f, i) => (
                                    <li key={i}>{f}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {m.estimates && m.estimates.length > 0 && (
                              <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-amber-800 dark:text-amber-300">
                                <span className="font-bold block text-[10px] uppercase">Calculated Estimates</span>
                                <ul className="list-disc list-inside mt-0.5 space-y-0.5 text-[10px] text-amber-900 dark:text-amber-200/90">
                                  {m.estimates.map((e, i) => (
                                    <li key={i}>{e}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {m.assumptions && m.assumptions.length > 0 && (
                              <div className="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-neutral-300">
                                <span className="font-bold block text-[10px] uppercase">Assumptions Requiring Validation</span>
                                <ul className="list-disc list-inside mt-0.5 space-y-0.5 text-[10px] text-neutral-600 dark:text-neutral-400">
                                  {m.assumptions.map((a, i) => (
                                    <li key={i}>{a}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {m.hypotheses && m.hypotheses.length > 0 && (
                              <div className="p-2 rounded-lg bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-900/40 text-teal-800 dark:text-teal-300">
                                <span className="font-bold block text-[10px] uppercase">Testable Hypotheses</span>
                                <ul className="list-disc list-inside mt-0.5 space-y-0.5 text-[10px] text-teal-900 dark:text-teal-200/90">
                                  {m.hypotheses.map((h, i) => (
                                    <li key={i}>{h}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Memory Citations */}
                      {m.citations && m.citations.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                          <span className="text-neutral-500 font-semibold uppercase flex items-center gap-1">
                            <BookOpen className="h-3 w-3" /> Cited Memory:
                          </span>
                          {m.citations.map((c) => (
                            <span
                              key={c.id}
                              className="px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 font-medium"
                              title={c.excerpt}
                            >
                              {c.title}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Convert Recommended Action to Growth Task Button */}
                      {m.recommended_next_action && (
                        <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-50 to-neutral-100 dark:from-emerald-950/60 dark:to-neutral-900 border border-emerald-300 dark:border-emerald-700/40 flex items-center justify-between gap-3 shadow-sm">
                          <div className="space-y-0.5 max-w-md">
                            <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                              <Zap className="h-2.5 w-2.5 text-amber-500 dark:text-amber-400" /> Proposed High-Leverage Task
                            </span>
                            <p className="text-xs font-bold text-neutral-900 dark:text-neutral-100">{m.recommended_next_action.title}</p>
                            <p className="text-[11px] text-neutral-600 dark:text-neutral-400 line-clamp-1">{m.recommended_next_action.description}</p>
                          </div>

                          <button
                            onClick={() => handleConvertActionToTask(m.recommended_next_action)}
                            className="py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex-shrink-0 flex items-center gap-1.5 transition-all shadow-sm"
                          >
                            <Plus className="h-3 w-3" />
                            <span>Add to Growth Sprint</span>
                          </button>
                        </div>
                      )}

                      {taskAddedMessageId && (
                        <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Added to Growth Plan successfully!
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Active Streaming Chunk Display */}
          {isStreaming && streamingText && (
            <div className="flex gap-3 max-w-3xl mr-auto justify-start">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 p-[1px] flex-shrink-0 flex items-center justify-center shadow-md">
                <div className="h-full w-full bg-neutral-900 dark:bg-neutral-950 rounded-[11px] flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-emerald-400 animate-spin" />
                </div>
              </div>
              <div className="rounded-2xl p-4 sm:p-5 text-xs sm:text-sm bg-neutral-50 dark:bg-neutral-900/80 border border-neutral-200 dark:border-neutral-800/90 text-neutral-900 dark:text-neutral-200 w-full shadow-sm">
                <div className="prose prose-neutral dark:prose-invert prose-xs max-w-none space-y-3">
                  <ReactMarkdown>{streamingText}</ReactMarkdown>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2 shadow-sm">
              <AlertCircle className="h-4 w-4 text-rose-500 dark:text-rose-400 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 border-t border-neutral-200 dark:border-neutral-800/80 bg-neutral-50/80 dark:bg-neutral-900/40 transition-colors">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2 max-w-4xl mx-auto"
          >
            <input
              type="text"
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              placeholder="Ask Ventirevo AI about location GPS, corridor demand, pricing, or strategic diagnostics..."
              disabled={isStreaming}
              className="flex-1 rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-4 py-2.5 text-xs sm:text-sm text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:opacity-50 transition-colors"
            />

            <button
              type="submit"
              disabled={isStreaming || !inputPrompt.trim()}
              className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-emerald-500/10 disabled:opacity-50"
            >
              {isStreaming ? (
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span className="hidden sm:inline">Strategize</span>
                  <Send className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          </form>
          <div className="text-center mt-2">
            <span className="text-[10px] text-neutral-500 dark:text-neutral-400">
              Ventirevo Intelligence Engine • Corridor GPS Verified • Never fabricates data
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
