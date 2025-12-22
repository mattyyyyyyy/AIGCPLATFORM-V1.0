
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Home, Mic, Speaker, Copy, Users, Library, Globe, User, Heart, Activity, Settings, X, Plus, Trash2, Volume2 } from 'lucide-react';
import { Page } from '../types';
import { NAV_GROUPS } from '../constants';
import { useVoices } from '../contexts/VoiceContext';
import { useLanguage } from '../contexts/LanguageContext';

interface SidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentPage, onNavigate }) => {
  const [showSettings, setShowSettings] = useState(false);
  const { voices, deleteVoice } = useVoices();
  const { t } = useLanguage();
  
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Home': return Home;
      case 'Globe': return Globe;
      case 'Library': return Library;
      case 'User': return User;
      case 'Heart': return Heart;
      case 'Mic': return Mic;
      case 'Speaker': return Speaker;
      case 'Copy': return Copy;
      case 'Users': return Users;
      default: return Activity;
    }
  };

  const handleDeleteVoice = (id: string) => {
    if (confirm('确定要删除这个声音模型吗？此操作无法撤销。')) {
      deleteVoice(id);
    }
  };
  
  const getTranslationKey = (id: string): any => {
    switch(id) {
        case 'main_menu': return 'main_menu';
        case 'library': return 'library';
        case 'capabilities': return 'capabilities';
        case Page.HOME: return 'home';
        case Page.PROMPT_DISCOVER: return 'discover';
        case Page.PRESET: return 'preset';
        case Page.CUSTOM: return 'custom';
        case Page.PROMPT_FAVORITES: return 'favorites';
        case Page.ASR: return 'asr';
        case Page.TTS: return 'tts';
        case Page.VOICE_CLONING: return 'voice_cloning';
        case Page.VOICEPRINT: return 'diarization';
        default: return id;
    }
  };

  return (
    <>
    <aside className="w-72 h-[calc(100vh-5rem)] fixed left-0 top-20 z-30 flex flex-col glass-panel border-r border-white/10 bg-[#020204]/80 backdrop-blur-2xl">
      <nav className="flex-1 px-4 py-6 space-y-8 overflow-y-auto custom-scrollbar">
        {NAV_GROUPS.map((group, idx) => {
          return (
            <div key={idx}>
              {group.title !== '主菜单' && (
                <div className="flex items-center gap-3 px-4 mb-3">
                  <div className="h-[1px] flex-1 bg-white/15" />
                  <div className="text-[12px] font-medium text-white uppercase tracking-[0.25em] drop-shadow-[0_0_8px_rgba(255,255,255,0.4)] whitespace-nowrap">
                    {t(getTranslationKey(group.id))}
                  </div>
                  <div className="h-[1px] flex-1 bg-white/15" />
                </div>
              )}
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = getIcon(item.icon);
                  const isActive = currentPage === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => onNavigate(item.id as Page)}
                      className={`
                        w-full flex items-center gap-4 px-5 py-3.5 rounded-xl transition-all duration-300 text-[13px] font-medium uppercase tracking-[0.15em] group relative border
                        ${isActive 
                          ? 'bg-spark-accent/20 text-white shadow-[0_4px_20px_rgba(59,130,246,0.2)] border-white/10' 
                          : 'border-transparent text-white/40 hover:text-white hover:bg-white/[0.04]'}
                      `}
                    >
                      <Icon size={18} className={`transition-colors shrink-0 ${isActive ? 'text-spark-accent' : 'text-white/40 group-hover:text-white/70'}`} />
                      <span className="truncate">{t(getTranslationKey(item.id))}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10">
        <button 
           onClick={() => setShowSettings(true)}
           className="w-full flex items-center gap-4 px-5 py-4 rounded-xl text-white/30 hover:text-white hover:bg-white/5 transition-all text-[12px] font-medium uppercase tracking-widest"
        >
           <Settings size={18} className="shrink-0" />
           <span className="truncate">{t('global_settings')}</span>
        </button>
      </div>
    </aside>

    {showSettings && createPortal(
       <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="absolute inset-0" onClick={() => setShowSettings(false)}></div>
          <div className="relative w-[600px] h-[70vh] bg-[#12141a] border border-white/10 rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden">
             <div className="p-8 border-b border-white/10 flex justify-between items-center bg-[#161618]">
                <h3 className="text-xl font-medium text-white uppercase tracking-widest">管理中心</h3>
                <button onClick={() => setShowSettings(false)} className="text-white/20 hover:text-white p-2 hover:bg-white/5 rounded-xl transition-all"><X size={28} /></button>
             </div>
             
             <div className="flex-1 overflow-y-auto p-8 bg-[#0f0f11] custom-scrollbar">
                <div className="space-y-6">
                   <div className="flex justify-between items-center mb-2 px-1">
                      <span className="text-[10px] font-medium text-white/20 uppercase tracking-[0.3em]">声音库管理 ({voices.length})</span>
                      <button 
                        onClick={() => { setShowSettings(false); onNavigate(Page.VOICE_CLONING); }}
                        className="flex items-center gap-2 text-[10px] font-medium text-spark-accent hover:text-blue-400 uppercase tracking-widest"
                      >
                        <Plus size={14} /> 新增声音
                      </button>
                   </div>
                   
                   <div className="space-y-3">
                      {voices.map(voice => (
                         <div key={voice.id} className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 group hover:bg-white/[0.05] hover:border-white/10 transition-all">
                            <img src={voice.avatarUrl} className="w-12 h-12 rounded-xl object-cover border border-white/10" />
                            <div className="flex-1 min-w-0">
                               <div className="text-base font-medium text-white truncate tracking-tight">{voice.name}</div>
                               <div className="text-[10px] text-white/30 font-medium uppercase tracking-widest mt-1">{voice.isCustom ? '自定义克隆' : '系统预设音色'}</div>
                            </div>
                            <button 
                              onClick={() => handleDeleteVoice(voice.id)}
                              className="p-3 rounded-xl text-white/10 hover:bg-red-500/10 hover:text-red-500 transition-colors"
                              title="删除模型"
                            >
                              <Trash2 size={18} />
                            </button>
                         </div>
                      ))}
                   </div>
                </div>
             </div>
          </div>
       </div>,
       document.body
    )}
    </>
  );
};

export default Sidebar;
