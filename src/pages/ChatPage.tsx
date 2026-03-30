import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Send, Bot, User, Activity, Map, Loader2, Navigation, Clock, Ruler, AlertCircle } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { mockChatHistory, ChatMessage } from '../data/mockData';
import { sendQuery } from '../utils/api';

const CHAT_STORAGE_KEY = 'traffic-chat-history';

const loadStoredMessages = (): ChatMessage[] => {
  try {
    const raw = localStorage.getItem(CHAT_STORAGE_KEY);
    if (!raw) return mockChatHistory;

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : mockChatHistory;
  } catch {
    return mockChatHistory;
  }
};

const saveStoredMessages = (messages: ChatMessage[]) => {
  try {
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
  } catch {
    // ignore storage errors
  }
};

export function ChatPage() {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [messages, setMessages] = useState<ChatMessage[]>(() => loadStoredMessages());
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const didAutoSend = useRef(false);

  const suggestions = [
    'chat.suggestion.1',
    'chat.suggestion.2',
    'chat.suggestion.3',
    'chat.suggestion.4',
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    saveStoredMessages(messages);
  }, [messages]);

  const handleSend = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const newUserMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: { en: text, th: text },
    };

    setMessages((prev) => [...prev, newUserMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      const result = await sendQuery(text, language);
      const newAiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: { en: result.answer, th: result.answer },
        intent: result.intent ? `chat.intent.${result.intent}` : undefined,
        isLive: result.used_live_data,
        focus_lat: result.focus_lat,
        focus_lng: result.focus_lng,
        route_points: result.route_points,
        route_summary: result.route_summary,
        suggested_roads: result.suggested_roads,
      };
      setMessages((prev) => [...prev, newAiMsg]);
    } catch {
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: {
          en: 'Sorry, I could not reach the traffic server. Please try again.',
          th: 'ขออภัย ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์จราจรได้ กรุณาลองใหม่อีกครั้ง',
        },
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    localStorage.removeItem(CHAT_STORAGE_KEY);
    setMessages([]);
  };

  // Auto-send a road query when navigated from a map dot "Ask in Chat"
  useEffect(() => {
    const state = location.state as { road_query?: string } | null;
    if (!state?.road_query || didAutoSend.current) return;
    didAutoSend.current = true;
    window.history.replaceState({}, '');
    handleSend(`How is traffic on ${state.road_query}?`);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col h-[100dvh] pt-16 bg-slate-50">
      <div className="flex-1 overflow-y-auto w-full max-w-3xl mx-auto px-4 py-6 scroll-smooth">
        <div className="flex justify-end mb-3 pr-1">
          <button
            onClick={handleClearChat}
            className="text-xs text-slate-500 border border-slate-300 bg-white px-3 py-1 rounded-full shadow-sm hover:border-red-300 hover:text-red-500 hover:bg-red-50 transition-colors"
          >
            Clear Chat
          </button>
        </div>

        <div className="space-y-6 pb-32">
          {messages.map((msg) => (
            <motion.div
              initial={{
                opacity: 0,
                y: 10,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              key={msg.id}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`flex max-w-[85%] sm:max-w-[75%] gap-3 ${
                  msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                <div className="flex-shrink-0 mt-1">
                  {msg.sender === 'user' ? (
                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600">
                      <User size={16} />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-cyan-600 flex items-center justify-center text-white shadow-sm">
                      <Bot size={18} />
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  <div
                    className={`px-4 py-3 rounded-2xl shadow-sm ${
                      msg.sender === 'user'
                        ? 'bg-cyan-600 text-white rounded-tr-sm'
                        : 'bg-white text-slate-800 border border-slate-100 rounded-tl-sm'
                    }`}
                  >
                    <p className="text-[15px] leading-relaxed whitespace-pre-wrap">
                      {msg.sender === 'user' ? msg.text.en : msg.text[language]}
                    </p>
                  </div>

                  {msg.sender === 'ai' && (msg.intent || msg.isLive) && (
                    <div className="flex items-center gap-2 mt-1 ml-1 flex-wrap">
                      {msg.intent && (
                        <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                          {t(msg.intent)}
                        </span>
                      )}

                      {msg.isLive && (
                        <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                          <Activity size={10} className="animate-pulse" />
                          {t('chat.live_data')}
                        </span>
                      )}

                      {msg.isLive && !msg.route_points && msg.focus_lat && (
                        <button
                          onClick={() => navigate('/map', {
                            state: { focus_lat: msg.focus_lat, focus_lng: msg.focus_lng }
                          })}
                          className="flex items-center gap-1 text-[11px] font-medium text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded-md border border-cyan-100 hover:bg-cyan-100 transition-colors"
                        >
                          <Map size={10} />
                          {language === 'th' ? 'ดูบนแผนที่' : 'View on Map'}
                        </button>
                      )}

                      {msg.route_points && (
                        <button
                          onClick={() => navigate('/map', {
                            state: {
                              route_points: msg.route_points,
                              focus_lat: msg.focus_lat,
                              focus_lng: msg.focus_lng,
                            }
                          })}
                          className="flex items-center gap-1 text-[11px] font-medium text-violet-700 bg-violet-50 px-2 py-0.5 rounded-md border border-violet-200 hover:bg-violet-100 transition-colors"
                        >
                          <Navigation size={10} />
                          {language === 'th' ? 'ดูเส้นทางบนแผนที่' : 'View Route on Map'}
                        </button>
                      )}
                    </div>
                  )}

                  {/* Route summary card */}
                  {msg.sender === 'ai' && msg.route_summary && (
                    <div className="mt-2 ml-1 bg-white border border-slate-200 rounded-xl p-3 shadow-sm max-w-xs">
                      <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-2">
                        {language === 'th' ? 'สรุปเส้นทาง' : 'Route Summary'}
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="flex flex-col items-center gap-0.5">
                          <Clock size={13} className="text-cyan-500" />
                          <span className="text-base font-bold text-slate-800">{msg.route_summary.travel_time_mins}</span>
                          <span className="text-[10px] text-slate-400">{language === 'th' ? 'นาที' : 'mins'}</span>
                        </div>
                        <div className="flex flex-col items-center gap-0.5">
                          <Ruler size={13} className="text-cyan-500" />
                          <span className="text-base font-bold text-slate-800">{msg.route_summary.length_km}</span>
                          <span className="text-[10px] text-slate-400">km</span>
                        </div>
                        <div className="flex flex-col items-center gap-0.5">
                          <AlertCircle size={13} className="text-orange-400" />
                          <span className="text-base font-bold text-orange-500">{msg.route_summary.traffic_delay_mins}</span>
                          <span className="text-[10px] text-slate-400">{language === 'th' ? 'นาทีหน่วง' : 'delay'}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Congested road chips for route suggestion */}
                  {msg.sender === 'ai' && msg.suggested_roads && msg.suggested_roads.length > 0 && (
                    <div className="mt-2 ml-1 flex flex-wrap gap-1.5">
                      {msg.suggested_roads.map((road, i) => (
                        <button
                          key={i}
                          onClick={() => setInputValue(`Route from  to  avoiding ${road}`)}
                          className="text-[11px] font-medium bg-orange-50 border border-orange-200 text-orange-700 px-2.5 py-1 rounded-full hover:bg-orange-100 transition-colors"
                        >
                          🚧 {road}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex gap-3 max-w-[85%] sm:max-w-[75%]">
                <div className="flex-shrink-0 mt-1 w-8 h-8 rounded-full bg-cyan-600 flex items-center justify-center text-white shadow-sm">
                  <Bot size={18} />
                </div>
                <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-white border border-slate-100 shadow-sm flex items-center gap-2 text-slate-400">
                  <Loader2 size={16} className="animate-spin" />
                  <span className="text-sm">{language === 'th' ? 'กำลังตรวจสอบ...' : 'Checking live data...'}</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 pb-safe">
        <div className="max-w-3xl mx-auto">
          <div className="flex overflow-x-auto gap-2 pb-3 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
            {suggestions.map((sugg, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(t(sugg))}
                className="whitespace-nowrap flex-shrink-0 text-sm bg-white border border-slate-200 text-slate-600 px-4 py-1.5 rounded-full hover:bg-slate-50 hover:border-cyan-300 hover:text-cyan-700 transition-colors shadow-sm"
              >
                {t(sugg)}
              </button>
            ))}
          </div>

          <div className="relative flex items-center">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend(inputValue)}
              placeholder={t('chat.input.placeholder')}
              className="w-full bg-slate-100 border-transparent focus:bg-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 rounded-full py-3 pl-5 pr-12 text-slate-900 placeholder:text-slate-500 transition-all shadow-inner"
            />

            <button
              onClick={() => handleSend(inputValue)}
              disabled={!inputValue.trim() || isLoading}
              className="absolute right-2 p-2 bg-cyan-600 text-white rounded-full hover:bg-cyan-700 disabled:opacity-50 disabled:hover:bg-cyan-600 transition-colors"
            >
              <Send size={18} className="ml-0.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}