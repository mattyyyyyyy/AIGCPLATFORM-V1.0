import React from 'react';

/**
 * DigitalHumanPage - 现在作为一个内嵌容器，
 * 承载外部数字人系统的完整体验，同时保留主站的导航控制。
 */
export default function DigitalHumanPage() {
  return (
    <div className="w-full h-full bg-black flex flex-col overflow-hidden animate-in fade-in duration-700">
      {/* 使用 Iframe 嵌入指定的外部链接 */}
      <iframe 
        src="https://newshuziren.vercel.app/" 
        title="Digital Human Module"
        className="w-full h-full border-none"
        allow="camera; microphone; display-capture; autoplay; clipboard-write"
        // 允许 Iframe 内部进行全屏操作
        allowFullScreen
      />
      
      {/* 底部装饰性遮罩（可选），确保内容与底部背景平滑融合 */}
      <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-black to-transparent pointer-events-none z-20" />
    </div>
  );
}