import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { motion } from "framer-motion";
import { BarChart3, Activity } from "lucide-react";

export default function CandlestickChart({ data, symbol }) {
  const [chartType, setChartType] = useState("candlestick");

  const CustomCandlestick = (props) => {
    const { x, y, width, height, payload } = props;
    const isPositive = payload.close >= payload.open;
    const color = isPositive ? '#10B981' : '#EF4444';
    
    const highY = y;
    const lowY = y + height;
    const openY = isPositive ? y + height : y;
    const closeY = isPositive ? y : y + height;
    const bodyHeight = Math.abs(closeY - openY);

    return (
      <g>
        <line
          x1={x + width / 2}
          y1={highY}
          x2={x + width / 2}
          y2={lowY}
          stroke={color}
          strokeWidth={1}
        />
        <rect
          x={x}
          y={Math.min(openY, closeY)}
          width={width}
          height={Math.max(1, bodyHeight)}
          fill={color}
          stroke={color}
        />
      </g>
    );
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const isPositive = data.close >= data.open;
      
      return (
        <div className="bg-black/90 border border-purple-400/30 rounded-lg p-3 backdrop-blur-xl">
          <p className="text-xs text-gray-400 mb-2">{data.date}</p>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between gap-4">
              <span className="text-gray-400">Open:</span>
              <span className="text-white font-semibold">${data.open?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-gray-400">High:</span>
              <span className="text-green-400 font-semibold">${data.high?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-gray-400">Low:</span>
              <span className="text-red-400 font-semibold">${data.low?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-gray-400">Close:</span>
              <span className={`font-semibold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                ${data.close?.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between gap-4 pt-1 border-t border-gray-700">
              <span className="text-gray-400">Volume:</span>
              <span className="text-white font-semibold">{data.volume?.toLocaleString()}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <Card className="bg-white/5 border-white/10 backdrop-blur-xl rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">{symbol} Price Chart</h3>
              <p className="text-sm text-gray-400">30-day candlestick view</p>
            </div>
          </div>

          <Select value={chartType} onValueChange={setChartType}>
            <SelectTrigger className="w-40 bg-white/5 border-white/10 text-white">
              <Activity className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="candlestick">Candlestick</SelectItem>
              <SelectItem value="line">Line Chart</SelectItem>
              <SelectItem value="area">Area Chart</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === "candlestick" ? (
              <ComposedChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis 
                  dataKey="date" 
                  stroke="rgba(255,255,255,0.3)" 
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  domain={['auto', 'auto']}
                  stroke="rgba(255,255,255,0.3)" 
                  style={{ fontSize: '12px' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="high"
                  shape={<CustomCandlestick />}
                />
              </ComposedChart>
            ) : chartType === "line" ? (
              <ComposedChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis 
                  dataKey="date" 
                  stroke="rgba(255,255,255,0.3)" 
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke="rgba(255,255,255,0.3)" 
                  style={{ fontSize: '12px' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="close" 
                  stroke="#7C3AED" 
                  strokeWidth={3}
                  dot={false}
                />
              </ComposedChart>
            ) : (
              <ComposedChart data={data}>
                <defs>
                  <linearGradient id="colorClose" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#7C3AED" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis 
                  dataKey="date" 
                  stroke="rgba(255,255,255,0.3)" 
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke="rgba(255,255,255,0.3)" 
                  style={{ fontSize: '12px' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="close" 
                  stroke="#7C3AED" 
                  strokeWidth={3}
                  fill="url(#colorClose)"
                  dot={false}
                />
              </ComposedChart>
            )}
          </ResponsiveContainer>
        </div>

        <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-green-500"></div>
            <span className="text-xs text-gray-300">Bullish</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-red-500"></div>
            <span className="text-xs text-gray-300">Bearish</span>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}