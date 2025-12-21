
import React, { useState, useEffect, useRef } from 'react';
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

const VoiceCloning: React.FC = () => {
  const { voices, addVoice, deleteVoice, updateVoice } = useVoices();
  const { playVoice, currentVoice, isPlaying } = usePlayer();
  
  const [activeTab, setActiveTab] = useState<'upload' | 'record'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordTime, setRecordTime] = useState(0);
  const [readingText, setReadingText] = useState(RANDOM_READING_TEXTS[0]);
  const [projectName, setProjectName] = useState('');
  const [description, setDescription] = useState('');
  const [isCloning, setIsCloning] = useState(false);
  const [cloningResult, setCloningResult] = useState<{status: 'success' | 'error', message: string} | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editTags, setEditTags] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const customVoices = voices.filter(v => v.source === 'custom' || v.isCustom);

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
       const isSuccess = Math.random() > 0.05; 
       
       if (isSuccess) {
         const newVoice: Voice = {
           id: `custom_${Date.now()}`,
           name: projectName,
           gender: 'Male',
           language: 'Chinese',
           tags: description ? description.split(/[，, ]/).filter(t => t) : ['Custom'],
           category: 'Character',
           avatarUrl: `https://api.dicebear.com/7.x/pixel-art/svg?seed=${projectName}`,
           isCustom: true,
           isPublic: true,
           previewUrl: "https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3",
           source: 'custom'
         };
         addVoice(newVoice);
         setCloningResult({status: 'success', message: '声音克隆成功！已添加到您的自定义声音库。'});
         setProjectName('');
         setDescription('');
         setFile(null);
       } else {
         setCloningResult({status: 'error', message: '声音采样率过低，克隆失败，请尝试更高质量的录音。'});
       }
     }, 2500);
  };

  const startEditing = (voice: Voice) => {
    setEditingId(voice.id);
    setEditName(voice.name);
    setEditTags(voice.tags.join(', '));
  };

  const saveEdit = () => {
    if (editingId) {
      updateVoice(editingId, {
        name: editName,
        tags: editTags.split(/[，, ]/).filter(t => t)
      });
      setEditingId(null);
    }
  };

  return (
    <div className="h-full flex flex-col pt-8 animate-in fade-in duration-500 overflow-hidden">
      {/* Title Section */}
      <div className="mb-6 shrink-0 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight uppercase">声音克隆</h1>
          <p className="text-[11px] font-bold text-white/30 uppercase tracking-[0.2em] mt-1">采集声学特征，训练专属 AI 数字孪生音色</p>
        </div>
      </div>

      {/* Main Row */}
      <div className="flex-1 flex gap-6 overflow-hidden min-h-0 items-stretch">
        <div className="flex-1 flex flex-col min-w-0 bg-[#0f0f11] rounded-xl border border-white/5 relative shadow-2xl overflow-hidden">
          <div className="flex-1 p-10 overflow-y-auto custom-scrollbar">
            <div className="max-w-3xl mx-auto space-y-12">
              <div className="space-y-6">
                 <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-spark-accent/10 border border-spark-accent/20 flex items-center justify-center text-spark-accent font-black">1</div>
                    <h2 className="text-sm font-black text-white uppercase tracking-widest">采集声音样本</h2>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => {setActiveTab('upload'); setFile(null);}} className={`p-6 rounded-2xl border transition-all text-left group ${activeTab === 'upload' ? 'bg-spark-accent/5 border-spark-accent/40 shadow-lg' : 'bg-white/[0.02] border-white/5 hover:border-white/10'}`}>
                       <UploadCloud size={24} className={activeTab === 'upload' ? 'text-spark-accent' : 'text-white/20'} />
                       <h3 className="text-sm font-black text-white mt-4">本地上传</h3>
                       <p className="text-[10px] text-white/30 font-bold mt-1">支持 WAV/MP3 等高质量格式</p>
                    </button>
                    <button onClick={() => {setActiveTab('record'); setFile(null);}} className={`p-6 rounded-2xl border transition-all text-left group ${activeTab === 'record' ? 'bg-spark-accent/5 border-spark-accent/40 shadow-lg' : 'bg-white/[0.02] border-white/5 hover:border-white/10'}`}>
                       <Mic size={24} className={activeTab === 'record' ? 'text-spark-accent' : 'text-white/20'} />
                       <h3 className="text-sm font-black text-white mt-4">在线录音</h3>
                       <p className="text-[10px] text-white/30 font-bold mt-1">推荐环境安静下录制 60s</p>
                    </button>
                 </div>

                 <div className="mt-4">
                   {activeTab === 'upload' ? (
                     <div onClick={() => fileInputRef.current?.click()} className="h-44 border-2 border-dashed border-white/5 rounded-2xl bg-white/[0.01] hover:bg-white/[0.03] hover:border-spark-accent/20 transition-all flex flex-col items-center justify-center cursor-pointer group">
                       <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="audio/*" className="hidden" />
                       <UploadCloud size={32} className="text-white/10 mb-3 group-hover:text-spark-accent transition-colors" />
                       <span className="text-[12px] font-bold text-white/20">{file ? file.name : "点击或拖拽上传音频样本"}</span>
                     </div>
                   ) : (
                     <div className="p-8 border border-white/5 rounded-2xl bg-white/[0.01] space-y-6">
                        <div className="bg-black/20 p-6 rounded-xl border border-white/5 text-center">
                           <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-4 italic">请朗读以下内容进行采样</p>
                           <p className="text-lg text-white/80 font-medium leading-relaxed">"{readingText}"</p>
                        </div>
                        <AIVoiceInput 
                          onStart={onStartRecording}
                          onStop={onStopRecording}
                        />
                     </div>
                   )}
                 </div>
              </div>

              <div className={`space-y-6 transition-all duration-500 ${!file ? 'opacity-20 pointer-events-none grayscale' : 'opacity-100'}`}>
                 <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-spark-accent/10 border border-spark-accent/20 flex items-center justify-center text-spark-accent font-black">2</div>
                    <h2 className="text-sm font-black text-white uppercase tracking-widest">配置训练信息</h2>
                 </div>
                 <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] ml-1">音色名称</label>
                       <input value={projectName} onChange={(e) => setProjectName(e.target.value)} className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-5 py-4 text-white font-bold outline-none focus:border-spark-accent/40 transition-all shadow-inner" placeholder="输入分身名称..." />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] ml-1">风格标签</label>
                       <input value={description} onChange={(e) => setDescription(e.target.value)} className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-5 py-4 text-white font-bold outline-none focus:border-spark-accent/40 transition-all shadow-inner" placeholder="温润、有力、磁性..." />
                    </div>
                 </div>
              </div>
            </div>
          </div>

          <div className="h-24 border-t border-white/5 bg-white/[0.01] flex justify-between items-center px-10 shrink-0 relative z-20">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-[9px] font-black text-white/30 uppercase tracking-widest">
                 <Info size={12}/> 高质量录音将提升克隆效果
              </div>
              <div className="flex items-center gap-4">
                 <button onClick={() => {setFile(null); setProjectName(''); setDescription('');}} className="p-3 text-white/20 hover:text-white transition-all hover:bg-white/5 rounded-xl"><RotateCcw size={20} /></button>
                 <StarButton 
                   onClick={handleCreate} 
                   disabled={!file || !projectName || isCloning} 
                   className="min-w-[220px]"
                 >
                   {isCloning ? (
                     <div className="flex items-center gap-3">
                       <Loader2 size={16} className="animate-spin" /> 
                       <TextShimmerWave className="[--base-color:rgba(255,255,255,0.6)]" children="正在训练模型..." />
                     </div>
                   ) : (
                     <div className="flex items-center gap-3">
                       <Sparkles size={16} /> 开始声音克隆
                     </div>
                   )}
                 </StarButton>
              </div>
          </div>
        </div>

        <div className="w-[340px] bg-[#0f0f11] border border-white/5 rounded-xl overflow-hidden shadow-2xl flex flex-col shrink-0">
            <div className="h-10 border-b border-white/5 flex items-center px-5 gap-3 bg-white/[0.02] shrink-0">
                <Settings2 size={14} className="text-spark-accent" />
                <span className="text-[16px] font-black text-white uppercase tracking-widest opacity-90">自定义声音库</span>
                <div className="ml-auto text-[10px] font-black text-white/20 tabular-nums">{customVoices.length}</div>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2 custom-scrollbar">
              {customVoices.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center opacity-5 text-center p-8 space-y-4">
                  <FileAudio size={40} />
                  <p className="text-[10px] font-black uppercase tracking-widest leading-relaxed">暂无克隆记录<br/>完成训练后将在此显示</p>
                </div>
              ) : (
                customVoices.map((voice) => {
                  const playing = currentVoice?.id === voice.id && isPlaying;
                  const isEditing = editingId === voice.id;
                  return (
                    <div key={voice.id} className={`group p-3 rounded-lg border transition-all flex flex-col gap-3 relative ${isEditing ? 'bg-spark-accent/5 border-spark-accent/30 shadow-lg' : 'bg-white/[0.02] border-white/5 hover:border-spark-accent/30'}`}>
                      <div className="flex items-center gap-3">
                          <div className="relative cursor-pointer shrink-0" onClick={() => playVoice(voice)}>
                             <img src={voice.avatarUrl} className="w-10 h-10 rounded-lg border border-white/10 shadow-lg object-cover" alt={voice.name} />
                             <div className={`absolute inset-0 rounded-lg bg-black/40 flex items-center justify-center transition-opacity ${playing ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                                {playing ? <Pause size={14} fill="white" className="text-white" /> : <Play size={14} fill="white" className="text-white ml-0.5" />}
                             </div>
                          </div>
                          <div className="flex-1 min-w-0">
                             {isEditing ? (
                               <input value={editName} onChange={e => setEditName(e.target.value)} autoFocus className="w-full bg-black/40 border border-white/20 rounded-lg px-2 py-1 text-sm font-black text-white outline-none focus:border-spark-accent" />
                             ) : (
                               <h4 className="text-sm font-black text-white truncate group-hover:text-spark-accent transition-colors">{voice.name}</h4>
                             )}
                             <p className="text-[10px] text-white/20 uppercase font-bold tracking-widest mt-0.5 truncate">{translateCategory(voice.category)} • CUSTOM</p>
                          </div>
                          {!isEditing && (
                             <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity gap-1">
                                <button onClick={() => startEditing(voice)} className="p-1.5 text-white/20 hover:text-spark-accent hover:bg-white/5 rounded-lg"><Edit3 size={12}/></button>
                                <button onClick={() => { if(confirm('确定永久删除该声音吗？')) deleteVoice(voice.id); }} className="p-1.5 text-white/20 hover:text-red-500 hover:bg-red-500/10 rounded-lg"><Trash2 size={12}/></button>
                             </div>
                          )}
                      </div>
                      {isEditing ? (
                        <div className="space-y-1.5 animate-in fade-in slide-in-from-top-1">
                           <div className="text-[9px] font-black text-white/20 uppercase tracking-widest">标签备注</div>
                           <div className="flex gap-2">
                             <input value={editTags} onChange={e => setEditTags(e.target.value)} className="flex-1 min-w-0 bg-black/40 border border-white/20 rounded-lg px-3 py-1 text-[11px] text-white outline-none font-bold" placeholder="标签 (逗号隔开)..." />
                             <div className="flex gap-1 shrink-0">
                                <button onClick={saveEdit} className="p-1.5 bg-spark-accent hover:bg-blue-500 rounded-lg text-white shadow-lg shadow-spark-accent/10 transition-colors" title="确认保存">
                                  <Check size={12}/>
                                </button>
                                <button onClick={() => setEditingId(null)} className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-white/40 transition-colors" title="取消">
                                  <X size={12}/>
                                </button>
                             </div>
                           </div>
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                           {voice.tags.map(t => (
                             <span key={t} className="text-[8px] font-bold text-white/20 px-1.5 py-0.5 rounded bg-white/5 uppercase tracking-tighter">#{t}</span>
                           ))}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
        </div>
      </div>

      <AnimatePresence>
        {cloningResult && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={() => setCloningResult(null)} />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 30 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 30 }} className="relative w-full max-w-sm bg-[#121214] border border-white/10 rounded-[2.5rem] shadow-2xl p-10 flex flex-col items-center text-center space-y-8 overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-white/5">
                <motion.div initial={{width:0}} animate={{width:"100%"}} transition={{duration:3, ease: "linear"}} className={`h-full ${cloningResult.status === 'success' ? 'bg-spark-accent' : 'bg-red-500'}`} />
              </div>
              <div className={`w-20 h-20 rounded-3xl flex items-center justify-center shadow-2xl ${cloningResult.status === 'success' ? 'bg-spark-accent/10 text-spark-accent border border-spark-accent/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                {cloningResult.status === 'success' ? <CheckCircle2 size={40} /> : <AlertCircle size={40} />}
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl font-black text-white uppercase tracking-tight">{cloningResult.status === 'success' ? '模型训练成功' : '克隆任务失败'}</h3>
                <p className="text-[13px] text-white/40 font-medium leading-relaxed px-4">{cloningResult.message}</p>
              </div>
              <button onClick={() => setCloningResult(null)} className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-lg ${cloningResult.status === 'success' ? 'bg-spark-accent text-white shadow-spark-accent/20' : 'bg-white/10 text-white'}`}>我知道了</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VoiceCloning;
