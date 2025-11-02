
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { Search, TrendingUp, TrendingDown, Plus, Newspaper } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import ThinkingAnimation from "@/components/dashboard/ThinkingAnimation";
import { ComposedChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function StockLookup({ onStockAdded }) {
  const [symbol, setSymbol] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [stockData, setStockData] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [error, setError] = useState(null);
  const [thinkingSteps, setThinkingSteps] = useState([]);

  const handleSearch = async () => {
    if (!symbol.trim()) return;

    setIsSearching(true);
    setError(null);
    setStockData(null);
    setChartData([]);

    setThinkingSteps([
      { icon: "database", text: "Uploading resources to Captain", subtext: "Initializing..." },
      { icon: "sparkles", text: "Fetching real-time stock data", subtext: `Looking up ${symbol.toUpperCase()}...` },
      { icon: "brain", text: "Analyzing news sentiment", subtext: "Scanning headlines..." },
      { icon: "chart", text: "Compiling results", subtext: "Almost done..." }
    ]);

    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Get REAL-TIME CURRENT stock data for ticker symbol: ${symbol.toUpperCase()}
        
Include:
- Company name
- Current stock price (exact current price)
- Today's price change percentage
- Trading volume
- Market capitalization
- Latest news sentiment (positive/negative/neutral) based on recent headlines
- Brief summary of key news (1-2 sentences)
- Last 7 days OHLC data (Open, High, Low, Close) for candlestick chart

Return ONLY a JSON object with current live data, no markdown.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            symbol: { type: "string" },
            name: { type: "string" },
            price: { type: "number" },
            change: { type: "number" },
            volume: { type: "number" },
            market_cap: { type: "string" },
            sentiment: { type: "string", enum: ["positive", "negative", "neutral"] },
            news_summary: { type: "string" },
            chart_data: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  date: { type: "string" },
                  open: { type: "number" },
                  high: { type: "number" },
                  low: { type: "number" },
                  close: { type: "number" }
                }
              }
            }
          }
        }
      });

      setStockData({
        ...result,
        last_updated: new Date().toISOString()
      });
      setChartData(result.chart_data || []);

      // Save news item
      try {
        await base44.entities.NewsItem.create({
          symbol: result.symbol,
          headline: "Latest Market Update",
          summary: result.news_summary || "No recent news",
          sentiment: result.sentiment || "neutral",
          sentiment_score: result.sentiment === "positive" ? 0.7 : result.sentiment === "negative" ? -0.7 : 0,
          source: "Bloom AI",
          published_date: new Date().toISOString()
        });
      } catch (e) {
        console.log("Could not save news");
      }
    } catch (err) {
      setError("Could not find stock data. Please check the symbol and try again.");
      console.error("Stock lookup error:", err);
    }

    setIsSearching(false);
    setThinkingSteps([]);
  };

  const handleAddToWatchlist = async () => {
    if (!stockData) return;

    try {
      await base44.entities.Stock.create(stockData);
      onStockAdded();
      setStockData(null);
      setSymbol("");
    } catch (err) {
      console.error("Error adding to watchlist:", err);
    }
  };

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case "positive": return "bg-green-500/20 text-green-400 border-green-500/30";
      case "negative": return "bg-red-500/20 text-red-400 border-red-500/30";
      default: return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const CustomCandlestick = (props) => {
    const { x, y, width, height, payload } = props;
    if (!payload || payload.open === undefined || payload.close === undefined || payload.high === undefined || payload.low === undefined) return null;
    
    const isPositive = payload.close >= payload.open;
    const color = isPositive ? '#10B981' : '#EF4444';
    
    // The `y` and `height` passed to `shape` prop for a Recharts `Bar` component
    // typically represent the bar from its `dataKey` value down to the chart's baseline.
    // However, the outline's logic for CustomCandlestick implies a specific interpretation
    // where `y` is the pixel coordinate for the high and `y + height` is for the low.
    // We will follow the outline's calculation as specified.

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
          y={Math.min(openY, closeY)} // Use Math.min to ensure y is always the top of the body
          width={width}
          height={Math.max(1, bodyHeight)} // Ensure minimum height for very thin candles
          fill={color}
          stroke={color}
        />
      </g>
    );
  };

  return (
    <Card className="bg-white/5 border-white/10 backdrop-blur-xl rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500">
          <Search className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Stock Lookup</h3>
          <p className="text-sm text-gray-400">Search any stock with news sentiment</p>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        <Input
          value={symbol}
          onChange={(e) => setSymbol(e.target.value.toUpperCase())}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Enter ticker (e.g., AAPL, TSLA, MSFT)"
          className="flex-1 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-cyan-500"
          disabled={isSearching}
        />
        <Button
          onClick={handleSearch}
          disabled={isSearching || !symbol.trim()}
          className="bg-cyan-600 hover:bg-cyan-700"
        >
          <Search className="w-4 h-4" />
        </Button>
      </div>

      <AnimatePresence mode="wait">
        {isSearching && thinkingSteps.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <ThinkingAnimation steps={thinkingSteps} />
          </motion.div>
        )}

        {error && !isSearching && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
          >
            {error}
          </motion.div>
        )}

        {stockData && !isSearching && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 p-4"
          >
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-cyan-500 to-blue-500 opacity-20 rounded-full blur-3xl" />
            
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-2xl font-bold text-white">{stockData.symbol}</h4>
                    <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${
                      stockData.change >= 0 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {stockData.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {stockData.change >= 0 ? '+' : ''}{stockData.change?.toFixed(2)}%
                    </div>
                    <Badge className={`${getSentimentColor(stockData.sentiment)} border text-xs`}>
                      <Newspaper className="w-3 h-3 mr-1" />
                      {stockData.sentiment}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-400 mt-1">{stockData.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-white">${stockData.price?.toFixed(2)}</p>
                  <p className="text-xs text-gray-400">Current Price</p>
                </div>
              </div>

              {/* Candlestick Chart */}
              {chartData.length > 0 && (
                <div className="mb-3 p-3 rounded-lg bg-white/5 border border-white/10">
                  <p className="text-xs text-gray-400 mb-2">7-Day Chart</p>
                  <div className="h-[120px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={chartData}>
                        <XAxis 
                          dataKey="date" 
                          stroke="rgba(255,255,255,0.2)" 
                          style={{ fontSize: '10px' }}
                          hide
                        />
                        <YAxis 
                          domain={['auto', 'auto']}
                          stroke="rgba(255,255,255,0.2)" 
                          style={{ fontSize: '10px' }}
                          hide
                        />
                        <Bar 
                          dataKey="high"
                          shape={<CustomCandlestick />}
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {stockData.news_summary && (
                <div className="mb-3 p-3 rounded-lg bg-white/5 border border-white/10">
                  <div className="flex items-start gap-2">
                    <Newspaper className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-gray-300 leading-relaxed">{stockData.news_summary}</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="p-2 rounded-lg bg-white/5">
                  <p className="text-xs text-gray-400">Volume</p>
                  <p className="text-sm font-semibold text-white">
                    {stockData.volume?.toLocaleString()}
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-white/5">
                  <p className="text-xs text-gray-400">Market Cap</p>
                  <p className="text-sm font-semibold text-white">{stockData.market_cap}</p>
                </div>
              </div>

              <Button
                onClick={handleAddToWatchlist}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add to Watchlist
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-4 flex flex-wrap gap-2">
        <p className="text-xs text-gray-500 w-full mb-1">Popular:</p>
        {['AAPL', 'TSLA', 'MSFT', 'GOOGL', 'AMZN', 'NVDA'].map((ticker) => (
          <button
            key={ticker}
            onClick={() => setSymbol(ticker)}
            className="text-xs px-2 py-1 rounded-md bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 transition-all"
          >
            {ticker}
          </button>
        ))}
      </div>
    </Card>
  );
}
