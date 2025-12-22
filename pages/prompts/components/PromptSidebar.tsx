
import React, { useState } from 'react';
import { Search, Image as ImageIcon, Cpu, Mic, Code, Layers, RotateCcw, Box } from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';
import DropdownMenu, { DropdownOption } from '../../../components/DropdownMenu';

interface PromptSidebarProps {
  onSearch: (query: string) => void;
  onFilterChange: (filters: { categories: string[]; brand?: string; version?: string; tags: string[]; logic: 'AND' | 'OR' }) => void;
}

const THEME_TAGS = [
  '学术', '论文', '写作', '职场', '创意', '设计', '二次元', '写实', 'Python', 'React', '提示词工程', '营销', '翻译', '法律'
];

const MODELS = [
  'Qwen', 'Doubao', 'Gemini', 'Gpt', 'Claude', 'NanoBanana', 'Midjourney'
];

const SectionHeader: React.FC<{ children: React.ReactNode; action?: React.ReactNode }> = ({ children, action }) => (
  <div className="flex items-center justify-between px-1 mb-3 mt-4 first:mt-0 select-none">
    <div className="flex items-center gap-2 flex-1">
      <div className="h-[1px] flex-1 bg-white/15 shadow-[0_0_4px_rgba(255,255,255,0.1)]" />
      <span className="text-[14px] font-medium text-white uppercase tracking-[0.2em] whitespace-nowrap drop-shadow-[0_0_6px_rgba(255,255,255,0.5)]">
        {children}
      </span>
      <div className="h-[1px] flex-1 bg-white/15 shadow-[0_0_4px_rgba(255,255,255,0.1)]" />
    </div>
    {action && <div className="ml-1">{action}</div>}
  </div>
);

const PromptSidebar: React.FC<PromptSidebarProps> = ({ onSearch, onFilterChange }) => {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategories, setActiveCategories] = useState<string[]>([]);
  const [activeModel, setActiveModel] = useState<string | null>(null);
  const [activeTags, setActiveTags] = useState<string[]>([]);

  const categories = [
    { id: '图片', icon: ImageIcon },
    { id: '语音', icon: Mic },
    { id: '编程', icon: Code },
    { id: '大模型', icon: Cpu },
  ];

  const notifyChange = (overrides: any = {}) => {
    onFilterChange({
      categories: overrides.categories !== undefined ? overrides.categories : activeCategories,
      brand: overrides.brand !== undefined ? overrides.brand : (activeModel || undefined),
      tags: overrides.tags !== undefined ? overrides.tags : activeTags,
      logic: 'AND', // Fixed to AND as requested
    });
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    onSearch(e.target.value);
  };

  const resetAll = () => {
    setSearchQuery('');
    setActiveCategories([]);
    setActiveModel(null);
    setActiveTags([]);
    onSearch('');
    onFilterChange({ categories: [], tags: [], logic: 'AND' });
  };

  const toggleCategory = (id: string) => {
    const next = activeCategories.includes(id) 
      ? activeCategories.filter(c => c !== id) 
      : [...activeCategories, id];
    setActiveCategories(next);
    notifyChange({ categories: next });
  };

  const toggleModel = (model: string) => {
    const next = activeModel === model ? null : model;
    setActiveModel(next);
    notifyChange({ brand: next || undefined });
  };

  const toggleTag = (tag: string) => {
    const next = activeTags.includes(tag) 
      ? activeTags.filter(t => t !== tag) 
      : [...activeTags, tag];
    setActiveTags(next);
    notifyChange({ tags: next });
  };

  return (
    <aside className="w-72 h-[calc(100vh-4rem)] fixed left-0 top-16 z-30 flex flex-col bg-[#020204]/60 backdrop-blur-xl border-r border-t border-white/15 shadow-[6px_0_40px_rgba(255,255,255,0.15)] transform-gpu rounded-tr-2xl">
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-5">
        
        {/* Module Title */}
        <div className="flex items-center justify-between mb-2">
           <div className="flex items-center gap-2.5 text-spark-amber">
              <Cpu size={16} />
              <span className="text-[13px] font-medium uppercase tracking-widest drop-shadow-[0_0_8px_rgba(245,158,11,0.4)]">{t('prompt_sidebar_title')}</span>
           </div>
           <button 
             onClick={resetAll} 
             className="p-1.5 rounded-lg bg-white/5 text-white/30 hover:text-white hover:bg-white/10 transition-all"
             title={t('prompt_sidebar_reset')}
           >
             <RotateCcw size={12} />
           </button>
        </div>

        {/* Search */}
        <div className="space-y-2">
           <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-spark-amber transition-colors" size={13} />
              <input 
                value={searchQuery}
                onChange={handleSearch}
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-2.5 pl-9 pr-3 text-[12px] text-white font-normal focus:border-spark-amber/50 outline-none placeholder:text-white/20 transition-all" 
                placeholder={t('prompt_search_placeholder')}
              />
           </div>
        </div>

        {/* Categories */}
        <div className="space-y-2">
           <SectionHeader>{t('prompt_section_category')}</SectionHeader>
           <div className="flex flex-wrap gap-2">
              {categories.map((cat) => {
                const isActive = activeCategories.includes(cat.id);
                return (
                  <button
                    key={cat.id}
                    onClick={() => toggleCategory(cat.id)}
                    className={`
                      inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[10px] font-medium uppercase tracking-wider transition-all duration-300
                      ${isActive 
                        ? 'bg-spark-amber border-spark-amber text-black shadow-[0_0_12px_rgba(245,158,11,0.5)]' 
                        : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white'}
                    `}
                  >
                    <cat.icon size={10} />
                    {cat.id}
                  </button>
                );
              })}
           </div>
        </div>

        {/* Models - Replaced dropdown with flat tags */}
        <div className="space-y-2">
           <SectionHeader>{t('prompt_section_model')}</SectionHeader>
           <div className="flex flex-wrap gap-2">
              {MODELS.map(m => {
                const isActive = activeModel === m;
                return (
                  <button
                    key={m}
                    onClick={() => toggleModel(m)}
                    className={`
                      inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[10px] font-medium uppercase tracking-wider transition-all duration-300
                      ${isActive 
                        ? 'bg-spark-amber border-spark-amber text-black shadow-[0_0_12px_rgba(245,158,11,0.5)]' 
                        : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white'}
                    `}
                  >
                    <Box size={10} />
                    {m}
                  </button>
                );
              })}
           </div>
        </div>

        {/* Popular Tags */}
        <div className="space-y-2">
           <SectionHeader>{t('prompt_section_tags')}</SectionHeader>
           <div className="flex flex-wrap gap-1.5">
              {THEME_TAGS.map(tag => {
                const isActive = activeTags.includes(tag);
                return (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`
                      inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-medium transition-all duration-200
                      ${isActive 
                        ? 'bg-white/10 border-spark-amber text-spark-amber shadow-[0_0_8px_rgba(245,158,11,0.3)]' 
                        : 'bg-white/5 border-white/10 text-white/40 hover:text-white'}
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
