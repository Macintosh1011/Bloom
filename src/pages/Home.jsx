
import React, { useRef } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingUp, Sparkles, Brain } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const featuresRef = useRef(null);

  // The scrollToFeatures function is removed as the "Learn More" button is removed.
  // const scrollToFeatures = () => {
  //   featuresRef.current?.scrollIntoView({ behavior: 'smooth' });
  // };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden flex flex-col">
      {/* Animated Purple Glow Background */}
      <div className="absolute inset-0">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-purple-600 rounded-full blur-[150px]"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
          className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-indigo-600 rounded-full blur-[120px]"
        />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 border-b border-white/5 bg-black/20 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L8 6v3H6v13h12V9h-2V6l-4-4zm0 2.5L14 6.5V9h-4V6.5l2-2zM8 11h8v9H8v-9zm2 2v2h4v-2h-4zm0 3v2h4v-2h-4z"/>
                  <path d="M11 2h2v3h-2zM9 4h2v2H9zM13 4h2v2h-2z"/>
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                  Bloom
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <Link to={createPageUrl("Dashboard")} className="text-sm text-gray-300 hover:text-white transition-colors">
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-6">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-purple-400/30 bg-purple-500/10 backdrop-blur-sm mb-8">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-purple-300">Powered by AI</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Watch your portfolio
              <br />
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                bloom with insight
              </span>
            </h1>

            <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
              AI-powered market intelligence that transforms real-time data into actionable insights.
              Make smarter investment decisions with Bloom.
            </p>

            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Link to={createPageUrl("Dashboard")}>
                <Button
                  size="lg"
                  className="bg-white text-black hover:bg-gray-100 text-lg px-8 py-6 rounded-full font-semibold group"
                >
                  Get Started
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              {/* The "Learn More" button is removed */}
              {/* <Button
                onClick={scrollToFeatures}
                size="lg"
                variant="outline"
                className="border-white/20 text-black hover:bg-white/10 text-lg px-8 py-6 rounded-full font-semibold"
              >
                Learn More
              </Button> */}
            </div>
          </motion.div>

          {/* Feature Cards */}
          <motion.div
            ref={featuresRef}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="grid md:grid-cols-3 gap-6 mt-24"
          >
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Real-Time Data</h3>
              <p className="text-sm text-gray-400">
                Live market data, stock prices, and economic indicators updated every minute.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center mb-4">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">AI Analysis</h3>
              <p className="text-sm text-gray-400">
                Intelligent insights powered by advanced AI that explains market movements.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Personalized</h3>
              <p className="text-sm text-gray-400">
                Custom insights based on your watchlist and investment interests.
              </p>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 bg-black/20 backdrop-blur-xl py-6">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-sm text-gray-500">
            © 2025 Bloom. AI-powered market intelligence platform.
          </p>
        </div>
      </footer>
    </div>
  );
}
