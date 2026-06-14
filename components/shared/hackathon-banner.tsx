"use client";

import { useState, useEffect } from "react";
import { X, Trophy, Code } from "lucide-react";

export default function HackathonBanner() {
  const [isVisible, setIsVisible] = useState(true);
  const [isClosed, setIsClosed] = useState(false);

  useEffect(() => {
    // Check if user has closed the banner before
    const closed = localStorage.getItem("hackathonBannerClosed");
    if (closed) {
      setIsClosed(true);
    }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem("hackathonBannerClosed", "true");
  };

  if (isClosed || !isVisible) return null;

  return (
    <div className="w-full bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 text-white py-2 px-4 relative">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-center sm:gap-3 text-[10px] sm:text-xs md:text-sm font-medium pr-6 sm:pr-0">
        <div className="flex items-center gap-1.5 sm:gap-3">
          <Trophy className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 text-yellow-300" />
          <span className="text-center">
            Informatics MSU Hackathon 2026 <span className="hidden sm:inline">— AI Track</span>
          </span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-3">
          <span className="hidden sm:inline text-white/80">|</span>
          <span className="flex items-center gap-1 text-white/90">
            <Code className="h-3 w-3" />
            MSU เด้ง
          </span>
        </div>
        <button
          onClick={handleClose}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-white/20 rounded transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
