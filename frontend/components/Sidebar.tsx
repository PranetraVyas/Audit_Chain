'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  FileText, 
  PlusCircle, 
  Network, 
  ShieldCheck, 
  Settings,
  Building2,
  Link as LinkIcon
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/audit-logs', label: 'Audit Logs', icon: FileText },
  { href: '/insert-event', label: 'Insert Event', icon: PlusCircle },
  { href: '/merkle-batches', label: 'Merkle Batches', icon: Network },
  { href: '/verification', label: 'Verification', icon: ShieldCheck },
  { href: '/verification/blockchain', label: 'Blockchain Verification', icon: LinkIcon },
  { href: '/architecture', label: 'Architecture', icon: Building2 },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-[#1a1a24] border-r border-[#2A2A2C] flex flex-col h-screen fixed left-0 top-0 z-40">
      {/* Logo */}
      <div className="p-6 border-b border-[#2A2A2C]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#6C4EFF] to-[#944BFF] flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="text-white font-bold text-lg">AuditChain</div>
            <div className="text-gray-400 text-xs">ML AUDIT SYSTEM</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-[#6C4EFF] text-white shadow-lg shadow-[#6C4EFF]/30'
                  : 'text-gray-400 hover:bg-[#2A2A2C] hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Version */}
      <div className="p-4 border-t border-[#2A2A2C] text-center">
        <div className="text-gray-500 text-xs">VERSION 1.0.0</div>
        <div className="text-gray-600 text-xs mt-1">RESEARCH BUILD</div>
      </div>
    </aside>
  );
}





