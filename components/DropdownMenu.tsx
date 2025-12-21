
import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

export type DropdownOption = {
  label: string;
  onClick: () => void;
  Icon?: React.ReactNode;
  active?: boolean;
};

type DropdownMenuProps = {
  options: DropdownOption[];
  children: React.ReactNode;
  className?: string;
  menuClassName?: string;
};

const DropdownMenu: React.FC<DropdownMenuProps> = ({ options, children, className = "", menuClassName = "" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-3 px-4 py-2.5 bg-[#11111198] hover:bg-[#111111d1] text-white/80 hover:text-white transition-all shadow-[0_0_20px_rgba(0,0,0,0.2)] border border-white/10 rounded-xl backdrop-blur-sm text-sm font-bold group"
      >
        <div className="flex-1 text-left truncate pointer-events-none">
          {children}
        </div>
        <motion.span
          className="shrink-0 text-white/20 group-hover:text-white/60 transition-colors"
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.4, ease: "easeInOut", type: "spring" }}
        >
          <ChevronDown className="h-4 w-4" />
        </motion.span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ y: -5, scale: 0.98, filter: "blur(10px)", opacity: 0 }}
            animate={{ y: 0, scale: 1, filter: "blur(0px)", opacity: 1 }}
            exit={{ y: -5, scale: 0.98, opacity: 0, filter: "blur(10px)" }}
            transition={{ duration: 0.3, ease: "circOut" }}
            className={`absolute z-[100] w-full min-w-[12rem] mt-2 p-1 bg-[#111111e6] border border-white/10 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.4)] backdrop-blur-md flex flex-col gap-1 ${menuClassName}`}
          >
            {options && options.length > 0 ? (
              options.map((option, index) => (
                <motion.button
                  key={`${option.label}-${index}`}
                  initial={{
                    opacity: 0,
                    x: -5,
                    filter: "blur(5px)",
                  }}
                  animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                  transition={{
                    duration: 0.2,
                    delay: index * 0.03,
                    ease: "easeOut",
                  }}
                  whileHover={{
                    backgroundColor: "rgba(255, 255, 255, 0.05)",
                  }}
                  whileTap={{
                    scale: 0.98,
                  }}
                  onClick={() => {
                    option.onClick();
                    setIsOpen(false);
                  }}
                  className={`px-3 py-2.5 cursor-pointer text-[13px] rounded-lg w-full text-left flex items-center gap-x-2 transition-colors ${
                    option.active ? "text-spark-accent bg-white/5 font-bold" : "text-white/60 hover:text-white"
                  }`}
                >
                  {option.Icon && <span className="shrink-0">{option.Icon}</span>}
                  <span className="truncate">{option.label}</span>
                </motion.button>
              ))
            ) : (
              <div className="px-4 py-3 text-white/30 text-[11px] italic text-center">No options available</div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DropdownMenu;
