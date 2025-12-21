
import React from 'react';
import { Globe, Check } from 'lucide-react';
import { Language } from '../../locales/translations';
import DropdownMenu, { DropdownOption } from '../../components/DropdownMenu';

interface NavbarProps {
  lang: 'CN' | 'EN';
  setLang: (lang: Language) => void;
  t: any;
  onNavClick: (tabId: string) => void;
  currentTab: string;
}

const Navbar: React.FC<NavbarProps> = ({ lang, setLang, t, onNavClick, currentTab }) => {
  
  const langOptions: DropdownOption[] = [
    { 
      label: '简体中文 (ZH)', 
      onClick: () => setLang('CN'), 
      active: lang === 'CN',
      Icon: lang === 'CN' ? <Check size={10} className="text-green-400" /> : null 
    },
    { 
      label: 'English (EN)', 
      onClick: () => setLang('EN'), 
      active: lang === 'EN',
      Icon: lang === 'EN' ? <Check size={10} className="text-green-400" /> : null 
    }
  ];

  return (
    <nav className="absolute top-0 left-0 right-0 h-20 z-40 flex items-center justify-between px-10 bg-transparent">
      {/* Left: Branding */}
      <div className="flex items-center gap-3 select-none">
        <span className="font-sans font-black text-2xl text-white tracking-tighter drop-shadow-md">JDO</span>
      </div>
      
      {/* Center: Tabs */}
      <div className="flex items-center gap-8">
        <button 
          onClick={() => window.open('https://jdo-aigcplatfoorm-v2-0.vercel.app/', '_blank')}
          className={`text-sm font-bold tracking-widest transition-all uppercase ${currentTab === 'digital-human' ? 'text-white' : 'text-white/40 hover:text-white'}`}
        >
          {lang === 'CN' ? '数字人' : 'Digital Human'}
        </button>
        <button 
          onClick={() => onNavClick('ai-voice')}
          className={`text-sm font-bold tracking-widest transition-all uppercase ${currentTab === 'ai-voice' ? 'text-white' : 'text-white/40 hover:text-white'}`}
        >
          {lang === 'CN' ? 'AI语音' : 'AI Voice'}
        </button>
      </div>

      {/* Right: Lang Switcher */}
      <div className="relative">
        <DropdownMenu options={langOptions} className="w-fit" menuClassName="right-0 min-w-[120px]">
          <div className="flex items-center gap-2 text-[10px] tracking-widest font-black">
            <Globe size={14} />
            <span>{lang === 'CN' ? 'ZH' : 'EN'}</span>
          </div>
        </DropdownMenu>
      </div>
    </nav>
  );
};

export default Navbar;
