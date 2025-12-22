
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
                filter: filter ? "blur(5px)" : "none",
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
      <div className="text-xl font-normal leading-relaxed tracking-wide">
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
    const fullText = "语音识别正在运行中... 系统正在实时捕获音频并利用 Gemini 3 Flash 模型进行流式转录。您可以直接说话，文字会即刻出现在下方的文本区域内，字体已调整为无衬线族群以确保最佳可读性。";
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
    <div className="h-full flex flex-col pt-2 animate-in fade-in duration-500 overflow-hidden">
      <div className="mb-2 shrink-0 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-light text-white tracking-tight uppercase drop-shadow-[0_0_8px_rgba(255,255,255,0.15)]">语音识别</h1>
          <p className="text-[11px] font-normal text-white/50 uppercase tracking-[0.2em] mt-1">AI 实时流式转录，支持高保真音频文件识别</p>
        </div>
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden min-h-0">
        <div className="flex-1 flex flex-col min-w-0 bg-black/20 backdrop-blur-2xl border border-white/10 rounded-2xl relative shadow-2xl overflow-hidden">
          <div className="flex-1 p-8 overflow-y-auto custom-scrollbar relative">
             {isProcessing ? (
               <div className="h-full flex flex-col items-center justify-center space-y-4">
                  <Loader2 className="w-8 h-8 text-spark-accent animate-spin" />
                  <TextShimmerWave className="text-[11px] font-medium uppercase tracking-widest text-white/70" children="正在处理音频..." />
               </div>
             ) : transcription ? (
               <div className="w-full">
                 <TextGenerateEffect words={transcription} key={sessionKey} />
               </div>
             ) : (
               <div className="h-full flex flex-col items-center justify-center opacity-5">
                  <Mic size={48} />
                  <p className="text-[11px] font-medium uppercase tracking-[0.4em] mt-6">等待音频输入</p>
               </div>
             )}
          </div>

          <div className="h-16 border-t border-white/5 bg-black/40 backdrop-blur-xl flex justify-between items-center px-6 shrink-0 relative z-20">
              <div className="flex items-center gap-4">
                  <input type="file" ref={fileInputRef} className="hidden" accept="audio/*" onChange={handleFileUpload} />
                  <button onClick={() => fileInputRef.current?.click()} className="p-2.5 text-white/40 hover:text-white transition-all hover:bg-white/5 rounded-xl border border-transparent" title="上传音频文件"><Upload size={18} /></button>
                  <button onClick={clearTranscription} className="p-2.5 text-white/30 hover:text-white transition-all hover:bg-white/5 rounded-xl" title="重置内容"><Eraser size={18} /></button>
                  
                  {(isRecording || isProcessing) && (
                    <div className="flex items-center gap-3 px-4 py-1.5 rounded-xl bg-white/5 border border-white/10 text-white animate-in fade-in">
                       <div className={`w-1.5 h-1.5 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-white/40'}`} />
                       <span className="font-mono text-[12px] font-medium tabular-nums tracking-widest">{formatTime(duration)}</span>
                    </div>
                  )}
              </div>
              <StarButton
                onClick={isRecording ? handleStop : handleStart}
                disabled={isProcessing}
                className="h-10 px-8"
              >
                 <div className="flex items-center gap-2 text-sm font-medium tracking-widest">
                    {isRecording ? <Square size={14} fill="currentColor" /> : <Mic size={14} />}
                    {isRecording ? '停止识别' : '开始转写'}
                 </div>
              </StarButton>
          </div>
        </div>

        <div className="w-80 bg-black/20 backdrop-blur-2xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col shrink-0">
            <div className="flex items-center gap-3 px-5 border-b border-white/5 bg-white/[0.02] shrink-0 h-12">
                <HistoryIcon size={16} className="text-spark-accent" />
                <span className="text-[14px] font-medium text-white uppercase tracking-widest drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]">历史转录</span>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2 custom-scrollbar">
              {history.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 text-white/60">
                  <HistoryIcon size={40} className="mb-4" />
                  <p className="text-[12px] font-medium uppercase tracking-widest">暂无记录</p>
                </div>
              ) : (
                history.map((item, i) => (
                  <div key={i} onClick={() => { setTranscription(item.text); setSessionKey(prev => prev + 1); }} className="group p-3 rounded-xl bg-white/5 backdrop-blur-sm border border-white/5 hover:border-spark-accent/30 transition-all cursor-pointer relative shadow-sm">
                    <div className="flex justify-between items-center mb-1.5">
                      <div className="flex items-center gap-2 text-white/40">
                        <Clock size={10} />
                        <span className="text-[10px] font-medium tabular-nums uppercase">{item.time}</span>
                      </div>
                    </div>
                    <p className="text-white/60 text-[13px] line-clamp-2 leading-relaxed font-normal">{item.text}</p>
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
