
import React, { ReactNode } from "react";

interface AuroraBackgroundProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  variant?: 'blue' | 'orange';
  className?: string;
}

export const AuroraBackground = ({
  className = "",
  children,
  variant = 'blue',
  ...props
}: AuroraBackgroundProps) => {
  // Voice Mode: Blue/Gray - Widened intervals for cleaner look (10% steps)
  const blueAurora = `repeating-linear-gradient(100deg, #172554 10%, #334155 20%, #1e3a8a 30%, #475569 40%, #1e40af 50%)`;
  
  // Prompt Mode: Orange/Pink - Widened intervals for cleaner look (10% steps)
  const orangeAurora = `repeating-linear-gradient(100deg, #450a0a 10%, #7c2d12 20%, #831843 30%, #701a75 40%, #9a3412 50%)`;

  const activeAurora = variant === 'orange' ? orangeAurora : blueAurora;

  return (
    <div
      className={`relative flex flex-col min-h-screen w-full bg-[#020204] text-white transition-colors duration-1000 ${className}`}
      {...props}
    >
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div
          className={`
            absolute -inset-[10px] opacity-40 will-change-transform
            [--white-gradient:repeating-linear-gradient(100deg,var(--white)_0%,var(--white)_15%,var(--transparent)_20%,var(--transparent)_25%,var(--white)_35%)]
            [--dark-gradient:repeating-linear-gradient(100deg,var(--black)_0%,var(--black)_15%,var(--transparent)_20%,var(--transparent)_25%,var(--black)_35%)]
            [background-image:var(--white-gradient),var(--aurora)]
            dark:[background-image:var(--dark-gradient),var(--aurora)]
            [background-size:300%,_200%]
            [background-position:50%_50%,50%_50%]
            filter blur-[20px] invert dark:invert-0
            after:content-[""] after:absolute after:inset-0 after:[background-image:var(--white-gradient),var(--aurora)] 
            after:dark:[background-image:var(--dark-gradient),var(--aurora)]
            after:[background-size:200%,_100%] 
            after:animate-aurora after:[background-attachment:fixed] after:mix-blend-difference
            transition-[background-image] duration-1000 ease-in-out
          `}
          style={{
            // @ts-ignore
            "--aurora": activeAurora,
            "--white": "#ffffff",
            "--black": "#000000",
            "--transparent": "transparent",
          } as React.CSSProperties}
        ></div>
        {/* Radial mask overlay for depth and focus */}
        <div className="absolute inset-0 [mask-image:radial-gradient(ellipse_at_100%_0%,black_20%,transparent_80%)] pointer-events-none"></div>
      </div>
      <div className="relative z-10 w-full h-full flex flex-col flex-1">
         {children}
      </div>
    </div>
  );
};
