
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
  const [editTags, setEditTags] = useState('');
  
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
    setEditTags(voice.tags.join(', '));
  };

  const saveEdit = (id: string) => {
    updateVoice(id, {
      name: editName,
      tags: editTags.split(/[，, ]/).filter(t => t.trim())
    });
    setEditingId(null);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if(confirm('确定要永久删除这个自定义声音吗？')) {
      deleteVoice(id);
    }
  };

  return (
    <div className="h-full flex flex-col gap-0 animate-in fade-in duration-500 relative">
       {/* Ultra-Compact Integrated Header */}
       <div className="flex items-center justify-between shrink-0 py-1.5 mb-4 border-b border-white/5 relative z-30">
          <div className="flex items-center gap-4">
            <h1 className="text-[13px] font-black text-white uppercase tracking-widest shrink-0">声音库</h1>
            
            <div className="flex bg-[#161618] border border-white/5 rounded-lg p-0.5 shrink-0">
              {[
                {id: Page.PRESET, label: '预设'}, 
                {id: Page.CUSTOM, label: '自定义'}
              ].map((tab) => (
                <button 
                  key={tab.id} 
                  onClick={() => onNavigate(tab.id as Page)} 
                  className={`px-2.5 py-0.5 text-[10px] font-bold rounded transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-white/10 text-white shadow-sm' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Compact Search Bar next to Tabs */}
            <div className="relative group min-w-[140px] md:min-w-[180px]">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-spark-accent transition-colors" size={12} />
              <input 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/[0.02] border border-white/5 rounded-lg py-1 pl-8 pr-3 text-white text-[11px] focus:border-spark-accent/30 outline-none placeholder:text-white/10 transition-all shadow-inner" 
                placeholder="搜索名称..." 
              />
            </div>

            {/* Filter and Create integrated to the right of Search Box */}
            <div className="flex items-center gap-2 relative">
              <button 
                onClick={() => setShowFilterPanel(!showFilterPanel)} 
                className={`px-2.5 py-1 rounded-lg border text-[10px] font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${showFilterPanel ? 'bg-spark-accent/20 border-spark-accent/40 text-white' : 'bg-[#161618] border-white/5 text-white/60 hover:bg-white/5 hover:text-white'}`}
              >
                <Filter size={10} /> 筛选
              </button>
              
              {activeTab === Page.CUSTOM && (
                 <button 
                   onClick={() => onNavigate(Page.VOICE_CLONING)} 
                   className="px-2.5 py-1 rounded-lg bg-spark-accent hover:bg-blue-500 text-white text-[10px] font-black flex items-center gap-1.5 transition-all shadow-lg shadow-spark-accent/20 whitespace-nowrap"
                 >
                   <Plus size={10} /> 创建
                 </button>
              )}

              {showFilterPanel && (
                <div ref={filterPanelRef} className="absolute top-full right-0 mt-2 w-[240px] bg-[#121214] border border-white/10 rounded-xl shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 flex flex-col gap-4">
                  <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">快速筛选</span>
                    <button onClick={clearFilters} className="text-[9px] text-spark-accent hover:underline flex items-center gap-1 font-bold"><RotateCcw size={9} /> 重置</button>
                  </div>
                  <div>
                    <div className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1.5">性别</div>
                    <div className="flex gap-1">
                      {['Male', 'Female'].map(g => (
                        <button key={g} onClick={() => setGenderFilter(genderFilter === g ? null : g)} className={`flex-1 py-1 rounded text-[9px] font-bold border transition-all ${genderFilter === g ? 'bg-spark-accent border-spark-accent text-white' : 'bg-white/5 border-white/5 text-white/40 hover:text-white'}`}>{g === 'Male' ? '男' : '女'}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1.5">类别</div>
                    <div className="flex flex-wrap gap-1">
                      {allCategories.map(cat => (
                        <button key={cat} onClick={() => setCatFilter(catFilter === cat ? null : cat)} className={`px-2 py-0.5 rounded text-[9px] font-bold border transition-all ${catFilter === cat ? 'bg-spark-accent border-spark-accent text-white' : 'bg-white/5 border-white/5 text-white/40 hover:text-white'}`}>{translateCategory(cat)}</button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Right side alignment if needed for more tools */}
          </div>
       </div>

       {/* Ultra-Compact Card Grid */}
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
                  className={`group flex flex-col p-3.5 rounded-xl transition-all duration-300 border animate-in fade-in slide-in-from-bottom-1 ${isEditing ? 'bg-spark-accent/5 border-spark-accent/40 shadow-xl' : playing ? 'bg-spark-accent/5 border-spark-accent/30 shadow-md' : 'bg-white/[0.02] border-white/5 hover:border-white/10'}`}
                >
                  <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className="relative cursor-pointer shrink-0" onClick={() => !isEditing && playVoice(voice)}>
                        <img src={voice.avatarUrl} alt={voice.name} className="w-12 h-12 rounded-lg object-cover bg-black/20 border border-white/10" />
                        {!isEditing && (
                          <div className={`absolute inset-0 rounded-lg flex items-center justify-center bg-black/40 backdrop-blur-[1px] transition-all ${playing ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                            {playing ? <Pause size={18} fill="white" className="text-white" /> : <Play size={18} fill="white" className="text-white ml-0.5" />}
                          </div>
                        )}
                    </div>
                    
                    {/* Info / Editing Input */}
                    <div className="flex-1 min-w-0">
                       {isEditing ? (
                         <input 
                           autoFocus
                           value={editName}
                           onChange={e => setEditName(e.target.value)}
                           className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-1 text-sm font-black text-white outline-none focus:border-spark-accent"
                           placeholder="名称"
                         />
                       ) : (
                         <div className="flex items-center gap-1.5 mb-1">
                            <h3 className={`text-[15px] font-black truncate leading-tight transition-colors ${playing ? 'text-spark-accent' : 'text-white'}`}>{voice.name}</h3>
                            {isSelected && <Zap size={10} className="text-spark-accent fill-spark-accent shrink-0" />}
                         </div>
                       )}
                       <p className="text-[10px] text-white/20 uppercase font-black tracking-widest truncate">{translateCategory(voice.category)}</p>
                    </div>

                    {/* Action Group */}
                    {!isEditing && (
                      <div className="flex flex-col items-end gap-2">
                        <button 
                          onClick={() => { setSelectedVoice(voice); onNavigate(Page.TTS); }} 
                          className={`px-3 py-1 rounded-lg text-[10px] font-black tracking-wide transition-all border shrink-0 ${isSelected ? 'bg-spark-accent border-spark-accent text-white shadow-lg' : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10 hover:text-white'}`}
                        >
                          {isSelected ? '已选' : '使用'}
                        </button>
                        
                        {isCustom && (
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity translate-x-1">
                            <button onClick={() => startEditing(voice)} className="p-1.5 text-white/20 hover:text-white hover:bg-white/5 rounded-md" title="编辑资料"><Edit3 size={12}/></button>
                            <button onClick={(e) => handleDelete(voice.id, e)} className="p-1.5 text-white/20 hover:text-red-500 hover:bg-red-500/10 rounded-md" title="永久删除"><Trash2 size={12}/></button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Edit Tags / Display Tags - Responsive side buttons */}
                  {isEditing ? (
                    <div className="mt-3 space-y-1.5 animate-in fade-in slide-in-from-top-1">
                       <label className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] ml-0.5">描述标签</label>
                       <div className="flex gap-2">
                         <input 
                            value={editTags} 
                            onChange={e => setEditTags(e.target.value)} 
                            className="flex-1 min-w-0 bg-black/40 border border-white/10 rounded-lg px-2.5 py-1.5 text-[11px] text-white outline-none focus:border-spark-accent"
                            placeholder="标签 (逗号或空格隔开)"
                         />
                         <div className="flex gap-1 shrink-0">
                           <button 
                             onClick={() => saveEdit(voice.id)} 
                             className="p-1.5 bg-spark-accent hover:bg-blue-500 rounded-lg text-white shadow-lg shadow-spark-accent/10 transition-colors"
                             title="保存修改"
                           >
                             <Check size={14}/>
                           </button>
                           <button 
                             onClick={() => setEditingId(null)} 
                             className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-white/40 transition-colors"
                             title="取消"
                           >
                             <CloseIcon size={14}/>
                           </button>
                         </div>
                       </div>
                    </div>
                  ) : isCustom ? (
                    <div className="mt-3 flex flex-wrap gap-1.5 h-4 overflow-hidden group-hover:h-auto transition-all">
                       {voice.tags.map(tag => (
                         <span key={tag} className="text-[9px] font-bold text-white/20 px-2 py-0.5 rounded-md bg-white/5 border border-white/5 uppercase">#{tag}</span>
                       ))}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>

          {getFilteredVoices().length === 0 && (
             <div className="flex flex-col items-center justify-center py-24 text-white/5">
                <Search size={40} className="mb-3 opacity-10" />
                <p className="text-[11px] font-black uppercase tracking-[0.2em]">无匹配音色</p>
             </div>
          )}
       </div>

       {showBackToTop && (
        <button 
          onClick={scrollToTop} 
          className="fixed bottom-12 right-12 z-[100] p-3.5 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 text-white shadow-2xl hover:bg-spark-accent hover:border-spark-accent hover:scale-110 active:scale-95 transition-all duration-500 group animate-in slide-in-from-bottom-10"
        >
          <ArrowUp size={20} />
        </button>
      )}
    </div>
  );
};

export default VoiceLibrary;
