import React, { useState } from 'react';
import PromptSidebar from './components/PromptSidebar';
import PromptListContainer from './components/PromptListContainer';
import { Page } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';

const PromptDiscover: React.FC = () => {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  // Fix: Updated state definition to strictly match the Filter type expected by sub-components
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
      {/* Sidebar - Positioned for the module */}
      <PromptSidebar 
        onSearch={setSearchQuery} 
        onFilterChange={setFilters} 
      />
      
      {/* Main Content Waterfall Area */}
      <div className="flex-1 ml-72 px-8 pt-0 pb-8 overflow-hidden flex flex-col">
        {/* Module Header - Minimal top spacing to satisfy "move up" request */}
        <div className="flex justify-between items-center shrink-0 py-2 mb-2 border-b border-white/5 min-h-[50px]">
          <h1 className="text-2xl font-black text-white uppercase tracking-tighter italic">提示词探索</h1>
          <div className="text-[10px] font-bold text-white/20 uppercase tracking-[0.3em]">Unleash the power of creative instructions</div>
        </div>
        
        {/* Waterfall Container */}
        <PromptListContainer 
          searchQuery={searchQuery} 
          filters={filters} 
        />
      </div>
    </div>
  );
};

export default PromptDiscover;