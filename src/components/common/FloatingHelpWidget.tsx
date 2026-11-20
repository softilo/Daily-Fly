'use client';

import Link from 'next/link';
import { MessageSquare, Search } from 'lucide-react';
import { useBrand } from '@/components/providers/BrandProvider';

export function FloatingHelpWidget() {
  const brand = useBrand();
  const cleanWhatsapp = brand.whatsapp.replace(/[^0-9]/g, '');

  return (
    <div className="fixed right-4 bottom-4 z-40 flex items-center gap-2">
      <Link
        href="/track-status"
        className="flex items-center gap-1.5 rounded-full border border-[#0A3A23]/20 bg-white/95 px-3.5 py-2 text-xs font-bold text-[#0A3A23] shadow-lg backdrop-blur transition hover:border-[#D9822B] hover:bg-[#FEF3E2]"
      >
        <Search className="h-3.5 w-3.5 text-[#D9822B]" />
        <span>Track File</span>
      </Link>
      <a
        href={`https://wa.me/${cleanWhatsapp}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 rounded-full border border-[#D9822B] bg-[#0A3A23] px-4 py-2 text-xs font-bold text-white shadow-lg transition hover:bg-[#062416]"
      >
        <MessageSquare className="h-3.5 w-3.5 text-[#F7D29E]" />
        <span className="hidden sm:inline">WhatsApp Help</span>
        <span className="sm:hidden">Chat</span>
      </a>
    </div>
  );
}
