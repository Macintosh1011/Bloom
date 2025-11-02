import React, { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { base44 } from "@/api/base44Client";
import { Send, Zap, Brain } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import CopilotMessage from "@/components/dashboard/CopilotMessage";
import ThinkingAnimation from "@/components/dashboard/ThinkingAnimation";

export default function CopilotPanel({ marketData, onVisualizationRequest }) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "👋 Hello! I'm Bloom, your AI market analyst. Ask me about current market conditions, specific stocks, trends, or get real-time stock analysis.",
      timestamp: new Date().toISOString()
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [thinkingSteps, setThinkingSteps] = useState([]);
  const [hasVisualization, setHasVisualization] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const suggestedPrompts = [
    "What's the current price of AAPL?",
    "Compare Tesla vs Rivian stock performance",
    "Explain today's market movements"
  ];

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = {
      role: "user",
      content: input,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    const userQuery = input;
    setInput("");
    setIsLoading(true);

    setThinkingSteps([
      { icon: "database", text: "Uploading resources to Captain", subtext: "Preparing context..." },
      { icon: "sparkles", text: "Fetching real-time market data", subtext: "Searching financial sources..." },
      { icon: "brain", text: "Analyzing with AI", subtext: "Processing insights..." },
      { icon: "chart", text: "Generating response", subtext: "Finalizing analysis..." }
    ]);

    try {
      try {
        const user = await base44.auth.me();
        const prefs = await base44.entities.UserPreference.filter({ created_by: user.email });
        const userPref = prefs[0];
        
        const queryHistory = userPref?.query_history || [];
        queryHistory.push({
          query: userQuery,
          timestamp: new Date().toISOString(),
          category: detectCategory(userQuery)
        });

        if (userPref) {
          await base44.entities.UserPreference.update(userPref.id, {
            ...userPref,
            query_history: queryHistory.slice(-50)
          });
        } else {
          await base44.entities.UserPreference.create({
            query_history: queryHistory,
            favorite_sectors: [],
            insights_shown: []
          });
        }
      } catch (e) {
        console.log("Could not save query history");
      }

      const context = marketData ? `
Current Market Data:
- NASDAQ: ${marketData.nasdaq} (${marketData.nasdaq_change > 0 ? '+' : ''}${marketData.nasdaq_change}%)
- S&P 500: ${marketData.sp500} (${marketData.sp500_change > 0 ? '+' : ''}${marketData.sp500_change}%)
- Fed Funds Rate: ${marketData.fed_rate}%
- CPI: ${marketData.cpi}
- Market Mood: ${marketData.market_mood}
` : '';

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are Bloom, an expert AI financial analyst with access to REAL-TIME market data and news. 

${context}

User question: ${userQuery}

If the user asks about a specific stock, use real-time internet data to get:
1. CURRENT price and change %
2. Latest news sentiment and headlines
3. Technical analysis if relevant

Provide a clear, professional, data-driven analysis using current market information. If the question relates to visualizing data or comparing metrics, include a JSON object at the end of your response in this exact format:
VISUALIZATION: {"type": "correlation", "metrics": ["nasdaq", "sp500"]}

Keep your main response conversational and insightful. Only add the VISUALIZATION tag if relevant.`,
        add_context_from_internet: true
      });

      let assistantContent = response;
      let visualizationData = null;

      if (typeof response === 'string' && response.includes('VISUALIZATION:')) {
        const parts = response.split('VISUALIZATION:');
        assistantContent = parts[0].trim();
        try {
          visualizationData = JSON.parse(parts[1].trim());
          setHasVisualization(true);
        } catch (e) {
          console.error("Failed to parse visualization data");
        }
      }

      const assistantMessage = {
        role: "assistant",
        content: assistantContent,
        timestamp: new Date().toISOString(),
        visualization: visualizationData
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error getting AI response:", error);
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "I apologize, but I encountered an error analyzing that request. Please try again.",
        timestamp: new Date().toISOString()
      }]);
    }

    setIsLoading(false);
    setThinkingSteps([]);
  };

  const detectCategory = (query) => {
    const lower = query.toLowerCase();
    if (lower.match(/aapl|apple|msft|microsoft|googl|google|amzn|amazon|meta|fb|tesla|tsla|nvda|nvidia/)) {
      return 'tech';
    }
    if (lower.match(/bank|finance|jpm|goldman|wells fargo/)) {
      return 'finance';
    }
    if (lower.match(/energy|oil|gas|chevron|exxon/)) {
      return 'energy';
    }
    return 'general';
  };

  const handleVisualize = () => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.visualization) {
      const vizData = {
        type: lastMessage.visualization.type || "correlation",
        data: Array.from({ length: 20 }, (_, i) => ({
          time: `${i}h`,
          value: marketData?.nasdaq + (Math.random() - 0.5) * 200,
          sp500: marketData?.sp500 + (Math.random() - 0.5) * 50
        }))
      };
      onVisualizationRequest(vizData);
      setHasVisualization(false);
    }
  };

  const handlePromptClick = (prompt) => {
    setInput(prompt);
  };

  return (
    <Card className="bg-gradient-to-br from-white/10 to-white/5 border-2 border-purple-400/30 backdrop-blur-xl rounded-2xl flex flex-col h-[580px] shadow-2xl">
      <div className="p-6 border-b border-purple-400/20">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Bloom Copilot</h3>
            <p className="text-sm text-purple-300">Real-time market intelligence</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message, index) => (
            <CopilotMessage key={index} message={message} />
          ))}
        </AnimatePresence>

        {isLoading && thinkingSteps.length > 0 && (
          <ThinkingAnimation steps={thinkingSteps} />
        )}

        <div ref={messagesEndRef} />
      </div>

      {messages.length <= 1 && (
        <div className="px-4 pb-3">
          <p className="text-xs text-purple-300 mb-2 font-medium">Try asking:</p>
          <div className="flex flex-col gap-2">
            {suggestedPrompts.map((prompt, index) => (
              <button
                key={index}
                onClick={() => handlePromptClick(prompt)}
                className="text-xs px-3 py-2 rounded-lg bg-purple-500/10 border border-purple-400/20 text-purple-200 hover:bg-purple-500/20 transition-all text-left"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="p-4 border-t border-purple-400/20">
        {hasVisualization && (
          <Button
            onClick={handleVisualize}
            className="w-full mb-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg"
          >
            <Zap className="w-4 h-4 mr-2" />
            Visualize It
          </Button>
        )}
        
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about any stock or market..."
            className="flex-1 bg-purple-950/30 border-purple-400/30 text-white placeholder:text-purple-300/50 focus:border-purple-400"
            disabled={isLoading}
          />
          <Button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}