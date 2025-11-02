

import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const isHome = location.pathname === '/' || location.pathname === createPageUrl('Home');

  // Don't render layout on Home page
  if (isHome) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-purple-900 to-indigo-950">
      <style>{`
        :root {
          --purple-glow: #7C3AED;
          --cyan-glow: #22D3EE;
          --green-positive: #10B981;
          --red-negative: #EF4444;
        }
        
        @keyframes glow-pulse {
          0%, 100% { box-shadow: 0 0 20px rgba(124, 58, 237, 0.3); }
          50% { box-shadow: 0 0 40px rgba(124, 58, 237, 0.5); }
        }
        
        .glow-card {
          animation: glow-pulse 3s ease-in-out infinite;
        }
        
        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }
        
        .shimmer {
          background: linear-gradient(90deg, transparent, rgba(124, 58, 237, 0.1), transparent);
          background-size: 1000px 100%;
          animation: shimmer 3s infinite;
        }

        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: rgba(88, 28, 135, 0.3);
        }
        
        ::-webkit-scrollbar-thumb {
          background: rgba(124, 58, 237, 0.5);
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(124, 58, 237, 0.7);
        }
      `}</style>

      {/* Top Navigation */}
      <nav className="border-b border-purple-500/20 bg-purple-950/40 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to={createPageUrl("Home")} className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-purple-500/50">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L8 6v3H6v13h12V9h-2V6l-4-4zm0 2.5L14 6.5V9h-4V6.5l2-2zM8 11h8v9H8v-9zm2 2v2h4v-2h-4zm0 3v2h4v-2h-4z"/>
                  <path d="M11 2h2v3h-2zM9 4h2v2H9zM13 4h2v2h-2z"/>
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                  Bloom
                </h1>
                <p className="text-xs text-purple-300">AI Market Intelligence</p>
              </div>
            </Link>
            
            <div className="flex items-center gap-6">
              <div className="hidden md:flex items-center gap-1 px-3 py-1.5 rounded-full bg-purple-500/20 border border-purple-400/30">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                <span className="text-xs text-purple-200">Live Data</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-[1600px] mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  );
}

