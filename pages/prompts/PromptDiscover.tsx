
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
        {/* Module Header - Tighter padding */}
        <div className="flex justify-between items-center shrink-0 py-1 mb-3 border-b border-white/5">
          <h1 className="text-xl font-light text-white uppercase tracking-tighter">提示词探索</h1>
          <div className="text-[9px] font-medium text-white/20 uppercase tracking-[0.3em]">Unleash the power of creative instructions</div>
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
