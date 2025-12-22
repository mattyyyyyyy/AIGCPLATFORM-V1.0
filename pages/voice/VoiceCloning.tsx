
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
            <div className="max-w-3xl mx-auto space-y-6">
              {/* Step 1 */}
              <div className="space-y-4">
                 <div className="flex items-center gap-4">
                    <div className="w-7 h-7 rounded-lg bg-spark-accent/10 border border-spark-accent/20 flex items-center justify-center text-spark-accent font-bold text-xs">1</div>
                    <h2 className="text-[13px] font-normal text-white uppercase tracking-widest">采集样本</h2>
                    <div className="flex gap-2 ml-auto">
                        <button onClick={() => {setActiveTab('upload'); setFile(null);}} className={`px-4 py-1.5 rounded-xl border text-[11px] font-bold transition-all flex items-center gap-2 ${activeTab === 'upload' ? 'bg-spark-accent/20 border-spark-accent/40 text-white' : 'bg-white/[0.02] border-white/5 text-white/30 hover:text-white'}`}>
                            <UploadCloud size={14} /> 本地上传
                        </button>
                        <button onClick={() => {setActiveTab('record'); setFile(null);}} className={`px-4 py-1.5 rounded-xl border text-[11px] font-bold transition-all flex items-center gap-2 ${activeTab === 'record' ? 'bg-spark-accent/20 border-spark-accent/40 text-white' : 'bg-white/[0.02] border-white/5 text-white/30 hover:text-white'}`}>
                            <Mic size={14} /> 在线录音
                        </button>
                    </div>
                 </div>

                 <div className="mt-2">
                   {activeTab === 'upload' ? (
                     <div onClick={() => fileInputRef.current?.click()} className="h-32 border-2 border-dashed border-white/10 rounded-2xl bg-white/[0.01] hover:bg-white/[0.03] transition-all flex flex-col items-center justify-center cursor-pointer group shadow-inner">
                       <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="audio/*" className="hidden" />
                       <UploadCloud size={28} className="text-white/10 mb-2 group-hover:text-spark-accent transition-colors" />
                       <span className="text-[11px] font-medium text-white/30">{file ? file.name : "点击上传样本"}</span>
                     </div>
                   ) : (
                     <div className="flex flex-col items-center py-6 space-y-6">
                        <div className="text-center px-4">
                           <p className="text-sm font-black text-emerald-500 uppercase tracking-[0.2em] mb-4 drop-shadow-md">朗读以下内容</p>
                           <p className="text-xl text-white font-medium leading-relaxed italic drop-shadow-lg max-w-2xl">"{readingText}"</p>
                        </div>
                        <div className="scale-95 w-full">
                           <AIVoiceInput onStart={onStartRecording} onStop={onStopRecording} />
                        </div>
                     </div>
                   )}
                 </div>
              </div>

              {/* Step 2 */}
              <div className={`space-y-4 transition-all duration-500 ${!file ? 'opacity-20 pointer-events-none' : 'opacity-100'}`}>
                 <div className="flex items-center gap-4">
                    <div className="w-7 h-7 rounded-lg bg-spark-accent/10 border border-spark-accent/20 flex items-center justify-center text-spark-accent font-bold text-xs">2</div>
                    <h2 className="text-[13px] font-normal text-white uppercase tracking-widest">配置训练</h2>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                       <label className="text-sm font-bold text-white uppercase tracking-wider ml-1">音色名称</label>
                       <input value={projectName} onChange={(e) => setProjectName(e.target.value)} className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-spark-accent/40" placeholder="填写声音名称…" />
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-sm font-bold text-white uppercase tracking-wider ml-1">备注信息</label>
                       <input value={description} onChange={(e) => setDescription(e.target.value)} className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-spark-accent/40" placeholder="填写声音备注..." />
                    </div>
                 </div>
              </div>
            </div>
          </div>

          <div className="h-14 border-t border-white/10 bg-black/40 backdrop-blur-xl flex justify-between items-center px-8 shrink-0 relative z-20">
              <div className="flex items-center gap-2 text-[9px] font-bold text-white/30 uppercase tracking-widest">
                 <div className="w-1 h-1 rounded-full bg-spark-accent" />
                 <span>高质量录音将提升克隆效果</span>
              </div>
              <div className="flex items-center gap-4">
                 <button onClick={() => {setFile(null); setProjectName(''); setDescription('');}} className="p-2 text-white/20 hover:text-white transition-all"><RotateCcw size={16} /></button>
                 <StarButton onClick={handleCreate} disabled={!file || !projectName || isCloning} className="min-w-[140px] !font-medium">
                   {isCloning ? "正在生成中" : "开始克隆声音"}
                 </StarButton>
              </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-80 bg-black/20 backdrop-blur-2xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col shrink-0">
            <div className="h-12 border-b border-white/10 flex items-center px-5 gap-3 bg-white/[0.02] shrink-0">
                <Settings2 size={16} className="text-spark-accent" />
                <span className="text-[14px] font-medium text-white uppercase tracking-widest drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]">自定义声音库</span>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2 custom-scrollbar">
              {customVoices.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4 text-white/60">
                  <FileAudio size={48} />
                  <p className="text-[12px] font-bold uppercase tracking-widest">暂无记录</p>
                </div>
              ) : (
                customVoices.map((voice) => {
                  const playing = currentVoice?.id === voice.id && isPlaying;
                  return (
                    <div key={voice.id} className="group p-3 rounded-xl border border-white/5 bg-white/5 backdrop-blur-sm transition-all hover:border-spark-accent/30 flex flex-col gap-2 shadow-sm">
                      <div className="flex items-center gap-3">
                          <div className="relative cursor-pointer shrink-0" onClick={() => playVoice(voice)}>
                             <img src={voice.avatarUrl} className="w-9 h-9 rounded-lg border border-white/10 object-cover" alt={voice.name} />
                             <div className={`absolute inset-0 rounded-lg bg-black/40 flex items-center justify-center transition-opacity ${playing ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                                {playing ? <Pause size={12} fill="white" className="text-white" /> : <Play size={12} fill="white" className="text-white ml-0.5" />}
                             </div>
                          </div>
                          <div className="flex-1 min-w-0 text-left">
                             <h4 className="text-[13px] font-medium text-white truncate">{voice.name}</h4>
                             {voice.notes && (
                               <p className="text-[10px] text-white/30 italic truncate">“{voice.notes}”</p>
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
        <div className="fixed top-24 left-1/2 -translate-x-1/2 bg-white text-black px-6 py-3 rounded-full shadow-2xl z-[100] animate-in slide-in-from-top-5 fade-in flex items-center gap-3">
           <CheckCircle2 size={20} className="text-green-600" />
           <span className="font-bold text-sm tracking-wide">克隆成功，已同步至声纹库</span>
        </div>,
        document.body
      )}
    </div>
  );
};

export default VoiceCloning;
