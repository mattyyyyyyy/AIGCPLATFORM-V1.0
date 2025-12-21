
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
  
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [modalTab, setModalTab] = useState<'preset' | 'custom'>('preset');
  const [modalSearch, setModalSearch] = useState('');
  const [showBackToTop, setShowBackToTop] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const shadowRef = useRef<HTMLTextAreaElement>(null);
  
  const { playVoice, currentVoice, isPlaying } = usePlayer();

  useEffect(() => {
    if (shadowRef.current && textareaRef.current) {
      shadowRef.current.style.height = '0px'; 
      const scrollHeight = shadowRef.current.scrollHeight;
      const newHeight = Math.min(Math.max(scrollHeight, 220), 600);
      textareaRef.current.style.height = `${newHeight}px`;
    }
  }, [text]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setShowBackToTop(e.currentTarget.scrollTop > 300);
  };

  const scrollToTop = () => {
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
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
      className="space-y-10 animate-in fade-in duration-1000 pb-24 overflow-y-auto h-full pr-2 custom-scrollbar scroll-smooth"
    >
      <div className="space-y-1 mt-4">
        <h1 className="text-6xl font-black text-white tracking-tighter drop-shadow-2xl">{t('home_title')}</h1>
        <p className="text-white/40 text-[13px] font-black uppercase tracking-[0.2em] ml-1">专业级 AI 语音合成与创作平台</p>
      </div>

      <GlassCard className="!p-0 border-white/5 shadow-2xl relative overflow-visible !rounded-[2.5rem]">
        <div className="relative p-0 pb-24">
          <textarea ref={shadowRef} value={text} readOnly aria-hidden="true" className="absolute top-0 left-0 w-full -z-10 opacity-0 pointer-events-none text-2xl font-light p-10" tabIndex={-1} />
          <textarea 
            ref={textareaRef} 
            value={text} 
            onChange={(e) => setText(e.target.value)} 
            placeholder={t('home_input_placeholder')} 
            className="w-full bg-transparent border-none outline-none text-2xl text-white font-medium placeholder-white/5 resize-none leading-relaxed scrollbar-hide p-12 transition-[height] duration-500 ease-in-out" 
            style={{ height: '240px' }} 
          />
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-28 bg-black/60 border-t border-white/5 backdrop-blur-3xl flex items-center justify-between px-10 rounded-b-[2.5rem]">
          <div className="flex items-center gap-6">
            <div 
              onClick={() => setShowVoiceModal(true)} 
              className="flex items-center gap-5 px-5 py-3 rounded-2xl bg-white/5 border border-white/10 text-base cursor-pointer hover:border-white/20 transition-all hover:bg-white/10 hover:scale-[1.02]"
            >
              <img src={selectedVoice.avatarUrl} className="w-11 h-11 rounded-xl border border-white/20 shadow-lg object-cover" />
              <div className="flex flex-col">
                <span className="font-black text-white text-base tracking-tight">{selectedVoice.name}</span>
                <span className="text-[10px] text-white/30 uppercase font-black tracking-[0.2em]">{translateCategory(selectedVoice.category)}</span>
              </div>
              <ChevronDown size={16} className="text-white/20 ml-2" />
            </div>
          </div>
          
          <button 
            onClick={() => onNavigate(Page.TTS)} 
            disabled={!text.trim()}
            className={`px-14 h-16 rounded-[1.25rem] font-black text-[15px] uppercase tracking-[0.25em] shadow-2xl transition-all flex items-center gap-4 ${!text.trim() ? 'bg-white/5 text-white/20' : 'bg-spark-accent text-white hover:scale-[1.03] active:scale-[0.97] shadow-blue-500/40'}`}
          >
            <Zap size={22} fill="currentColor" /> {t('generate_audio')}
          </button>
        </div>
      </GlassCard>

      <div className="space-y-6">
        <div className="flex justify-between items-center px-2">
          <h2 className="text-2xl font-black text-white uppercase tracking-tight">{t('find_voice')}</h2>
          <button onClick={() => onNavigate(Page.PRESET)} className="text-[11px] font-black uppercase tracking-[0.2em] text-white/40 hover:text-white flex items-center gap-3 transition-all">
            {t('find_more')} <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5">
          {featuredVoices.map((voice, idx) => {
            const playing = currentVoice?.id === voice.id && isPlaying;
            const isSelected = selectedVoice.id === voice.id;
            return (
              <div 
                key={voice.id} 
                style={{ animationDelay: `${idx * 50}ms` }}
                className={`group flex items-center p-4 rounded-3xl transition-all duration-500 border animate-in fade-in slide-in-from-bottom-4 ${playing ? 'bg-white/10 border-white/30 shadow-2xl scale-[1.02]' : 'bg-white/5 border-white/5 hover:border-white/10 hover:bg-white/[0.08]'}`}
              >
                <div className="relative cursor-pointer shrink-0 mr-4" onClick={() => playVoice(voice)}>
                    <img src={voice.avatarUrl} alt={voice.name} className="w-14 h-14 rounded-2xl object-cover bg-black/20 border border-white/10 shadow-xl" />
                    <div className={`absolute inset-0 rounded-2xl flex items-center justify-center bg-black/40 backdrop-blur-[2px] transition-all ${playing ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                       {playing ? <Pause size={20} fill="white" className="text-white" /> : <Play size={20} fill="white" className="text-white ml-0.5" />}
                    </div>
                </div>
                <div className="flex-1 min-w-0 mr-3">
                   <h3 className={`text-[16px] font-black truncate leading-tight ${playing ? 'text-spark-accent' : 'text-white'}`}>{voice.name}</h3>
                   <p className="text-[9px] text-white/30 uppercase font-black tracking-[0.2em] mt-1.5 truncate">{translateCategory(voice.category)}</p>
                </div>
                <div className="shrink-0">
                   <button 
                     onClick={() => { setSelectedVoice(voice); onNavigate(Page.TTS); }} 
                     className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${isSelected ? 'bg-spark-accent border-spark-accent text-white shadow-lg' : 'bg-white/5 border-white/10 text-white/40 hover:text-white hover:bg-white/10'}`}
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
          className="fixed bottom-12 right-12 z-[100] p-5 rounded-2xl bg-white text-black shadow-2xl hover:scale-110 active:scale-95 transition-all duration-500 animate-in slide-in-from-bottom-10"
        >
          <ArrowUp size={28} strokeWidth={3} />
        </button>
      )}

      {showVoiceModal && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
           <div className="absolute inset-0" onClick={() => setShowVoiceModal(false)}></div>
           <div className="relative w-[1000px] h-[85vh] bg-[#0c0c0e] border border-white/10 rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-500">
              
              <div className="px-10 py-8 border-b border-white/10 flex justify-between items-center bg-[#0e0e11]">
                <h3 className="text-2xl font-black text-white uppercase tracking-widest">选择音色库</h3>
                <button onClick={() => setShowVoiceModal(false)} className="text-white/20 hover:text-white p-3 hover:bg-white/5 rounded-2xl transition-all"><X size={32} /></button>
              </div>

              <div className="flex-1 flex flex-col bg-[#08080a] overflow-hidden">
                   <div className="px-10 py-5 border-b border-white/5 flex gap-12 items-center bg-[#050507]">
                      {[
                        { id: 'preset', label: '预设声音' },
                        { id: 'custom', label: '自定义声音' }
                      ].map(tItem => (
                        <button 
                          key={tItem.id} 
                          onClick={() => setModalTab(tItem.id as any)}
                          className={`relative py-3 text-sm font-black uppercase tracking-[0.2em] transition-all ${modalTab === tItem.id ? 'text-white' : 'text-white/20 hover:text-white/40'}`}
                        >
                          {tItem.label}
                          {modalTab === tItem.id && <div className="absolute -bottom-1 left-0 right-0 h-1 bg-spark-accent rounded-full shadow-[0_0_15px_rgba(59,130,246,0.8)]" />}
                        </button>
                      ))}

                      <div className="relative group flex-1 max-w-md ml-auto">
                         <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                         <input 
                           value={modalSearch}
                           onChange={(e) => setModalSearch(e.target.value)}
                           className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-3.5 pl-14 pr-6 text-white text-base focus:border-white/20 outline-none placeholder:text-white/10 transition-all shadow-inner" 
                           placeholder="关键词搜索..." 
                         />
                      </div>
                   </div>

                   <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
                      <div className="grid grid-cols-2 xl:grid-cols-3 gap-6">
                         {filteredModalVoices.length > 0 ? (
                           filteredModalVoices.map(voice => {
                              const playing = currentVoice?.id === voice.id && isPlaying;
                              const isSelected = selectedVoice.id === voice.id;
                              return (
                                <div 
                                  key={voice.id} 
                                  className={`group flex items-center p-5 rounded-[1.5rem] transition-all border ${playing ? 'bg-white/10 border-white/20 shadow-xl' : 'bg-white/[0.02] border-transparent hover:border-white/10'}`}
                                >
                                  <div className="relative cursor-pointer shrink-0 mr-5" onClick={() => playVoice(voice)}>
                                      <img src={voice.avatarUrl} alt={voice.name} className="w-16 h-16 rounded-[1.25rem] object-cover bg-black/20 border border-white/10 shadow-lg" />
                                      <div className={`absolute inset-0 rounded-[1.25rem] flex items-center justify-center bg-black/40 backdrop-blur-[1px] transition-all ${playing ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                                         {playing ? <Pause size={24} fill="white" className="text-white" /> : <Play size={24} fill="white" className="text-white ml-0.5" />}
                                      </div>
                                  </div>
                                  <div className="flex-1 min-w-0 mr-5">
                                     <h3 className={`text-base font-black truncate tracking-tight ${playing ? 'text-spark-accent' : 'text-white'}`}>{voice.name}</h3>
                                     <p className="text-[10px] text-white/20 uppercase font-black tracking-[0.2em] mt-1.5 truncate">{translateCategory(voice.category)}</p>
                                  </div>
                                  <div className="shrink-0">
                                    <button 
                                      onClick={() => { setSelectedVoice(voice); setShowVoiceModal(false); }} 
                                      className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all border ${isSelected ? 'bg-white text-black shadow-lg shadow-white/10' : 'bg-white/5 border-white/10 text-white/40 hover:text-white'}`}
                                    >
                                      {isSelected ? '已选' : '选择'}
                                    </button>
                                  </div>
                                </div>
                              );
                           })
                         ) : (
                           <div className="col-span-full py-32 flex flex-col items-center justify-center text-white/5">
                              <Search size={80} className="mb-8 opacity-10" />
                              <p className="text-2xl font-black tracking-[0.3em] uppercase italic">未发现匹配项</p>
                           </div>
                         )}
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
