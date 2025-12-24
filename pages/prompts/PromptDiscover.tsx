import React, { useState } from 'react';
import PromptSidebar from './components/PromptSidebar';
import PromptListContainer from './components/PromptListContainer';
import { Page } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';

const PromptDiscover: React.FC = () => {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<{ 
    categories: string[]; 
    brand?: string; 
    version?: string; 
    tags: string[]; 
    logic: 'AND' | 'OR' 
  }>({ 
    categories: [], 
    tags: [], 
    logic: 'AND' 
  });

  return (
    <div className="flex h-full relative">
      {/* Sidebar - Positioned for the module - top aligned with Navbar h-16 */}
      <PromptSidebar 
        onSearch={setSearchQuery} 
        onFilterChange={setFilters} 
      />
      
      {/* Main Content Waterfall Area */}
      <div className="flex-1 ml-72 px-8 pt-0 pb-8 overflow-hidden flex flex-col">
        {/* Module Header - Refined Typography & Spacing */}
        <div className="flex flex-col shrink-0 pt-6 space-y-2">
          <h1 className="text-5xl font-light text-white tracking-[0.2em]">灵感“咒语”库</h1>
          <div className="text-[11px] font-normal text-white/50 uppercase tracking-[0.3em] ml-1">
            寻找适合您想法的提示词
          </div>
        </div>
        
        {/* Waterfall Container - Adjusted margin to match Home Page rhythm */}
        <div className="flex-1 mt-6 overflow-hidden flex flex-col">
          <PromptListContainer 
            searchQuery={searchQuery} 
            filters={filters} 
          />
        </div>
      </div>
    </div>
  );
};

export default PromptDiscover;