
import React, { useState } from 'react';
import { Search, Image as ImageIcon, Cpu, Mic, Code, Layers, RotateCcw } from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';
import DropdownMenu, { DropdownOption } from '../../../components/DropdownMenu';

interface PromptSidebarProps {
  onSearch: (query: string) => void;
  onFilterChange: (filters: { categories: string[]; brand?: string; version?: string; tags: string[]; logic: 'AND' | 'OR' }) => void;
}

const THEME_TAGS = [
  '学术', '论文', '写作', '职场', '创意', '设计', '二次元', '写实', 'Python', 'React', '提示词工程', '营销', '翻译', '法律'
];

const MODEL_DATA = [
  { id: 'GEMINI', versions: ['GEMINI3', 'GEMINI2.5', 'GEMINI FLASH'] },
  { id: 'GPT', versions: ['GPT-4o', 'GPT-4', 'O1'] },
  { id: 'CLAUDE', versions: ['CLAUDE 3.5', 'CLAUDE 3'] },
];

const SectionHeader: React.FC<{ children: React.ReactNode; action?: React.ReactNode }> = ({ children, action }) => (
  <div className="flex items-center justify-between px-1 mb-3 mt-6 first:mt-0 select-none">
    <div className="flex items-center gap-3 flex-1">
      <div className="h-[1px] flex-1 bg-white/10" />
      <span className="text-[11px] font-black text-white/40 uppercase tracking-[0.2em] whitespace-nowrap">
        {children}
      </span>
      <div className="h-[1px] flex-1 bg-white/10" />
    </div>
    {action && <div className="ml-2">{action}</div>}
  </div>
);

const PromptSidebar: React.FC<PromptSidebarProps> = ({ onSearch, onFilterChange }) => {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategories, setActiveCategories] = useState<string[]>([]);
  const [activeBrand, setActiveBrand] = useState<string | null>(null);
  const [activeVersion, setActiveVersion] = useState<string | null>(null);
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [filterLogic, setFilterLogic] = useState<'AND' | 'OR'>('AND');

  const categories = [
    { id: '图片', icon: ImageIcon },
    { id: '语音', icon: Mic },
    { id: '编程', icon: Code },
    { id: '大模型', icon: Cpu },
  ];

  const notifyChange = (overrides: any = {}) => {
    onFilterChange({
      categories: overrides.categories !== undefined ? overrides.categories : activeCategories,
      brand: overrides.brand !== undefined ? overrides.brand : (activeBrand || undefined),
      version: overrides.version !== undefined ? overrides.version : (activeVersion || undefined),
      tags: overrides.tags !== undefined ? overrides.tags : activeTags,
      logic: overrides.logic !== undefined ? overrides.logic : filterLogic,
    });
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    onSearch(e.target.value);
  };

  const resetAll = () => {
    setSearchQuery('');
    setActiveCategories([]);
    setActiveBrand(null);
    setActiveVersion(null);
    setActiveTags([]);
    onSearch('');
    onFilterChange({ categories: [], tags: [], logic: filterLogic });
  };

  const toggleLogic = () => {
    const next = filterLogic === 'AND' ? 'OR' : 'AND';
    setFilterLogic(next);
    notifyChange({ logic: next });
  };

  const toggleCategory = (id: string) => {
    const next = activeCategories.includes(id) 
      ? activeCategories.filter(c => c !== id) 
      : [...activeCategories, id];
    setActiveCategories(next);
    notifyChange({ categories: next });
  };

  const handleBrandSelect = (brand: string | null) => {
    setActiveBrand(brand);
    setActiveVersion(null);
    notifyChange({ brand: brand || undefined, version: undefined });
  };

  const handleVersionSelect = (version: string | null) => {
    setActiveVersion(version);
    notifyChange({ version: version || undefined });
  };

  const toggleTag = (tag: string) => {
    const next = activeTags.includes(tag) 
      ? activeTags.filter(t => t !== tag) 
      : [...activeTags, tag];
    setActiveTags(next);
    notifyChange({ tags: next });
  };

  const availableVersions = MODEL_DATA.find(m => m.id === activeBrand)?.versions || [];

  const brandOptions: DropdownOption[] = [
    { label: "所有模型", onClick: () => handleBrandSelect(null), active: !activeBrand },
    ...MODEL_DATA.map(m => ({
      label: m.id,
      onClick: () => handleBrandSelect(m.id),
      active: activeBrand === m.id
    }))
  ];

  const versionOptions: DropdownOption[] = [
    { label: "所有版本", onClick: () => handleVersionSelect(null), active: !activeVersion },
    ...availableVersions.map(v => ({
      label: v,
      onClick: () => handleVersionSelect(v),
      active: activeVersion === v
    }))
  ];

  return (
    <aside className="w-72 h-[calc(100vh-5rem)] fixed left-0 top-20 z-30 flex flex-col bg-[#020204]/60 backdrop-blur-2xl border-r border-white/5 transform-gpu">
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
        
        {/* Module Title & Reset */}
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-3 text-spark-amber">
              <Cpu size={18} className="drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
              <span className="text-sm font-black uppercase tracking-widest">提示词库</span>
           </div>
           <button 
             onClick={resetAll} 
             className="p-2 rounded-lg bg-white/5 text-white/30 hover:text-white hover:bg-white/10 transition-all"
             title="重置全部筛选"
           >
             <RotateCcw size={14} />
           </button>
        </div>

        {/* Search & Logic */}
        <div className="space-y-3">
           <div className="relative group">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-spark-amber transition-colors" size={14} />
              <input 
                value={searchQuery}
                onChange={handleSearch}
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white text-xs focus:border-spark-amber/50 outline-none placeholder:text-white/10 transition-all shadow-inner" 
                placeholder="搜索提示词..." 
              />
           </div>
           <button 
             onClick={toggleLogic}
             className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl border transition-all ${
                filterLogic === 'AND' 
                ? 'bg-spark-amber/10 border-spark-amber/30 text-white shadow-[0_4px_15px_rgba(245,158,11,0.1)]' 
                : 'bg-orange-500/10 border-orange-500/30 text-white'
             }`}
           >
             <div className="flex items-center gap-2.5">
                <Layers size={14} className={filterLogic === 'AND' ? 'text-spark-amber' : 'text-orange-400'} />
                <span className="text-[11px] font-black tracking-widest uppercase">
                  {filterLogic === 'AND' ? '严谨模式 (AND)' : '模糊模式 (OR)'}
                </span>
             </div>
             <div className={`w-1.5 h-1.5 rounded-full ${filterLogic === 'AND' ? 'bg-spark-amber' : 'bg-orange-400'} shadow-[0_0_8px_currentColor]`} />
           </button>
        </div>

        {/* Model Selection */}
        <div className="space-y-2.5">
           <SectionHeader>模型家族</SectionHeader>
           <div className="space-y-2">
              <DropdownMenu options={brandOptions} className="w-full" menuClassName="w-full">
                <span className="text-[11px] font-bold uppercase tracking-wider">{activeBrand || "所有模型"}</span>
              </DropdownMenu>

              <DropdownMenu 
                options={versionOptions} 
                className={`w-full ${!activeBrand ? 'opacity-30 pointer-events-none' : ''}`} 
                menuClassName="w-full"
              >
                <span className="text-[11px] font-bold uppercase tracking-wider">{activeVersion || "所有版本"}</span>
              </DropdownMenu>
           </div>
        </div>

        {/* Core Categories (Pills) */}
        <div className="space-y-2.5">
           <SectionHeader>任务分类</SectionHeader>
           <div className="flex flex-wrap gap-2">
              {categories.map((cat) => {
                const isActive = activeCategories.includes(cat.id);
                return (
                  <button
                    key={cat.id}
                    onClick={() => toggleCategory(cat.id)}
                    className={`
                      inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-wider transition-all duration-300
                      ${isActive 
                        ? 'bg-spark-amber border-spark-amber text-black shadow-[0_0_15px_rgba(245,158,11,0.4)]' 
                        : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-white'}
                    `}
                  >
                    <cat.icon size={12} className={isActive ? 'text-black' : 'text-white/30'} />
                    {cat.id}
                  </button>
                );
              })}
           </div>
        </div>

        {/* Theme Tags (Pills) */}
        <div className="space-y-2.5">
           <SectionHeader>热门标签</SectionHeader>
           <div className="flex flex-wrap gap-2">
              {THEME_TAGS.map(tag => {
                const isActive = activeTags.includes(tag);
                return (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`
                      inline-flex items-center rounded-full border px-3 py-1 text-[10px] font-bold transition-all duration-200
                      ${isActive 
                        ? 'bg-white/10 border-spark-amber text-spark-amber shadow-[0_0_10px_rgba(245,158,11,0.2)]' 
                        : 'bg-white/5 border-transparent text-white/40 hover:bg-white/10 hover:text-white'}
                    `}
                  >
                    #{tag}
                  </button>
                );
              })}
           </div>
        </div>
      </div>
    </aside>
  );
};

export default PromptSidebar;
