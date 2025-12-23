
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import GlassCard from '../../components/GlassCard';
import { Play, Pause, ChevronDown, Wand2, ArrowRight, X, Search, ArrowUp, Zap } from 'lucide-react';
import { Page } from '../../types';
import { translateCategory } from '../../constants';
import { usePlayer } from '../../contexts/PlayerContext';
import { useTTS } from '../../contexts/TTSContext';
import { useVoices } from '../../contexts/VoiceContext';
import { useLanguage } from '../../contexts/LanguageContext';

interface HomeProps {
  onNavigate: (page: Page) => void;
}

const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  const { text, setText, selectedVoice, setSelectedVoice } = useTTS();
  const { voices } = useVoices();
  const { t } = useLanguage();
  const { playVoice, currentVoice, isPlaying } = usePlayer();
  
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [modalTab, setModalTab] = useState<'preset' | 'custom'>('preset');
  const [modalSearch, setModalSearch] = useState('');
  const [showBackToTop, setShowBackToTop] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const shadowRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (shadowRef.current && textareaRef.current) {
      shadowRef.current.style.height = '0px'; 
      const scrollHeight = shadowRef.current.scrollHeight;
      const newHeight = Math.min(Math.max(scrollHeight, 180), 500);
      textareaRef.current.style.height = `${newHeight}px`;
    }
  }, [text]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setShowBackToTop(e.currentTarget.scrollTop > 300);
  };

  const scrollToTop = () => {
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartSynthesis = () => {
    if (!text.trim()) return;
    // Set current voice to trigger player popup and start playing
    playVoice(selectedVoice);
  };

  const featuredVoices = useMemo(() => voices.filter(v => v.source === 'preset'), [voices]);

  const filteredModalVoices = useMemo(() => {
    return voices.filter(v => {
      const matchTab = v.source === modalTab || (modalTab === 'custom' && v.isCustom);
      const matchSearch = v.name.toLowerCase().includes(modalSearch.toLowerCase());
      return matchTab && matchSearch;
    });
  }, [voices, modalTab, modalSearch]);

  return (
    <div 
      ref={scrollContainerRef}
      onScroll={handleScroll}
      className="space-y-6 animate-in fade-in duration-1000 pb-20 overflow-y-auto h-full pr-2 custom-scrollbar scroll-smooth"
    >
      <div className="space-y-2 mt-2">
        <h1 className="text-5xl font-light text-white tracking-[0.2em]">{t('home_title')}</h1>
        <p className="text-white/50 text-[11px] font-normal uppercase tracking-[0.3em] ml-1">专业级 AI 语音合成与创作平台</p>
      </div>

      <GlassCard className="!p-0 border-white/5 shadow-2xl relative overflow-visible !rounded-2xl">
        <div className="relative p-0 pb-20">
          <textarea ref={shadowRef} value={text} readOnly aria-hidden="true" className="absolute top-0 left-0 w-full -z-10 opacity-0 pointer-events-none text-xl font-light p-8" tabIndex={-1} />
          <textarea 
            ref={textareaRef} 
            value={text} 
            onChange={(e) => setText(e.target.value)} 
            placeholder={t('home_input_placeholder')} 
            className="w-full bg-transparent border-none outline-none text-xl text-white font-normal placeholder-white/10 resize-none leading-relaxed scrollbar-hide p-8 transition-[height] duration-500 ease-in-out" 
            style={{ height: '180px' }} 
          />
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-20 bg-white/[0.02] border-t border-white/10 backdrop-blur-3xl flex items-center justify-between px-8 rounded-b-2xl shadow-[0_-10px_30px_rgba(0,0,0,0.1)]">
          <div className="flex items-center gap-4">
            <div 
              onClick={() => setShowVoiceModal(true)} 
              className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm cursor-pointer hover:border-white/20 transition-all hover:bg-white/10"
            >
              <img src={selectedVoice.avatarUrl} className="w-9 h-9 rounded-lg border border-white/10 object-cover" />
              <div className="flex flex-col">
                <span className="font-medium text-white text-sm tracking-tight">{selectedVoice.name}</span>
                <span className="text-[10px] text-white/40 uppercase font-normal tracking-widest">{translateCategory(selectedVoice.category)}</span>
              </div>
              <ChevronDown size={14} className="text-white/20 ml-1" />
            </div>
          </div>
          
          <button 
            onClick={handleStartSynthesis} 
            disabled={!text.trim()}
            className={`px-10 h-11 rounded-xl font-bold text-[12px] uppercase tracking-[0.2em] shadow-lg transition-all flex items-center gap-3 border border-transparent ${!text.trim() ? 'bg-white/5 text-white/20' : 'bg-gradient-to-tr from-blue-600 to-cyan-500 text-white hover:scale-[1.03] active:scale-[0.97] shadow-blue-500/30'}`}
          >
            <Zap size={16} fill="currentColor" /> 开始合成音频
          </button>
        </div>
      </GlassCard>

      <div className="space-y-4">
        <div className="flex justify-between items-center px-2">
          <h2 className="text-xl font-normal text-white uppercase tracking-tight">{t('find_voice')}</h2>
          <button onClick={() => onNavigate(Page.PRESET)} className="text-[11px] font-normal uppercase tracking-widest text-white/40 hover:text-white flex items-center gap-2 transition-all">
            {t('find_more')} <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
          {featuredVoices.map((voice, idx) => {
            const playing = currentVoice?.id === voice.id && isPlaying;
            const isSelected = selectedVoice.id === voice.id;
            return (
              <div 
                key={voice.id} 
                style={{ animationDelay: `${idx * 40}ms` }}
                className={`glass-panel group flex items-center p-3 rounded-xl transition-all duration-300 border animate-in fade-in slide-in-from-bottom-4 ${playing ? 'bg-white/15 border-white/30 scale-[1.02] shadow-[0_10px_25px_rgba(0,0,0,0.2)]' : 'hover:bg-white/[0.08] hover:border-white/20'}`}
              >
                <div className="relative cursor-pointer shrink-0 mr-3" onClick={() => playVoice(voice)}>
                    <img src={voice.avatarUrl} alt={voice.name} className="w-11 h-11 rounded-lg object-cover bg-black/20 border border-white/10" />
                    <div className={`absolute inset-0 rounded-lg flex items-center justify-center bg-black/40 backdrop-blur-[1px] transition-all ${playing ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                       {playing ? <Pause size={16} fill="white" className="text-white" /> : <Play size={16} fill="white" className="text-white ml-0.5" />}
                    </div>
                </div>
                <div className="flex-1 min-w-0 mr-2">
                   <h3 className={`text-sm font-medium truncate leading-tight ${playing ? 'text-spark-accent' : 'text-white'}`}>{voice.name}</h3>
                   <p className="text-[10px] text-white/40 uppercase font-normal tracking-wider mt-1 truncate">{translateCategory(voice.category)}</p>
                </div>
                <div className="shrink-0">
                   <button 
                     onClick={() => { setSelectedVoice(voice); onNavigate(Page.TTS); }} 
                     className={`px-3 py-1.5 rounded-lg text-[10px] font-medium uppercase tracking-wider transition-all border ${isSelected ? 'bg-gradient-to-tr from-blue-600 to-cyan-500 border-transparent text-white shadow-md' : 'bg-white/5 border-white/10 text-white/40 hover:text-white hover:bg-white/10'}`}
                   >
                     {isSelected ? '已选' : '使用'}
                   </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {showBackToTop && (
        <button 
          onClick={scrollToTop} 
          className="fixed bottom-10 right-10 z-[100] p-4 rounded-xl bg-white text-black shadow-2xl hover:scale-110 active:scale-95 transition-all duration-500 animate-in slide-in-from-bottom-10"
        >
          <ArrowUp size={24} strokeWidth={2} />
        </button>
      )}

      {showVoiceModal && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
           <div className="absolute inset-0" onClick={() => setShowVoiceModal(false)}></div>
           <div className="relative w-[1000px] h-[85vh] bg-[#0c0c0e] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-500">
              
              <div className="px-6 py-3 border-b border-white/10 flex justify-between items-center bg-[#0e0e11]">
                <h3 className="text-xl font-medium text-white uppercase tracking-widest">选择音色库</h3>
                <button onClick={() => setShowVoiceModal(false)} className="text-white/20 hover:text-white p-2 hover:bg-white/5 rounded-xl transition-all"><X size={24} /></button>
              </div>

              <div className="flex-1 flex flex-col bg-[#08080a] overflow-hidden">
                   <div className="px-6 py-2 border-b border-white/5 flex gap-12 items-center bg-[#050507]">
                      {[
                        { id: 'preset', label: '预设声音' },
                        { id: 'custom', label: '自定义声音' }
                      ].map(tItem => (
                        <button 
                          key={tItem.id} 
                          onClick={() => setModalTab(tItem.id as any)}
                          className={`relative py-3 text-sm font-medium uppercase tracking-[0.2em] transition-all ${modalTab === tItem.id ? 'text-white' : 'text-white/40 hover:text-white/60'}`}
                        >
                          {tItem.label}
                          {modalTab === tItem.id && <div className="absolute -bottom-1 left-0 right-0 h-1 bg-spark-accent rounded-full" />}
                        </button>
                      ))}

                      <div className="relative group flex-1 max-w-md ml-auto">
                         <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                         <input 
                           value={modalSearch}
                           onChange={(e) => setModalSearch(e.target.value)}
                           className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-2 pl-12 pr-6 text-white text-sm font-normal focus:border-white/20 outline-none placeholder:text-white/10 transition-all" 
                           placeholder="关键词搜索..." 
                         />
                      </div>
                   </div>

                   <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                      <div className="grid grid-cols-2 xl:grid-cols-3 gap-3">
                         {filteredModalVoices.map(voice => {
                            const isSelected = selectedVoice.id === voice.id;
                            return (
                              <div 
                                key={voice.id} 
                                className={`group flex items-center p-3 rounded-xl transition-all border ${isSelected ? 'bg-white/10 border-white/20' : 'bg-white/[0.02] border-transparent hover:border-white/10'}`}
                              >
                                <div className="relative shrink-0 mr-4">
                                    <img src={voice.avatarUrl} alt={voice.name} className="w-12 h-12 rounded-xl object-cover bg-black/20 border border-white/10 shadow-lg" />
                                </div>
                                <div className="flex-1 min-w-0 mr-4">
                                   <h3 className={`text-sm font-medium truncate tracking-tight ${isSelected ? 'text-spark-accent' : 'text-white'}`}>{voice.name}</h3>
                                   <p className="text-[10px] text-white/40 uppercase font-normal tracking-widest mt-0.5 truncate">{translateCategory(voice.category)}</p>
                                </div>
                                <div className="shrink-0">
                                  <button 
                                    onClick={() => { setSelectedVoice(voice); setShowVoiceModal(false); }} 
                                    className={`px-4 py-1.5 rounded-lg text-[10px] font-medium uppercase tracking-widest transition-all border ${isSelected ? 'bg-gradient-to-tr from-blue-600 to-cyan-500 text-white' : 'bg-white/5 border-white/10 text-white/40 hover:text-white'}`}
                                  >
                                    {isSelected ? '已选' : '选择'}
                                  </button>
                                </div>
                              </div>
                            );
                         })}
                      </div>
                   </div>
              </div>
           </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default Home;
