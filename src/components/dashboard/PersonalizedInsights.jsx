import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { Sparkles, TrendingUp, X, Lightbulb } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function PersonalizedInsights({ stocks }) {
  const [insights, setInsights] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [dismissed, setDismissed] = useState([]);

  useEffect(() => {
    if (stocks.length > 0) {
      generateInsights();
    }
  }, [stocks]);

  const generateInsights = async () => {
    if (isGenerating) return;
    
    setIsGenerating(true);
    try {
      const user = await base44.auth.me();
      const prefs = await base44.entities.UserPreference.filter({ created_by: user.email });
      const userPref = prefs[0];

      const queryHistory = userPref?.query_history || [];
      const recentQueries = queryHistory.slice(-10);
      
      // Detect user interests
      const interests = detectInterests(recentQueries, stocks);

      if (interests.length > 0) {
        const result = await base44.integrations.Core.InvokeLLM({
          prompt: `Based on a user's interest in ${interests.join(", ")}, generate 2-3 BRIEF, actionable market insights for today. 
          
Each insight should be:
- One sentence or short phrase
- Focused on trends, opportunities, or risks
- Related to their interests
- Backed by current market data

Return as JSON array of insight strings.`,
          add_context_from_internet: true,
          response_json_schema: {
            type: "object",
            properties: {
              insights: {
                type: "array",
                items: { type: "string" }
              }
            }
          }
        });

        const newInsights = result.insights || [];
        const insightsShown = userPref?.insights_shown || [];
        
        // Filter out already shown insights
        const freshInsights = newInsights.filter(i => !insightsShown.includes(i));
        
        setInsights(freshInsights);

        // Update user preferences
        if (userPref && freshInsights.length > 0) {
          await base44.entities.UserPreference.update(userPref.id, {
            ...userPref,
            insights_shown: [...insightsShown, ...freshInsights].slice(-50)
          });
        }
      }
    } catch (error) {
      console.error("Error generating insights:", error);
    }
    setIsGenerating(false);
  };

  const detectInterests = (queries, stocks) => {
    const interests = new Set();
    
    // From watchlist
    stocks.forEach(stock => {
      interests.add(stock.symbol);
    });

    // From query history
    queries.forEach(q => {
      if (q.category === 'tech') interests.add('technology stocks');
      if (q.category === 'finance') interests.add('financial sector');
      if (q.category === 'energy') interests.add('energy sector');
    });

    return Array.from(interests).slice(0, 5);
  };

  const handleDismiss = (index) => {
    setDismissed(prev => [...prev, index]);
  };

  const visibleInsights = insights.filter((_, index) => !dismissed.includes(index));

  if (visibleInsights.length === 0 || isGenerating) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
      >
        <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-400/30 backdrop-blur-xl rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex-shrink-0">
              <Lightbulb className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                Personalized Insights for You
              </h3>
              <div className="space-y-2">
                {visibleInsights.map((insight, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start gap-2 group"
                  >
                    <TrendingUp className="w-3 h-3 text-purple-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-200 flex-1">{insight}</p>
                    <Button
                      onClick={() => handleDismiss(index)}
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3 text-gray-400" />
                    </Button>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}