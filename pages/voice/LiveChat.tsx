
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { 
  Activity, Mic, Square, Loader2, Volume2, 
  MessageCircle, Zap, ShieldAlert, Cpu 
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import { StarButton } from '../../components/StarButton';

const LiveChat: React.FC = () => {
  const { t } = useLanguage();
  const [isActive, setIsActive] = useState(false);
  const [status, setStatus] = useState<'idle' | 'listening' | 'speaking' | 'error'>('idle');
  const [inputTranscription, setInputTranscription] = useState('');
  const [outputTranscription, setOutputTranscription] = useState('');
  const [chatLog, setChatLog] = useState<{ role: 'user' | 'ai', text: string }[]>([]);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const sessionRef = useRef<any>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  // Base64 helper methods as per requirements
  const encode = (bytes: Uint8Array) => {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) { binary += String.fromCharCode(bytes[i]); }
    return btoa(binary);
  };

  const decode = (base64: string) => {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) { bytes[i] = binaryString.charCodeAt(i); }
    return bytes;
  };

  const decodeAudioData = async (
    data: Uint8Array,
    ctx: AudioContext,
    sampleRate: number,
    numChannels: number,
  ): Promise<AudioBuffer> => {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
      }
    }
    return buffer;
  };

  const createBlob = (data: Float32Array) => {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) { int16[i] = data[i] * 32768; }
    return {
      data: encode(new Uint8Array(int16.buffer)),
      mimeType: 'audio/pcm;rate=16000',
    };
  };

  const stopLive = useCallback(() => {
    setIsActive(false);
    setStatus('idle');
    if (sessionRef.current) sessionRef.current.close();
    if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
    }
    for (const source of sourcesRef.current.values()) {
        source.stop();
    }
    sourcesRef.current.clear();
  }, []);

  const startLive = async () => {
    setIsActive(true);
    setStatus('listening');
    setChatLog([]);
    setInputTranscription('');
    setOutputTranscription('');

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            const source = audioContextRef.current!.createMediaStreamSource(stream);
            const scriptProcessor = audioContextRef.current!.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmBlob = createBlob(inputData);
              sessionPromise.then(session => session.sendRealtimeInput({ media: pcmBlob }));
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(audioContextRef.current!.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.inputTranscription) {
                const text = message.serverContent.inputTranscription.text;
                setInputTranscription(prev => prev + text);
            }
            if (message.serverContent?.outputTranscription) {
                const text = message.serverContent.outputTranscription.text;
                setOutputTranscription(prev => prev + text);
                setStatus('speaking');
            }
            
            if (message.serverContent?.turnComplete) {
                setChatLog(prev => [
                    ...prev, 
                    { role: 'user', text: inputTranscription },
                    { role: 'ai', text: outputTranscription }
                ]);
                setInputTranscription('');
                setOutputTranscription('');
                setStatus('listening');
            }

            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio && outputAudioContextRef.current) {
                nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputAudioContextRef.current.currentTime);
                const audioBuffer = await decodeAudioData(decode(base64Audio), outputAudioContextRef.current, 24000, 1);
                const source = outputAudioContextRef.current.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(outputAudioContextRef.current.destination);
                source.onended = () => sourcesRef.current.delete(source);
                source.start(nextStartTimeRef.current);
                nextStartTimeRef.current += audioBuffer.duration;
                sourcesRef.current.add(source);
            }

            if (message.serverContent?.interrupted) {
                for (const src of sourcesRef.current.values()) src.stop();
                sourcesRef.current.clear();
                nextStartTimeRef.current = 0;
            }
          },
          onerror: () => setStatus('error'),
          onclose: () => stopLive(),
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          systemInstruction: 'You are a friendly and helpful AI voice assistant named Spark. Keep your answers natural, concise, and helpful.'
        }
      });

      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error(err);
      setStatus('error');
      setIsActive(false);
    }
  };

  return (
    <div className="h-full flex flex-col pt-2 animate-in fade-in duration-1000 overflow-hidden relative">
      <div className="mb-2 shrink-0">
        <h1 className="text-2xl font-light text-white tracking-tight uppercase drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
          实时 AI 对话
        </h1>
        <p className="text-[11px] font-normal text-white/50 uppercase tracking-[0.2em] mt-1">
          {t('live_desc')}
        </p>
      </div>

      <div className="flex-1 flex flex-col bg-black/20 backdrop-blur-2xl border border-white/10 rounded-2xl relative shadow-2xl overflow-hidden items-center justify-center">
        
        {/* Immersive Core Visualizer */}
        <div className="relative w-full max-w-2xl flex flex-col items-center justify-center py-12">
            <div className="relative mb-12">
                <AnimatePresence>
                    {isActive && (
                        <>
                            <motion.div 
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1.2, opacity: 0.15 }}
                                exit={{ scale: 0.8, opacity: 0 }}
                                className="absolute inset-[-40px] rounded-full bg-spark-accent blur-3xl animate-pulse"
                            />
                            <motion.div 
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1.1, opacity: 0.1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                className="absolute inset-[-20px] rounded-full border-2 border-spark-accent/20 animate-spin"
                                style={{ animationDuration: '10s' }}
                            />
                        </>
                    )}
                </AnimatePresence>

                <div className={`w-32 h-32 rounded-full border-2 flex items-center justify-center transition-all duration-700 relative z-10 ${
                    isActive 
                      ? 'bg-spark-accent/10 border-spark-accent/40 shadow-[0_0_40px_rgba(59,130,246,0.4)]' 
                      : 'bg-white/5 border-white/10'
                }`}>
                    {status === 'speaking' ? (
                        <Volume2 size={48} className="text-spark-accent animate-bounce" />
                    ) : status === 'listening' ? (
                        <Mic size={48} className="text-white animate-pulse" />
                    ) : status === 'error' ? (
                        <ShieldAlert size={48} className="text-red-500" />
                    ) : (
                        <Activity size={48} className="text-white/20" />
                    )}
                </div>
            </div>

            <div className="flex flex-col items-center gap-2 mb-8">
                <span className={`text-[12px] font-bold uppercase tracking-[0.4em] transition-colors ${isActive ? 'text-spark-accent' : 'text-white/20'}`}>
                    {status === 'idle' ? t('live_status_idle') : 
                     status === 'listening' ? t('live_status_listening') : 
                     status === 'speaking' ? t('live_status_speaking') : t('live_status_error')}
                </span>
                {isActive && (
                    <div className="h-4 flex items-center justify-center gap-1.5">
                        {[...Array(5)].map((_, i) => (
                            <motion.div 
                                key={i}
                                className="w-1 bg-spark-accent rounded-full"
                                animate={{ height: [4, 12, 4] }}
                                transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.1 }}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Live Transcription Overlay */}
            <div className="w-full px-12 text-center h-24 flex flex-col justify-center">
                <AnimatePresence mode="wait">
                    {inputTranscription && (
                        <motion.p 
                            key="input"
                            initial={{ opacity: 0, y: 5 }} 
                            animate={{ opacity: 1, y: 0 }} 
                            exit={{ opacity: 0 }}
                            className="text-white/40 text-sm font-medium tracking-wide italic"
                        >
                            "{inputTranscription}"
                        </motion.p>
                    )}
                    {outputTranscription && (
                        <motion.p 
                            key="output"
                            initial={{ opacity: 0, y: 5 }} 
                            animate={{ opacity: 1, y: 0 }} 
                            exit={{ opacity: 0 }}
                            className="text-white text-lg font-light tracking-tight leading-relaxed drop-shadow-md"
                        >
                            {outputTranscription}
                        </motion.p>
                    )}
                </AnimatePresence>
            </div>
        </div>

        {/* Action Button */}
        <div className="absolute bottom-12 flex flex-col items-center gap-6">
            <StarButton 
                onClick={isActive ? stopLive : startLive}
                className={`h-14 px-12 rounded-2xl transition-all duration-500 ${isActive ? '!bg-red-500 !from-red-600 !to-pink-600 shadow-red-500/20' : ''}`}
            >
                <div className="flex items-center gap-3">
                    {isActive ? <Square size={20} fill="currentColor" /> : <Zap size={20} fill="currentColor" />}
                    <span className="text-base font-black tracking-[0.2em]">{isActive ? t('live_stop') : t('live_start')}</span>
                </div>
            </StarButton>
            
            <div className="flex items-center gap-4 text-white/20">
                <div className="flex items-center gap-2">
                    <Cpu size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Gemini 2.5 Native Audio</span>
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
                <div className="flex items-center gap-2">
                    <MessageCircle size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Natural Processing</span>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default LiveChat;
