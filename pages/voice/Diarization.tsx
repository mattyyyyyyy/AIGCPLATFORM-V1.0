
import { 
  Users, 
  FileAudio, 
  Edit2, 
  Check, 
  Mic, 
  Settings2, 
  Cpu, 
  Sparkles, 
  Fingerprint, 
  Loader2, 
  AlertCircle, 
  X, 
  Plus, 
  Square, 
  Trash2, 
  Activity, 
  Info 
} from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';
import { SpeakerSegment, SpeakerIdentity } from '../../types';
import { useVoices } from '../../contexts/VoiceContext';
import { analyzeConversation, arrayBufferToBase64 } from '../../services/geminiService';
import { motion, AnimatePresence } from 'framer-motion';
import { TextShimmerWave } from '../../components/TextShimmerWave';
import { StarButton } from '../../components/StarButton';

const SIMULATED_DIALOG = [
  { spk: 'spk_known_1', text: '大家好，欢迎参加今天的语音技术研讨会。我们将探讨最新的声纹识别进展。' },
  { spk: 'spk_known_2', text: '李经理好，我这边已经准备好演示 Demo 了，大家可以看到实时转录的效果。' },
  { spk: 'spk_new_3', text: '抱歉我来晚了，我是研发部的张三。刚才提到的实时延迟是多少？' },
  { spk: 'spk_known_1', text: '没关系，张工。我们刚开始。目前流式处理可以做到百毫秒级。' },
  { spk: 'spk_new_3', text: '明白了，那对于复杂背景噪音的处理能力如何呢？' },
  { spk: 'spk_known_2', text: '我们采用了最新的降噪算法，配合 Gemini 3 的多模态能力，抗噪表现非常优异。' },
  { spk: 'spk_known_1', text: '接下来我们可以测试一下在多人交谈情况下的分离准确度。' }
];

const Diarization: React.FC = () => {
  const { speakerRegistry, updateSpeaker, registerSpeaker, removeSpeaker, clearRegistry } = useVoices();
  
  const [activeSubTab, setActiveSubTab] = useState<'upload' | 'record'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [segments, setSegments] = useState<SpeakerSegment[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordTime, setRecordTime] = useState(0);

  const timerRef = useRef<number | null>(null);
  const streamIntervalRef = useRef<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [editingSpeakerId, setEditingSpeakerId] = useState<string | null>(null);
  const [tempName, setTempName] = useState('');

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [segments, isRecording]);

  useEffect(() => {
    if (isRecording) {
      timerRef.current = window.setInterval(() => setRecordTime(prev => prev + 1), 1000);
      simulateDiarizationStream();
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      if (streamIntervalRef.current) clearInterval(streamIntervalRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (streamIntervalRef.current) clearInterval(streamIntervalRef.current);
    };
  }, [isRecording]);

  const simulateDiarizationStream = () => {
    let index = 0;
    setSegments([]);

    streamIntervalRef.current = window.setInterval(() => {
      if (index < SIMULATED_DIALOG.length) {
        const item = SIMULATED_DIALOG[index];
        const speakerId = item.spk;
        
        if (!speakerRegistry[speakerId]) {
          const isKnown = speakerId.includes('known');
          registerSpeaker({
            id: speakerId,
            name: isKnown ? (speakerId === 'spk_known_1' ? '李经理' : '王助理') : '未知访客',
            color: index % 2 === 0 ? 'bg-blue-600' : 'bg-purple-600',
            isKnown: isKnown,
            avatarSeed: speakerId
          });
        }

        const newSeg: SpeakerSegment = {
          id: `seg_${Date.now()}_${index}`,
          speakerId,
          text: item.text,
          startTime: index * 4,
          endTime: (index + 1) * 4,
          confidence: 0.98 + (Math.random() * 0.02)
        };
        
        setSegments(prev => [...prev, newSeg]);
        index++;
      } else {
        if (streamIntervalRef.current) clearInterval(streamIntervalRef.current);
      }
    }, 3000);
  };

  const processAudioFile = async () => {
    if (!file) return;
    setIsProcessing(true);
    setError(null);
    setSegments([]); 

    try {
      const arrayBuffer = await file.arrayBuffer();
      const base64 = arrayBufferToBase64(arrayBuffer);
      const data = await analyzeConversation(base64, file.type || 'audio/wav');
      
      const newSegments: SpeakerSegment[] = data.map((item: any, idx: number) => {
        const speakerId = `spk_${item.speaker.replace(/\s+/g, '_').toLowerCase()}`;
        
        if (!speakerRegistry[speakerId]) {
          registerSpeaker({
            id: speakerId,
            name: item.speaker,
            color: idx % 2 === 0 ? 'bg-indigo-600' : 'bg-rose-500',
            isKnown: false,
            avatarSeed: speakerId
          });
        }

        return {
          id: `seg_${Date.now()}_${idx}`,
          speakerId,
          text: item.text,
          startTime: item.startTime,
          endTime: item.endTime,
          confidence: 0.95
        };
      });

      setSegments(newSegments);
    } catch (err: any) {
      setError(err.message || "分析失败");
    } finally {
      setIsProcessing(false);
    }
  };

  const saveSpeakerName = () => {
    if (editingSpeakerId && tempName.trim()) {
      updateSpeaker(editingSpeakerId, { name: tempName, isKnown: true });
      setEditingSpeakerId(null);
    }
  };

  const formatTime = (seconds: number) => `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${(Math.floor(seconds % 60)).toString().padStart(2, '0')}`;

  const getAvatarUrl = (speaker: SpeakerIdentity) => {
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${speaker.avatarSeed || speaker.id}&backgroundColor=b6e3f4,c0aede,d1d4f9`;
  };

  const handleClearAll = () => {
    if (confirm("确定要清空所有记录吗？")) {
      setSegments([]);
    }
  };

  const handleRemoveSpeaker = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const speaker = speakerRegistry[id];
    if (!speaker) return;

    if (speaker.isKnown) {
      updateSpeaker(id, { 
        isKnown: false, 
        name: id.includes('known') ? '访客 (已重置)' : '未知身份' 
      });
    } else {
      if (confirm("确定要永久删除此身份记录吗？")) {
        removeSpeaker(id);
      }
    }
  };

  return (
    <div className="h-full flex flex-col pt-8 animate-in fade-in duration-500 overflow-hidden">
      {/* Title Section */}
      <div className="mb-6 shrink-0 flex items-center justify-between">
        <div>
           <h1 className="text-2xl font-black text-white tracking-tight uppercase">声纹分离</h1>
           <p className="text-[11px] font-bold text-white/30 uppercase tracking-[0.2em] mt-1">AI 实时说话人转录与身份自动识别</p>
        </div>
      </div>

      {/* Main Row */}
      <div className="flex-1 flex flex-col lg:flex-row gap-6 overflow-hidden min-h-0 items-stretch">
        <div className="flex-1 flex flex-col min-w-0 bg-[#0f0f11] rounded-xl border border-white/5 relative shadow-2xl overflow-hidden">
            <div className="h-16 border-b border-white/5 bg-white/[0.01] flex items-center justify-between px-8 shrink-0 relative z-20">
               <div className="flex items-center gap-2">
                  <Fingerprint size={16} className="text-spark-accent" />
                  <span className="text-sm font-black text-white/40 uppercase tracking-[0.2em]">实时识别控制台</span>
               </div>
               {isRecording && (
                 <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                    <span className="font-mono text-xs font-black text-white tabular-nums">
                      {formatTime(recordTime)}
                    </span>
                 </div>
               )}
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-10 space-y-8 custom-scrollbar scroll-smooth">
               {isProcessing ? (
                 <div className="h-full flex flex-col items-center justify-center space-y-6">
                    <div className="relative">
                       <Loader2 className="w-16 h-16 text-spark-accent animate-spin" />
                       <div className="absolute inset-0 flex items-center justify-center"><Cpu size={24} className="text-spark-accent/40" /></div>
                    </div>
                    <TextShimmerWave className="text-sm font-black text-white/40 uppercase tracking-widest" children="正在深度解析多角色音频..." />
                 </div>
               ) : (segments.length > 0 || isRecording) ? (
                 <>
                   {segments.map((seg) => {
                     const speaker = speakerRegistry[seg.speakerId] || { id: seg.speakerId, name: '未知', color: 'bg-gray-700', isKnown: false };
                     return (
                       <div key={seg.id} className="group animate-in slide-in-from-bottom-2 fade-in">
                          <div className="flex-1">
                             <div className="flex items-baseline gap-3 mb-2">
                                <span className="font-black text-white text-lg tracking-tight">{speaker.name}</span>
                                <span className="text-[10px] font-bold text-white/20 tabular-nums bg-white/5 px-2 py-0.5 rounded">{formatTime(seg.startTime || 0)}</span>
                                {speaker.isKnown && <div className="px-2 py-0.5 rounded bg-spark-accent/10 border border-spark-accent/20 text-spark-accent text-[9px] font-black uppercase tracking-tighter">已验证身份</div>}
                             </div>
                             <div className="text-white/80 text-base leading-relaxed bg-white/[0.03] p-5 rounded-2xl border border-white/5 shadow-inner group-hover:bg-white/[0.05] transition-colors">
                                {seg.text}
                             </div>
                          </div>
                       </div>
                     );
                   })}
                   
                   {isRecording && (
                     <div className="flex items-center gap-4 mt-4 py-8 opacity-40">
                        <div className="flex gap-1.5">
                          <span className="w-2 h-2 bg-spark-accent rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                          <span className="w-2 h-2 bg-spark-accent rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                          <span className="w-2 h-2 bg-spark-accent rounded-full animate-bounce"></span>
                        </div>
                     </div>
                   )}
                 </>
               ) : (
                 <div className="h-full flex flex-col items-center justify-center opacity-10">
                    <Users size={80} />
                    <p className="text-[12px] font-bold uppercase tracking-[0.4em] mt-6 text-center">暂无对话记录<br/>请上传音频或开始实时识别</p>
                 </div>
               )}
            </div>

            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute bottom-24 left-8 right-8 z-30"
                >
                  <div className="bg-red-500/10 border border-red-500/20 backdrop-blur-xl px-6 py-4 rounded-xl flex items-center gap-4 text-red-400">
                    <AlertCircle size={20} />
                    <span className="text-sm font-bold leading-relaxed">{error}</span>
                    <button onClick={() => setError(null)} className="ml-auto hover:text-white p-1"><X size={16} /></button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="h-24 border-t border-white/5 bg-white/[0.01] flex justify-between items-center px-8 shrink-0 relative z-20">
                <div className="flex bg-black/40 p-1 rounded-xl border border-white/5">
                   <button 
                      onClick={() => {setActiveSubTab('upload'); setIsRecording(false);}} 
                      className={`px-5 py-2.5 rounded-lg text-[12px] font-black tracking-widest transition-all uppercase flex items-center gap-2.5 ${activeSubTab === 'upload' ? 'bg-white/10 text-white shadow-lg' : 'text-white/30 hover:text-white/60'}`}
                   >
                      <FileAudio size={16} /> 离线分析
                   </button>
                   <button 
                      onClick={() => setActiveSubTab('record')} 
                      className={`px-5 py-2.5 rounded-lg text-[12px] font-black tracking-widest transition-all uppercase flex items-center gap-2.5 ${activeSubTab === 'record' ? 'bg-white/10 text-white shadow-lg' : 'text-white/30 hover:text-white/60'}`}
                   >
                      <Mic size={16} /> 实时会话
                   </button>
                </div>

                <div className="flex items-center gap-4">
                   <input type="file" ref={fileInputRef} className="hidden" onChange={e => e.target.files && setFile(e.target.files[0])} accept="audio/*" />
                   
                   {activeSubTab === 'upload' && (
                     <>
                        {!file ? (
                          <button onClick={() => fileInputRef.current?.click()} className="px-6 py-3 rounded-xl border border-white/10 text-white/60 hover:text-white hover:bg-white/5 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all">
                            <Plus size={14} /> 选择音频
                          </button>
                        ) : (
                          <div className="flex items-center gap-3 px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 max-w-[150px]">
                             <span className="text-[11px] font-bold text-white/40 truncate">{file.name}</span>
                             <button onClick={() => setFile(null)} className="text-white/20 hover:text-red-500 shrink-0"><X size={14}/></button>
                          </div>
                        )}
                        <StarButton 
                          onClick={processAudioFile} 
                          disabled={!file || isProcessing} 
                          className="min-w-[180px]"
                        >
                           {isProcessing ? (
                             <div className="flex items-center gap-3">
                               <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                               <TextShimmerWave className="[--base-color:rgba(255,255,255,0.6)]" children="处理中..." />
                             </div>
                           ) : <div className="flex items-center gap-3"><Sparkles size={18} /> 开始深度分离</div>}
                        </StarButton>
                     </>
                   )}

                   {activeSubTab === 'record' && (
                     <StarButton 
                        onClick={() => setIsRecording(!isRecording)} 
                        lightColor={isRecording ? "#ef4444" : "#3b82f6"}
                        className={`min-w-[180px] ${isRecording ? 'shadow-[0_0_25px_rgba(239,68,68,0.3)] ring-1 ring-red-500/50' : 'shadow-[0_0_25px_rgba(59,130,246,0.2)]'}`}
                     >
                        <div className="flex items-center gap-3">
                          {isRecording ? <Square size={18} fill="currentColor" /> : <Mic size={18} />}
                          {isRecording ? '停止识别' : '开始识别'}
                        </div>
                     </StarButton>
                   )}
                </div>
            </div>
         </div>

        <div className="w-full lg:w-[340px] flex h-full bg-[#0f0f11] border border-white/5 rounded-xl overflow-hidden shadow-2xl shrink-0 flex-col">
           <div className="h-10 border-b border-white/5 flex items-center justify-between px-5 bg-white/[0.02] shrink-0">
              <div className="flex items-center gap-3">
                <Settings2 size={14} className="text-spark-accent" />
                <span className="text-[16px] font-black text-white uppercase tracking-widest opacity-90">声纹库中心</span>
              </div>
           </div>

           <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2 custom-scrollbar">
              {Object.keys(speakerRegistry).length > 0 ? (
                (Object.values(speakerRegistry) as SpeakerIdentity[]).map((speaker) => {
                  const isEditing = editingSpeakerId === speaker.id;
                  const activeInTranscript = segments.some(s => s.speakerId === speaker.id);
                  
                  return (
                    <div key={speaker.id} className={`p-3 rounded-lg bg-white/[0.02] border border-white/5 transition-all group/card ${isEditing ? 'border-spark-accent/40 bg-spark-accent/5' : 'hover:border-white/10 hover:bg-white/[0.04]'} ${activeInTranscript && isRecording ? 'ring-1 ring-spark-accent/30 bg-spark-accent/[0.02]' : ''}`}>
                      <div className="flex items-center gap-3">
                         <div className={`w-10 h-10 rounded-lg ${speaker.color} overflow-hidden shrink-0 border border-white/10 relative`}>
                            <img src={getAvatarUrl(speaker)} alt={speaker.name} className="w-full h-full object-cover" />
                            {activeInTranscript && isRecording && (
                              <div className="absolute inset-0 bg-spark-accent/20 flex items-center justify-center">
                                 <Activity size={14} className="text-white animate-pulse" />
                              </div>
                            )}
                         </div>
                         <div className="flex-1 min-w-0">
                            {isEditing ? (
                              <div className="flex items-center gap-1.5">
                                 <input 
                                   autoFocus 
                                   value={tempName} 
                                   onChange={(e) => setTempName(e.target.value)} 
                                   onKeyDown={(e) => e.key === 'Enter' && saveSpeakerName()} 
                                   className="w-full bg-black/40 border border-white/20 rounded-lg px-2 py-1 text-sm text-white outline-none" 
                                 />
                                 <button onClick={saveSpeakerName} className="p-1.5 bg-spark-accent rounded-md text-white"><Check size={12}/></button>
                              </div>
                            ) : (
                              <div>
                                 <div className="flex items-center justify-between">
                                    <span className="text-sm font-black text-white truncate max-w-[120px]">{speaker.name}</span>
                                    <div className="flex items-center opacity-0 group-hover/card:opacity-100 transition-opacity">
                                      <button onClick={() => {setEditingSpeakerId(speaker.id); setTempName(speaker.name)}} className="p-1 text-white/20 hover:text-white transition-colors"><Edit2 size={12}/></button>
                                      <button onClick={(e) => handleRemoveSpeaker(speaker.id, e)} className="p-1 text-white/20 hover:text-red-500 transition-colors"><Trash2 size={12}/></button>
                                    </div>
                                 </div>
                                 <div className="mt-0.5 flex items-center justify-between">
                                    {speaker.isKnown ? (
                                      <span className="text-[10px] font-bold text-spark-accent uppercase flex items-center gap-1">
                                        <Check size={10} /> 已验证
                                      </span>
                                    ) : (
                                      <span className="text-[10px] font-bold text-white/20 uppercase tracking-tighter">新发现身份</span>
                                    )}
                                    {activeInTranscript && isRecording && <span className="text-[8px] font-black text-spark-accent animate-pulse uppercase tracking-tighter ml-auto">正在发言</span>}
                                 </div>
                              </div>
                            )}
                         </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="h-full flex flex-col items-center justify-center opacity-5 text-center p-8">
                  <Users size={32} className="mb-4" />
                  <p className="text-[10px] font-black uppercase tracking-widest leading-relaxed">等待声纹提取</p>
                </div>
              )}
           </div>
           
           <div className="p-5 border-t border-white/5 bg-white/[0.01]">
              <div className="flex items-center gap-2 text-[10px] text-white/30 font-bold uppercase">
                 <span className="w-1.5 h-1.5 rounded-full bg-spark-accent/40" />
                 <span>重命名身份后将持久保存</span>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Diarization;
