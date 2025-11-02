import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, CheckCircle2, Database, Brain, Sparkles, LineChart } from "lucide-react";

export default function ThinkingAnimation({ steps = [] }) {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (currentStep < steps.length - 1) {
      const timer = setTimeout(() => {
        setCurrentStep(prev => prev + 1);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [currentStep, steps.length]);

  const getIcon = (iconName) => {
    const icons = {
      database: Database,
      brain: Brain,
      sparkles: Sparkles,
      chart: LineChart
    };
    return icons[iconName] || Loader2;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-2"
    >
      {steps.map((step, index) => {
        const Icon = getIcon(step.icon);
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;
        
        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.2 }}
            className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
              isCurrent 
                ? 'bg-purple-500/20 border-purple-400/50' 
                : isCompleted 
                ? 'bg-green-500/10 border-green-400/30' 
                : 'bg-white/5 border-white/10'
            }`}
          >
            <div className={`flex-shrink-0 ${
              isCurrent ? 'animate-spin' : ''
            }`}>
              {isCompleted ? (
                <CheckCircle2 className="w-5 h-5 text-green-400" />
              ) : (
                <Icon className={`w-5 h-5 ${
                  isCurrent ? 'text-purple-400' : 'text-gray-500'
                }`} />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium ${
                isCurrent ? 'text-purple-200' : isCompleted ? 'text-green-300' : 'text-gray-400'
              }`}>
                {step.text}
              </p>
              {step.subtext && isCurrent && (
                <p className="text-xs text-purple-300/60 mt-0.5">{step.subtext}</p>
              )}
            </div>
            {isCurrent && (
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="w-2 h-2 rounded-full bg-purple-400"
              />
            )}
          </motion.div>
        );
      })}
    </motion.div>
  );
}