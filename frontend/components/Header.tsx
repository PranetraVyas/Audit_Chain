'use client';

import { Search, Bell, Wallet } from 'lucide-react';

export default function Header() {
  return (
    <header className="h-16 bg-[#161618] border-b border-[#2A2A2C] flex items-center justify-between px-6 fixed top-0 left-64 right-0 z-30">
      {/* Search Bar */}
      <div className="flex-1 max-w-2xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search events, batches, hashes..."
            className="w-full pl-10 pr-4 py-2 bg-[#1B1B1D] border border-[#2A2A2C] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#6C4EFF] transition-colors"
          />
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-4">
        <button className="p-2 text-gray-400 hover:text-white transition-colors">
          <Bell className="w-5 h-5" />
        </button>
        <button className="p-2 text-gray-400 hover:text-white transition-colors">
          <Wallet className="w-5 h-5" />
        </button>
        <button className="px-4 py-2 bg-[#6C4EFF] hover:bg-[#5a3fe6] text-white rounded-lg font-medium transition-colors flex items-center gap-2">
          <Wallet className="w-4 h-4" />
          Connect Wallet
        </button>
      </div>
    </header>
  );
}






