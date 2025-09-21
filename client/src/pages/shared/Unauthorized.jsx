import React, { useState, useEffect } from "react";
import { AlertTriangle, Lock, Home, ArrowLeft, RefreshCw } from "lucide-react";
const Unauthorized = () => {
  const [glitchEffect, setGlitchEffect] = useState(false);
  const [isAnimating, setIsAnimating] = useState(true);
  useEffect(() => {
    const interval = setInterval(() => {
      setGlitchEffect(true);
      setTimeout(() => setGlitchEffect(false), 200);
    }, 3000);
    const animationTimer = setTimeout(() => setIsAnimating(false), 500);
    return () => clearInterval(interval);
    clearTimeout(animationTimer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-gray-900 to-black flex items-center justify-center relative overflow-hidden">
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: "50px 50px",
          }}
        ></div>
      </div>

      {/* Animated warning strips */}
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-500 to-yellow-500 animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-yellow-500 to-red-500 animate-pulse"></div>

      <div
        className={`text-center z-10 px-8 transform transition-all duration-500 ${
          isAnimating ? "scale-95 opacity-0" : "scale-100 opacity-100"
        }`}
      >
        {/* 401 Text with glitch effect */}
        <div className="relative mb-8">
          <h1
            className={`text-8xl md:text-[10rem] font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400 transition-all duration-200 ${
              glitchEffect ? "animate-pulse filter blur-sm" : ""
            }`}
          >
            401
          </h1>
          {glitchEffect && (
            <>
              <div className="absolute inset-0 text-8xl md:text-[10rem] font-black text-red-500 transform translate-x-1 translate-y-1 opacity-70">
                401
              </div>
              <div className="absolute inset-0 text-8xl md:text-[10rem] font-black text-cyan-500 transform -translate-x-1 -translate-y-1 opacity-70">
                401
              </div>
            </>
          )}
        </div>

        {/* Lock icon with security animation */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl flex items-center justify-center transform rotate-3 hover:rotate-0 transition-transform duration-300">
              <Lock className="w-12 h-12 text-white" />
            </div>
            <div className="absolute inset-0 w-24 h-24 bg-red-500 rounded-2xl blur-lg opacity-30 animate-ping"></div>
          </div>
        </div>

        {/* Message */}
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Access Denied
        </h2>
        <p className="text-xl text-gray-300 mb-12 max-w-lg mx-auto leading-relaxed">
          You don't have permission to access this resource. Please check your
          credentials or contact an administrator.
        </p>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button className="group bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white px-8 py-4 rounded-xl font-semibold flex items-center gap-3 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-red-500/25">
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            Go Back
          </button>
          <button className="group bg-gray-800 hover:bg-gray-700 text-white px-8 py-4 rounded-xl font-semibold flex items-center gap-3 transform hover:scale-105 transition-all duration-300 border border-gray-600 hover:border-gray-500">
            <Lock className="w-5 h-5 group-hover:scale-110 transition-transform" />
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
