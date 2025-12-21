
import { Voice, Page } from './types';

// Category mapping for translation
export const CATEGORY_MAP: Record<string, string> = {
  'Social Media': '社交媒体',
  'Character': '角色演绎',
  'Narrator': '旁白解说',
  'News': '新闻播报',
};

// Helper to translate voice categories
export const translateCategory = (category: string) => CATEGORY_MAP[category] || category;

const DEMO_AUDIO = 'https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3';

// Mock data for preset voices
export const MOCK_VOICES: Voice[] = [
  {
    id: 'v1',
    name: 'Kore',
    gender: 'Male',
    language: 'English',
    tags: ['Friendly', 'Warm'],
    category: 'Social Media',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kore',
    previewUrl: DEMO_AUDIO,
    source: 'preset'
  },
  {
    id: 'v2',
    name: 'Puck',
    gender: 'Male',
    language: 'English',
    tags: ['Energetic', 'Young'],
    category: 'Character',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Puck',
    previewUrl: DEMO_AUDIO,
    source: 'preset'
  },
  {
    id: 'v3',
    name: '李梅',
    gender: 'Female',
    language: 'Chinese',
    tags: ['温柔', '专业'],
    category: 'Narrator',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=LiMei',
    previewUrl: DEMO_AUDIO,
    source: 'preset'
  },
  {
    id: 'v4',
    name: 'Zephyr',
    gender: 'Male',
    language: 'English',
    tags: ['Calm', 'Deep'],
    category: 'Narrator',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Zephyr',
    previewUrl: DEMO_AUDIO,
    source: 'preset'
  },
  {
    id: 'v5',
    name: 'Aoede',
    gender: 'Female',
    language: 'English',
    tags: ['Melodic', 'Storyteller'],
    category: 'Social Media',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aoede',
    previewUrl: DEMO_AUDIO,
    source: 'preset'
  },
  {
    id: 'v6',
    name: '王伟',
    gender: 'Male',
    language: 'Chinese',
    tags: ['稳重', '大气'],
    category: 'News',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=WangWei',
    previewUrl: DEMO_AUDIO,
    source: 'preset'
  },
  {
    id: 'v7',
    name: '小雨',
    gender: 'Female',
    language: 'Chinese',
    tags: ['活泼', '亲切'],
    category: 'Social Media',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=XiaoYu',
    previewUrl: DEMO_AUDIO,
    source: 'preset'
  },
  {
    id: 'v8',
    name: 'Charon',
    gender: 'Male',
    language: 'English',
    tags: ['Mysterious', 'Gravelly'],
    category: 'Character',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Charon',
    previewUrl: DEMO_AUDIO,
    source: 'preset'
  },
  {
    id: 'v9',
    name: '萌萌',
    gender: 'Female',
    language: 'Chinese',
    tags: ['可爱', '萝莉'],
    category: 'Character',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=MengMeng',
    previewUrl: DEMO_AUDIO,
    source: 'preset'
  },
  {
    id: 'v10',
    name: 'Fenrir',
    gender: 'Male',
    language: 'English',
    tags: ['Powerful', 'Authoritative'],
    category: 'News',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Fenrir',
    previewUrl: DEMO_AUDIO,
    source: 'preset'
  },
  {
    id: 'v11',
    name: '雅静',
    gender: 'Female',
    language: 'Chinese',
    tags: ['知性', '优雅'],
    category: 'News',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=YaJing',
    previewUrl: DEMO_AUDIO,
    source: 'preset'
  },
  {
    id: 'v12',
    name: '老陈',
    gender: 'Male',
    language: 'Chinese',
    tags: ['沧桑', '讲故事'],
    category: 'Narrator',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=LaoChen',
    previewUrl: DEMO_AUDIO,
    source: 'preset'
  },
  {
    id: 'v13',
    name: 'Sofia',
    gender: 'Female',
    language: 'English',
    tags: ['Sophisticated', 'Clear'],
    category: 'News',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sofia',
    previewUrl: DEMO_AUDIO,
    source: 'preset'
  },
  {
    id: 'v14',
    name: '志明',
    gender: 'Male',
    language: 'Chinese',
    tags: ['阳光', '少年'],
    category: 'Social Media',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ZhiMing',
    previewUrl: DEMO_AUDIO,
    source: 'preset'
  },
  {
    id: 'v15',
    name: 'Lily',
    gender: 'Female',
    language: 'English',
    tags: ['Cheerful', 'Bright'],
    category: 'Social Media',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lily',
    previewUrl: DEMO_AUDIO,
    source: 'preset'
  },
  {
    id: 'v16',
    name: '大勇',
    gender: 'Male',
    language: 'Chinese',
    tags: ['豪放', '粗犷'],
    category: 'Character',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=DaYong',
    previewUrl: DEMO_AUDIO,
    source: 'preset'
  },
  {
    id: 'v17',
    name: 'Scott',
    gender: 'Male',
    language: 'English',
    tags: ['Professional', 'Trustworthy'],
    category: 'News',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Scott',
    previewUrl: DEMO_AUDIO,
    source: 'preset'
  },
  {
    id: 'v18',
    name: '晓晓',
    gender: 'Female',
    language: 'Chinese',
    tags: ['甜美', '少女'],
    category: 'Narrator',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=XiaoXiao',
    previewUrl: DEMO_AUDIO,
    source: 'preset'
  },
  {
    id: 'v19',
    name: 'Arthur',
    gender: 'Male',
    language: 'English',
    tags: ['British', 'Refined'],
    category: 'Narrator',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Arthur',
    previewUrl: DEMO_AUDIO,
    source: 'preset'
  },
  {
    id: 'v20',
    name: '春华',
    gender: 'Female',
    language: 'Chinese',
    tags: ['端庄', '播音腔'],
    category: 'News',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ChunHua',
    previewUrl: DEMO_AUDIO,
    source: 'preset'
  }
];

export const NAV_GROUPS = [
  {
    title: '主菜单',
    id: 'main_menu',
    items: [
      { id: Page.HOME, label: '首页', icon: 'Home' },
    ]
  },
  {
    title: '声音库',
    id: 'library',
    items: [
      { id: Page.PRESET, label: '预设声音', icon: 'Library' },
      { id: Page.CUSTOM, label: '自定义声音', icon: 'User' },
    ]
  },
  {
    title: '核心能力',
    id: 'capabilities',
    items: [
      { id: Page.ASR, label: '语音识别', icon: 'Mic' },
      { id: Page.TTS, label: '语音合成', icon: 'Speaker' },
      { id: Page.VOICE_CLONING, label: '声音克隆', icon: 'Copy' },
      { id: Page.VOICEPRINT, label: '声纹识别', icon: 'Users' }, 
    ]
  }
];

// Mock texts for voice cloning recording
export const RANDOM_READING_TEXTS = [
  "人工智能正在深刻地改变着我们的生活方式 and 工作模式。",
  "在这片广袤的土地上，孕育了无数灿烂的文化和悠久的历史。",
  "科技的进步不仅带来了便利，也为艺术创作开辟了全新的边界。",
  "我们要不断探索未知的领域，追求真理和智慧，共同创造美好的未来。"
];
