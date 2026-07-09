import React, { useState, useRef, useEffect } from 'react';
import { 
  BookOpen, 
  ChevronRight, 
  HelpCircle, 
  ArrowLeft, 
  CheckCircle2, 
  Sparkles, 
  Bot, 
  Send, 
  Loader2, 
  User, 
  CornerDownRight 
} from 'lucide-react';

interface Article {
  id: string;
  category: string;
  title: string;
  shortDesc: string;
  fullBody: string;
  image: string;
}

const LEARN_ARTICLES: Article[] = [
  {
    id: 'pruning',
    category: 'Crop Care',
    title: 'Pruning For Accelerated Growth',
    shortDesc: 'Pinch the top leaves early to encourage lateral bushiness.',
    fullBody: 'Pruning is the single most effective action to multiply your herb yields! When your basil or mint sprouts reach about 4 inches tall (typically around day 12-15), look for the main center stalk. Using clean fingers or mini scissors, pinch off the top set of leaves just above a major node branch. This redirects growth hormones to the side shoots, transforming a single thin stalk into a dense, bushy herb cluster.',
    image: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: 'refill',
    category: 'Routine Support',
    title: 'Optimizing Clean Water Refills',
    shortDesc: 'How to flush scale and keep nutrient levels in the perfect range.',
    fullBody: 'Every 2-3 weeks, your garden unit consumes its 2.5L capacity. While the app notifies you to top-up, we recommend doing a "flush and clean" every 2 months. Pour out any remaining water entirely to wash out naturally occurring mineral salt build-ups. Refill with fresh, cool water and insert a new nutrient tablet if prompted. This prevents water logging and scale.',
    image: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: 'ph_level',
    category: 'Water Science',
    title: 'Understanding pH in Hydroponics',
    shortDesc: 'Why a range of 5.5 - 6.5 pH is the critical sweet spot for crops.',
    fullBody: 'Plants don\'t eat soil; they absorb dissolved ionic nutrients through water. If the pH level of your water is too high or too low, the roots undergo "nutrient lockout" where they physically cannot absorb nitrogen or calcium. AgriNexus has automated pH buffering filters inside the smart base to maintain a steady 6.0 - 6.5 balance automatically, so you don\'t have to measure chemical drop vials manually.',
    image: 'https://images.unsplash.com/photo-1516259762381-22954d7d3ad2?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: 'harvest',
    category: 'Harvesting',
    title: 'How & When To Harvest Efficiently',
    shortDesc: 'Harvest only the top 30% to keep cycles active indefinitely.',
    fullBody: 'When harvesting coriander, parsley, or lettuce, never chop the plant off at the base! Instead, follow the "one-third rule": never harvest more than 30% of the active foliage at any single time. Pluck mature outer leaves first, leaving the tiny inner crown leaves untouched. This ensures the photosynthetic engine remains intact to regenerate fresh harvests within just a few days.',
    image: 'https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?q=80&w=600&auto=format&fit=crop'
  }
];

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

interface LearnScreenProps {
  activePlantName?: string;
}

export default function LearnScreen({ activePlantName = 'Sweet Basil' }: LearnScreenProps) {
  const [activeTab, setActiveTab] = useState<'guides' | 'ai'>('guides');
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);
  
  // Chat States
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      role: 'model',
      text: `Hi there! I'm your AgriNexus AI Gardening Advisor, powered by Google Gemini 3.5. 🌿\n\nI see you're currently growing **${activePlantName}**! Ask me anything about care schedules, pruning, pH balancing, water top-ups, or pest troubleshooting for your smart garden.`,
      timestamp: new Date()
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeArticle = LEARN_ARTICLES.find(a => a.id === selectedArticleId);

  // Auto scroll to bottom of chat
  useEffect(() => {
    if (activeTab === 'ai') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isTyping, activeTab]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isTyping) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      role: 'user',
      text: textToSend,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setIsTyping(true);

    try {
      // Map history for API
      const history = chatMessages
        .filter(m => m.id !== 'welcome-msg') // Skip welcome
        .map(m => ({
          role: m.role,
          text: m.text
        }));

      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: textToSend,
          history,
          plantContext: activePlantName
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to communicate with Gemini.');
      }

      const botMsg: ChatMessage = {
        id: `msg-${Date.now()}-bot`,
        role: 'model',
        text: data.reply,
        timestamp: new Date()
      };

      setChatMessages(prev => [...prev, botMsg]);
    } catch (err: any) {
      console.error(err);
      const botErrorMsg: ChatMessage = {
        id: `msg-${Date.now()}-error`,
        role: 'model',
        text: "I am having trouble connecting to the AgriNexus AI Gardening Advisor right now. Please try again in a few moments.",
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, botErrorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handlePresetQuery = (query: string) => {
    handleSendMessage(query);
  };

  return (
    <div className="bg-[#f7faf6] min-h-screen pb-24 text-[#181c1a]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#f7faf6] border-b border-[#D8E4DA]/40 px-5 h-16 flex items-center justify-between">
        {selectedArticleId ? (
          <button
            onClick={() => setSelectedArticleId(null)}
            className="flex items-center gap-1.5 text-[#006038] font-heading font-bold text-sm"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Guides
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#006038] text-[24px]">menu_book</span>
            <h1 className="font-heading text-lg font-bold text-[#006038]">Knowledge Center</h1>
          </div>
        )}
      </header>

      <main className="px-5 mt-4 max-w-md mx-auto">
        {selectedArticleId ? (
          /* Detailed Article View */
          <div className="space-y-4 animate-fade-in">
            <span className="inline-block text-[10px] font-bold bg-[#9ef5be] text-[#002110] px-2.5 py-1 rounded-full uppercase tracking-wider">
              {activeArticle?.category}
            </span>
            <h2 className="font-heading font-extrabold text-2xl text-[#181c1a] leading-tight">
              {activeArticle?.title}
            </h2>
            
            <div className="w-full aspect-[16/9] rounded-xl overflow-hidden my-4 border border-[#D8E4DA]/50">
              <img
                src={activeArticle?.image}
                alt={activeArticle?.title}
                className="w-full h-full object-cover"
              />
            </div>

            <p className="font-sans text-sm text-[#3f4941] leading-relaxed whitespace-pre-wrap pt-2">
              {activeArticle?.fullBody}
            </p>

            <div className="p-4 bg-[#f1f4f0] rounded-xl border border-[#D8E4DA]/50 mt-6 flex gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#006038] flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-[#181c1a]">Pro Grower Advice</p>
                <p className="text-[11px] text-[#58605b] mt-0.5">
                  Regular pruning combined with stable water refill cycles helps increase total flavor concentration and active essential oils by up to 40%!
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* List View with Tab Selection */
          <div className="space-y-4">
            {/* Tabs Selector */}
            <div className="flex bg-[#ecefeb] p-1 rounded-xl border border-[#D8E4DA]/30">
              <button
                onClick={() => setActiveTab('guides')}
                className={`flex-1 py-2 text-xs font-bold font-heading rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'guides' 
                    ? 'bg-white text-[#006038] shadow-xs' 
                    : 'text-[#58605b] hover:text-[#181c1a]'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                Guides &amp; FAQs
              </button>
              <button
                onClick={() => setActiveTab('ai')}
                className={`flex-1 py-2 text-xs font-bold font-heading rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'ai' 
                    ? 'bg-white text-[#1f7a4d] shadow-xs' 
                    : 'text-[#58605b] hover:text-[#181c1a]'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500 animate-pulse" />
                Ask Gemini AI
              </button>
            </div>

            {activeTab === 'guides' ? (
              <div className="space-y-5">
                <div className="space-y-1">
                  <h2 className="font-heading font-extrabold text-xl text-[#181c1a]">Care &amp; Growth Tips</h2>
                  <p className="text-xs text-[#58605b]">Simple insights to maximize your home yields and maintain your smart garden.</p>
                </div>

                <div className="space-y-3">
                  {LEARN_ARTICLES.map(article => (
                    <div
                      key={article.id}
                      onClick={() => setSelectedArticleId(article.id)}
                      className="p-4 bg-white rounded-xl border border-[#D8E4DA]/40 cursor-pointer hover:border-[#006038]/50 hover:shadow-sm transition-all flex items-center gap-4 group"
                    >
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                        <img
                          src={article.image}
                          alt={article.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      
                      <div className="flex-grow min-w-0">
                        <span className="text-[9px] font-bold text-[#006038] uppercase tracking-wider">
                          {article.category}
                        </span>
                        <h3 className="font-heading font-bold text-sm text-[#181c1a] truncate group-hover:text-[#006038] transition-colors">
                          {article.title}
                        </h3>
                        <p className="text-[11px] text-[#3f4941] truncate mt-0.5">
                          {article.shortDesc}
                        </p>
                      </div>

                      <ChevronRight className="w-4 h-4 text-[#3f4941] flex-shrink-0 group-hover:translate-x-1 transition-transform" />
                    </div>
                  ))}
                </div>

                {/* Diagnostics Quick Help */}
                <section className="bg-white rounded-xl border border-[#D8E4DA]/40 p-4 space-y-3 mt-4">
                  <div className="flex items-center gap-2">
                    <HelpCircle className="w-5 h-5 text-[#006038]" />
                    <h3 className="font-heading font-bold text-sm text-[#181c1a]">Quick Help &amp; FAQs</h3>
                  </div>
                  <div className="space-y-2 text-xs divide-y divide-[#D8E4DA]/20">
                    <div className="pt-2">
                      <p className="font-bold text-[#181c1a]">Q: Why is my indicator light flashing yellow?</p>
                      <p className="text-[#3f4941] mt-0.5">A: It indicates low water level! Top up the basin with fresh water.</p>
                    </div>
                    <div className="pt-2">
                      <p className="font-bold text-[#181c1a]">Q: How much power does AgriNexus draw?</p>
                      <p className="text-[#3f4941] mt-0.5">A: It uses ultra-efficient 15W active LEDs drawing less than standard kitchen night-lights.</p>
                    </div>
                  </div>
                </section>
              </div>
            ) : (
              /* Gemini AI Chat Tab */
              <div className="space-y-4 flex flex-col h-[calc(100vh-250px)] max-h-[550px] bg-white rounded-2xl border border-[#D8E4DA]/50 shadow-xs overflow-hidden">
                {/* Chat Header banner */}
                <div className="bg-[#f0fcf4] border-b border-[#D8E4DA]/30 px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-[#9ef5be] rounded-lg">
                      <Bot className="w-4 h-4 text-[#006038]" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#006038]">AgriNexus AI Assistant</h4>
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                        <span className="text-[9px] text-[#58605b]">Gemini 3.5 Active</span>
                      </div>
                    </div>
                  </div>
                  <span className="text-[9px] font-bold font-mono text-[#006038] bg-white border border-[#9ef5be] px-2 py-0.5 rounded-full">
                    DEV MODE
                  </span>
                </div>

                {/* Messages Panel */}
                <div className="flex-grow p-4 overflow-y-auto space-y-4 text-xs leading-relaxed">
                  {chatMessages.map(msg => (
                    <div
                      key={msg.id}
                      className={`flex gap-2.5 max-w-[85%] ${
                        msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
                      }`}
                    >
                      <div className={`p-2 rounded-full flex-shrink-0 self-start ${
                        msg.role === 'user' ? 'bg-[#9ef5be] text-[#002110]' : 'bg-[#f1f4f0] text-[#006038]'
                      }`}>
                        {msg.role === 'user' ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
                      </div>

                      <div className={`p-3.5 rounded-2xl whitespace-pre-wrap ${
                        msg.role === 'user' 
                          ? 'bg-[#1f7a4d] text-white rounded-tr-none font-medium' 
                          : 'bg-[#f5f8f5] text-[#181c1a] rounded-tl-none border border-[#D8E4DA]/20'
                      }`}>
                        {msg.text}
                      </div>
                    </div>
                  ))}

                  {/* Typing Indicator */}
                  {isTyping && (
                    <div className="flex gap-2.5 max-w-[85%] mr-auto">
                      <div className="p-2 rounded-full flex-shrink-0 self-start bg-[#f1f4f0] text-[#006038]">
                        <Bot className="w-3 h-3" />
                      </div>
                      <div className="p-3.5 rounded-2xl rounded-tl-none bg-[#f5f8f5] border border-[#D8E4DA]/20 text-[#58605b] flex items-center gap-2">
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-[#1f7a4d]" />
                        <span>AgriNexus Advisor is thinking...</span>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Pre-set Helper prompts (only shown when conversation is empty of user messages) */}
                {chatMessages.length === 1 && !isTyping && (
                  <div className="px-4 pb-1 space-y-1.5">
                    <p className="text-[10px] uppercase font-bold text-[#58605b] tracking-wider ml-1">Suggested Questions</p>
                    <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pb-2">
                      <button 
                        onClick={() => handlePresetQuery(`How often should I harvest my ${activePlantName}?`)}
                        className="px-2.5 py-1.5 bg-[#f1f4f0] hover:bg-[#e2e8e3] text-[#3f4941] text-[10px] rounded-lg transition-colors flex items-center gap-1 text-left"
                      >
                        <CornerDownRight className="w-2.5 h-2.5 text-[#006038]" />
                        <span>Harvesting {activePlantName}</span>
                      </button>
                      <button 
                        onClick={() => handlePresetQuery(`What are the ideal hydroponic conditions for growing ${activePlantName}?`)}
                        className="px-2.5 py-1.5 bg-[#f1f4f0] hover:bg-[#e2e8e3] text-[#3f4941] text-[10px] rounded-lg transition-colors flex items-center gap-1 text-left"
                      >
                        <CornerDownRight className="w-2.5 h-2.5 text-[#006038]" />
                        <span>Ideal Conditions</span>
                      </button>
                      <button 
                        onClick={() => handlePresetQuery("How does pH nutrient lockout work and how do I fix it?")}
                        className="px-2.5 py-1.5 bg-[#f1f4f0] hover:bg-[#e2e8e3] text-[#3f4941] text-[10px] rounded-lg transition-colors flex items-center gap-1 text-left"
                      >
                        <CornerDownRight className="w-2.5 h-2.5 text-[#006038]" />
                        <span>Nutrient Lockout Fix</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Chat Footer Input */}
                <div className="p-3 bg-white border-t border-[#D8E4DA]/40">
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendMessage(chatInput);
                    }}
                    className="flex gap-2"
                  >
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder={`Ask about your ${activePlantName}...`}
                      className="flex-grow h-10 px-3.5 rounded-xl border border-[#D8E4DA] text-xs focus:outline-none focus:border-[#1f7a4d]"
                      disabled={isTyping}
                    />
                    <button
                      type="submit"
                      disabled={!chatInput.trim() || isTyping}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                        chatInput.trim() && !isTyping
                          ? 'bg-[#1f7a4d] text-white shadow-xs hover:bg-[#18603c] active:scale-95'
                          : 'bg-slate-100 text-slate-300'
                      }`}
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
