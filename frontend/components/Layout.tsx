'use client';

import Sidebar from './Sidebar';
import Header from './Header';
import Footer from './Footer';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#0E0E0F]">
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col">
        <Header />
        <main className="pt-16 p-6 flex-1">
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
}

