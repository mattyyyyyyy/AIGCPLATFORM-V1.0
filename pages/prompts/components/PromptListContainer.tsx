
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Copy, X, Cpu, Info, CheckCircle, ArrowUp, Zap, Image as ImageIcon, Code, Mic, Compass, ShieldAlert } from 'lucide-react';
import { PromptItem } from '../../../types';
import { useLanguage } from '../../../contexts/LanguageContext';

// --- Extensive Mock Data ---
const ALL_PROMPTS: PromptItem[] = [
  {
    id: 'p1', title: '赛博朋克霓虹都市', category: '图片', tags: ['写实', '设计', '二次元'], 
    description: "Cinematic shot, futuristic cyberpunk city at night, neon lights reflecting on wet pavement, hyper-realistic, 8k resolution, Unreal Engine 5 render style.",
    negativePrompt: "blur, low quality, distorted, extra limbs, ugly, text, watermark, bad anatomy",
    usageCount: '12K', isFavorite: false, author: 'DesignAI', isPublic: true, createdAt: Date.now(),
    imageUrl: 'https://images.unsplash.com/photo-1605142859862-978be7eba909?auto=format&fit=crop&q=80&w=800',
    model: 'MIDJOURNEY V6',
  },
  {
    id: 'p2', title: '学术研究与验证助手', category: '大模型', brand: 'GEMINI', version: 'GEMINI3', tags: ['学术', '论文'],
    description: "你是一名严谨的学术助手，负责验证论文真实性，检查引用来源是否可靠，并提供逻辑严密的批判性分析...",
    usageCount: '87K', isFavorite: false, author: 'Academic', isPublic: true, createdAt: Date.now(),
    model: 'GEMINI 3 PRO',
  },
  {
    id: 'p3', title: 'Python 性能优化专家', category: '编程', brand: 'GPT', version: 'GPT-4o', tags: ['Python', '职场'],
    description: "请分析这段 Python 代码的内存瓶颈，并提供符合 PEP8 规范的重构方案，重点关注多线程并发性能...",
    usageCount: '45K', isFavorite: false, author: 'Coder', isPublic: true, createdAt: Date.now(),
    model: 'GPT-4o',
  },
  {
    id: 'p4', title: '情感化语音对白设计', category: '语音', tags: ['创意', '写作'],
    description: "为一个带有忧郁色彩的 AI 角色编写一段关于‘记忆碎片’的对白，要求语气平缓但富有感染力...",
    usageCount: '15K', isFavorite: false, author: 'VoiceArt', isPublic: true, createdAt: Date.now(),
    model: 'Gemini 2.5 TTS',
  },
  {
    id: 'p5', title: 'React 架构重构指南', category: '编程', tags: ['React', '提示词工程'],
    description: "如何将现有的类组件架构平滑迁移至 Functional Components + Hooks，并实现高效的 Context 状态管理...",
    usageCount: '21K', isFavorite: false, author: 'WebDev', isPublic: true, createdAt: Date.now(),
    model: 'GPT-4',
  },
  {
    id: 'p6', title: '中式水墨山水画', category: '图片', tags: ['写实', '创意', '设计'],
    description: "Traditional Chinese ink wash painting, ethereal mountains in mist, a lonely boat on the lake, minimalist brushwork.",
    negativePrompt: "colors, photography, 3d, vibrant, realistic, modern, saturation",
    usageCount: '19K', isFavorite: false, author: 'ArtStudio', isPublic: true, createdAt: Date.now(),
    imageUrl: 'https://images.unsplash.com/photo-1518156677180-95a2893f3e9f?auto=format&fit=crop&q=80&w=800',
    model: 'STABLE DIFFUSION XL',
  },
  {
    id: 'p7', title: '二次元风格人物生成', category: '图片', tags: ['二次元', '设计'],
    description: "Anime style character design, high detail, vibrant colors, expressive eyes, digital art, trending on Pixiv.",
    negativePrompt: "realistic, photo, 3d render, deformed, sketch, lowres, text, messy",
    usageCount: '34K', isFavorite: false, author: 'MangaArtist', isPublic: true, createdAt: Date.now(),
    imageUrl: 'https://images.unsplash.com/photo-1578632738980-43318b5c9440?auto=format&fit=crop&q=80&w=800',
    model: 'NIJIJOURNEY V6',
  },
  {
    id: 'p8', title: '营销文案专家', category: '大模型', brand: 'CLAUDE', version: 'CLAUDE 3.5', tags: ['营销', '写作', '职场'],
    description: "针对一款高端智能耳机编写一系列社交媒体推文，强调其降噪效果 and 人体工学设计，采用极简主义文风...",
    usageCount: '55K', isFavorite: false, author: 'Copywriter', isPublic: true, createdAt: Date.now(),
    model: 'CLAUDE 3.5 SONNET',
  },
  {
    id: 'p9', title: '法律文书校对系统', category: '大模型', brand: 'GPT', version: 'GPT-4o', tags: ['法律', '职场'],
    description: "审查以下商业合同草案，识别潜在的合规风险，并建议更具保障性的条款措辞...",
    usageCount: '12K', isFavorite: false, author: 'LegalAI', isPublic: true, createdAt: Date.now(),
    model: 'GPT-4o',
  },
  {
    id: 'p10', title: '创意短视频剧本', category: '语音', tags: ['创意', '写作', '营销'],
    description: "编写一个 15 秒的短视频剧本，场景设置在雨中的咖啡馆，旁白需要带有淡淡的怀旧感...",
    usageCount: '9K', isFavorite: false, author: 'VideoGen', isPublic: true, createdAt: Date.now(),
    model: 'Gemini 3 Flash',
  },
  {
    id: 'p11', title: '写实派景观摄影', category: '图片', tags: ['写实', '设计', '职场'],
    description: "National Geographic style photography, grand canyon at sunset, dramatic lighting, sharp focus, 8k.",
    negativePrompt: "cgi, cartoon, drawing, blurred, low contrast, oversaturated, humanoids",
    usageCount: '28K', isFavorite: false, author: 'NatureCam', isPublic: true, createdAt: Date.now(),
    imageUrl: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&q=80&w=800',
    model: 'MIDJOURNEY V6',
  },
  {
    id: 'p12', title: '超现实主义时装设计', category: '图片', tags: ['设计', '创意', '写实'],
    description: "High-end avant-garde fashion photography, model wearing a gown made of flowing liquid chrome and iridescent glass feathers, set in a minimalist white marble hall, volumetric lighting, unreal engine 5 style.",
    usageCount: '8K', isFavorite: false, author: 'FashionAI', isPublic: true, createdAt: Date.now(),
    imageUrl: 'https://images.unsplash.com/photo-1539109132382-381bb3f1c2b3?auto=format&fit=crop&q=80&w=800',
    model: 'MIDJOURNEY V6',
  },
  {
    id: 'p13', title: '跨语言翻译校对官', category: '大模型', brand: 'GEMINI', version: 'GEMINI3', tags: ['翻译', '职场'],
    description: "作为一名资深的跨语言翻译专家，请对比这段中文原文与其对应的英文译文。指出其中的文化差异处理是否妥当，并提供更符合母语习惯的修改建议。",
    usageCount: '32K', isFavorite: false, author: 'Linguist', isPublic: true, createdAt: Date.now(),
    model: 'GEMINI 3 PRO',
  },
  {
    id: 'p14', title: '极简旅行攻略制定', category: '大模型', tags: ['创意', '营销'],
    description: "为我制定一份为期 3 天的京都深度漫游计划。避开人潮拥挤的热门景点，侧重于小众的寺庙、匠人作坊 and 隐秘的深夜食堂。",
    usageCount: '41K', isFavorite: false, author: 'Traveler', isPublic: true, createdAt: Date.now(),
    model: 'GPT-4o',
  },
  {
    id: 'p15', title: '社交媒体爆款标题', category: '大模型', tags: ['营销', '创意', '职场'],
    description: "根据以下产品亮点，生成 10 个具有高度吸引力的社交媒体标题。要求能够引起用户共鸣，并带有适当的 emoji，适合发布在小红书或 Instagram。",
    usageCount: '62K', isFavorite: false, author: 'ViralMarketer', isPublic: true, createdAt: Date.now(),
    model: 'CLAUDE 3.5 SONNET',
  }
];

interface PromptListContainerProps {
  searchQuery?: string;
  filters?: { categories: string[]; brand?: string; version?: string; tags: string[]; logic: 'AND' | 'OR' };
  type?: 'all' | 'favorites' | 'mine';
  emptyText?: string;
}

const Tag: React.FC<{ children: React.ReactNode; variant?: 'default' | 'outline' | 'accent'; className?: string }> = ({ children, variant = 'outline', className = '' }) => {
  const variants = {
    default: "bg-white/5 border-white/10 text-white/50",
    outline: "bg-transparent border-white/10 text-white/40 hover:border-white/20 hover:text-white/60",
    accent: "bg-spark-amber/10 border-spark-amber/30 text-spark-amber"
  };
  
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[9px] font-bold transition-all duration-200 ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

const PromptListContainer: React.FC<PromptListContainerProps> = ({ 
  searchQuery = '', 
  filters,
  type = 'all',
  emptyText
}) => {
  const { t } = useLanguage();
  const [selectedPrompt, setSelectedPrompt] = useState<PromptItem | null>(null);
  const [showCopyToast, setShowCopyToast] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const currentFilters = useMemo(() => filters || { 
    categories: [] as string[], 
    brand: undefined, 
    version: undefined, 
    tags: [] as string[], 
    logic: 'AND' as const 
  }, [filters]);

  useEffect(() => {
    if (showCopyToast) {
      const timer = setTimeout(() => setShowCopyToast(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [showCopyToast]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setShowBackToTop(e.currentTarget.scrollTop > 400);
  };

  const scrollToTop = () => {
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setShowCopyToast(true);
  };

  const filteredData = useMemo(() => {
    const { categories, brand, version, tags, logic } = currentFilters;
    
    return ALL_PROMPTS.filter(p => {
      if (type === 'favorites' && !p.isFavorite) return false;
      if (type === 'mine' && p.author !== 'Me') return false; 

      const matchSearch = !searchQuery || 
                          p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.description.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchSearch) return false;

      const conditions = [];

      if (categories.length > 0) {
        conditions.push(categories.includes(p.category));
      }

      if (brand) {
        conditions.push(p.brand === brand);
      }

      if (version) {
        conditions.push(p.version === version);
      }

      if (tags.length > 0) {
        if (logic === 'AND') {
          conditions.push(tags.every(t => p.tags.includes(t)));
        } else {
          conditions.push(tags.some(t => p.tags.includes(t)));
        }
      }

      if (conditions.length === 0) return true;

      if (logic === 'AND') {
        return conditions.every(c => c === true);
      } else {
        return conditions.some(c => c === true);
      }
    });
  }, [searchQuery, currentFilters, type]);

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case '图片': return <ImageIcon size={10} />;
      case '编程': return <Code size={10} />;
      case '语音': return <Mic size={10} />;
      default: return <Cpu size={10} />;
    }
  };

  return (
    <div className="h-full flex flex-col relative">
      <div 
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-24 scroll-smooth"
      >
        {filteredData.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {filteredData.map((item, index) => (
              <div 
                key={item.id}
                onClick={() => setSelectedPrompt(item)}
                style={{ animationDelay: `${index * 50}ms` }}
                className="group bg-[#0f0f11] border border-white/5 hover:border-spark-amber/40 rounded-xl p-6 transition-all duration-500 hover:bg-[#161618] hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col h-[420px] cursor-pointer relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-spark-amber/5 blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity" />
                <h3 className="text-xl font-medium text-white group-hover:text-spark-amber truncate transition-colors leading-tight mb-4 relative z-10">{item.title}</h3>
                <div className="flex-1 relative overflow-hidden rounded-lg bg-black/40 border border-white/5 mb-4 group-hover:border-white/10 transition-all duration-500">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt={item.title} />
                  ) : (
                    <div className="p-6 h-full flex flex-col">
                      <p className="text-sm text-white/40 leading-relaxed line-clamp-6 font-light italic">"{item.description}"</p>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f11] via-transparent to-transparent opacity-60 group-hover:opacity-20 transition-opacity" />
                </div>
                
                {/* Tags Section */}
                <div className="flex flex-wrap gap-2 mb-4 relative z-10 overflow-hidden max-h-[22px]">
                   {item.tags.slice(0, 3).map(tag => (
                     <Tag key={tag}>#{tag}</Tag>
                   ))}
                   {item.tags.length > 3 && <span className="text-[9px] font-medium text-white/20">+ {item.tags.length - 3}</span>}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/5 shrink-0 relative z-10">
                  <div className="flex items-center gap-2 max-w-full">
                    {item.model && (
                      <Tag variant="accent" className="uppercase tracking-widest truncate max-w-[120px]">{item.model}</Tag>
                    )}
                    <Tag className="gap-1.5 whitespace-nowrap">
                       {getCategoryIcon(item.category)}
                       {item.category}
                    </Tag>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-80 text-white/10 animate-in fade-in zoom-in-95">
            <Compass size={64} className="mb-6 opacity-10" />
            <p className="text-xl font-medium tracking-widest uppercase">{emptyText || '未发现匹配项'}</p>
            <p className="text-xs text-white/20 mt-2">请尝试调整筛选原则或重置搜索条件</p>
          </div>
        )}
      </div>

      {showBackToTop && (
        <button onClick={scrollToTop} className="fixed bottom-12 right-12 z-[100] p-4 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 text-white shadow-2xl hover:bg-spark-amber hover:border-spark-amber hover:scale-110 transition-all duration-500 group animate-in slide-in-from-bottom-10">
          <ArrowUp size={24} className="relative z-10 group-hover:-translate-y-1 transition-transform" />
        </button>
      )}

      {showCopyToast && createPortal(
        <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[10000] animate-in slide-in-from-bottom-5 duration-300">
          <div className="px-8 py-3 rounded-full bg-white text-black font-medium text-sm flex items-center gap-3 shadow-2xl">
            <CheckCircle size={18} className="text-green-500"/> 已复制 Prompt
          </div>
        </div>, document.body
      )}

      {selectedPrompt && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-md animate-in fade-in duration-300">
          <div className="absolute inset-0" onClick={() => setSelectedPrompt(null)}></div>
          <div className={`relative w-full ${selectedPrompt.imageUrl ? 'max-w-6xl' : 'max-w-4xl'} max-h-[90vh] bg-black/20 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300`}>
            
            {/* Header: Added Glow Effect */}
            <div className="px-10 py-5 border-b border-white/5 flex justify-between items-center bg-white/[0.02] shrink-0 shadow-[0_4px_30px_rgba(255,255,255,0.05)] relative z-20">
              <div className="flex flex-col gap-1.5">
                 <h2 className="text-3xl font-bold text-white leading-tight">{selectedPrompt.title}</h2>
                 <div className="flex gap-4">
                    <Tag variant="accent" className="uppercase tracking-[0.2em] px-3">{selectedPrompt.category}</Tag>
                    <span className="text-[11px] font-medium uppercase text-white/30 tracking-[0.25em] self-center">• {selectedPrompt.model || '通用模型'}</span>
                 </div>
              </div>
              <button onClick={() => setSelectedPrompt(null)} className="text-white/20 hover:text-white p-3 hover:bg-white/5 rounded-xl transition-all"><X size={28}/></button>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar p-10 pt-6">
              <div className={`grid grid-cols-1 ${selectedPrompt.imageUrl ? 'lg:grid-cols-2' : ''} gap-8`}>
                {selectedPrompt.imageUrl && (
                  <div className="space-y-6">
                    <div className="rounded-2xl overflow-hidden border border-white/10 bg-black/40 shadow-2xl">
                      <img src={selectedPrompt.imageUrl} className="w-full h-auto" alt="preview" />
                    </div>
                    <div className="flex flex-wrap gap-2.5">
                       {selectedPrompt.tags.map(tag => (
                         <Tag key={tag} className="px-4 py-2 text-[11px] font-bold">#{tag}</Tag>
                       ))}
                    </div>
                  </div>
                )}
                
                {/* Content: Increased titles, reduced spacing */}
                <div className="space-y-6 flex flex-col"> 
                    <div className="space-y-4">
                      {/* Positive Prompt */}
                      <div className="space-y-2.5">
                        <div className="flex justify-between items-center px-1">
                          <div className="flex items-center gap-2.5">
                             <Zap size={18} className="text-spark-amber" />
                             <span className="text-lg font-black text-white/50 uppercase tracking-[0.2em]">
                               {selectedPrompt.category === '图片' ? '正向提示词' : 'Prompt 内容'}
                             </span>
                          </div>
                          <button 
                            onClick={() => handleCopy(selectedPrompt.description)} 
                            className="flex items-center gap-2.5 px-6 py-1.5 rounded-lg bg-gradient-to-r from-pink-500 to-yellow-500 text-white text-xs font-black uppercase tracking-widest hover:shadow-[0_0_20px_rgba(236,72,153,0.3)] active:scale-95 transition-all"
                          >
                            <Copy size={14} /> 复制
                          </button>
                        </div>
                        <div className="bg-[#0a0a0c] border border-white/5 rounded-2xl p-6 text-base text-white/90 leading-relaxed font-mono whitespace-pre-wrap shadow-inner border-l-2 border-l-spark-amber/30">
                          {selectedPrompt.description}
                        </div>
                      </div>

                      {/* Negative Prompt */}
                      {selectedPrompt.category === '图片' && selectedPrompt.negativePrompt && (
                        <div className="space-y-2.5 animate-in slide-in-from-bottom-2">
                          <div className="flex justify-between items-center px-1">
                            <div className="flex items-center gap-2.5">
                               <ShieldAlert size={18} className="text-orange-500" />
                               <span className="text-lg font-black text-white/50 uppercase tracking-[0.2em]">反向提示词</span>
                            </div>
                            <button 
                               onClick={() => handleCopy(selectedPrompt.negativePrompt || '')} 
                               className="flex items-center gap-2.5 px-6 py-1.5 rounded-lg bg-gradient-to-r from-pink-500 to-yellow-500 text-white text-xs font-black uppercase tracking-widest hover:shadow-[0_0_20px_rgba(236,72,153,0.3)] active:scale-95 transition-all"
                            >
                               <Copy size={14}/> 复制
                            </button>
                          </div>
                          <div className="bg-[#0a0a0c] border border-white/5 rounded-2xl p-6 text-base text-white/40 leading-relaxed font-mono whitespace-pre-wrap shadow-inner italic border-l-2 border-l-orange-500/30">
                            {selectedPrompt.negativePrompt}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Model Info */}
                    <div className="bg-white/[0.02] p-6 rounded-2xl border border-white/5 mt-auto">
                      <span className="text-lg font-black text-white/30 uppercase tracking-[0.2em] flex items-center gap-2.5 mb-3">
                        <Cpu size={20}/> 推荐模型
                      </span>
                      <p className="text-xl font-bold text-white tracking-tight">{selectedPrompt.model || '通用'}</p>
                    </div>
                </div>
              </div>
            </div>
          </div>
        </div>, document.body
      )}
    </div>
  );
};

export default PromptListContainer;
