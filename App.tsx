import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';

// AI Voice Module Components
import Home from './pages/voice/Home';
import ASR from './pages/voice/ASR';
import TTS from './pages/voice/TTS';
import VoiceCloning from './pages/voice/VoiceCloning';
import Diarization from './pages/voice/Diarization'; 
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
    <div className="min-h-screen bg-spark-bg text-white font-sans selection:bg-spark-accent/40 selection:text-white overflow-hidden relative">
      {/* Immersive Dark Background Layers */}
      <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-[#050505] via-[#0a0a0f] to-[#050505]" />
          <div className="absolute top-[-10%] left-[-10%] w-[65vw] h-[65vw] rounded-full bg-spark-accent/5 blur-[120px] animate-pulse-slow" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[55vw] h-[55vw] rounded-full bg-spark-amber/5 blur-[100px] animate-pulse-slow" />
      </div>

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