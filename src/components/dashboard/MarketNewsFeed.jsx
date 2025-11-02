import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { Newspaper, TrendingUp, TrendingDown, Minus, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import ThinkingAnimation from "@/components/dashboard/ThinkingAnimation";

export default function MarketNewsFeed({ newsItems }) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [thinkingSteps, setThinkingSteps] = useState([]);

  const handleRefreshNews = async () => {
    setIsRefreshing(true);
    setThinkingSteps([
      { icon: "database", text: "Uploading resources to Captain", subtext: "Connecting..." },
      { icon: "sparkles", text: "Fetching latest market news", subtext: "Scanning sources..." },
      { icon: "brain", text: "Analyzing sentiment", subtext: "Processing headlines..." },
      { icon: "chart", text: "Compiling news feed", subtext: "Finalizing..." }
    ]);

    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Get the top 5 CURRENT market news headlines from today with sentiment analysis.

For each headline provide:
- headline (string)
- summary (brief 1 sentence summary)
- sentiment (positive/negative/neutral)
- source (news source)

Return as JSON array.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            news: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  headline: { type: "string" },
                  summary: { type: "string" },
                  sentiment: { type: "string", enum: ["positive", "negative", "neutral"] },
                  source: { type: "string" }
                }
              }
            }
          }
        }
      });

      // Save news items
      for (const newsItem of result.news || []) {
        try {
          await base44.entities.NewsItem.create({
            symbol: "MARKET",
            headline: newsItem.headline,
            summary: newsItem.summary,
            sentiment: newsItem.sentiment,
            sentiment_score: newsItem.sentiment === "positive" ? 0.7 : newsItem.sentiment === "negative" ? -0.7 : 0,
            source: newsItem.source,
            published_date: new Date().toISOString()
          });
        } catch (e) {
          console.log("Could not save news item");
        }
      }

      window.location.reload();
    } catch (error) {
      console.error("Error refreshing news:", error);
    }

    setIsRefreshing(false);
    setThinkingSteps([]);
  };

  const getSentimentIcon = (sentiment) => {
    switch (sentiment) {
      case "positive": return TrendingUp;
      case "negative": return TrendingDown;
      default: return Minus;
    }
  };

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case "positive": return "bg-green-500/20 text-green-400 border-green-500/30";
      case "negative": return "bg-red-500/20 text-red-400 border-red-500/30";
      default: return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  return (
    <Card className="bg-white/5 border-white/10 backdrop-blur-xl rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500 to-red-500">
            <Newspaper className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Market News</h3>
            <p className="text-sm text-gray-400">Latest headlines with sentiment</p>
          </div>
        </div>
        <Button
          onClick={handleRefreshNews}
          disabled={isRefreshing}
          variant="outline"
          size="sm"
          className="bg-white/5 border-white/10 text-gray-300 hover:bg-white/10"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {isRefreshing && thinkingSteps.length > 0 ? (
        <ThinkingAnimation steps={thinkingSteps} />
      ) : (
        <div className="space-y-3">
          {newsItems.length === 0 ? (
            <div className="text-center py-8">
              <Newspaper className="w-8 h-8 text-gray-600 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No news available</p>
              <p className="text-xs text-gray-600 mt-1">Click refresh to fetch latest headlines</p>
            </div>
          ) : (
            newsItems.map((news, index) => {
              const SentimentIcon = getSentimentIcon(news.sentiment);
              return (
                <motion.div
                  key={news.id || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group"
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${getSentimentColor(news.sentiment)} flex-shrink-0`}>
                      <SentimentIcon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h4 className="text-sm font-semibold text-white leading-tight">
                          {news.headline}
                        </h4>
                        <Badge className={`${getSentimentColor(news.sentiment)} border text-xs flex-shrink-0`}>
                          {news.sentiment}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-400 mb-2">{news.summary}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>{news.source}</span>
                        <span>•</span>
                        <span>{new Date(news.published_date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      )}
    </Card>
  );
}