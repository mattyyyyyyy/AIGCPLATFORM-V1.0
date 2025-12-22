
import React, { useState, useEffect } from "react";
import { Mic, Square } from "lucide-react";

function cn(...classes: (string | undefined | boolean | null)[]) {
  return classes.filter(Boolean).join(' ');
}

interface AIVoiceInputProps {
  onStart?: () => void;
  onStop?: (duration: number) => void;
  visualizerBars?: number;
  demoMode?: boolean;
  demoInterval?: number;
  className?: string;
}

export function AIVoiceInput({
  onStart,
  onStop,
  visualizerBars = 32, // Reduced number of bars
  demoMode = false,
  demoInterval = 3000,
  className
}: AIVoiceInputProps) {
  const [submitted, setSubmitted] = useState(false);
  const [time, setTime] = useState(0);
  const [isClient, setIsClient] = useState(false);
  const [isDemo, setIsDemo] = useState(demoMode);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    let intervalId: any;

    if (submitted) {
      onStart?.();
      intervalId = setInterval(() => {
        setTime((t) => t + 1);
      }, 1000);
    } else {
      if (time > 0) {
        onStop?.(time);
      }
      setTime(0);
    }

    return () => clearInterval(intervalId);
  }, [submitted]);

  useEffect(() => {
    if (!isDemo) return;

    let timeoutId: any;
    const runAnimation = () => {
      setSubmitted(true);
      timeoutId = setTimeout(() => {
        setSubmitted(false);
        timeoutId = setTimeout(runAnimation, 1000);
      }, demoInterval);
    };

    const initialTimeout = setTimeout(runAnimation, 100);
    return () => {
      clearTimeout(timeoutId);
      clearTimeout(initialTimeout);
    };
  }, [isDemo, demoInterval]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleClick = () => {
    if (isDemo) {
      setIsDemo(false);
      setSubmitted(false);
    } else {
      setSubmitted((prev) => !prev);
    }
  };

  return (
    <div className={cn("w-full py-2", className)}>
      <div className="relative max-w-xl w-full mx-auto flex items-center flex-col gap-4">
        {/* Main Recording Button */}
        <button
          className={cn(
            "group relative w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-2xl overflow-hidden",
            submitted 
              ? "bg-emerald-600 ring-4 ring-emerald-500/20 scale-95" 
              : "bg-emerald-500 hover:bg-emerald-400 hover:scale-105 hover:shadow-emerald-500/40"
          )}
          type="button"
          onClick={handleClick}
        >
          {/* Ripple Effect Background when recording */}
          {submitted && (
             <div className="absolute inset-0 bg-white/20 animate-pulse" />
          )}

          {submitted ? (
            <div className="relative z-10 flex flex-col items-center justify-center gap-1">
               <Square className="w-5 h-5 text-white fill-white" />
            </div>
          ) : (
            <Mic className="w-7 h-7 text-white fill-white/20 transition-transform group-hover:scale-110" />
          )}
        </button>

        {/* Timer */}
        <span
          className={cn(
            "font-mono text-sm font-bold tracking-widest transition-colors duration-300 tabular-nums",
            submitted
              ? "text-white animate-pulse"
              : "text-white/20"
          )}
        >
          {formatTime(time)}
        </span>

        {/* Visualizer Bars */}
        <div className="h-8 w-full flex items-center justify-center gap-1">
          {[...Array(visualizerBars)].map((_, i) => (
            <div
              key={i}
              className={cn(
                "w-1 rounded-full transition-all duration-300 ease-in-out",
                submitted
                  ? "bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]"
                  : "bg-white/5 h-1"
              )}
              style={
                submitted && isClient
                  ? {
                      height: `${20 + Math.random() * 80}%`,
                      animationDelay: `${i * 0.05}s`,
                    }
                  : undefined
              }
            />
          ))}
        </div>

        {/* Status Text */}
        <p className={cn(
          "h-4 text-[10px] font-bold uppercase tracking-[0.2em] transition-colors duration-300",
          submitted ? "text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]" : "text-white/30"
        )}>
          {submitted ? "正在采集音频样本..." : "点击上方按钮开始录制"}
        </p>
      </div>
    </div>
  );
}
