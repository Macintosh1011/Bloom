
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

import MetricCards from "@/components/dashboard/MetricCards";
import MarketMomentumChart from "@/components/dashboard/MarketMomentumChart";
import CopilotPanel from "@/components/dashboard/CopilotPanel";
import MoodIndicator from "@/components/dashboard/MoodIndicator";
import StockLookup from "@/components/dashboard/StockLookup";
import StockWatchlist from "@/components/dashboard/StockWatchlist";
import PersonalizedInsights from "@/components/dashboard/PersonalizedInsights";
import MarketNewsFeed from "@/components/dashboard/MarketNewsFeed";
import TopMovers from "@/components/dashboard/TopMovers";
import SectorPerformance from "@/components/dashboard/SectorPerformance";

export default function Dashboard() {
  const [marketData, setMarketData] = useState(null);
  const [isLoadingMarket, setIsLoadingMarket] = useState(true);
  const [visualizationData, setVisualizationData] = useState(null);

  const queryClient = useQueryClient();

  const { data: snapshots } = useQuery({
    queryKey: ['marketSnapshots'],
    queryFn: () => base44.entities.MarketSnapshot.list('-created_date', 1),
    initialData: [],
    refetchInterval: 60000,
  });

  const { data: stocks, refetch: refetchStocks } = useQuery({
    queryKey: ['stocks'],
    queryFn: () => base44.entities.Stock.list('-last_updated'),
    initialData: [],
    refetchInterval: 30000,
  });

  const { data: newsItems } = useQuery({
    queryKey: ['newsItems'],
    queryFn: () => base44.entities.NewsItem.list('-published_date', 10),
    initialData: [],
    refetchInterval: 120000,
  });

  useEffect(() => {
    fetchMarketData();
  }, []);

  const fetchMarketData = async () => {
    setIsLoadingMarket(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Get the CURRENT REAL-TIME market data RIGHT NOW for: 
        
1. NASDAQ Composite Index - current value and today's percentage change
2. S&P 500 Index - current value and today's percentage change  
3. Federal Funds Effective Rate - current rate percentage
4. Consumer Price Index (CPI) - latest value

Also analyze today's market movements and determine the overall market sentiment (bullish/bearish/neutral).

Return ONLY a JSON object with exact current values, no markdown or code blocks.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            nasdaq: { type: "number" },
            nasdaq_change: { type: "number" },
            sp500: { type: "number" },
            sp500_change: { type: "number" },
            fed_rate: { type: "number" },
            cpi: { type: "number" },
            market_mood: { type: "string", enum: ["bullish", "bearish", "neutral"] }
          }
        }
      });

      const data = {
        ...result,
        snapshot_date: new Date().toISOString()
      };

      setMarketData(data);

      await base44.entities.MarketSnapshot.create(data);
      queryClient.invalidateQueries({ queryKey: ['marketSnapshots'] });
    } catch (error) {
      console.error("Error fetching market data:", error);
      if (snapshots.length > 0) {
        setMarketData(snapshots[0]);
      }
    }
    setIsLoadingMarket(false);
  };

  const handleVisualizationRequest = (vizData) => {
    setVisualizationData(vizData);
  };

  const handleStockAdded = () => {
    refetchStocks();
  };

  if (isLoadingMarket && !marketData) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 text-purple-400 animate-spin mx-auto" />
          <p className="text-gray-400">Loading market intelligence...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Market Overview</h2>
          <p className="text-gray-400">Real-time insights powered by AI</p>
        </div>
        {marketData && <MoodIndicator mood={marketData.market_mood} />}
      </div>

      <MetricCards data={marketData} onRefresh={fetchMarketData} isLoading={isLoadingMarket} />

      <PersonalizedInsights stocks={stocks} />

      <div className="grid lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <StockLookup onStockAdded={handleStockAdded} />
          
          <TopMovers />
          
          <SectorPerformance />

          <MarketMomentumChart 
            marketData={marketData} 
            visualizationData={visualizationData}
          />

          <MarketNewsFeed newsItems={newsItems} />
        </div>

        <div className="space-y-6">
          <CopilotPanel 
            marketData={marketData}
            onVisualizationRequest={handleVisualizationRequest}
          />
          
          <StockWatchlist stocks={stocks} onRefresh={refetchStocks} />
        </div>
      </div>
    </div>
  );
}
