
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  UploadCloud, Mic, Trash2, CheckCircle2, 
  Sparkles, RotateCcw, Info, User, Clock, 
  FileAudio, AlertCircle, X, Play, Pause, Save, Square,
  Loader2,
  Settings2,
  Edit3,
  Check
} from 'lucide-react';
import { RANDOM_READING_TEXTS, translateCategory } from '../../constants';
import { Voice } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';
import { useVoices } from '../../contexts/VoiceContext';
import { usePlayer } from '../../contexts/PlayerContext';
import { TextShimmerWave } from '../../components/TextShimmerWave';
import { AIVoiceInput } from '../../components/AIVoiceInput';
import { StarButton } from '../../components/StarButton';
import { SciFiLoader } from '../../components/SciFiLoader';

const VoiceCloning: React.FC = () => {
  const { voices, addVoice, deleteVoice, updateVoice, registerSpeaker } = useVoices();
  const { playVoice, currentVoice, isPlaying } = usePlayer();
  
  const [activeTab, setActiveTab] = useState<'upload' | 'record'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordTime, setRecordTime] = useState(0);
  const [readingText, setReadingText] = useState(RANDOM_READING_TEXTS[0]);
  const [projectName, setProjectName] = useState('');
  const [description, setDescription] = useState('');
  const [isCloning, setIsCloning] = useState(false);
  
  // Toast state
  const [showToast, setShowToast] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const customVoices = voices.filter(v => v.source === 'custom' || v.isCustom);

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setFile(e.target.files[0]);
  };

  const onStartRecording = () => {
    setIsRecording(true);
    setReadingText(RANDOM_READING_TEXTS[Math.floor(Math.random() * RANDOM_READING_TEXTS.length)]);
  };

  const onStopRecording = (duration: number) => {
    setIsRecording(false);
    setRecordTime(duration);
    setFile(new File(["audio content"], `recorded_sample_${Date.now()}.wav`, { type: "audio/wav" }));
  };

  const handleCreate = () => {
     if (!projectName || !file) return;
     setIsCloning(true);
     
     setTimeout(() => {
       setIsCloning(false);
       const isSuccess = true; // Mock success
       
       if (isSuccess) {
         const voiceId = `custom_${Date.now()}`;
         const avatarUrl = `https://api.dicebear.com/7.x/pixel-art/svg?seed=${projectName}`;
         
         const newVoice: Voice = {
           id: voiceId,
           name: projectName,
           gender: 'Male',
           language: 'Chinese',
           tags: [],
           notes: description,
           category: 'Character',
           avatarUrl: avatarUrl,
           isCustom: true,
           isPublic: true,
           previewUrl: "https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3",
           source: 'custom'
         };

         // Sync to Voice Library
         addVoice(newVoice);
         
         // Sync to Voiceprint Registry (Speaker Center)
         registerSpeaker({
            id: voiceId,
            name: projectName,
            color: 'bg-spark-accent',
            isKnown: true,
            avatarSeed: projectName,
            source: 'cloned' // Mark as cloned
         });

         setShowToast(true);
         setProjectName('');
         setDescription('');
         setFile(null);
       }
     }, 3500);
  };

  return (
    <div className="h-full flex flex-col pt-2 animate-in fade-in duration-500 overflow-hidden relative">
      <div className="mb-2 shrink-0">
        <h1 className="text-2xl font-light text-white tracking-tight uppercase drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">声音克隆</h1>
        <p className="text-[11px] font-normal text-white/50 uppercase tracking-[0.2em] mt-1">训练专属 AI 数字孪生音色</p>
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden min-h-0 items-stretch relative">
        <div className="flex-1 flex flex-col min-w-0 bg-black/20 backdrop-blur-2xl border border-white/10 rounded-2xl relative shadow-2xl overflow-hidden">
          {isCloning && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-[2px]">
              <SciFiLoader text="正在生成中…" size={160} />
            </div>
          )}

          <div className={`flex-1 p-6 overflow-y-auto custom-scrollbar relative transition-all duration-500 ${isCloning ? 'opacity-20 blur-sm pointer-events-none' : 'opacity-100'}`}>
            <div className="max-w-3xl mx-auto space-y-12 py-4">
              {/* Step 1 */}
              <div className="space-y-6">
                 <div className="flex items-center gap-6">
                    <motion.div 
                      animate={{ 
                        boxShadow: [
                          "0 0 15px rgba(59,130,246,0.3)", 
                          "0 0 35px rgba(59,130,246,0.6)", 
                          "0 0 15px rgba(59,130,246,0.3)"
                        ] 
                      }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      className="w-14 h-14 rounded-2xl bg-gradient-to-br from-spark-accent to-blue-600 border border-white/30 flex items-center justify-center text-white font-black text-2xl shrink-0 shadow-[0_0_20px_rgba(59,130,246,0.5)]"
                    >
                      1
                    </motion.div>
                    <div className="flex flex-col">
                      <h2 className="text-lg font-bold text-white uppercase tracking-[0.15em] leading-none">采集样本</h2>
                      <span className="text-[10px] text-white/30 uppercase tracking-widest mt-1.5 font-medium">Collect Audio Samples</span>
                    </div>
                    <div className="flex gap-2.5 ml-auto">
                        <button onClick={() => {setActiveTab('upload'); setFile(null);}} className={`px-5 py-2 rounded-xl border text-[11px] font-bold transition-all flex items-center gap-2 ${activeTab === 'upload' ? 'bg-spark-accent/20 border-spark-accent/60 text-white shadow-[0_0_20px_rgba(59,130,246,0.15)]' : 'bg-white/[0.02] border-white/5 text-white/30 hover:text-white'}`}>
                            <UploadCloud size={14} /> 本地上传
                        </button>
                        <button onClick={() => {setActiveTab('record'); setFile(null);}} className={`px-5 py-2 rounded-xl border text-[11px] font-bold transition-all flex items-center gap-2 ${activeTab === 'record' ? 'bg-spark-accent/20 border-spark-accent/60 text-white shadow-[0_0_20px_rgba(59,130,246,0.15)]' : 'bg-white/[0.02] border-white/5 text-white/30 hover:text-white'}`}>
                            <Mic size={14} /> 在线录音
                        </button>
                    </div>
                 </div>

                 <div className="mt-4 px-2">
                   {activeTab === 'upload' ? (
                     <div onClick={() => fileInputRef.current?.click()} className="h-40 border-2 border-dashed border-white/10 rounded-[2rem] bg-white/[0.01] hover:bg-white/[0.03] transition-all flex flex-col items-center justify-center cursor-pointer group shadow-inner">
                       <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="audio/*" className="hidden" />
                       <UploadCloud size={36} className="text-white/10 mb-3 group-hover:text-spark-accent transition-all group-hover:scale-110" />
                       <span className="text-xs font-bold text-white/40 group-hover:text-white/60 transition-colors uppercase tracking-widest">{file ? file.name : "点击或拖拽上传音色样本"}</span>
                       <span className="text-[10px] text-white/10 mt-2">支持 WAV, MP3, FLAC 格式</span>
                     </div>
                   ) : (
                     <div className="flex flex-col items-center py-4 space-y-6">
                        <div className="text-center px-4">
                           <p className="text-[12px] font-black text-emerald-500/80 uppercase tracking-[0.3em] mb-4">请清晰朗读以下文字</p>
                           <p className="text-xl md:text-2xl text-white font-medium leading-relaxed italic drop-shadow-[0_0_20px_rgba(255,255,255,0.1)] max-w-2xl">"{readingText}"</p>
                        </div>
                        <div className="scale-100 w-full max-w-lg">
                           <AIVoiceInput onStart={onStartRecording} onStop={onStopRecording} />
                        </div>
                     </div>
                   )}
                 </div>
              </div>

              {/* Step 2 */}
              <div className={`space-y-6 transition-all duration-700 ${!file ? 'opacity-20 pointer-events-none grayscale' : 'opacity-100'}`}>
                 <div className="flex items-center gap-6">
                    <motion.div 
                      animate={file ? { 
                        boxShadow: [
                          "0 0 15px rgba(59,130,246,0.3)", 
                          "0 0 35px rgba(59,130,246,0.6)", 
                          "0 0 15px rgba(59,130,246,0.3)"
                        ] 
                      } : {}}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      className="w-14 h-14 rounded-2xl bg-gradient-to-br from-spark-accent to-blue-600 border border-white/30 flex items-center justify-center text-white font-black text-2xl shrink-0 shadow-[0_0_20px_rgba(59,130,246,0.5)]"
                    >
                      2
                    </motion.div>
                    <div className="flex flex-col">
                      <h2 className="text-lg font-bold text-white uppercase tracking-[0.15em] leading-none">配置训练</h2>
                      <span className="text-[10px] text-white/30 uppercase tracking-widest mt-1.5 font-medium">Configure Voice Training</span>
                    </div>
                 </div>
                 <div className="grid grid-cols-2 gap-6 px-2">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-1">音色名称</label>
                       <input value={projectName} onChange={(e) => setProjectName(e.target.value)} className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-5 py-3.5 text-sm text-white outline-none focus:border-spark-accent/50 shadow-inner transition-all focus:bg-white/[0.05]" placeholder="填写声音名称…" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-1">备注信息</label>
                       <input value={description} onChange={(e) => setDescription(e.target.value)} className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-5 py-3.5 text-sm text-white outline-none focus:border-spark-accent/50 shadow-inner transition-all focus:bg-white/[0.05]" placeholder="填写声音备注..." />
                    </div>
                 </div>
              </div>
            </div>
          </div>

          <div className="h-20 border-t border-white/10 bg-black/60 backdrop-blur-3xl flex justify-between items-center px-10 shrink-0 relative z-20">
              <div className="flex items-center gap-3">
                 <div className="w-2 h-2 rounded-full bg-spark-accent shadow-[0_0_10px_rgba(59,130,246,0.8)] animate-pulse" />
                 <span className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">高质量录音样本将获得更完美的克隆效果</span>
              </div>
              <div className="flex items-center gap-6">
                 <button onClick={() => {setFile(null); setProjectName(''); setDescription('');}} className="p-3 text-white/20 hover:text-white transition-all hover:bg-white/5 rounded-xl"><RotateCcw size={18} /></button>
                 <StarButton onClick={handleCreate} disabled={!file || !projectName || isCloning} className="min-w-[180px] h-12 !text-sm !font-black !tracking-[0.2em]">
                   {isCloning ? "正在克隆中" : "开始训练模型"}
                 </StarButton>
              </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-80 bg-black/20 backdrop-blur-2xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col shrink-0">
            <div className="h-14 border-b border-white/10 flex items-center px-6 gap-3 bg-white/[0.02] shrink-0">
                <Settings2 size={18} className="text-spark-accent" />
                <span className="text-[13px] font-bold text-white uppercase tracking-[0.25em] drop-shadow-[0_0_10px_rgba(255,255,255,0.4)]">自定义音色库</span>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-6 space-y-3 custom-scrollbar">
              {customVoices.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4 text-white/60">
                  <FileAudio size={56} className="opacity-10 mb-2" />
                  <p className="text-[11px] font-black uppercase tracking-[0.3em] leading-relaxed">暂无自定义记录<br/><span className="text-[9px] opacity-40">开始克隆您的第一个声音</span></p>
                </div>
              ) : (
                customVoices.map((voice) => {
                  const playing = currentVoice?.id === voice.id && isPlaying;
                  return (
                    <div key={voice.id} className={`glass-panel group p-4 rounded-2xl border transition-all duration-300 flex flex-col gap-2 shadow-sm ${playing ? 'bg-white/15 border-white/40' : 'border-white/5 hover:border-white/20 hover:bg-white/[0.08]'}`}>
                      <div className="flex items-center gap-4">
                          <div className="relative cursor-pointer shrink-0" onClick={() => playVoice(voice)}>
                             <img src={voice.avatarUrl} className="w-10 h-10 rounded-xl border border-white/10 object-cover shadow-lg" alt={voice.name} />
                             <div className={`absolute inset-0 rounded-xl bg-black/40 flex items-center justify-center transition-opacity ${playing ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                                {playing ? <Pause size={14} fill="white" className="text-white" /> : <Play size={14} fill="white" className="text-white ml-0.5" />}
                             </div>
                          </div>
                          <div className="flex-1 min-w-0 text-left">
                             <h4 className="text-sm font-bold text-white truncate tracking-tight">{voice.name}</h4>
                             {voice.notes && (
                               <p className="text-[10px] text-white/30 italic truncate mt-0.5">“{voice.notes}”</p>
                             )}
                          </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
        </div>
      </div>

      {showToast && createPortal(
        <div className="fixed top-24 left-1/2 -translate-x-1/2 bg-white text-black px-8 py-4 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.5)] z-[100] animate-in slide-in-from-top-10 fade-in flex items-center gap-4 border border-white/20">
           <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(16,185,129,0.4)]">
             <CheckCircle2 size={18} className="text-white" />
           </div>
           <div className="flex flex-col">
              <span className="font-black text-sm tracking-widest uppercase">训练完成</span>
              <span className="text-[10px] text-black/40 font-bold uppercase tracking-widest">已成功同步至全局声纹中心</span>
           </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default VoiceCloning;
