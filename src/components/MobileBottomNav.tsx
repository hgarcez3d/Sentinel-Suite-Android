import React from 'react';
import {
  Network,
  Radio,
  Bot,
  Shield,
  ShieldAlert,
  FileText,
  Anchor
} from 'lucide-react';

export type MobileTab = 'topology' | 'radar' | 'agents' | 'threat_intel' | 'wisdom_dossier';

interface MobileBottomNavProps {
  activeTab: MobileTab;
  onSelectTab: (tab: MobileTab) => void;
  criticalCount: number;
  unresolvedBeaconsCount: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onSelectTab,
  criticalCount,
  unresolvedBeaconsCount
}) => {
  const tabs = [
    {
      id: 'topology' as MobileTab,
      label: 'Network',
      icon: Network,
      badge: criticalCount > 0 ? criticalCount : null,
      badgeColor: 'bg-red-500'
    },
    {
      id: 'radar' as MobileTab,
      label: 'Physical Defense',
      icon: Shield,
      badge: unresolvedBeaconsCount > 0 ? unresolvedBeaconsCount : null,
      badgeColor: 'bg-amber-500'
    },
    {
      id: 'agents' as MobileTab,
      label: 'Agent Squad',
      icon: Bot,
      badge: null,
      badgeColor: 'bg-cyan-500'
    },
    {
      id: 'threat_intel' as MobileTab,
      label: 'Threat AI',
      icon: ShieldAlert,
      badge: 'AI',
      badgeColor: 'bg-purple-600'
    },
    {
      id: 'wisdom_dossier' as MobileTab,
      label: 'Popeye Hub',
      icon: Anchor,
      badge: null,
      badgeColor: 'bg-amber-500'
    }
  ];

  return (
    <nav className="shrink-0 bg-[#090e1a]/98 backdrop-blur-lg border-t border-slate-800/90 px-1 pt-1.5 pb-2 pb-safe z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.5)]">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all relative ${
                isActive
                  ? 'text-[#00e5ff] scale-105'
                  : 'text-slate-400 hover:text-slate-200 active:scale-95'
              }`}
            >
              {/* Active Tab Glow Pill Indicator */}
              {isActive && (
                <span className="absolute -top-1.5 w-6 h-0.5 rounded-full bg-[#00e5ff] shadow-[0_0_8px_#00e5ff]" />
              )}

              <div className="relative">
                <Icon size={19} className={isActive ? 'text-[#00e5ff]' : 'text-slate-400'} />
                {tab.badge !== null && (
                  <span
                    className={`absolute -top-1 -right-2 px-1 py-0.2 min-w-[14px] text-[8.5px] font-mono font-bold text-white rounded-full flex items-center justify-center border border-slate-900 ${tab.badgeColor}`}
                  >
                    {tab.badge}
                  </span>
                )}
              </div>

              <span
                className={`text-[9.5px] font-bold tracking-tight mt-0.5 transition-colors ${
                  isActive ? 'text-white font-extrabold' : 'text-slate-400'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
