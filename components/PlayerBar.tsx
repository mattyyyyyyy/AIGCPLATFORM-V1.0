
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
  actionButton?: React.ReactNode; 
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
    <div className={`bg-white/90 backdrop-blur-2xl border border-white shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex items-center gap-8 relative overflow-hidden group w-full transition-all duration-300 h-[5.5rem] ${className}`}>
      
      {/* Progress Bar Background (Bottom Line) */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/5 pointer-events-none">
         <div 
           className="h-full bg-blue-600 transition-all duration-100 ease-linear shadow-[0_0_10px_rgba(37,99,235,0.3)]"
           style={{ width: `${progress}%` }}
         />
      </div>

      {/* Info Section */}
      <div className="flex items-center gap-4 min-w-[150px] max-w-[25%] shrink-0 py-3 pl-6">
        <div className="relative shrink-0">
           <img 
             src={avatarUrl} 
             alt="avatar" 
             className={`w-12 h-12 rounded-xl border border-black/10 object-cover ${isPlaying ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`} 
           />
        </div>
        <div className="overflow-hidden">
          <h3 className="font-bold text-slate-900 text-[15px] truncate tracking-tight">{title}</h3>
        </div>
      </div>

      {/* Controls Section - Perfectly Centered */}
      <div className="flex-1 flex flex-col items-center justify-center gap-2 h-full py-2">
         <div className="flex items-center gap-10">
            {onRewind && (
              <button 
                onClick={onRewind}
                className="text-slate-400 hover:text-slate-900 transition-colors active:scale-95"
                title="-10s"
              >
                <Rewind size={20} />
              </button>
            )}

            <button 
              onClick={onTogglePlay}
              className="w-11 h-11 rounded-full bg-blue-600 text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg hover:shadow-blue-500/40"
            >
              {isPlaying ? <Pause size={22} fill="currentColor" /> : <Play size={22} fill="currentColor" className="ml-0.5" />}
            </button>

            {onForward && (
              <button 
                onClick={onForward}
                className="text-slate-400 hover:text-slate-900 transition-colors active:scale-95"
                title="+10s"
              >
                <FastForward size={20} />
              </button>
            )}
         </div>
         
         <div className="w-full max-w-md flex items-center gap-3 text-[10px] font-bold text-slate-400">
            <span className="w-10 text-right tabular-nums">{formatTime(currentTime)}</span>
            <input
              type="range"
              min="0"
              max={duration || 100}
              value={currentTime}
              onChange={(e) => onSeek(parseFloat(e.target.value))}
              className="flex-1 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-600 shadow-sm transition-all hover:h-1.5"
            />
            <span className="w-10 tabular-nums">{formatTime(duration)}</span>
         </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4 pr-6 pl-4 border-l border-slate-100 shrink-0 h-12">
        <button 
          onClick={onClose}
          className="p-3 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-900 transition-colors active:scale-90"
        >
           <X size={24} />
        </button>
      </div>
    </div>
  );
};

export default PlayerBar;
