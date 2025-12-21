
import React, { useState, useEffect } from "react";
import { Mic } from "lucide-react";

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
  visualizerBars = 48,
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
    <div className={cn("w-full py-4", className)}>
      <div className="relative max-w-xl w-full mx-auto flex items-center flex-col gap-4">
        <button
          className={cn(
            "group w-20 h-20 rounded-2xl flex items-center justify-center transition-all duration-500 border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/10 shadow-xl",
            submitted ? "ring-2 ring-spark-accent/50 scale-95" : ""
          )}
          type="button"
          onClick={handleClick}
        >
          {submitted ? (
            <div
              className="w-6 h-6 rounded-sm animate-spin bg-spark-accent cursor-pointer pointer-events-auto shadow-[0_0_15px_rgba(59,130,246,0.6)]"
              style={{ animationDuration: "2s" }}
            />
          ) : (
            <Mic className="w-8 h-8 text-white/70 group-hover:text-white transition-colors" />
          )}
        </button>

        <span
          className={cn(
            "font-mono text-lg font-black tracking-widest transition-opacity duration-300",
            submitted
              ? "text-spark-accent animate-pulse"
              : "text-white/20"
          )}
        >
          {formatTime(time)}
        </span>

        <div className="h-10 w-full flex items-center justify-center gap-0.5">
          {[...Array(visualizerBars)].map((_, i) => (
            <div
              key={i}
              className={cn(
                "w-1 rounded-full transition-all duration-300",
                submitted
                  ? "bg-spark-accent/60 animate-pulse"
                  : "bg-white/5 h-2"
              )}
              style={
                submitted && isClient
                  ? {
                      height: `${30 + Math.random() * 70}%`,
                      animationDelay: `${i * 0.05}s`,
                    }
                  : undefined
              }
            />
          ))}
        </div>

        <p className="h-4 text-[10px] font-black uppercase tracking-[0.3em] text-white/30">
          {submitted ? "正在聆听并分析音频特征..." : "点击上方按钮开始录制"}
        </p>
      </div>
    </div>
  );
}
