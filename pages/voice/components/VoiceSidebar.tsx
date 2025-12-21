import { Home, Mic, Speaker, Copy, Library, User, Activity, Users } from 'lucide-react';
import React from 'react';
import { NAV_GROUPS } from '../../../constants';
import { useLanguage } from '../../../contexts/LanguageContext';
import { Page } from '../../../types';

interface VoiceSidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

const VoiceSidebar: React.FC<VoiceSidebarProps> = ({ currentPage, onNavigate }) => {
  const { t } = useLanguage();
  
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Home': return Home;
      case 'Library': return Library;
      case 'User': return User;
      case 'Mic': return Mic;
      case 'Speaker': return Speaker;
      case 'Copy': return Copy;
      case 'Users': return Users;
      default: return Activity;
    }
  };

  const getTranslationKey = (id: string): any => {
    switch(id) {
        case 'main_menu': return 'main_menu';
        case 'library': return 'library';
        case 'capabilities': return 'capabilities';
        case Page.HOME: return 'home';
        case Page.PRESET: return 'preset';
        case Page.CUSTOM: return 'custom';
        case Page.ASR: return 'asr';
        case Page.TTS: return 'tts';
        case Page.VOICE_CLONING: return 'voice_cloning';
        case Page.VOICEPRINT: return 'diarization';
        default: return id;
    }
  };

  return (
    <aside className="w-72 h-[calc(100vh-5rem)] fixed left-0 top-20 z-30 flex flex-col glass-panel bg-[#020204]/60 backdrop-blur-2xl border-r border-t border-white/5 transform-gpu translate-z-0">
      <nav className="flex-1 px-4 py-4 space-y-4 overflow-y-auto custom-scrollbar flex flex-col">
        {NAV_GROUPS.map((group, idx) => (
          <div key={idx} className="w-full flex flex-col">
            {group.title !== '主菜单' && (
              <div className="flex items-center gap-3 px-1 mb-3 mt-2 first:mt-0 select-none pointer-events-none">
                <div className="h-[1px] flex-1 bg-white/15 shadow-[0_0_6px_rgba(255,255,255,0.2)]" />
                <span className="text-[14px] font-black text-white uppercase tracking-[0.12em] drop-shadow-[0_0_6px_rgba(255,255,255,0.6)] whitespace-nowrap">
                  {t(getTranslationKey(group.id))}
                </span>
                <div className="h-[1px] flex-1 bg-white/15 shadow-[0_0_6px_rgba(255,255,255,0.2)]" />
              </div>
            )}
            <div className="space-y-0.5 w-full">
              {group.items.map((item) => {
                const Icon = getIcon(item.icon);
                const isActive = currentPage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id as Page)}
                    className={`
                      w-full flex items-center gap-4 px-4 py-2.5 rounded-lg transition-all duration-200 text-[13px] font-bold group relative
                      ${isActive 
                        ? 'bg-white/5 text-white border border-white/10 shadow-[0_2px_10px_rgba(0,0,0,0.1)]' 
                        : 'text-white/30 hover:text-white hover:bg-white/[0.02] border border-transparent'}
                    `}
                  >
                    <Icon size={16} className={`transition-colors shrink-0 ${isActive ? 'text-spark-accent' : 'text-white/30 group-hover:text-white/60'}`} />
                    <span className="truncate">{t(getTranslationKey(item.id))}</span>
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-spark-accent rounded-full shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
};

export default VoiceSidebar;