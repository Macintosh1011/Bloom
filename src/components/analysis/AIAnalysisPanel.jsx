import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { Brain, TrendingUp, TrendingDown, Minus, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import ThinkingAnimation from "@/components/dashboard/ThinkingAnimation";

export default function AIAnalysisPanel({ symbol, stockData, chartData, indicators }) {
  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [thinkingSteps, setThinkingSteps] = useState([]);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setThinkingSteps([
      { icon: "database", text: "Uploading resources to Captain", subtext: "Preparing analysis..." },
      { icon: "sparkles", text: "Analyzing technical indicators", subtext: "RSI, MACD, Stochastic..." },
      { icon: "brain", text: "Processing chart patterns", subtext: "Evaluating price action..." },
      { icon: "chart", text: "Generating recommendation", subtext: "Finalizing..." }
    ]);

    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Provide a comprehensive technical analysis for ${symbol}:

Current Data:
- Price: $${stockData.price}
- Change: ${stockData.change}%
- RSI: ${indicators?.rsi}
- MACD: ${indicators?.macd?.value}
- Stochastic: ${indicators?.stochastic?.k}

Based on technical indicators, chart patterns, and current market conditions, provide:

1. Trading Recommendation: STRONG BUY / BUY / HOLD / SELL / STRONG SELL
2. Confidence Level: 1-100
3. Key Support Level (price)
4. Key Resistance Level (price)
5. Target Price (short-term)
6. Stop Loss Price
7. Detailed reasoning (3-4 bullet points explaining the recommendation with technical evidence)
8. Risk factors (2-3 bullet points)

Return structured JSON.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            recommendation: { 
              type: "string", 
              enum: ["STRONG BUY", "BUY", "HOLD", "SELL", "STRONG SELL"] 
            },
            confidence: { type: "number" },
            support_level: { type: "number" },
            resistance_level: { type: "number" },
            target_price: { type: "number" },
            stop_loss: { type: "number" },
            reasoning: {
              type: "array",
              items: { type: "string" }
            },
            risks: {
              type: "array",
              items: { type: "string" }
            }
          }
        }
      });

      setAnalysis(result);
    } catch (error) {
      console.error("Error analyzing stock:", error);
    }

    setIsAnalyzing(false);
    setThinkingSteps([]);
  };

  const getRecommendationColor = (rec) => {
    switch (rec) {
      case "STRONG BUY": return "from-green-600 to-emerald-600";
      case "BUY": return "from-green-500 to-green-600";
      case "HOLD": return "from-yellow-500 to-orange-500";
      case "SELL": return "from-red-500 to-red-600";
      case "STRONG SELL": return "from-red-600 to-red-700";
      default: return "from-gray-500 to-gray-600";
    }
  };

  const getRecommendationIcon = (rec) => {
    switch (rec) {
      case "STRONG BUY":
      case "BUY":
        return TrendingUp;
      case "SELL":
      case "STRONG SELL":
        return TrendingDown;
      default:
        return Minus;
    }
  };

  return (
    <Card className="bg-gradient-to-br from-white/10 to-white/5 border-2 border-purple-400/30 backdrop-blur-xl rounded-2xl p-6 shadow-2xl sticky top-24">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg">
          <Brain className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">AI Analysis</h3>
          <p className="text-sm text-purple-300">Trading recommendation</p>
        </div>
      </div>

      {!analysis && !isAnalyzing && (
        <Button
          onClick={handleAnalyze}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg py-6"
        >
          <Brain className="w-5 h-5 mr-2" />
          Analyze Chart
        </Button>
      )}

      <AnimatePresence mode="wait">
        {isAnalyzing && thinkingSteps.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <ThinkingAnimation steps={thinkingSteps} />
          </motion.div>
        )}

        {analysis && !isAnalyzing && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Recommendation Badge */}
            <div className={`p-6 rounded-2xl bg-gradient-to-br ${getRecommendationColor(analysis.recommendation)} text-white text-center`}>
              <div className="flex items-center justify-center gap-2 mb-2">
                {React.createElement(getRecommendationIcon(analysis.recommendation), { className: "w-8 h-8" })}
              </div>
              <h4 className="text-2xl font-bold mb-2">{analysis.recommendation}</h4>
              <div className="flex items-center justify-center gap-2">
                <div className="w-full bg-white/20 rounded-full h-2">
                  <div 
                    className="bg-white rounded-full h-2" 
                    style={{ width: `${analysis.confidence}%` }}
                  />
                </div>
                <span className="text-sm font-semibold">{analysis.confidence}%</span>
              </div>
            </div>

            {/* Price Targets */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-green-500/10 border border-green-400/20">
                <p className="text-xs text-green-300 mb-1">Target Price</p>
                <p className="text-lg font-bold text-white">${analysis.target_price?.toFixed(2)}</p>
              </div>
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-400/20">
                <p className="text-xs text-red-300 mb-1">Stop Loss</p>
                <p className="text-lg font-bold text-white">${analysis.stop_loss?.toFixed(2)}</p>
              </div>
              <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-400/20">
                <p className="text-xs text-purple-300 mb-1">Support</p>
                <p className="text-lg font-bold text-white">${analysis.support_level?.toFixed(2)}</p>
              </div>
              <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-400/20">
                <p className="text-xs text-cyan-300 mb-1">Resistance</p>
                <p className="text-lg font-bold text-white">${analysis.resistance_level?.toFixed(2)}</p>
              </div>
            </div>

            {/* Reasoning */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-purple-400" />
                Key Points
              </h4>
              <ul className="space-y-2">
                {analysis.reasoning?.map((reason, index) => (
                  <li key={index} className="text-sm text-gray-300 flex items-start gap-2">
                    <span className="text-purple-400 mt-1">•</span>
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Risks */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400" />
                Risk Factors
              </h4>
              <ul className="space-y-2">
                {analysis.risks?.map((risk, index) => (
                  <li key={index} className="text-sm text-gray-300 flex items-start gap-2">
                    <span className="text-red-400 mt-1">⚠</span>
                    <span>{risk}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Button
              onClick={handleAnalyze}
              variant="outline"
              className="w-full bg-white/5 border-white/10 text-gray-300 hover:bg-white/10"
            >
              Re-analyze
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}