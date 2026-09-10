import React from 'react';
import { MapPin, Clock, Phone, Award, ShieldCheck } from 'lucide-react';
import { getRgba } from '../utils/theme';

interface ShopBannerProps {
  themeColor: string;
}

export const ShopBanner: React.FC<ShopBannerProps> = ({ themeColor }) => {
  return (
    <div className="border-b border-neutral-800/60 bg-neutral-900/30 text-xs text-neutral-400 py-2.5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-4 sm:gap-6">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-neutral-500" />
            <span>Av. Paulista, 1200 — Jardins, SP</span>
          </div>

          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-neutral-500" />
            <span>Seg a Sáb: 09h às 20h</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-neutral-300">
            <ShieldCheck className="w-3.5 h-3.5" style={{ color: themeColor }} />
            <span>Atendimento Personalizado & Toalha Quente</span>
          </div>
        </div>
      </div>
    </div>
  );
};
