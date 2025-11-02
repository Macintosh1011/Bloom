import React from "react";
import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";
import { motion } from "framer-motion";

export default function StockHeader({ stock }) {
  const isPositive = stock.change >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="bg-gradient-to-br from-white/10 to-white/5 border-2 border-purple-400/30 backdrop-blur-xl rounded-2xl p-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-4xl font-bold text-white">{stock.symbol}</h1>
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${
                isPositive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
              }`}>
                {isPositive ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                <span className="text-lg font-semibold">
                  {isPositive ? '+' : ''}{stock.change?.toFixed(2)}%
                </span>
              </div>
            </div>
            <p className="text-gray-300 text-lg mb-4">{stock.name}</p>
            <div className="text-5xl font-bold text-white mb-2">
              ${stock.price?.toFixed(2)}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-400/20">
              <p className="text-xs text-purple-300 mb-1">Volume</p>
              <p className="text-sm font-bold text-white">{stock.volume?.toLocaleString()}</p>
            </div>
            <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-400/20">
              <p className="text-xs text-purple-300 mb-1">Market Cap</p>
              <p className="text-sm font-bold text-white">{stock.market_cap}</p>
            </div>
            <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-400/20">
              <p className="text-xs text-purple-300 mb-1">52W High</p>
              <p className="text-sm font-bold text-white">${stock.high_52week?.toFixed(2)}</p>
            </div>
            <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-400/20">
              <p className="text-xs text-purple-300 mb-1">52W Low</p>
              <p className="text-sm font-bold text-white">${stock.low_52week?.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}