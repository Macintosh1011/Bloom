import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, ArrowLeft, TrendingUp, TrendingDown, Activity } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

import CandlestickChart from "@/components/analysis/CandlestickChart";
import TechnicalIndicators from "@/components/analysis/TechnicalIndicators";
import AIAnalysisPanel from "@/components/analysis/AIAnalysisPanel";
import StockHeader from "@/components/analysis/StockHeader";

export default function StockAnalysis() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const symbol = params.get('symbol');
  
  const [stockData, setStockData] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [indicators, setIndicators] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (symbol) {
      fetchStockAnalysis();
    }
  }, [symbol]);

  const fetchStockAnalysis = async () => {
    setIsLoading(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Get comprehensive REAL-TIME stock analysis for ${symbol.toUpperCase()}:

1. Current stock data: price, change %, volume, market cap, 52-week high/low
2. Historical price data for the last 30 days (OHLC - Open, High, Low, Close)
3. Technical indicators: RSI (14-day), MACD, Stochastic Oscillator
4. Company info and recent news sentiment

Return detailed JSON with all data.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            stock: {
              type: "object",
              properties: {
                symbol: { type: "string" },
                name: { type: "string" },
                price: { type: "number" },
                change: { type: "number" },
                volume: { type: "number" },
                market_cap: { type: "string" },
                high_52week: { type: "number" },
                low_52week: { type: "number" }
              }
            },
            historical: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  date: { type: "string" },
                  open: { type: "number" },
                  high: { type: "number" },
                  low: { type: "number" },
                  close: { type: "number" },
                  volume: { type: "number" }
                }
              }
            },
            indicators: {
              type: "object",
              properties: {
                rsi: { type: "number" },
                macd: {
                  type: "object",
                  properties: {
                    value: { type: "number" },
                    signal: { type: "number" },
                    histogram: { type: "number" }
                  }
                },
                stochastic: {
                  type: "object",
                  properties: {
                    k: { type: "number" },
                    d: { type: "number" }
                  }
                }
              }
            },
            sentiment: { type: "string", enum: ["positive", "negative", "neutral"] }
          }
        }
      });

      setStockData(result.stock);
      setChartData(result.historical || []);
      setIndicators(result.indicators);
    } catch (error) {
      console.error("Error fetching stock analysis:", error);
    }
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 text-purple-400 animate-spin mx-auto" />
          <p className="text-gray-400">Loading stock analysis...</p>
        </div>
      </div>
    );
  }

  if (!stockData) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-gray-400">Stock not found</p>
          <Link to={createPageUrl("Dashboard")}>
            <Button>Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link to={createPageUrl("Dashboard")}>
        <Button variant="outline" className="bg-white/5 border-white/10 text-gray-300 hover:bg-white/10">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
      </Link>

      <StockHeader stock={stockData} />

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <CandlestickChart data={chartData} symbol={symbol} />
          <TechnicalIndicators data={chartData} indicators={indicators} />
        </div>

        <div>
          <AIAnalysisPanel 
            symbol={symbol} 
            stockData={stockData}
            chartData={chartData}
            indicators={indicators}
          />
        </div>
      </div>
    </div>
  );
}