
import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, Sliders, History, 
  AlertCircle, Smile, Search,
  Type, Eraser, Sparkles, Clock, Trash2, RotateCcw, Zap
} from 'lucide-react';
import { translateCategory } from '../../constants';
import { usePlayer } from '../../contexts/PlayerContext';
import { useTTS } from '../../contexts/TTSContext';
import { useVoices } from '../../contexts/VoiceContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { Voice } from '../../types';
import { TextShimmerWave } from '../../components/TextShimmerWave';

interface TTSHistoryItem {
  id: string;
  text: string;
  voiceName: string;
  time: string;
  audioUrl: string;
  avatarUrl: string;
  category: string;
}

const TTS: React.FC = () => {
  const { text, setText, selectedVoice } = useTTS();
  const { voices } = useVoices();
  const { t } = useLanguage();
  const { playVoice, closePlayer: closeGlobalPlayer } = usePlayer();

  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'settings' | 'history'>('settings');
  const [error, setError] = useState<string | null>(null);
  const [ttsHistory, setTtsHistory] = useState<TTSHistoryItem[]>([]);
  
  const [modalTab, setModalTab] = useState<'preset' | 'custom'>('preset');
  const [modalSearch, setModalSearch] = useState('');

  const [speed, setSpeed] = useState(1.0);
  const [pitch, setPitch] = useState(0);
  const [volume, setVolume] = useState(1.0);
  const [emotion, setEmotion] = useState('natural');

  const { setSelectedVoice } = useTTS();

  const handleGenerate = async () => {
    if (!text.trim()) return;
    setIsGenerating(true);
    setError(null);
    
    closeGlobalPlayer();

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      const demoAudioUrl = "https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3";
      
      const ttsResultVoice: Voice = {
        ...selectedVoice,
        id: `tts_gen_${Date.now()}`,
        previewUrl: demoAudioUrl,
        name: `${selectedVoice.name} (合成结果)`,
      };

      const newItem: TTSHistoryItem = {
        id: ttsResultVoice.id,
        text: text.slice(0, 150),
        voiceName: selectedVoice.name,
        time: new Date().toLocaleTimeString(),
        audioUrl: demoAudioUrl,
        avatarUrl: selectedVoice.avatarUrl,
        category: selectedVoice.category
      };
      setTtsHistory(prev => [newItem, ...prev].slice(0, 20));
      playVoice(ttsResultVoice);
    } catch (err: any) {
      setError("模拟合成出错，请检查配置。");
    } finally {
      setIsGenerating(false);
    }
  };

  const emotions = [
    { id: 'natural', label: t('emotion_natural'), icon: '✨' },
    { id: 'happy', label: t('emotion_happy'), icon: '😊' },
    { id: 'sad', label: t('emotion_sad'), icon: '😢' },
    { id: 'angry', label: t('emotion_angry'), icon: '😤' },
    { id: 'excited', label: t('emotion_excited'), icon: '🤩' },
    { id: 'whisper', label: t('emotion_whisper'), icon: '🤫' },
    { id: 'friendly', label: '友好', icon: '🤝' },
    { id: 'serious', label: '严肃', icon: '🧐' },
  ];

  const filteredModalVoices = useMemo(() => {
    return voices.filter(v => {
      const matchTab = v.source === modalTab || (modalTab === 'custom' && v.isCustom);
      const matchSearch = v.name.toLowerCase().includes(modalSearch.toLowerCase());
      return matchTab && matchSearch;
    });
  }, [voices, modalTab, modalSearch]);

  const playFromHistory = (item: TTSHistoryItem) => {
    const historyVoice: Voice = {
      id: item.id,
      name: `${item.voiceName} (历史记录)`,
      gender: 'Male',
      language: 'Chinese',
      tags: [],
      category: item.category as any,
      avatarUrl: item.avatarUrl,
      previewUrl: item.audioUrl
    };
    playVoice(historyVoice);
  };

  const deleteHistoryItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setTtsHistory(prev => prev.filter(item => item.id !== id));
  };

  const resetParams = () => {
    setSpeed(1.0); setPitch(0); setVolume(1.0); setEmotion('natural');
  };

  const getSliderStyle = (value: number, min: number, max: number) => {
    const percentage = ((value - min) / (max - min)) * 100;
    return {
      background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${percentage}%, rgba(255,255,255,0.05) ${percentage}%, rgba(255,255,255,0.05) 100%)`,
    };
  };

  return (
    <div className="h-full flex flex-col pt-8 animate-in fade-in duration-500 overflow-hidden">
      {/* Title Section */}
      <div className="mb-6 shrink-0 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight uppercase">{t('tts_title')}</h1>
          <p className="text-[11px] font-black text-white/30 uppercase tracking-[0.25em] mt-1">{t('tts_desc')}</p>
        </div>
      </div>

      {/* Main Row */}
      <div className="flex-1 flex gap-6 overflow-hidden min-h-0 items-stretch">
        <div className="flex-1 flex flex-col min-w-0 bg-[#0f0f11] rounded-[2rem] border border-white/5 relative shadow-2xl overflow-hidden">
          <div className="flex-1 p-10 overflow-y-auto custom-scrollbar relative">
             <textarea 
               className="w-full h-full bg-transparent border-none outline-none resize-none text-2xl text-white/80 font-medium placeholder-white/5 leading-relaxed custom-scrollbar" 
               placeholder={t('tts_placeholder')} 
               value={text} 
               onChange={(e) => setText(e.target.value)} 
            />
             {error && (
               <div className="absolute top-8 left-8 right-8 z-40 animate-in slide-in-from-top-4">
                  <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-6 py-4 rounded-xl flex items-center gap-4 backdrop-blur-xl">
                    <AlertCircle size={20} />
                    <span className="text-sm font-bold">{error}</span>
                  </div>
               </div>
             )}
          </div>

          <div className="h-24 border-t border-white/5 bg-black/40 backdrop-blur-3xl flex justify-between items-center px-10 shrink-0 relative z-20">
              <div className="flex items-center gap-6">
                  <button 
                    onClick={handleGenerate} 
                    disabled={isGenerating || !text.trim()} 
                    className={`px-12 h-16 rounded-[1.25rem] font-black text-[15px] uppercase tracking-[0.25em] transition-all flex items-center gap-4 shadow-2xl min-w-[220px] ${isGenerating || !text.trim() ? 'bg-white/5 text-white/20' : 'bg-white text-black hover:bg-white/90 hover:scale-[1.03] active:scale-[0.97] shadow-white/10'}`}
                  >
                     {isGenerating ? (
                       <div className="flex items-center gap-3">
                         <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                         <TextShimmerWave className="[--base-color:rgba(0,0,0,0.5)] font-black uppercase tracking-widest" children={t('generating')} />
                       </div>
                     ) : (
                       <>
                         <Sparkles size={22} />
                         {t('generate_audio')}
                       </>
                     )}
                  </button>
                  <div className="w-[1px] h-8 bg-white/10 mx-2" />
                  <div className="text-[11px] font-black text-white/20 uppercase tracking-[0.2em] flex items-center gap-3 bg-white/5 px-4 py-2 rounded-xl border border-white/5"><Type size={14} /> {text.length.toLocaleString()} / 5,000</div>
              </div>
              <button onClick={() => setText('')} className="p-4 text-white/20 hover:text-white transition-all hover:bg-white/10 rounded-2xl" title="清除内容"><Eraser size={22} /></button>
          </div>
        </div>

        <div className="w-[380px] bg-[#0f0f11] border border-white/5 rounded-[2rem] overflow-hidden shadow-2xl flex shrink-0">
            <div className="flex-1 flex flex-col h-full border-r border-white/5">
                <div className="flex items-center justify-between px-6 border-b border-white/5 bg-white/[0.02] shrink-0 h-14">
                    <div className="flex items-center gap-3">
                      {activeTab === 'settings' ? <Sliders size={16} className="text-spark-accent" /> : <History size={16} className="text-white/40" />}
                      <span className="text-[16px] font-black text-white uppercase tracking-[0.15em] opacity-90">
                        {activeTab === 'settings' ? t('voice_effects') : '合成历史'}
                      </span>
                    </div>
                    {activeTab === 'settings' && (
                      <button onClick={resetParams} className="p-2 rounded-xl text-white/20 hover:text-spark-accent hover:bg-white/5 transition-all"><RotateCcw size={16} /></button>
                    )}
                </div>
                
                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 custom-scrollbar">
                  {activeTab === 'settings' ? (
                    <div className="space-y-6 animate-in fade-in duration-300">
                      <div onClick={() => setShowVoiceModal(true)} className="group p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-spark-accent/30 cursor-pointer transition-all flex items-center gap-4 hover:scale-[1.02] active:scale-[0.98]">
                        <img src={selectedVoice.avatarUrl} alt={selectedVoice.name} className="w-14 h-14 rounded-2xl object-cover border border-white/10 shadow-lg" />
                        <div className="flex-1 min-w-0">
                            <div className="text-base font-black text-white truncate tracking-tight">{selectedVoice.name}</div>
                            <div className="text-[10px] text-white/30 font-black uppercase tracking-[0.2em] mt-1.5 truncate">{translateCategory(selectedVoice.category)}</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-2.5">
                        {emotions.map((em) => (
                          <button key={em.id} onClick={() => setEmotion(em.id)} title={em.label} className={`flex flex-col items-center justify-center gap-2 py-4 rounded-xl border transition-all ${emotion === em.id ? 'bg-spark-accent/10 border-spark-accent/30 text-white shadow-[0_0_15px_rgba(59,130,246,0.2)]' : 'bg-white/[0.02] border-transparent text-white/30 hover:bg-white/5 hover:text-white'}`}>
                             <span className="text-2xl">{em.icon}</span> 
                             <span className="text-[9px] font-black uppercase tracking-widest truncate w-full text-center px-1 opacity-60">{em.label}</span>
                          </button>
                        ))}
                      </div>

                      <div className="space-y-8 pt-4">
                        {[
                          { label: t('speed'), val: speed, set: setSpeed, min: 0.5, max: 2.0, step: 0.1, fmt: (v:number)=>v.toFixed(1)+'x' },
                          { label: t('pitch'), val: pitch, set: setPitch, min: -10, max: 10, step: 1, fmt: (v:number)=>(v>0?'+':'')+v },
                          { label: t('volume'), val: volume, set: setVolume, min: 0, max: 2.0, step: 0.1, fmt: (v:number)=>(v*100).toFixed(0)+'%' },
                        ].map((s) => (
                          <div key={s.label} className="space-y-4">
                            <div className="flex justify-between items-center px-1">
                              <span className="text-[11px] font-black text-white/40 uppercase tracking-[0.2em]">{s.label}</span>
                              <span className="text-spark-accent font-black text-[12px] tabular-nums tracking-widest">{s.fmt(s.val)}</span>
                            </div>
                            <input type="range" min={s.min} max={s.max} step={s.step} value={s.val} onChange={(e) => s.set(parseFloat(e.target.value))} style={getSliderStyle(s.val, s.min, s.max)} className="glow-slider" />
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3 animate-in fade-in duration-300">
                      {ttsHistory.length === 0 ? (
                        <div className="h-full py-24 flex flex-col items-center justify-center opacity-5 text-center p-8">
                          <History size={48} className="mb-6" />
                          <p className="text-[11px] font-black uppercase tracking-[0.3em]">暂无历史记录</p>
                        </div>
                      ) : (
                        ttsHistory.map((item) => (
                          <div key={item.id} onClick={() => playFromHistory(item)} className="group p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-spark-accent/30 transition-all cursor-pointer relative">
                            <div className="flex justify-between items-center mb-2">
                              <div className="flex items-center gap-2"><Clock size={12} className="text-spark-accent/60" /><span className="text-[10px] font-black text-white/30 tabular-nums uppercase tracking-widest">{item.time}</span></div>
                              <span className="text-[10px] font-black text-white/10 uppercase tracking-[0.15em] bg-white/5 px-2 py-0.5 rounded">{item.voiceName}</span>
                            </div>
                            <p className="text-white/40 text-[11px] font-bold line-clamp-2 leading-relaxed tracking-tight">{item.text}</p>
                            <button onClick={(e) => deleteHistoryItem(item.id, e)} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-2 text-white/20 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"><Trash2 size={12} /></button>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
            </div>

            <div className="w-16 shrink-0 flex flex-col items-center py-6 gap-6 bg-white/[0.01]">
                <button 
                  onClick={() => setActiveTab('settings')} 
                  title="配置"
                  className={`p-4 rounded-2xl transition-all hover:scale-110 active:scale-90 ${activeTab === 'settings' ? 'bg-spark-accent text-white shadow-[0_0_20px_rgba(59,130,246,0.4)]' : 'text-white/20 hover:text-white/50'}`}
                >
                  <Sliders size={24} />
                </button>
                <button 
                  onClick={() => setActiveTab('history')} 
                  title="历史"
                  className={`p-4 rounded-2xl transition-all hover:scale-110 active:scale-90 ${activeTab === 'history' ? 'bg-spark-accent text-white shadow-[0_0_20px_rgba(59,130,246,0.4)]' : 'text-white/20 hover:text-white/50'}`}
                >
                  <History size={24} />
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default TTS;
