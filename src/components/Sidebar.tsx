'use client';

import {
  LayoutDashboard, MessageSquare, Kanban, FolderKanban, Calendar,
  Brain, FileText, BarChart3, UsersRound,
  Monitor, Plug, Settings, ChevronDown, Search, X
} from 'lucide-react';
import { useEffect } from 'react';

interface SidebarProps {
  onNavigate: (screen: string) => void;
  activeScreen: string;
  isMobileMenuOpen: boolean;
  onMobileMenuClose: () => void;
}

const mainNav = [
  { id: 'fleet', label: 'Fleet Overview', icon: LayoutDashboard },
  { id: 'command', label: 'Command Center', icon: MessageSquare },
  { id: 'standups', label: 'Standups', icon: UsersRound },
  { id: 'tasks', label: 'Task Board', icon: Kanban },
  { id: 'projects', label: 'Projects', icon: FolderKanban },
  { id: 'calendar', label: 'Calendar', icon: Calendar },
];

const toolsNav = [
  { id: 'memory', label: 'Memory', icon: Brain },
  { id: 'docs', label: 'Documents', icon: FileText },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
];

const systemNav = [
  { id: 'system', label: 'System', icon: Monitor },
  { id: 'integrations', label: 'Integrations', icon: Plug },
  { id: 'settings', label: 'Settings', icon: Settings },
];

function NavSection({ label, items, activeScreen, onNavigate, onMobileClose }: {
  label: string;
  items: typeof mainNav;
  activeScreen: string;
  onNavigate: (screen: string) => void;
  onMobileClose: () => void;
}) {
  return (
    <div className="mb-5">
      <div className="px-5 mb-1.5">
        <span className="text-[11px] font-medium uppercase tracking-widest text-zinc-500/70">
          {label}
        </span>
      </div>
      <div className="space-y-[1px] px-3">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeScreen === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                onNavigate(item.id);
                onMobileClose();
              }}
              className={`
                w-full flex items-center gap-3 px-3 h-[44px] md:h-[34px] text-[13px] rounded-lg
                transition-all duration-150 cursor-pointer relative
                ${isActive
                  ? 'bg-white/[0.08] text-white font-medium shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
                }
              `}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 bg-blue-500 rounded-r-full" />
              )}
              <Icon size={16} className={`flex-shrink-0 ${isActive ? 'text-blue-400' : 'opacity-60'}`} strokeWidth={isActive ? 2 : 1.5} />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function Sidebar({ onNavigate, activeScreen, isMobileMenuOpen, onMobileMenuClose }: SidebarProps) {
  // Close menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileMenuOpen) {
        onMobileMenuClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isMobileMenuOpen, onMobileMenuClose]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  return (
    <>
      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={onMobileMenuClose}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-50
        w-[280px] md:w-[240px] md:min-w-[240px] h-screen 
        flex flex-col bg-[#0f0f12] border-r border-[#1e1e24] select-none
        transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="h-[56px] flex items-center gap-2.5 px-5 border-b border-[#1e1e24] flex-shrink-0">
          <div className="w-[28px] h-[28px] rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-[12px] font-bold">M</span>
          </div>
          <div className="flex items-center gap-1.5 cursor-pointer group flex-1">
            <span className="text-[14px] font-semibold text-white tracking-tight">Mission Control</span>
            <ChevronDown size={14} className="text-zinc-500 group-hover:text-zinc-300 transition-colors" />
          </div>
          {/* Mobile close button */}
          <button
            onClick={onMobileMenuClose}
            className="md:hidden p-2 -mr-2 text-zinc-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Search */}
        <div className="px-3 pt-4 pb-2">
          <div className="flex items-center gap-2 px-3 h-[44px] md:h-[32px] bg-white/[0.04] border border-[#27272a] rounded-lg text-zinc-500 text-[12px] cursor-pointer hover:bg-white/[0.06] hover:border-[#3f3f46] transition-all">
            <Search size={13} className="flex-shrink-0" />
            <span>Search...</span>
            <span className="ml-auto text-[10px] text-zinc-600 bg-white/[0.06] px-1.5 py-0.5 rounded font-mono">⌘K</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto pt-2 pb-4">
          <NavSection label="Main" items={mainNav} activeScreen={activeScreen} onNavigate={onNavigate} onMobileClose={onMobileMenuClose} />
          <NavSection label="Tools" items={toolsNav} activeScreen={activeScreen} onNavigate={onNavigate} onMobileClose={onMobileMenuClose} />
          <NavSection label="System" items={systemNav} activeScreen={activeScreen} onNavigate={onNavigate} onMobileClose={onMobileMenuClose} />
        </nav>

        {/* User */}
        <div className="border-t border-[#1e1e24] p-3 flex-shrink-0">
          <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-white/[0.04] cursor-pointer transition-colors">
            <div className="w-[32px] h-[32px] rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center flex-shrink-0 relative">
              <span className="text-white text-[11px] font-semibold">SG</span>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-[#0f0f12]"></span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] text-zinc-200 font-medium truncate leading-tight">Sebastian Galindo</p>
              <p className="text-[11px] text-zinc-500 leading-tight mt-0.5">CEO</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
