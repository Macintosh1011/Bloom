
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { TrendingUp, TrendingDown, RefreshCw, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createPageUrl } from "@/utils";

export default function StockWatchlist({ stocks, onRefresh }) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    
    for (const stock of stocks) {
      try {
        const result = await base44.integrations.Core.InvokeLLM({
          prompt: `Get CURRENT REAL-TIME stock price and change for ${stock.symbol}. Return only JSON with price (number) and change (number) fields.`,
          add_context_from_internet: true,
          response_json_schema: {
            type: "object",
            properties: {
              price: { type: "number" },
              change: { type: "number" }
            }
          }
        });

        await base44.entities.Stock.update(stock.id, {
          ...stock,
          price: result.price,
          change: result.change,
          last_updated: new Date().toISOString()
        });
      } catch (err) {
        console.error(`Error updating ${stock.symbol}:`, err);
      }
    }

    onRefresh();
    setIsRefreshing(false);
  };

  const handleDelete = async (stockId) => {
    setDeletingId(stockId);
    try {
      await base44.entities.Stock.delete(stockId);
      onRefresh();
    } catch (err) {
      console.error("Error deleting stock:", err);
    }
    setDeletingId(null);
  };

  return (
    <Card className="bg-gradient-to-br from-white/10 to-white/5 border-2 border-purple-400/30 backdrop-blur-xl rounded-2xl p-5 max-h-[500px] flex flex-col shadow-2xl">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-purple-400/20">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2L8 6v3H6v13h12V9h-2V6l-4-4zm0 2.5L14 6.5V9h-4V6.5l2-2zM8 11h8v9H8v-9zm2 2v2h4v-2h-4zm0 3v2h4v-2h-4z"/>
            <path d="M11 2h2v3h-2zM9 4h2v2H9zM13 4h2v2h-2z"/>
          </svg>
          <h3 className="text-sm font-bold text-white">Watchlist</h3>
          <span className="text-xs text-purple-300">({stocks.length})</span>
        </div>
        <Button
          onClick={handleRefresh}
          disabled={isRefreshing || stocks.length === 0}
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-purple-300 hover:text-white hover:bg-purple-500/20"
        >
          <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2">
        <AnimatePresence>
          {stocks.length === 0 ? (
            <div className="text-center py-8">
              <svg className="w-8 h-8 text-purple-400 mx-auto mb-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L8 6v3H6v13h12V9h-2V6l-4-4zm0 2.5L14 6.5V9h-4V6.5l2-2zM8 11h8v9H8v-9zm2 2v2h4v-2h-4zm0 3v2h4v-2h-4z"/>
                <path d="M11 2h2v3h-2zM9 4h2v2H9zM13 4h2v2h-2z"/>
              </svg>
              <p className="text-sm text-purple-300">No stocks in watchlist</p>
              <p className="text-xs text-purple-400 mt-1">Search and add stocks above</p>
            </div>
          ) : (
            stocks.map((stock) => (
              <motion.div
                key={stock.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="group relative p-3 rounded-xl bg-purple-500/10 border border-purple-400/20 hover:bg-purple-500/20 transition-all cursor-pointer"
                onClick={() => window.location.href = createPageUrl("StockAnalysis") + `?symbol=${stock.symbol}`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white">{stock.symbol}</h4>
                      <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${
                        stock.change >= 0 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {stock.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {stock.change >= 0 ? '+' : ''}{stock.change?.toFixed(2)}%
                      </div>
                    </div>
                    <p className="text-xs text-purple-300 truncate mt-0.5">{stock.name}</p>
                  </div>
                  
                  <div className="text-right ml-2">
                    <p className="text-sm font-bold text-white">${stock.price?.toFixed(2)}</p>
                  </div>
                </div>

                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(stock.id);
                  }}
                  disabled={deletingId === stock.id}
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/20"
                >
                  <Trash2 className="w-3 h-3 text-red-400" />
                </Button>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {stocks.length > 0 && (
        <div className="mt-3 pt-3 border-t border-purple-400/20">
          <p className="text-xs text-purple-400 text-center">
            Last updated: {new Date().toLocaleTimeString()}
          </p>
        </div>
      )}
    </Card>
  );
}
