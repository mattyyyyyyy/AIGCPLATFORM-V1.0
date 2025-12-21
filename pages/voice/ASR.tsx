
import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  Square, 
  Clock, 
  Trash2, 
  Eraser,
  Upload,
  Loader2,
  AlertCircle,
  History as HistoryIcon
} from 'lucide-react';
import { motion, stagger, useAnimate } from "framer-motion";
import { transcribeAudio, arrayBufferToBase64 } from '../../services/geminiService';
import { TextShimmerWave } from '../../components/TextShimmerWave';
import { StarButton } from '../../components/StarButton';

const TextGenerateEffect: React.FC<{
  words: string;
  className?: string;
  filter?: boolean;
  duration?: number;
}> = ({
  words,
  className,
  filter = true,
  duration = 0.5,
}) => {
  const [scope, animate] = useAnimate();
  const wordsArray = words.split(""); 
  
  useEffect(() => {
    if (wordsArray.length > 0) {
      animate(
        "span",
        {
          opacity: 1,
          filter: filter ? "blur(0px)" : "none",
        },
        {
          duration: duration ? duration : 1,
          delay: stagger(0.01),
        }
      );
    }
  }, [words, animate, filter, duration, wordsArray.length]);

  const renderWords = () => {
    return (
      <motion.div ref={scope} className="inline">
        {wordsArray.map((word, idx) => {
          return (
            <motion.span
              key={idx}
              className="text-white/80 opacity-0"
              style={{
                filter: filter ? "blur(10px)" : "none",
              }}
            >
              {word}
            </motion.span>
          );
        })}
      </motion.div>
    );
  };

  return (
    <div className={className}>
      <div className="text-xl font-medium leading-relaxed tracking-wide">
        {renderWords()}
      </div>
    </div>
  );
};

const ASR: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [duration, setDuration] = useState(0);
  const [transcription, setTranscription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<{time: string, text: string, duration: number}[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [sessionKey, setSessionKey] = useState(0);
  
  const MAX_DURATION = 180;

  useEffect(() => {
    let timerInterval: any;
    if (isRecording) {
      timerInterval = window.setInterval(() => {
        setDuration(prev => {
          if (prev >= MAX_DURATION) {
            handleStop();
            return MAX_DURATION;
          }
          return prev + 1;
        });
      }, 1000);
    } 
    return () => clearInterval(timerInterval);
  }, [isRecording]);

  const handleStart = () => {
    if (transcription) addToHistory(transcription, duration);
    setTranscription('');
    setDuration(0);
    setError(null);
    setSessionKey(prev => prev + 1);
    setIsRecording(true);
    setTimeout(() => simulateStreamingTranscription(), 100);
  };

  const handleStop = () => setIsRecording(false);

  const simulateStreamingTranscription = () => {
    const fullText = "语音识别正在运行中... 系统正在实时捕获音频并利用 Gemini 3 Flash 模型进行流式转录。您可以直接说话，文字会即刻出现在下方的文本区域内，字体大小已调整为 1.25rem 以便阅读。";
    setTranscription(fullText);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsProcessing(true);
    setError(null);
    setTranscription('');
    setSessionKey(prev => prev + 1);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const base64 = arrayBufferToBase64(arrayBuffer);
      const result = await transcribeAudio(base64, file.type || 'audio/wav');
      setTranscription(result);
      addToHistory(result, 0); 
    } catch (err: any) {
      setError(err.message || "文件转录失败");
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const addToHistory = (text: string, dur: number) => {
    setHistory(prev => [{ 
      time: new Date().toLocaleTimeString(), 
      text,
      duration: dur
    }, ...prev].slice(0, 15));
  };

  const clearTranscription = () => {
    if (transcription && !isRecording) addToHistory(transcription, duration);
    setTranscription('');
    setDuration(0);
    setError(null);
    setSessionKey(prev => prev + 1);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const deleteHistoryItem = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setHistory(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="h-full flex flex-col pt-8 animate-in fade-in duration-500 overflow-hidden">
      {/* Title Section */}
      <div className="mb-6 shrink-0 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight uppercase">语音识别</h1>
          <p className="text-[11px] font-black text-white/30 uppercase tracking-[0.25em] mt-1">AI 实时流式转录，支持高保真音频文件识别</p>
        </div>
      </div>

      {/* Main Row: Box + Sidebar */}
      <div className="flex-1 flex gap-6 overflow-hidden min-h-0">
        <div className="flex-1 flex flex-col min-w-0 bg-[#0f0f11] rounded-[2rem] border border-white/5 relative shadow-2xl overflow-hidden">
          <div className="flex-1 p-12 overflow-y-auto custom-scrollbar relative">
             {isProcessing ? (
               <div className="h-full flex flex-col items-center justify-center space-y-4">
                  <Loader2 className="w-10 h-10 text-spark-accent animate-spin" />
                  <TextShimmerWave className="text-[10px] font-black uppercase tracking-widest" children="正在处理音频..." />
               </div>
             ) : transcription ? (
               <div className="w-full">
                 <TextGenerateEffect words={transcription} key={sessionKey} />
               </div>
             ) : (
               <div className="h-full flex flex-col items-center justify-center opacity-10">
                  <Mic size={56} />
                  <p className="text-[11px] font-black uppercase tracking-[0.5em] mt-6">等待音频输入</p>
               </div>
             )}
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
              <div className="flex items-center gap-5">
                  <StarButton
                    onClick={isRecording ? handleStop : handleStart}
                    disabled={isProcessing}
                    lightColor={isRecording ? "#ef4444" : "#3b82f6"}
                    className={`min-w-[220px] ${isRecording ? 'shadow-[0_0_30px_rgba(239,68,68,0.3)] ring-1 ring-red-500/50' : 'shadow-[0_0_30px_rgba(59,130,246,0.2)]'}`}
                  >
                     <div className="flex items-center gap-3">
                        {isRecording ? <Square size={18} fill="currentColor" /> : <Mic size={18} />}
                        {isRecording ? '停止识别' : '开始转写'}
                     </div>
                  </StarButton>
                  
                  <input type="file" ref={fileInputRef} className="hidden" accept="audio/*" onChange={handleFileUpload} />
                  <button onClick={() => fileInputRef.current?.click()} className="p-4 text-white/30 hover:text-white transition-all hover:bg-white/10 rounded-2xl border border-transparent hover:border-white/10" title="上传音频文件"><Upload size={20} /></button>
                  
                  {(isRecording || isProcessing) && (
                    <div className="flex items-center gap-4 px-5 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-white animate-in fade-in">
                       <div className={`w-2 h-2 rounded-full ${isRecording ? 'bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]' : 'bg-white/20'}`} />
                       <span className="font-mono text-[13px] font-black tabular-nums tracking-widest">{formatTime(duration)}</span>
                    </div>
                  )}
              </div>
              <button onClick={clearTranscription} className="p-4 text-white/20 hover:text-white transition-all hover:bg-white/10 rounded-2xl" title="重置内容"><Eraser size={20} /></button>
          </div>
        </div>

        <div className="w-[340px] bg-[#0f0f11] border border-white/5 rounded-[2rem] overflow-hidden shadow-2xl flex flex-col shrink-0">
            <div className="flex items-center gap-3 px-6 border-b border-white/5 bg-white/[0.02] shrink-0 h-14">
                <HistoryIcon size={16} className="text-spark-accent" />
                <span className="text-[16px] font-black text-white uppercase tracking-[0.15em] opacity-90">历史转录</span>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 custom-scrollbar">
              {history.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center opacity-5 text-center p-8">
                  <HistoryIcon size={48} className="mb-6" />
                  <p className="text-[11px] font-black uppercase tracking-[0.3em]">暂无历史记录</p>
                </div>
              ) : (
                history.map((item, i) => (
                  <div key={i} onClick={() => { setTranscription(item.text); setSessionKey(prev => prev + 1); }} className="group p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-spark-accent/30 transition-all cursor-pointer relative">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <Clock size={11} className="text-spark-accent/60" />
                        <span className="text-[10px] font-black text-white/30 tabular-nums uppercase tracking-widest">{item.time}</span>
                      </div>
                      <span className="text-[10px] font-black text-white/10 tabular-nums bg-white/5 px-2 py-0.5 rounded tracking-widest">{item.duration > 0 ? formatTime(item.duration) : 'FILE'}</span>
                    </div>
                    <p className="text-white/40 text-[11px] line-clamp-3 leading-relaxed font-bold tracking-tight">{item.text}</p>
                    <button 
                      onClick={(e) => deleteHistoryItem(i, e)}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-2 text-white/20 hover:text-red-500 transition-all rounded-xl hover:bg-red-500/10"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))
              )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default ASR;
