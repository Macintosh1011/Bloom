import React from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { motion } from "framer-motion";

export default function MoodIndicator({ mood }) {
  const moodConfig = {
    bullish: {
      label: "Bullish",
      icon: TrendingUp,
      gradient: "from-green-500 to-emerald-500",
      bgColor: "bg-green-500/10",
      borderColor: "border-green-500/30",
      textColor: "text-green-400"
    },
    bearish: {
      label: "Bearish",
      icon: TrendingDown,
      gradient: "from-red-500 to-orange-500",
      bgColor: "bg-red-500/10",
      borderColor: "border-red-500/30",
      textColor: "text-red-400"
    },
    neutral: {
      label: "Neutral",
      icon: Minus,
      gradient: "from-gray-500 to-slate-500",
      bgColor: "bg-gray-500/10",
      borderColor: "border-gray-500/30",
      textColor: "text-gray-400"
    }
  };

  const config = moodConfig[mood] || moodConfig.neutral;
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`flex items-center gap-3 px-4 py-2.5 rounded-full border ${config.borderColor} ${config.bgColor} backdrop-blur-xl`}
    >
      <div className={`p-1.5 rounded-full bg-gradient-to-br ${config.gradient}`}>
        <Icon className="w-4 h-4 text-white" />
      </div>
      <div>
        <p className="text-xs text-gray-400">Market Mood</p>
        <p className={`text-sm font-semibold ${config.textColor}`}>{config.label}</p>
      </div>
    </motion.div>
  );
}