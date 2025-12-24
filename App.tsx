import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';

// AI Voice Module Components
import Home from './pages/voice/Home';
import ASR from './pages/voice/ASR';
import TTS from './pages/voice/TTS';
import VoiceCloning from './pages/voice/VoiceCloning';
import Diarization from './pages/voice/Diarization'; 
import LiveChat from './pages/voice/LiveChat';
import VoiceLibrary from './pages/voice/VoiceLibrary';
import VoiceSidebar from './pages/voice/components/VoiceSidebar';
import VoicePlayer from './pages/voice/components/VoicePlayer';

// Digital Human Module Page
import DigitalHuman from './pages/digital-human/DigitalHumanPage';

// Prompt Engine Module Components
import PromptDiscover from './pages/prompts/PromptDiscover';

import { PlayerProvider, usePlayer } from './contexts/PlayerContext';
import { TTSProvider } from './contexts/TTSContext';
import { VoiceProvider } from './contexts/VoiceContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { ModuleProvider, useModule } from './contexts/ModuleContext';
import { Page, AppModule } from './types';

const AppContent: React.FC = () => {
  const { currentModule } = useModule();
  const { closePlayer } = usePlayer();
  
  const [currentPage, setCurrentPage] = useState<Page>(
    currentModule === AppModule.PROMPT_LIBRARY ? Page.PROMPT_DISCOVER : Page.HOME
  );

  // Background Image Management
  useEffect(() => {
    const bgElement = document.getElementById('global-bg-image');
    if (bgElement) {
      if (currentModule === AppModule.PROMPT_LIBRARY) {
        bgElement.style.backgroundImage = "url('https://github.com/mattyyyyyyy/picture2bed/blob/main/%E6%A9%99%E7%B2%89%E7%B3%BB%E6%8A%BD%E8%B1%A1%E5%9B%BE1.jpg?raw=true')";
      } else if (currentModule === AppModule.AI_VOICE) {
        bgElement.style.backgroundImage = "url('https://github.com/mattyyyyyyy/picture2bed/blob/main/%E8%93%9D%E8%89%B2%E7%A7%91%E6%8A%80%E6%84%9F%E6%8A%BD%E8%B1%A1%E5%9B%BE1.png?raw=true')";
      } else {
        // 数字人模式下可以隐藏背景或设为纯黑
        bgElement.style.backgroundImage = "none";
        bgElement.style.backgroundColor = "#000000";
      }
    }
  }, [currentModule]);

  useEffect(() => {
    closePlayer();
    if (currentModule === AppModule.AI_VOICE) {
      setCurrentPage(Page.HOME);
    } else if (currentModule === AppModule.PROMPT_LIBRARY) {
      setCurrentPage(Page.PROMPT_DISCOVER);
    }
  }, [currentModule, closePlayer]); 

  const renderAiVoiceModule = () => {
    const renderSubPage = () => {
      switch (currentPage) {
        case Page.HOME: return <Home onNavigate={setCurrentPage} />;
        case Page.ASR: return <ASR />;
        case Page.TTS: return <TTS />;
        case Page.VOICE_CLONING: return <VoiceCloning />;
        case Page.VOICEPRINT: return <Diarization />; 
        case Page.LIVE_CHAT: return <LiveChat />;
        case Page.PRESET:
        case Page.CUSTOM:
          return <VoiceLibrary onNavigate={setCurrentPage} initialTab={currentPage} />;
        default: return <Home onNavigate={setCurrentPage} />;
      }
    };

    return (
      <>
        <VoiceSidebar currentPage={currentPage} onNavigate={setCurrentPage} />
        <main className="relative z-10 flex flex-col ml-72 px-8 pt-0 h-[calc(100vh-4rem)] mt-16">
          <div className="flex-1 overflow-hidden flex flex-col pt-0 pb-8">
            {renderSubPage()}
          </div>
        </main>
        <VoicePlayer />
      </>
    );
  };

  const renderPromptModule = () => {
    return (
      <main className="relative z-10 w-full mt-16 h-[calc(100vh-4rem)]">
        <PromptDiscover />
      </main>
    );
  };

  return (
    <div className="relative flex flex-col min-h-screen w-full">
      <Navbar />

      {currentModule === AppModule.AI_VOICE && renderAiVoiceModule()}
      {currentModule === AppModule.PROMPT_LIBRARY && renderPromptModule()}
      {currentModule === AppModule.DIGITAL_HUMAN && (
        <main className="relative z-10 w-full h-screen">
          <DigitalHuman />
        </main>
      )}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <LanguageProvider>
      <ModuleProvider>
        <PlayerProvider>
          <VoiceProvider>
            <TTSProvider>
              <AppContent />
            </TTSProvider>
          </VoiceProvider>
        </PlayerProvider>
      </ModuleProvider>
    </LanguageProvider>
  );
};

export default App;