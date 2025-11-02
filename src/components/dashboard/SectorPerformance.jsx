import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { BarChart3, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import ThinkingAnimation from "@/components/dashboard/ThinkingAnimation";

export default function SectorPerformance() {
  const [sectors, setSectors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [thinkingSteps, setThinkingSteps] = useState([]);

  useEffect(() => {
    fetchSectorPerformance();
  }, []);

  const fetchSectorPerformance = async () => {
    setIsLoading(true);
    setThinkingSteps([
      { icon: "database", text: "Uploading resources to Captain", subtext: "Initializing..." },
      { icon: "sparkles", text: "Analyzing sector performance", subtext: "Scanning markets..." },
      { icon: "brain", text: "Processing data", subtext: "Calculating changes..." },
      { icon: "chart", text: "Generating chart", subtext: "Finalizing..." }
    ]);

    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Get TODAY's performance for major market sectors with REAL-TIME data.

Return data for these sectors:
- Technology
- Healthcare
- Financials
- Energy
- Consumer Discretionary
- Industrials
- Real Estate
- Utilities

For each sector provide:
- name (sector name)
- change (percentage change today)

Return as JSON array of sector objects.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            sectors: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  change: { type: "number" }
                }
              }
            }
          }
        }
      });

      setSectors(result.sectors || []);
    } catch (error) {
      console.error("Error fetching sector performance:", error);
    }

    setIsLoading(false);
    setThinkingSteps([]);
  };

  const getBarColor = (change) => {
    return change >= 0 ? '#10B981' : '#EF4444';
  };

  return (
    <Card className="bg-white/5 border-white/10 backdrop-blur-xl rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Sector Performance</h3>
            <p className="text-sm text-gray-400">Today's sector rotation</p>
          </div>
        </div>
        <Button
          onClick={fetchSectorPerformance}
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
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={sectors} layout="vertical" margin={{ left: 100 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis type="number" stroke="rgba(255,255,255,0.3)" style={{ fontSize: '12px' }} />
              <YAxis 
                type="category" 
                dataKey="name" 
                stroke="rgba(255,255,255,0.3)" 
                style={{ fontSize: '12px' }}
                width={90}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(0,0,0,0.9)', 
                  border: '1px solid rgba(124, 58, 237, 0.3)',
                  borderRadius: '12px'
                }}
                formatter={(value) => [`${value.toFixed(2)}%`, 'Change']}
              />
              <Bar dataKey="change" radius={[0, 8, 8, 0]}>
                {sectors.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(entry.change)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-green-500"></div>
          <span className="text-xs text-gray-300">Positive</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-red-500"></div>
          <span className="text-xs text-gray-300">Negative</span>
        </div>
      </div>
    </Card>
  );
}