
import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
  onClick?: () => void;
}

const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', hoverEffect = false, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className={`
        glass-panel rounded-2xl p-6 transition-all duration-300
        ${hoverEffect ? 'hover:bg-white/[0.05] hover:border-white/20 hover:shadow-2xl cursor-pointer translate-y-0 hover:-translate-y-1' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
};

export default GlassCard;
