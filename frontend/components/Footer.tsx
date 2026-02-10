'use client';

import Link from 'next/link';
import { Github, FileText, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-auto py-6 px-6 border-t border-[#2A2A2C] bg-[#161618]">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-sm text-gray-500">
          Blockchain-Backed ML Audit Logging System — Research Project
        </div>
        <div className="flex items-center gap-6">
          <Link
            href="#"
            className="text-sm text-gray-400 hover:text-[#6C4EFF] transition-colors flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            Documentation
          </Link>
          <Link
            href="#"
            className="text-sm text-gray-400 hover:text-[#6C4EFF] transition-colors flex items-center gap-2"
          >
            <Github className="w-4 h-4" />
            GitHub
          </Link>
          <Link
            href="#"
            className="text-sm text-gray-400 hover:text-[#6C4EFF] transition-colors flex items-center gap-2"
          >
            <Mail className="w-4 h-4" />
            Contact
          </Link>
        </div>
      </div>
    </footer>
  );
}






