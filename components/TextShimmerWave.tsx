
import React from 'react';
import { motion, Transition } from 'framer-motion';

type TextShimmerWaveProps = {
  // Modified type to allow flexible children for JSX compatibility
  children: any;
  as?: React.ElementType;
  className?: string;
  duration?: number;
  zDistance?: number;
  xDistance?: number;
  yDistance?: number;
  spread?: number;
  scaleDistance?: number;
  rotateYDistance?: number;
  transition?: Transition;
};

export function TextShimmerWave({
  children,
  as: Component = 'p',
  className = '',
  duration = 1.5,
  zDistance = 8,
  xDistance = 1,
  yDistance = -1,
  spread = 1.2,
  scaleDistance = 1.05,
  rotateYDistance = 5,
  transition,
}: TextShimmerWaveProps) {
  const MotionComponent = motion(Component as any);
  
  // Ensure we have a string for the split operation
  const content = typeof children === 'string' ? children : (children?.toString() || '');

  return (
    <MotionComponent
      className={`relative inline-block [perspective:500px] [--base-color:rgba(255,255,255,0.4)] [--base-gradient-color:#ffffff] ${className}`}
      style={{ color: 'var(--base-color)' }}
    >
      {content.split('').map((char, i) => {
        const delay = (i * duration * (1 / spread)) / content.length;

        return (
          <motion.span
            key={i}
            className="inline-block whitespace-pre [transform-style:preserve-3d]"
            initial={{
              translateZ: 0,
              scale: 1,
              rotateY: 0,
              color: 'var(--base-color)',
            }}
            animate={{
              translateZ: [0, zDistance, 0],
              translateX: [0, xDistance, 0],
              translateY: [0, yDistance, 0],
              scale: [1, scaleDistance, 1],
              rotateY: [0, rotateYDistance, 0],
              color: [
                'var(--base-color)',
                'var(--base-gradient-color)',
                'var(--base-color)',
              ],
            }}
            transition={{
              duration: duration,
              repeat: Infinity,
              repeatDelay: (content.length * 0.05) / spread,
              delay,
              ease: 'easeInOut',
              ...transition,
            }}
          >
            {char}
          </motion.span>
        );
      })}
    </MotionComponent>
  );
}
