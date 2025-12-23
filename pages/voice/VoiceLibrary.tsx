
import React, { useState, useEffect, useRef } from 'react';
import { translateCategory, CATEGORY_MAP } from '../../constants';
import { 
  Search, Play, Pause, Filter, RotateCcw, Plus, ArrowUp, Zap, 
  Edit3, Trash2, Check, X as CloseIcon 
} from 'lucide-react';
import { Page, Voice } from '../../types';
import { usePlayer } from '../../contexts/PlayerContext';
import { useVoices } from '../../contexts/VoiceContext';
import { useTTS } from '../../contexts/TTSContext';
import { useLanguage } from '../../contexts/LanguageContext';

interface VoiceLibraryProps {
  onNavigate: (page: Page) => void;
  initialTab?: Page;
}

const VoiceLibrary: React.FC<VoiceLibraryProps> = ({ onNavigate, initialTab = Page.PRESET }) => {
  const [activeTab, setActiveTab] = useState<Page>(initialTab);
  const { playVoice, currentVoice, isPlaying } = usePlayer();
  const { voices, deleteVoice, updateVoice } = useVoices();
  const { t } = useLanguage();
  const { setSelectedVoice, selectedVoice } = useTTS();
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [genderFilter, setGenderFilter] = useState<string | null>(null);
  const [catFilter, setCatFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showBackToTop, setShowBackToTop] = useState(false);
  
  // 编辑状态
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editNotes, setEditNotes] = useState('');
  
  const filterPanelRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const allCategories = Object.keys(CATEGORY_MAP);

  useEffect(() => { setActiveTab(initialTab); }, [initialTab]);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterPanelRef.current && !filterPanelRef.current.contains(event.target as Node)) setShowFilterPanel(false);
    };
    if (showFilterPanel) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showFilterPanel]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setShowBackToTop(e.currentTarget.scrollTop > 300);
  };

  const scrollToTop = () => {
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getFilteredVoices = () => {
    let filtered = voices;
    switch (activeTab) {
        case Page.CUSTOM: filtered = filtered.filter(v => v.source === 'custom' || v.isCustom); break;
        case Page.PRESET: filtered = filtered.filter(v => v.source === 'preset'); break;
        default: filtered = filtered.filter(v => v.source === 'preset'); break;
    }
    if (genderFilter) filtered = filtered.filter(v => v.gender === genderFilter);
    if (catFilter) filtered = filtered.filter(v => v.category === catFilter);
    if (searchQuery) {
      filtered = filtered.filter(v => v.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    return filtered;
  };

  const clearFilters = () => { 
    setGenderFilter(null); 
    setCatFilter(null); 
    setSearchQuery('');
  };

  const startEditing = (voice: Voice) => {
    setEditingId(voice.id);
    setEditName(voice.name);
    setEditNotes(voice.notes || '');
  };

  const saveEdit = (id: string) => {
    updateVoice(id, {
      name: editName,
      notes: editNotes
    });
    setEditingId(null);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if(confirm('确定要永久删除这个自定义声音吗？')) {
      deleteVoice(id);
    }
  };

  const isCustomPage = activeTab === Page.CUSTOM;

  return (
    <div className="h-full flex flex-col gap-0 animate-in fade-in duration-500 relative">
       {/* Header with increased clarity */}
       <div className="flex items-center justify-between shrink-0 py-2.5 mb-4 border-b border-white/5 relative z-30">
          <div className="flex items-center gap-6">
            <h1 className="text-xl font-medium text-white uppercase tracking-widest shrink-0">
              {isCustomPage ? '自定义声音' : '预设声音'}
            </h1>
            
            {/* Search Bar */}
            <div className="relative group min-w-[200px] md:min-w-[260px]">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-spark-accent transition-colors" size={14} />
              <input 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-2 pl-10 pr-4 text-white text-[13px] font-normal focus:border-spark-accent/30 outline-none placeholder:text-white/20 transition-all" 
                placeholder="搜索名称..." 
              />
            </div>

            {/* Actions area - Filter hidden on custom page */}
            <div className="flex items-center gap-3 relative h-9">
              {!isCustomPage && (
                <button 
                  onClick={() => setShowFilterPanel(!showFilterPanel)} 
                  className={`px-4 py-1 rounded-xl border text-[13px] font-medium transition-all flex items-center gap-2 whitespace-nowrap h-full ${showFilterPanel ? 'bg-spark-accent/20 border-spark-accent/40 text-white' : 'bg--[#161618] border-white/10 text-white/60 hover:bg-white/5 hover:text-white'}`}
                >
                  <Filter size={12} /> 筛选
                </button>
              )}
              
              {isCustomPage && (
                 <button 
                   onClick={() => onNavigate(Page.VOICE_CLONING)} 
                   className="px-6 py-1 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 hover:scale-[1.02] active:scale-[0.98] text-white text-[13px] font-bold uppercase tracking-widest flex items-center gap-2 transition-all shadow-lg shadow-blue-500/20 whitespace-nowrap h-full"
                 >
                   <Plus size={14} /> 创建新声音
                 </button>
              )}

              {showFilterPanel && (
                <div ref={filterPanelRef} className="absolute top-full right-0 mt-2 w-[280px] bg-[#121214] border border-white/10 rounded-2xl shadow-2xl p-5 z-50 animate-in fade-in zoom-in-95 flex flex-col gap-5">
                  <div className="flex justify-between items-center border-b border-white/10 pb-2">
                    <span className="text-[10px] font-medium text-white/60 uppercase tracking-widest">快速筛选</span>
                    <button onClick={clearFilters} className="text-[11px] text-spark-accent hover:underline flex items-center gap-1 font-medium"><RotateCcw size={10} /> 重置</button>
                  </div>
                  <div>
                    <div className="text-[10px] font-medium text-white/30 uppercase tracking-widest mb-2">性别</div>
                    <div className="flex gap-2">
                      {['Male', 'Female'].map(g => (
                        <button key={g} onClick={() => setGenderFilter(genderFilter === g ? null : g)} className={`flex-1 py-1.5 rounded-lg text-[11px] font-medium border transition-all ${genderFilter === g ? 'bg-spark-accent border-spark-accent text-white' : 'bg-white/5 border-white/10 text-white/40 hover:text-white'}`}>{g === 'Male' ? '男' : '女'}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-medium text-white/30 uppercase tracking-widest mb-2">类别</div>
                    <div className="flex flex-wrap gap-2">
                      {allCategories.map(cat => (
                        <button key={cat} onClick={() => setCatFilter(catFilter === cat ? null : cat)} className={`px-3 py-1 rounded-lg text-[11px] font-medium border transition-all ${catFilter === cat ? 'bg-spark-accent border-spark-accent text-white' : 'bg-white/5 border-white/10 text-white/40 hover:text-white'}`}>{translateCategory(cat)}</button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
       </div>

       {/* List area */}
       <div 
         ref={scrollContainerRef}
         onScroll={handleScroll}
         className="flex-1 overflow-y-auto pb-28 custom-scrollbar scroll-smooth"
       >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
            {getFilteredVoices().map((voice, idx) => {
              const playing = currentVoice?.id === voice.id && isPlaying;
              const isSelected = selectedVoice.id === voice.id;
              const isEditing = editingId === voice.id;
              const isCustom = voice.source === 'custom' || voice.isCustom;

              return (
                <div 
                  key={voice.id} 
                  style={{ animationDelay: `${idx * 15}ms` }}
                  className={`glass-panel group flex flex-col p-3.5 rounded-xl transition-all duration-300 border animate-in fade-in slide-in-from-bottom-1 ${isEditing ? 'bg-spark-accent/10 border-spark-accent/40 shadow-xl' : playing ? 'bg-white/15 border-white/30 shadow-md' : 'border-white/10 hover:border-white/20 hover:bg-white/[0.06]'}`}
                >
                  {isEditing && (
                    <div className="mb-3 space-y-2 animate-in fade-in slide-in-from-top-1">
                       <label className="text-sm font-bold text-white uppercase tracking-wider ml-0.5">备注信息</label>
                       <textarea 
                          value={editNotes} 
                          onChange={e => setEditNotes(e.target.value)} 
                          rows={2}
                          className="w-full bg-black/40 border border-white/20 rounded-lg px-2.5 py-2 text-[11px] text-white font-normal outline-none focus:border-spark-accent resize-none"
                          placeholder="填写声音备注..."
                       />
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <div className="relative cursor-pointer shrink-0" onClick={() => !isEditing && playVoice(voice)}>
                        <img src={voice.avatarUrl} alt={voice.name} className="w-11 h-11 rounded-lg object-cover bg-black/20 border border-white/10" />
                        {!isEditing && (
                          <div className={`absolute inset-0 rounded-lg flex items-center justify-center bg-black/40 transition-all ${playing ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                            {playing ? <Pause size={16} fill="white" className="text-white" /> : <Play size={16} fill="white" className="text-white ml-0.5" />}
                          </div>
                        )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                       {isEditing ? (
                         <div className="space-y-1">
                           <label className="text-sm font-bold text-white uppercase tracking-wider ml-0.5">名称</label>
                           <input 
                             value={editName}
                             onChange={e => setEditName(e.target.value)}
                             className="w-full bg-black/40 border border-white/20 rounded-lg px-2 py-1.5 text-sm font-medium text-white outline-none focus:border-spark-accent"
                             placeholder="填写声音名称…"
                           />
                         </div>
                       ) : (
                         <div className="flex flex-col gap-0.5">
                            <div className="flex items-center gap-1.5">
                               <h3 className={`text-[14px] font-medium truncate leading-tight transition-colors ${playing ? 'text-spark-accent' : 'text-white'}`}>{voice.name}</h3>
                               {isSelected && <Zap size={10} className="text-spark-accent fill-spark-accent shrink-0" />}
                            </div>
                            {!isCustom && (
                              <p className="text-[10px] text-white/50 uppercase font-normal tracking-widest truncate">{translateCategory(voice.category)}</p>
                            )}
                            {isCustom && voice.notes && (
                              <p className="text-[10px] text-white/30 italic truncate max-w-[120px]">“{voice.notes}”</p>
                            )}
                         </div>
                       )}
                    </div>

                    {!isEditing && (
                      <div className="flex flex-col items-end gap-1.5">
                        <button 
                          onClick={() => { setSelectedVoice(voice); onNavigate(Page.TTS); }} 
                          className={`px-3 py-1 rounded-md text-[10px] font-medium tracking-wide transition-all border shrink-0 ${isSelected ? 'bg-gradient-to-tr from-blue-600 to-cyan-500 border-transparent text-white shadow-sm' : 'bg-white/5 border-white/10 text-white/50 hover:text-white hover:bg-white/10'}`}
                        >
                          {isSelected ? '已选' : '使用'}
                        </button>
                        
                        {isCustom && (
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => startEditing(voice)} className="p-1 text-white/30 hover:text-white hover:bg-white/10 rounded" title="编辑资料"><Edit3 size={11}/></button>
                            <button onClick={(e) => handleDelete(voice.id, e)} className="p-1 text-white/30 hover:text-red-500 hover:bg-red-500/10 rounded" title="永久删除"><Trash2 size={11}/></button>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {isEditing && (
                      <div className="flex flex-col gap-1 shrink-0 pt-4">
                        <button onClick={() => saveEdit(voice.id)} className="p-2 bg-spark-accent hover:bg-blue-500 rounded-lg text-white transition-colors shadow-lg" title="保存"><Check size={14}/></button>
                        <button onClick={() => setEditingId(null)} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-white/40" title="取消"><CloseIcon size={14}/></button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {getFilteredVoices().length === 0 && (
             <div className="h-full flex flex-col items-center justify-center text-white/60">
                <Search size={48} className="mb-4 opacity-10" />
                <p className="text-[13px] font-medium uppercase tracking-[0.3em]">无匹配音色</p>
             </div>
          )}
       </div>

       {showBackToTop && (
        <button 
          onClick={scrollToTop} 
          className="fixed bottom-12 right-12 z-[100] p-3 rounded-xl bg-white text-black shadow-2xl hover:scale-110 active:scale-95 transition-all duration-500"
        >
          <ArrowUp size={20} />
        </button>
      )}
    </div>
  );
};

export default VoiceLibrary;
