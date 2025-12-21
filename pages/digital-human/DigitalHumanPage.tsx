
import React, { useState, useEffect, useRef, memo, useMemo } from 'react';
import { Mic, MessageSquare, Box, Globe, Ghost, ChevronDown, Check } from 'lucide-react';
import { AppModule } from '../../types';
import Navbar from './Navbar';
import { useLanguage } from '../../contexts/LanguageContext';
import { useModule } from '../../contexts/ModuleContext';

// --- Isolated Typewriter Component ---
interface TypewriterProps {
  phrases: string[];
}

const Typewriter = memo(({ phrases }: TypewriterProps) => {
  const [displayText, setDisplayText] = useState("");
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [typingSpeed, setTypingSpeed] = useState(150);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const currentPhrase = phrases[phraseIndex % phrases.length];

    if (isDeleting) {
      timer = setTimeout(() => {
        setDisplayText(prev => prev.slice(0, -1));
        setTypingSpeed(50);
      }, typingSpeed);
    } else {
      timer = setTimeout(() => {
        setDisplayText(currentPhrase.slice(0, displayText.length + 1));
        setTypingSpeed(100 + Math.random() * 50);
      }, typingSpeed);
    }

    if (!isDeleting && displayText === currentPhrase) {
      clearTimeout(timer);
      timer = setTimeout(() => {
        setIsDeleting(true);
        setTypingSpeed(50);
      }, 3000);
    } else if (isDeleting && displayText === "") {
      setIsDeleting(false);
      setPhraseIndex(prev => prev + 1);
      setTypingSpeed(150);
    }

    return () => clearTimeout(timer);
  }, [displayText, isDeleting, phraseIndex, typingSpeed, phrases]);

  return (
    <h1 className="text-5xl md:text-7xl lg:text-8xl font-normal text-center tracking-[0.2em] leading-tight text-white drop-shadow-[0_0_35px_rgba(255,255,255,0.8)] min-h-[1.2em]">
      {displayText}
      <span className="ml-1 animate-[blink_1s_step-end_infinite]">_</span>
    </h1>
  );
});

interface FeatureCardProps {
  id: AppModule;
  type3D: 'mic' | 'camera' | 'ghost' | 'human';
  title: string;
  video: string;
  style: React.CSSProperties;
  isHovered: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onClick: (e: React.MouseEvent<HTMLDivElement>) => void;
}

const FeatureCard: React.FC<FeatureCardProps> = memo(({ 
  id,
  type3D,
  title, 
  video,
  style,
  isHovered,
  onMouseEnter,
  onMouseLeave,
  onClick 
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      if (isHovered) {
        const playPromise = videoRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {});
        }
      } else {
        videoRef.current.pause();
        videoRef.current.currentTime = 0; 
      }
    }
  }, [isHovered]);

  return (
    <div 
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
      style={{
        ...style,
        boxShadow: isHovered 
          ? undefined 
          : '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
      }}
      className={`absolute w-64 h-96 cursor-pointer group origin-center will-change-transform rounded-[2rem] bg-white/5 backdrop-blur-md border transition-all duration-500 overflow-hidden
        ${isHovered ? 'animate-border-pulse bg-white/10' : 'border-white/10'}
      `}
    >
        <div className="relative z-10 h-full w-full flex flex-col items-center justify-end pb-8 select-none">
            <div className="absolute inset-0">
                 <video
                    ref={videoRef}
                    src={video}
                    muted
                    loop
                    playsInline
                    preload="auto"
                    className="absolute inset-0 w-full h-full object-cover z-0 transition-all duration-700"
                    style={{
                      filter: isHovered ? 'none' : 'grayscale(100%)',
                      opacity: isHovered ? 1 : 0.6
                    }}
                 />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 z-20" />
            </div>
            <span className="relative z-30 text-2xl font-bold text-white tracking-[0.2em] uppercase drop-shadow-[0_0_15px_rgba(255,255,255,0.5)] text-center px-4">
              {title}
            </span>
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-20" />
    </div>
  );
});

export default function DigitalHumanPage() {
  const { lang, setLang, t } = useLanguage();
  const { setModule } = useModule();
  
  const [animData, setAnimData] = useState<{
    module: AppModule;
    rect: DOMRect;
    title: string;
  } | null>(null);
  const [isExpanding, setIsExpanding] = useState(false);
  const [deckScale, setDeckScale] = useState(1);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    let timeoutId: number;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        const baseWidth = 1536; 
        const baseHeight = 864;
        const widthScale = Math.min(1, Math.max(0.55, window.innerWidth / baseWidth));
        const heightScale = Math.min(1, Math.max(0.55, window.innerHeight / baseHeight));
        setDeckScale(Math.min(widthScale, heightScale));
      }, 50);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    }
  }, []);

  const handleModuleSelect = (module: AppModule, title: string, e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setAnimData({ module, rect, title });

    setTimeout(() => {
      setIsExpanding(true);
    }, 10);

    setTimeout(() => {
      if (module === AppModule.AI_VOICE || module === AppModule.PROMPT_LIBRARY) {
        setModule(module);
      } else {
        setIsExpanding(false);
        setAnimData(null);
      }
    }, 400);
  };

  const handleNavClick = (tabId: string) => {
    if (tabId === 'ai-voice') {
        setModule(AppModule.AI_VOICE);
    }
  };

  const CARD_SPACING = 190; 
  const PUSH_DISTANCE = 220; 
  const CENTER_INDEX = 1.5; 

  const getCardStyle = (index: number) => {
    const relativeIndex = index - CENTER_INDEX;
    const baseX = relativeIndex * CARD_SPACING;
    const baseRotate = relativeIndex * 4; 

    const isHovered = index === hoveredIndex;
    const isIdle = hoveredIndex === null;
    
    let transform = '';
    let zIndex = 10;
    let opacity = 1;
    let filter = 'blur(0px)';
    
    if (isIdle) {
      transform = `translateX(${baseX}px) rotate(${baseRotate}deg) scale(0.9)`;
      zIndex = 10 + index; 
    } else if (isHovered) {
      transform = `translateX(${baseX}px) rotate(0deg) scale(1.05) translateY(-30px)`;
      zIndex = 50;
      opacity = 1;
    } else {
      const isLeft = index < hoveredIndex;
      const pushDir = isLeft ? -1 : 1;
      const targetX = baseX + (pushDir * PUSH_DISTANCE);
      const targetRotate = baseRotate + (pushDir * 8); 
      
      transform = `translateX(${targetX}px) rotate(${targetRotate}deg) scale(0.85)`;
      zIndex = 40 - Math.abs(index - hoveredIndex); 
      opacity = 0.5;
      filter = 'blur(2px)'; 
    }

    return { transform, zIndex, opacity, filter, transition: 'all 800ms cubic-bezier(0.2, 1, 0.2, 1)' };
  };

  const featureList: { 
    id: AppModule; 
    type3D: 'mic' | 'camera' | 'ghost' | 'human'; 
    title: string; 
    video: string; 
  }[] = [
    { 
      id: AppModule.DH_AUDIO, 
      type3D: 'mic', 
      title: (t('dh_features') as unknown as string[])[0], 
      video: "https://res.cloudinary.com/djmxoehe9/video/upload/v1765437646/macphone_rbh44x.mp4"
    },
    { 
      id: AppModule.DH_CHAT, 
      type3D: 'camera', 
      title: (t('dh_features') as unknown as string[])[1], 
      video: "https://res.cloudinary.com/djmxoehe9/video/upload/v1765437646/shexiangji_cnko5j.mp4"
    },
    { 
      id: AppModule.DH_AVATAR, 
      type3D: 'ghost', 
      title: (t('dh_features') as unknown as string[])[2], 
      video: "https://res.cloudinary.com/djmxoehe9/video/upload/v1765437646/plant_pwucfi.mp4"
    },
    { 
      id: AppModule.DH_3D, 
      type3D: 'human', 
      title: (t('dh_features') as unknown as string[])[3], 
      video: "https://res.cloudinary.com/djmxoehe9/video/upload/v1765437646/littlegirl_gzwaui.mp4"
    },
  ];

  const typewriterPhrases = useMemo(() => [
    t('heroTitle'),
    "Make Cars Smarter",
    "重新定义美学创造"
  ], [t('heroTitle')]);

  const selectedFeature = featureList.find(f => f.id === animData?.module);

  return (
    <div className="relative z-10 w-full h-full flex flex-col overflow-hidden bg-spark-bg">
      <style>{`
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
        @keyframes border-pulse {
          0%, 100% { box-shadow: 0 0 20px rgba(255, 255, 255, 0.1), inset 0 0 10px rgba(255,255,255,0.05); border-color: rgba(255, 255, 255, 0.2); }
          50% { box-shadow: 0 0 40px rgba(255, 255, 255, 0.4), inset 0 0 20px rgba(255,255,255,0.2); border-color: rgba(255, 255, 255, 0.6); }
        }
        .animate-border-pulse { animation: border-pulse 2s ease-in-out infinite; }
      `}</style>

      {/* Background Video */}
      <video 
        autoPlay 
        loop 
        muted 
        playsInline 
        className="absolute inset-0 w-full h-full object-cover z-0"
        src="https://res.cloudinary.com/djmxoehe9/video/upload/v1765817364/12%E6%9C%8816%E6%97%A5_1_u5zzwh.mp4"
      />
      <div className="absolute inset-0 bg-black/40 z-[1]" />

      <Navbar lang={lang} setLang={setLang} t={t} onNavClick={handleNavClick} currentTab="digital-human" />

      <main className="w-full h-full flex flex-col items-center relative z-10">
        <div className="flex flex-col items-center mt-[22vh] md:mt-[22vh] z-20">
            <div className="flex items-center justify-center min-h-[80px] md:min-h-[120px]">
               <Typewriter phrases={typewriterPhrases} />
            </div>
        </div>

        <div className={`relative flex-1 w-full flex items-center justify-center mt-0 max-w-6xl perspective-1000 animate-in fade-in zoom-in-95 duration-1000 delay-200 ${animData ? 'opacity-0 pointer-events-none' : 'opacity-100'} transition-opacity duration-300`}>
           <div className="relative h-[450px] w-full flex justify-center items-center" style={{ transform: `scale(${deckScale})`, transformOrigin: 'center center' }}>
             {featureList.map((feature, index) => (
                <FeatureCard 
                  key={feature.id}
                  id={feature.id}
                  type3D={feature.type3D}
                  title={feature.title}
                  video={feature.video}
                  style={getCardStyle(index)}
                  isHovered={hoveredIndex === index}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  onClick={(e) => handleModuleSelect(feature.id, feature.title, e)}
                />
             ))}
           </div>
        </div>
      </main>

      {animData && selectedFeature && (
        <div 
          className="fixed z-50 bg-[#191919]/40 backdrop-blur-xl border border-white/10 overflow-hidden shadow-2xl"
          style={{
            top: isExpanding ? 0 : animData.rect.top,
            left: isExpanding ? 0 : animData.rect.left,
            width: isExpanding ? '100vw' : animData.rect.width,
            height: isExpanding ? '100vh' : animData.rect.height,
            borderRadius: isExpanding ? 0 : '2rem', 
            transition: 'all 300ms cubic-bezier(0.2, 0, 0.2, 1)', 
          }}
        >
           <div className="w-full h-full flex flex-col items-center justify-center relative">
              <div className="absolute inset-0 w-full h-full">
                <video src={selectedFeature.video} autoPlay loop muted className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />
                <div className={`absolute inset-0 bg-black/60 transition-opacity duration-500 ${isExpanding ? 'opacity-100' : 'opacity-0'}`} />
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
