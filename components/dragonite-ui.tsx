'use client';

import { ReactNode } from 'react';
import { Sparkles } from 'lucide-react';

export function DragoniteLogo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const dims = { sm: 'w-6 h-6', md: 'w-8 h-8', lg: 'w-12 h-12' };
  const text = { sm: 'text-sm', md: 'text-lg', lg: 'text-2xl' };
  return (
    <div className="flex items-center gap-2 select-none">
      <div className={`relative ${dims[size]}`}>
        <svg viewBox="0 0 48 48" className="w-full h-full">
          <defs>
            <radialGradient id="ballGrad" cx="50%" cy="40%">
              <stop offset="0%" stopColor="#FB923C" />
              <stop offset="60%" stopColor="#F97316" />
              <stop offset="100%" stopColor="#EA580C" />
            </radialGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="1.5" result="blur"/>
              <feMerge>
                <feMergeNode in="blur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          <circle cx="24" cy="24" r="22" fill="url(#ballGrad)" filter="url(#glow)" />
          <path d="M 2 24 A 22 22 0 0 1 46 24 Z" fill="#0F172A" opacity="0.92"/>
          <rect x="2" y="22" width="44" height="4" fill="#E2E8F0" rx="2"/>
          <circle cx="24" cy="24" r="6" fill="#0F172A" stroke="#FACC15" strokeWidth="2"/>
          <circle cx="24" cy="24" r="3" fill="#FACC15" />
        </svg>
      </div>
      <span className={`${text[size]} font-bold tracking-tight`}>
        <span className="dragon-gradient-text">DRAGONITE</span>
        <span className="text-slate-400">.DEV</span>
      </span>
    </div>
  );
}

export function PokeballSpinner({ size = 40 }: { size?: number }) {
  return (
    <div className="flex items-center justify-center">
      <svg width={size} height={size} viewBox="0 0 48 48" className="pokeball-spin">
        <circle cx="24" cy="24" r="22" fill="#1E293B" stroke="#F97316" strokeWidth="2"/>
        <path d="M 2 24 A 22 22 0 0 1 46 24 Z" fill="#F97316" opacity="0.85"/>
        <rect x="2" y="22" width="44" height="4" fill="#E2E8F0" rx="2"/>
        <circle cx="24" cy="24" r="6" fill="#1E293B" stroke="#FACC15" strokeWidth="2"/>
        <circle cx="24" cy="24" r="3" fill="#FACC15" />
      </svg>
    </div>
  );
}

export function LoadingScreen({ message = 'Đang tải...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <PokeballSpinner size={56} />
      <p className="text-slate-400 text-sm">{message}</p>
    </div>
  );
}

export function SectionHeader({ title, subtitle, icon, action }: {
  title: string; subtitle?: string; icon?: ReactNode; action?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
      <div className="flex items-center gap-3">
        {icon && <div className="text-orange-500">{icon}</div>}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-100">{title}</h1>
          {subtitle && <p className="text-sm text-slate-400 mt-1">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}

export function EmptyState({ icon, title, description, action }: {
  icon?: ReactNode; title: string; description?: string; action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {icon && <div className="text-slate-600 mb-4">{icon}</div>}
      <h3 className="text-lg font-semibold text-slate-300">{title}</h3>
      {description && <p className="text-sm text-slate-500 mt-1 max-w-md">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function FeatureBadge({ icon, children, className = '' }: {
  icon?: ReactNode; children: ReactNode; className?: string;
}) {
  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-800/60 border border-slate-700 ${className}`}>
      {icon && <span className="w-3 h-3">{icon}</span>}
      {children}
    </div>
  );
}
