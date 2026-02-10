'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const isLoggedIn = typeof window !== 'undefined' && localStorage.getItem('token');

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/events', label: 'Log Event' },
    { href: '/batches', label: 'Merkle Batches' },
    { href: '/verify', label: 'Verification' },
  ];

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('username');
      router.push('/login');
    }
  };

  return (
    <header className="h-20 sticky top-0 z-50 glass border-b border-[#2A2A2C] shadow-lg">
      <div className="max-w-7xl mx-auto px-6 md:px-8 h-full flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6C4EFF] via-[#944BFF] to-[#6C4EFF] shadow-lg shadow-[#6C4EFF]/30 group-hover:shadow-[#6C4EFF]/50 transition-all duration-300 transform group-hover:scale-110"></div>
          <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            AuditChain
          </span>
        </Link>
        
        <nav className="flex gap-8 text-sm font-medium">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative pb-1.5 px-2 py-1 rounded-lg transition-all duration-200 ${
                  isActive 
                    ? 'text-white bg-white/10 shadow-sm' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            <>
              {typeof window !== 'undefined' && localStorage.getItem('username') && (
                <span className="hidden sm:block text-xs text-gray-400 px-3 py-1.5 rounded-full glass border border-white/10">
                  {localStorage.getItem('username')}
                </span>
              )}
              <button
                onClick={handleLogout}
                className="text-xs glass border border-white/10 px-4 py-2 rounded-full hover:border-[#6C4EFF] transition-all duration-200"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="text-xs glass border border-white/10 px-4 py-2 rounded-full hover:border-[#6C4EFF] transition-all duration-200"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

