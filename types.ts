
export enum Page {
  // Voice Module Sub-pages
  HOME = 'HOME',
  PRESET = 'PRESET',
  CUSTOM = 'CUSTOM',
  ASR = 'ASR',
  TTS = 'TTS',
  VOICE_CLONING = 'VOICE_CLONING',
  VOICEPRINT = 'VOICEPRINT', // 重命名：声纹识别
  LIVE_CHAT = 'LIVE_CHAT', // Added Live Chat
  
  // Prompt Module
  PROMPT_DISCOVER = 'PROMPT_DISCOVER',
  PROMPT_FAVORITES = 'PROMPT_FAVORITES',
  PROMPT_MINE = 'PROMPT_MINE',
  PROMPT_CREATE = 'PROMPT_CREATE',
}

export enum AppModule {
  DIGITAL_HUMAN = 'DIGITAL_HUMAN',
  AI_VOICE = 'AI_VOICE',
  PROMPT_LIBRARY = 'PROMPT_LIBRARY',
  // Digital Human Sub-modules
  DH_AUDIO = '2d-audio',
  DH_CHAT = '2d-chat',
  DH_AVATAR = '2d-avatar',
  DH_3D = '3d-avatar'
}

export type PromptView = 'HOME';

export interface Voice {
  id: string;
  name: string;
  gender: 'Male' | 'Female';
  language: 'Chinese' | 'English';
  tags: string[];
  notes?: string; // Added for custom voices
  category: 'Social Media' | 'Character' | 'Narrator' | 'News';
  previewUrl?: string;
  avatarUrl: string;
  isCustom?: boolean;
  isFavorite?: boolean;
  isPublic?: boolean;
  flag?: string; 
  description?: string; 
  source?: 'preset' | 'community' | 'custom'; 
}

export interface SpeakerIdentity {
  id: string;
  name: string;
  color: string;
  isKnown: boolean;
  avatarSeed: string;
  source?: 'cloned' | 'detected';
}

export interface SpeakerSegment {
  id: string;
  speakerId: string;
  text: string;
  timestamp?: number;
  startTime?: number;
  endTime?: number;
  confidence?: number;
}

export interface TranscriptionRecord {
  id: string;
  timestamp: number;
  text: string;
  duration: number;
}

export interface CloneProject {
  id: string;
  name: string;
  description: string;
  isPublic: boolean;
  status: 'draft' | 'processing' | 'completed';
  file?: File;
  createdAt: number;
  avatarUrl?: string;
}

export interface PromptItem {
  id: string;
  title: string;
  category: string;
  tags: string[];
  description: string;
  negativePrompt?: string; 
  usageCount: string;
  isFavorite: boolean;
  author: string; 
  isPublic: boolean;
  createdAt: number;
  votes?: number;
  imageUrl?: string;
  model?: string; 
  brand?: string; 
  version?: string; 
  notes?: string; 
}