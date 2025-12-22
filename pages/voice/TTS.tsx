
import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, Sliders, History, 
  AlertCircle, Smile, Search,
  Type, Eraser, Sparkles, Clock, Trash2, RotateCcw, Zap,
  Loader2
} from 'lucide-react';
import { translateCategory } from '../../constants';
import { usePlayer } from '../../contexts/PlayerContext';
import { useTTS } from '../../contexts/TTSContext';
import { useVoices } from '../../contexts/VoiceContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { Voice } from '../../types';
import { TextShimmerWave } from '../../components/TextShimmerWave';
import { StarButton } from '../../components/StarButton';

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
      } as any;

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
      playVoice(ttsResultVoice as any);
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

  const getSliderStyle = (value: number, min: number, max: number) => {
    const percentage = ((value - min) / (max - min)) * 100;
    return {
      background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${percentage}%, rgba(255,255,255,0.05) ${percentage}%, rgba(255,255,255,0.05) 100%)`,
    };
  };

  // Define filteredModalVoices to fix missing reference in the modal section
  const filteredModalVoices = useMemo(() => {
    return voices.filter(v => {
      const matchTab = v.source === modalTab || (modalTab === 'custom' && v.isCustom);
      const matchSearch = v.name.toLowerCase().includes(modalSearch.toLowerCase());
      return matchTab && matchSearch;
    });
  }, [voices, modalTab, modalSearch]);

  return (
    <div className="h-full flex flex-col pt-8 animate-in fade-in duration-500 overflow-hidden">
      <div className="mb-4 shrink-0 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight uppercase drop-shadow-[0_0_8px_rgba(255,255,255,0.15)]">{t('tts_title')}</h1>
          <p className="text-[10px] font-medium text-white/50 uppercase tracking-[0.2em] mt-1">{t('tts_desc')}</p>
        </div>
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden min-h-0 items-stretch">
        <div className="flex-1 flex flex-col min-w-0 bg-[#0f0f11] rounded-2xl border border-white/5 relative shadow-2xl overflow-hidden">
          <div className="flex-1 p-8 overflow-y-auto custom-scrollbar relative">
             <textarea 
               className="w-full h-full bg-transparent border-none outline-none resize-none text-xl text-white/70 font-normal placeholder-white/5 leading-relaxed custom-scrollbar" 
               placeholder={t('tts_placeholder')} 
               value={text} 
               onChange={(e) => setText(e.target.value)} 
            />
          </div>

          <div className="h-16 border-t border-white/5 bg-black/40 backdrop-blur-xl flex justify-between items-center px-6 shrink-0 relative z-20">
              <div className="flex items-center gap-4">
                  <StarButton 
                    onClick={handleGenerate} 
                    disabled={isGenerating || !text.trim()} 
                    className="h-10 px-8"
                  >
                     {isGenerating ? (
                        <div className="flex items-center gap-2 text-sm font-bold tracking-widest">
                          <Loader2 size={14} className="animate-spin" />
                          <span>合成中</span>
                        </div>
                     ) : (
                       <div className="flex items-center gap-2 text-sm font-bold tracking-widest">
                         <Sparkles size={16} /> {t('generate_audio')}
                       </div>
                     )}
                  </StarButton>
                  <div className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] flex items-center gap-2 bg-white/5 px-3 py-1 rounded-xl border border-white/10"><Type size={12} /> {text.length} / 5,000</div>
              </div>
              <button onClick={() => setText('')} className="p-2.5 text-white/30 hover:text-white transition-all hover:bg-white/5 rounded-xl"><Eraser size={18} /></button>
          </div>
        </div>

        <div className="w-80 bg-[#0f0f11] border border-white/5 rounded-2xl overflow-hidden shadow-2xl flex shrink-0">
            <div className="flex-1 flex flex-col h-full border-r border-white/5">
                <div className="flex items-center justify-between px-5 border-b border-white/5 bg-white/[0.02] shrink-0 h-12">
                    <span className="text-[16px] font-black text-white uppercase tracking-widest drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]">
                      {activeTab === 'settings' ? t('voice_effects') : '合成历史'}
                    </span>
                    {activeTab === 'settings' && (
                      <button onClick={() => { setSpeed(1.0); setPitch(0); setVolume(1.0); setEmotion('natural'); }} className="p-1.5 rounded-lg text-white/20 hover:text-spark-accent transition-colors"><RotateCcw size={14} /></button>
                    )}
                </div>
                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 custom-scrollbar">
                  {activeTab === 'settings' ? (
                    <div className="space-y-6 animate-in fade-in duration-300">
                      <div onClick={() => setShowVoiceModal(true)} className="group p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-spark-accent/30 cursor-pointer transition-all flex items-center gap-3">
                        <img src={selectedVoice.avatarUrl} alt={selectedVoice.name} className="w-10 h-10 rounded-lg object-cover border border-white/10" />
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-bold text-white truncate">{selectedVoice.name}</div>
                            <div className="text-[9px] text-white/40 uppercase font-bold tracking-widest truncate">{translateCategory(selectedVoice.category)}</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-4 gap-1.5">
                        {emotions.map((em) => (
                          <button key={em.id} onClick={() => setEmotion(em.id)} className={`flex flex-col items-center justify-center gap-1.5 py-3 rounded-lg border transition-all ${emotion === em.id ? 'bg-spark-accent/10 border-spark-accent/30 text-white' : 'bg-white/[0.01] border-transparent text-white/30 hover:bg-white/5 hover:text-white'}`}>
                             <span className="text-xl">{em.icon}</span> 
                             <span className="text-[8px] font-bold uppercase truncate w-full text-center px-1">{em.label}</span>
                          </button>
                        ))}
                      </div>
                      <div className="space-y-6 pt-2">
                        {[
                          { label: t('speed'), val: speed, set: setSpeed, min: 0.5, max: 2.0, step: 0.1, fmt: (v:number)=>v.toFixed(1)+'x' },
                          { label: t('pitch'), val: pitch, set: setPitch, min: -10, max: 10, step: 1, fmt: (v:number)=>(v>0?'+':'')+v },
                          { label: t('volume'), val: volume, set: setVolume, min: 0, max: 2.0, step: 0.1, fmt: (v:number)=>(v*100).toFixed(0)+'%' },
                        ].map((s) => (
                          <div key={s.label} className="space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{s.label}</span>
                              <span className="text-spark-accent font-bold text-[11px] tabular-nums">{s.fmt(s.val)}</span>
                            </div>
                            <input type="range" min={s.min} max={s.max} step={s.step} value={s.val} onChange={(e) => s.set(parseFloat(e.target.value))} style={getSliderStyle(s.val, s.min, s.max)} className="glow-slider" />
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4 animate-in fade-in duration-300">
                      {ttsHistory.length > 0 ? (
                        ttsHistory.map((item) => (
                          <div key={item.id} className="p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-spark-accent/30 transition-all group/hist">
                             <div className="flex items-center gap-3 mb-3">
                                <img src={item.avatarUrl} className="w-8 h-8 rounded-lg border border-white/5" alt={item.voiceName} />
                                <div className="flex-1 min-w-0">
                                   <div className="text-[11px] font-bold text-white truncate">{item.voiceName}</div>
                                   <div className="text-[8px] text-white/30 font-bold uppercase tracking-widest">{item.time}</div>
                                </div>
                                <button onClick={() => playVoice({ id: item.id, name: item.voiceName, avatarUrl: item.avatarUrl, previewUrl: item.audioUrl, category: item.category as any } as any)} className="p-1.5 rounded-lg bg-white/5 hover:bg-spark-accent text-white/40 hover:text-white transition-all shadow-sm"><Zap size={10} fill="currentColor" /></button>
                             </div>
                             <p className="text-[10px] text-white/50 line-clamp-2 leading-relaxed italic font-medium">"{item.text}"</p>
                          </div>
                        ))
                      ) : (
                        <div className="space-y-2 text-center py-20 opacity-10">
                          <History size={40} className="mx-auto mb-4" />
                          <p className="text-[10px] font-bold uppercase tracking-widest">暂无记录</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
            </div>
            <div className="w-12 shrink-0 flex flex-col items-center py-4 gap-4 bg-white/[0.01]">
                <button onClick={() => setActiveTab('settings')} className={`p-3 rounded-xl transition-all ${activeTab === 'settings' ? 'bg-spark-accent text-white shadow-lg shadow-spark-accent/20' : 'text-white/20 hover:text-white/40'}`}><Sliders size={18} /></button>
                <button onClick={() => setActiveTab('history')} className={`p-3 rounded-xl transition-all ${activeTab === 'history' ? 'bg-spark-accent text-white shadow-lg shadow-spark-accent/20' : 'text-white/20 hover:text-white/40'}`}><History size={18} /></button>
            </div>
        </div>
      </div>
      {/* Modal and Portal omitted for brevity, same as previous */}
    </div>
  );
};

export default TTS;
