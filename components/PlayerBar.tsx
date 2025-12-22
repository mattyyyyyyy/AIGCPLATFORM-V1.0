
import React from 'react';
import { Play, Pause, Rewind, FastForward, X } from 'lucide-react';

interface PlayerBarProps {
  avatarUrl: string;
  title: string;
  subTitle?: string;
  tags?: string[];
  isPlaying: boolean;
  onTogglePlay: () => void;
  onClose: () => void;
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
  onForward?: () => void;
  onRewind?: () => void;
  actionButton?: React.ReactNode; // Download or Heart
  className?: string;
}

const PlayerBar: React.FC<PlayerBarProps> = ({
  avatarUrl,
  title,
  isPlaying,
  onTogglePlay,
  onClose,
  currentTime,
  duration,
  onSeek,
  onForward,
  onRewind,
  actionButton,
  className = ''
}) => {
  const formatTime = (time: number) => {
    if (isNaN(time)) return "00:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className={`bg-[#0f0f11]/80 backdrop-blur-xl border border-white/5 rounded-xl px-6 py-2 shadow-[0_8px_30px_rgba(0,0,0,0.3)] flex items-center gap-8 relative overflow-hidden group w-full transition-all duration-300 hover:bg-[#0f0f11]/90 ${className}`}>
      
      {/* Progress Bar Background (Bottom Line) */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/5">
         <div 
           className="h-full bg-gradient-to-r from-spark-accent to-spark-dark transition-all duration-100 ease-linear"
           style={{ width: `${progress}%` }}
         />
      </div>

      {/* Info Section - Simplified: Only avatar and title */}
      <div className="flex items-center gap-4 min-w-[150px] max-w-[25%] shrink-0">
        <div className="relative shrink-0">
           <img 
             src={avatarUrl} 
             alt="avatar" 
             className={`w-10 h-10 rounded-lg border border-white/10 object-cover ${isPlaying ? 'shadow-[0_0_15px_rgba(59,130,246,0.3)]' : ''}`} 
           />
           {isPlaying && (
             <div className="absolute -bottom-1 -right-1 bg-[#12141a] rounded-full p-0.5 border border-white/10">
               <div className="w-1.5 h-1.5 rounded-full bg-spark-accent animate-pulse"></div>
             </div>
           )}
        </div>
        <div className="overflow-hidden">
          <h3 className="font-bold text-white text-sm truncate tracking-tight">{title}</h3>
        </div>
      </div>

      {/* Controls Section - Centered & Expanded */}
      <div className="flex-1 flex flex-col items-center justify-center gap-1.5">
         <div className="flex items-center gap-8">
            {onRewind && (
              <button 
                onClick={onRewind}
                className="text-white/30 hover:text-white transition-colors hover:scale-110 active:scale-95"
                title="-10s"
              >
                <Rewind size={16} />
              </button>
            )}

            <button 
              onClick={onTogglePlay}
              className="w-9 h-9 rounded-full bg-white text-spark-bg flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg hover:shadow-white/20"
            >
              {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
            </button>

            {onForward && (
              <button 
                onClick={onForward}
                className="text-white/30 hover:text-white transition-colors hover:scale-110 active:scale-95"
                title="+10s"
              >
                <FastForward size={16} />
              </button>
            )}
         </div>
         
         {/* Scrubber */}
         <div className="w-full flex items-center gap-3 text-[10px] font-mono text-white/30">
            <span className="w-9 text-right tabular-nums">{formatTime(currentTime)}</span>
            <input
              type="range"
              min="0"
              max={duration || 100}
              value={currentTime}
              onChange={(e) => onSeek(parseFloat(e.target.value))}
              className="flex-1 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white hover:[&::-webkit-slider-thumb]:bg-spark-accent [&::-webkit-slider-thumb]:transition-colors"
            />
            <span className="w-9 tabular-nums">{formatTime(duration)}</span>
         </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4 pl-4 border-l border-white/5 shrink-0">
        {actionButton}
        
        <button 
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-white/10 text-white/30 hover:text-white transition-colors"
        >
           <X size={18} />
        </button>
      </div>
    </div>
  );
};

export default PlayerBar;
