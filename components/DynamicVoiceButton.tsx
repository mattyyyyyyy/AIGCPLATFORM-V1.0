
import React from "react"
import { Mic } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"

function cn(...classes: (string | undefined | boolean | null)[]) {
  return classes.filter(Boolean).join(' ');
}

interface DynamicVoiceButtonProps {
  onStart?: () => void
  onStop?: () => void
  isRecording?: boolean
  className?: string
  startText?: string
  stopText?: string
}

export function DynamicVoiceButton({
  className,
  onStart,
  onStop,
  isRecording = false,
  startText = "开始识别",
}: DynamicVoiceButtonProps) {
  const [time, setTime] = React.useState<number>(0)

  React.useEffect(() => {
    let intervalId: any

    if (isRecording) {
      intervalId = setInterval(() => {
        setTime((t) => t + 1)
      }, 1000)
    } else {
      setTime(0)
    }

    return () => clearInterval(intervalId)
  }, [isRecording])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const handleClick = () => {
    if (isRecording) {
      onStop?.();
    } else {
      onStart?.();
    }
  }

  return (
    <div className={cn("flex flex-col items-center justify-center", className)}>
      <motion.button
        className={cn(
          "relative flex items-center justify-center rounded-full cursor-pointer overflow-hidden border whitespace-nowrap",
          isRecording 
            ? "p-2 border-spark-accent/30 bg-spark-accent/10" 
            : "h-10 px-8 bg-gradient-to-tr from-blue-600 to-cyan-500 border-transparent shadow-xl hover:shadow-blue-500/20"
        )}
        layout
        transition={{
          layout: { duration: 0.3, type: "spring", stiffness: 300, damping: 25 }
        }}
        onClick={handleClick}
      >
        <motion.div 
          className="flex items-center justify-center shrink-0 z-10"
          layout="position"
        >
          {isRecording ? (
            <div className="h-6 w-6 flex items-center justify-center">
              <motion.div
                className="w-3 h-3 bg-spark-accent rounded-sm"
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />
            </div>
          ) : (
            <div className="flex items-center gap-2.5 text-white">
               <Mic size={14} fill="currentColor" />
               <motion.span 
                 initial={{ opacity: 0 }} 
                 animate={{ opacity: 1 }} 
                 className="text-sm font-medium uppercase tracking-widest"
               >
                 {startText}
               </motion.span>
            </div>
          )}
        </motion.div>

        <AnimatePresence>
          {isRecording && (
            <motion.div
              initial={{ opacity: 0, width: 0, marginLeft: 0 }}
              animate={{ opacity: 1, width: "auto", marginLeft: 12 }}
              exit={{ opacity: 0, width: 0, marginLeft: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="overflow-hidden flex gap-4 items-center justify-center pr-2 origin-left"
            >
              {/* Frequency Animation */}
              <div className="flex gap-0.5 items-center justify-center h-4">
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-0.5 bg-spark-accent rounded-full"
                    initial={{ height: 4 }}
                    animate={{
                      height: [4, 8 + Math.random() * 12, 4 + Math.random() * 6, 4],
                    }}
                    transition={{
                      duration: 0.5,
                      repeat: Infinity,
                      delay: i * 0.05,
                      ease: "easeInOut",
                    }}
                  />
                ))}
              </div>
              
              {/* Timer */}
              <div className="text-xs font-mono text-spark-accent w-10 text-center tracking-wider">
                {formatTime(time)}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  )
}
