import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, BarChart, Bar } from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, TrendingUp, BarChart3, Calendar } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function MarketMomentumChart({ marketData, visualizationData }) {
  const [displayData, setDisplayData] = useState([]);
  const [chartType, setChartType] = useState("area");
  const [dateRange, setDateRange] = useState("1M");

  useEffect(() => {
    if (visualizationData) {
      setDisplayData(visualizationData.data || []);
      setChartType(visualizationData.type || "area");
    } else {
      generateMomentumData();
    }
  }, [visualizationData, marketData, dateRange]);

  const generateMomentumData = () => {
    const baseValue = marketData?.nasdaq || 15000;
    const change = marketData?.nasdaq_change || 0;
    
    const points = dateRange === "1D" ? 24 : dateRange === "1W" ? 7 : dateRange === "1M" ? 30 : 90;
    const timeLabel = dateRange === "1D" ? "h" : "d";
    
    const data = Array.from({ length: points }, (_, i) => {
      const variance = (Math.random() - 0.5) * (baseValue * 0.02);
      const trend = (change / 100) * baseValue * (i / points);
      return {
        time: `${i}${timeLabel}`,
        value: baseValue + trend + variance,
        sp500: (marketData?.sp500 || 4500) + (trend * 0.3) + (variance * 0.8),
        volume: Math.floor(Math.random() * 1000000000)
      };
    });
    
    setDisplayData(data);
  };

  const renderChart = () => {
    const commonProps = {
      data: displayData,
      margin: { top: 5, right: 30, left: 20, bottom: 5 }
    };

    switch (chartType) {
      case "bar":
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="time" stroke="rgba(255,255,255,0.3)" style={{ fontSize: '12px' }} />
            <YAxis stroke="rgba(255,255,255,0.3)" style={{ fontSize: '12px' }} />
            <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.9)', border: '1px solid rgba(124, 58, 237, 0.3)', borderRadius: '12px', color: '#fff' }} />
            <Bar dataKey="value" fill="#7C3AED" />
          </BarChart>
        );
      
      case "line":
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="time" stroke="rgba(255,255,255,0.3)" style={{ fontSize: '12px' }} />
            <YAxis stroke="rgba(255,255,255,0.3)" style={{ fontSize: '12px' }} />
            <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.9)', border: '1px solid rgba(124, 58, 237, 0.3)', borderRadius: '12px', color: '#fff' }} />
            <Line type="monotone" dataKey="value" stroke="#7C3AED" strokeWidth={3} dot={false} name="NASDAQ" />
            <Line type="monotone" dataKey="sp500" stroke="#22D3EE" strokeWidth={2} dot={false} name="S&P 500" />
          </LineChart>
        );
      
      default:
        return (
          <AreaChart {...commonProps}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#7C3AED" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorSP" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22D3EE" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#22D3EE" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="time" stroke="rgba(255,255,255,0.3)" style={{ fontSize: '12px' }} />
            <YAxis stroke="rgba(255,255,255,0.3)" style={{ fontSize: '12px' }} />
            <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.9)', border: '1px solid rgba(124, 58, 237, 0.3)', borderRadius: '12px', color: '#fff' }} />
            <Area type="monotone" dataKey="value" stroke="#7C3AED" strokeWidth={3} fill="url(#colorValue)" name="NASDAQ" />
            <Area type="monotone" dataKey="sp500" stroke="#22D3EE" strokeWidth={2} fill="url(#colorSP)" name="S&P 500" />
          </AreaChart>
        );
    }
  };

  return (
    <Card className="bg-white/5 border-white/10 backdrop-blur-xl p-6 rounded-2xl">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Market Momentum</h3>
            <p className="text-sm text-gray-400">Advanced charting with technical analysis</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={chartType} onValueChange={setChartType}>
            <SelectTrigger className="w-32 bg-white/5 border-white/10 text-white">
              <BarChart3 className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="area">Area Chart</SelectItem>
              <SelectItem value="line">Line Chart</SelectItem>
              <SelectItem value="bar">Bar Chart</SelectItem>
            </SelectContent>
          </Select>

          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-24 bg-white/5 border-white/10 text-white">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1D">1 Day</SelectItem>
              <SelectItem value="1W">1 Week</SelectItem>
              <SelectItem value="1M">1 Month</SelectItem>
              <SelectItem value="3M">3 Months</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20">
            <Sparkles className="w-3 h-3 text-purple-400" />
            <span className="text-xs text-purple-300">Live</span>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={`${chartType}-${dateRange}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="h-[400px]"
        >
          {displayData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              {renderChart()}
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center space-y-3">
                <div className="w-16 h-16 mx-auto rounded-full bg-purple-500/10 flex items-center justify-center">
                  <TrendingUp className="w-8 h-8 text-purple-400" />
                </div>
                <p className="text-gray-400">Loading market data...</p>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-purple-500"></div>
          <span className="text-sm text-gray-300">NASDAQ</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-cyan-500"></div>
          <span className="text-sm text-gray-300">S&P 500</span>
        </div>
        <div className="text-xs text-gray-500">
          Range: {dateRange}
        </div>
      </div>
    </Card>
  );
}