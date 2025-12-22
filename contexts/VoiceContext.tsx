
import React, { createContext, useContext, useState } from 'react';
import { Voice, SpeakerIdentity } from '../types';
import { MOCK_VOICES } from '../constants';

interface VoiceContextType {
  voices: Voice[];
  speakerRegistry: Record<string, SpeakerIdentity>;
  toggleFavorite: (voiceId: string) => void;
  addVoice: (voice: Voice) => void;
  deleteVoice: (voiceId: string) => void;
  updateVoice: (voiceId: string, updates: Partial<Voice>) => void;
  getVoice: (voiceId: string) => Voice | undefined;
  
  // Speaker Diarization Actions
  updateSpeaker: (id: string, updates: Partial<SpeakerIdentity>) => void;
  registerSpeaker: (speaker: SpeakerIdentity) => void;
  removeSpeaker: (id: string) => void;
  clearRegistry: () => void;
  findSpeakerByVoiceprint: (sampleId: string) => SpeakerIdentity | null;
}

const VoiceContext = createContext<VoiceContextType | undefined>(undefined);

export const VoiceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [voices, setVoices] = useState<Voice[]>(MOCK_VOICES);
  
  // Speaker Memory Registry: 存储已命名的角色声纹
  const [speakerRegistry, setSpeakerRegistry] = useState<Record<string, SpeakerIdentity>>({
    'spk_known_1': { id: 'spk_known_1', name: '李经理', color: 'bg-indigo-600', isKnown: true, avatarSeed: 'manager', source: 'detected' },
    'spk_known_2': { id: 'spk_known_2', name: '王助理', color: 'bg-rose-500', isKnown: true, avatarSeed: 'assistant', source: 'detected' }
  });

  const toggleFavorite = (voiceId: string) => {
    setVoices(prevVoices => 
      prevVoices.map(voice => 
        voice.id === voiceId ? { ...voice, isFavorite: !voice.isFavorite } : voice
      )
    );
  };

  const addVoice = (voice: Voice) => {
    setVoices(prev => [voice, ...prev]);
  };

  const deleteVoice = (voiceId: string) => {
    setVoices(prev => prev.filter(v => v.id !== voiceId));
  };

  const updateVoice = (voiceId: string, updates: Partial<Voice>) => {
    setVoices(prev => prev.map(v => v.id === voiceId ? { ...v, ...updates } : v));
  };

  const getVoice = (voiceId: string) => voices.find(v => v.id === voiceId);

  // 更新已存在的说话人信息
  const updateSpeaker = (id: string, updates: Partial<SpeakerIdentity>) => {
    setSpeakerRegistry(prev => ({
      ...prev,
      [id]: { ...prev[id], ...updates }
    }));
  };

  // 注册新发现的说话人
  const registerSpeaker = (speaker: SpeakerIdentity) => {
    setSpeakerRegistry(prev => ({
      ...prev,
      [speaker.id]: speaker
    }));
  };

  const removeSpeaker = (id: string) => {
    setSpeakerRegistry(prev => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const clearRegistry = () => {
    setSpeakerRegistry({});
  };

  const findSpeakerByVoiceprint = (sampleId: string) => {
    // Simulated voiceprint matching logic
    if (sampleId.includes('spk_1')) {
        return speakerRegistry['spk_known_1']; 
    }
    return null;
  };

  return (
    <VoiceContext.Provider value={{ 
      voices, 
      speakerRegistry,
      toggleFavorite, 
      addVoice, 
      deleteVoice,
      updateVoice,
      getVoice,
      updateSpeaker,
      registerSpeaker,
      removeSpeaker,
      clearRegistry,
      findSpeakerByVoiceprint
    }}>
      {children}
    </VoiceContext.Provider>
  );
};

export const useVoices = () => {
  const context = useContext(VoiceContext);
  if (!context) throw new Error("useVoices must be used within VoiceProvider");
  return context;
};
