
import React from 'react';
import { usePlayer } from '../contexts/PlayerContext';
import { useVoices } from '../contexts/VoiceContext';
import PlayerBar from './PlayerBar';
import { translateCategory } from '../constants';

const GlobalPlayer: React.FC = () => {
  const { 
    currentVoice, 
    isPlaying, 
    currentTime, 
    duration, 
    togglePlay, 
    seek, 
    forward, 
    rewind, 
    closePlayer 
  } = usePlayer();

  const { getVoice } = useVoices();

  if (!currentVoice) return null;

  const activeVoiceData = getVoice(currentVoice.id) || currentVoice;
  const isPreset = activeVoiceData.source === 'preset';

  return (
    <div className="fixed bottom-6 left-80 right-8 z-50 animate-in slide-in-from-bottom-10 fade-in duration-500">
      <PlayerBar
        avatarUrl={activeVoiceData.avatarUrl}
        title={activeVoiceData.name}
        subTitle={translateCategory(activeVoiceData.category)}
        tags={isPreset ? [] : activeVoiceData.tags}
        isPlaying={isPlaying}
        onTogglePlay={togglePlay}
        onClose={closePlayer}
        currentTime={currentTime}
        duration={duration}
        onSeek={seek}
        onForward={() => forward(10)}
        onRewind={() => rewind(10)}
      />
    </div>
  );
};

export default GlobalPlayer;
