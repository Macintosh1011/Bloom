import React from "react";
import { TrendingUp, TrendingDown, DollarSign, Activity, Percent, BarChart3, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function MetricCards({ data, onRefresh, isLoading }) {
  const metrics = [
    {
      label: "NASDAQ",
      value: data?.nasdaq?.toFixed(2) || "—",
      change: data?.nasdaq_change || 0,
      icon: Activity,
      color: "from-purple-500 to-pink-500",
      bgGlow: "bg-purple-500/10",
      borderGlow: "border-purple-500/30"
    },
    {
      label: "S&P 500",
      value: data?.sp500?.toFixed(2) || "—",
      change: data?.sp500_change || 0,
      icon: TrendingUp,
      color: "from-cyan-500 to-blue-500",
      bgGlow: "bg-cyan-500/10",
      borderGlow: "border-cyan-500/30"
    },
    {
      label: "Fed Funds Rate",
      value: data?.fed_rate ? `${data.fed_rate.toFixed(2)}%` : "—",
      change: null,
      icon: Percent,
      color: "from-orange-500 to-red-500",
      bgGlow: "bg-orange-500/10",
      borderGlow: "border-orange-500/30"
    },
    {
      label: "CPI",
      value: data?.cpi?.toFixed(1) || "—",
      change: null,
      icon: BarChart3,
      color: "from-green-500 to-emerald-500",
      bgGlow: "bg-green-500/10",
      borderGlow: "border-green-500/30"
    }
  ];

  return (
    <div className="relative">
      <Button
        onClick={onRefresh}
        disabled={isLoading}
        variant="outline"
        size="sm"
        className="absolute -top-12 right-0 bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 z-10"
      >
        <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
        Refresh Data
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          const isPositive = metric.change && metric.change > 0;
          const isNegative = metric.change && metric.change < 0;

          return (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative overflow-hidden rounded-2xl border-2 ${metric.borderGlow} ${metric.bgGlow} backdrop-blur-xl p-6 group hover:scale-[1.02] transition-all duration-300`}
            >
              {/* Glow effect */}
              <div className={`absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br ${metric.color} opacity-20 rounded-full blur-3xl group-hover:opacity-40 transition-opacity`} />
              
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${metric.color} shadow-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  {metric.change !== null && (
                    <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full ${
                      isPositive ? 'bg-green-500/20 text-green-400' : 
                      isNegative ? 'bg-red-500/20 text-red-400' : 
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                      <span className="text-sm font-semibold">
                        {metric.change > 0 ? '+' : ''}{metric.change.toFixed(2)}%
                      </span>
                    </div>
                  )}
                </div>
                
                <p className="text-sm font-medium text-purple-300 mb-2">{metric.label}</p>
                <p className="text-3xl font-bold text-white">{metric.value}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}