
import React, { memo } from 'react';
import { Globe, Check } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useModule } from '../contexts/ModuleContext';
import { AppModule } from '../types';
import DropdownMenu, { DropdownOption } from './DropdownMenu';

const JDOLogo = memo(() => (
  <div className="flex items-center gap-3">
    <img 
      src="https://github.com/mattyyyyyyy/picture2bed/blob/main/e850352ac65c103853436eb801478413b07eca802308%20(1).png?raw=true" 
      alt="JDO Logo" 
      className="w-8 h-8 object-contain drop-shadow-[0_0_10px_rgba(255,255,255,0.6)]"
    />
    <span 
      className="font-sans font-medium text-2xl text-white tracking-tighter drop-shadow-lg select-none leading-none"
    >
      JDO
    </span>
  </div>
));

const Navbar: React.FC = () => {
  const { lang, setLang } = useLanguage();
  const { currentModule, setModule } = useModule();

  const handleModuleClick = (id: AppModule) => {
    setModule(id);
  };

  const langOptions: DropdownOption[] = [
    { 
      label: '简体中文', 
      onClick: () => setLang('CN'), 
      active: lang === 'CN',
      Icon: lang === 'CN' ? <Check size={12} className="text-green-400" /> : null 
    },
    { 
      label: 'English', 
      onClick: () => setLang('EN'), 
      active: lang === 'EN',
      Icon: lang === 'EN' ? <Check size={12} className="text-green-400" /> : null 
    }
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 z-50 flex items-center justify-between px-10 md:px-14 bg-transparent transition-all duration-300 pointer-events-none">
      {/* Left: Logo */}
      <div className="flex items-center gap-3 select-none min-w-[200px] h-full cursor-pointer pointer-events-auto group" onClick={() => handleModuleClick(AppModule.AI_VOICE)}>
         <JDOLogo />
      </div>
      
      {/* Center: Unified Modular Switcher */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center z-50 pointer-events-auto">
         <div className="flex items-center gap-12 px-8 py-2.5 rounded-xl bg-white/[0.04] backdrop-blur-lg border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
            <button 
              onClick={() => handleModuleClick(AppModule.DIGITAL_HUMAN)}
              className={`relative py-1 text-[14px] font-light uppercase tracking-[0.2em] transition-all duration-500 leading-none whitespace-nowrap ${
                currentModule === AppModule.DIGITAL_HUMAN 
                  ? 'text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.6)]' 
                  : 'text-white/20 hover:text-white/50'
              }`}
            >
              {lang === 'CN' ? '数字人' : 'Digital Human'}
            </button>

            <button 
              onClick={() => handleModuleClick(AppModule.AI_VOICE)}
              className={`relative py-1 text-[14px] font-light uppercase tracking-[0.2em] transition-all duration-500 leading-none whitespace-nowrap ${
                currentModule === AppModule.AI_VOICE 
                  ? 'text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.6)]' 
                  : 'text-white/20 hover:text-white/50'
              }`}
            >
              {lang === 'CN' ? 'AI语音' : 'AI Voice'}
            </button>

            <button 
              onClick={() => handleModuleClick(AppModule.PROMPT_LIBRARY)}
              className={`relative py-1 text-[14px] font-light uppercase tracking-[0.2em] transition-all duration-500 leading-none whitespace-nowrap ${
                currentModule === AppModule.PROMPT_LIBRARY 
                  ? 'text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.6)]' 
                  : 'text-white/20 hover:text-white/50'
              }`}
            >
              {lang === 'CN' ? '提示词' : 'Prompt'}
            </button>
         </div>
      </div>
      
      {/* Right: Language Switcher */}
      <div className="relative z-50 flex items-center justify-end gap-6 min-w-[200px] pointer-events-auto">
        <DropdownMenu options={langOptions} className="w-fit" menuClassName="right-0">
          <div className="flex items-center gap-1.5 px-1 py-0.5 font-black uppercase tracking-widest text-[9px]">
            <Globe size={13} className="text-white/40" />
            <span>{lang === 'CN' ? 'ZH' : 'EN'}</span>
          </div>
        </DropdownMenu>
      </div>
    </nav>
  );
};

export default Navbar;
