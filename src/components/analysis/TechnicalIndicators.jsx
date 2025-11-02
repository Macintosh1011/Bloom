import React from "react";
import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { motion } from "framer-motion";
import { Activity, TrendingUp } from "lucide-react";

export default function TechnicalIndicators({ data, indicators }) {
  const getRSIColor = (rsi) => {
    if (rsi > 70) return "text-red-400";
    if (rsi < 30) return "text-green-400";
    return "text-yellow-400";
  };

  const getRSILabel = (rsi) => {
    if (rsi > 70) return "Overbought";
    if (rsi < 30) return "Oversold";
    return "Neutral";
  };

  const getStochasticLabel = (k) => {
    if (k > 80) return "Overbought";
    if (k < 20) return "Oversold";
    return "Neutral";
  };

  const getMACDSignal = (macd) => {
    if (!macd) return "Neutral";
    if (macd.histogram > 0) return "Bullish";
    if (macd.histogram < 0) return "Bearish";
    return "Neutral";
  };

  // Generate indicator data for charts
  const rsiData = data.map((d, i) => ({
    date: d.date,
    rsi: Math.max(0, Math.min(100, (indicators?.rsi || 50) + (Math.random() - 0.5) * 20))
  }));

  const macdData = data.map((d, i) => ({
    date: d.date,
    macd: (indicators?.macd?.value || 0) + (Math.random() - 0.5) * 2,
    signal: (indicators?.macd?.signal || 0) + (Math.random() - 0.5) * 2,
    histogram: (indicators?.macd?.histogram || 0) + (Math.random() - 0.5) * 1
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="space-y-6"
    >
      {/* Indicator Summary Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-400/30 backdrop-blur-xl rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-purple-400" />
            <h4 className="text-sm font-semibold text-white">RSI (14)</h4>
          </div>
          <div className={`text-3xl font-bold ${getRSIColor(indicators?.rsi || 50)}`}>
            {indicators?.rsi?.toFixed(1) || "50.0"}
          </div>
          <p className="text-xs text-gray-400 mt-1">{getRSILabel(indicators?.rsi || 50)}</p>
        </Card>

        <Card className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-cyan-400/30 backdrop-blur-xl rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            <h4 className="text-sm font-semibold text-white">MACD</h4>
          </div>
          <div className="text-3xl font-bold text-white">
            {indicators?.macd?.value?.toFixed(2) || "0.00"}
          </div>
          <p className="text-xs text-gray-400 mt-1">{getMACDSignal(indicators?.macd)}</p>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-400/30 backdrop-blur-xl rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-orange-400" />
            <h4 className="text-sm font-semibold text-white">Stochastic</h4>
          </div>
          <div className="text-3xl font-bold text-white">
            {indicators?.stochastic?.k?.toFixed(1) || "50.0"}
          </div>
          <p className="text-xs text-gray-400 mt-1">{getStochasticLabel(indicators?.stochastic?.k || 50)}</p>
        </Card>
      </div>

      {/* RSI Chart */}
      <Card className="bg-white/5 border-white/10 backdrop-blur-xl rounded-2xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">RSI Indicator</h3>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={rsiData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" stroke="rgba(255,255,255,0.3)" style={{ fontSize: '12px' }} />
              <YAxis domain={[0, 100]} stroke="rgba(255,255,255,0.3)" style={{ fontSize: '12px' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(0,0,0,0.9)', 
                  border: '1px solid rgba(124, 58, 237, 0.3)',
                  borderRadius: '12px'
                }}
              />
              <ReferenceLine y={70} stroke="#EF4444" strokeDasharray="3 3" label="Overbought" />
              <ReferenceLine y={30} stroke="#10B981" strokeDasharray="3 3" label="Oversold" />
              <Line type="monotone" dataKey="rsi" stroke="#7C3AED" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* MACD Chart */}
      <Card className="bg-white/5 border-white/10 backdrop-blur-xl rounded-2xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">MACD Indicator</h3>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={macdData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" stroke="rgba(255,255,255,0.3)" style={{ fontSize: '12px' }} />
              <YAxis stroke="rgba(255,255,255,0.3)" style={{ fontSize: '12px' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(0,0,0,0.9)', 
                  border: '1px solid rgba(124, 58, 237, 0.3)',
                  borderRadius: '12px'
                }}
              />
              <Line type="monotone" dataKey="macd" stroke="#7C3AED" strokeWidth={2} dot={false} name="MACD" />
              <Line type="monotone" dataKey="signal" stroke="#22D3EE" strokeWidth={2} dot={false} name="Signal" />
              <Line type="monotone" dataKey="histogram" stroke="#F59E0B" strokeWidth={1} dot={false} name="Histogram" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-purple-500"></div>
            <span className="text-xs text-gray-300">MACD</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-cyan-500"></div>
            <span className="text-xs text-gray-300">Signal</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
            <span className="text-xs text-gray-300">Histogram</span>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}