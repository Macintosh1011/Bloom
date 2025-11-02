import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { TrendingUp, TrendingDown, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import ThinkingAnimation from "@/components/dashboard/ThinkingAnimation";

export default function TopMovers() {
  const [gainers, setGainers] = useState([]);
  const [losers, setLosers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [thinkingSteps, setThinkingSteps] = useState([]);

  useEffect(() => {
    fetchTopMovers();
  }, []);

  const fetchTopMovers = async () => {
    setIsLoading(true);
    setThinkingSteps([
      { icon: "database", text: "Uploading resources to Captain", subtext: "Connecting..." },
      { icon: "sparkles", text: "Fetching market movers", subtext: "Scanning markets..." },
      { icon: "brain", text: "Analyzing performance", subtext: "Processing data..." },
      { icon: "chart", text: "Compiling results", subtext: "Almost done..." }
    ]);

    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Get the top 5 stock gainers and top 5 stock losers for TODAY with REAL-TIME data.

For each stock provide:
- symbol (ticker)
- name (company name)
- price (current price)
- change (percentage change today)

Return as JSON with "gainers" and "losers" arrays.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            gainers: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  symbol: { type: "string" },
                  name: { type: "string" },
                  price: { type: "number" },
                  change: { type: "number" }
                }
              }
            },
            losers: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  symbol: { type: "string" },
                  name: { type: "string" },
                  price: { type: "number" },
                  change: { type: "number" }
                }
              }
            }
          }
        }
      });

      setGainers(result.gainers || []);
      setLosers(result.losers || []);
    } catch (error) {
      console.error("Error fetching top movers:", error);
    }

    setIsLoading(false);
    setThinkingSteps([]);
  };

  return (
    <Card className="bg-white/5 border-white/10 backdrop-blur-xl rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-red-500">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Top Movers</h3>
            <p className="text-sm text-gray-400">Today's biggest winners and losers</p>
          </div>
        </div>
        <Button
          onClick={fetchTopMovers}
          disabled={isLoading}
          variant="outline"
          size="sm"
          className="bg-white/5 border-white/10 text-gray-300 hover:bg-white/10"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {isLoading && thinkingSteps.length > 0 ? (
        <ThinkingAnimation steps={thinkingSteps} />
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Top Gainers */}
          <div>
            <h4 className="text-sm font-semibold text-green-400 mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Top Gainers
            </h4>
            <div className="space-y-2">
              {gainers.map((stock, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-3 rounded-xl bg-green-500/10 border border-green-400/20 hover:bg-green-500/20 transition-all"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white">{stock.symbol}</p>
                      <p className="text-xs text-gray-400 truncate">{stock.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-white">${stock.price?.toFixed(2)}</p>
                      <p className="text-xs text-green-400 font-semibold">
                        +{stock.change?.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Top Losers */}
          <div>
            <h4 className="text-sm font-semibold text-red-400 mb-3 flex items-center gap-2">
              <TrendingDown className="w-4 h-4" />
              Top Losers
            </h4>
            <div className="space-y-2">
              {losers.map((stock, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-3 rounded-xl bg-red-500/10 border border-red-400/20 hover:bg-red-500/20 transition-all"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white">{stock.symbol}</p>
                      <p className="text-xs text-gray-400 truncate">{stock.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-white">${stock.price?.toFixed(2)}</p>
                      <p className="text-xs text-red-400 font-semibold">
                        {stock.change?.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}