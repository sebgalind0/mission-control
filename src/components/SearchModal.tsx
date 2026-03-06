'use client';

import { Search, ArrowRight, Hash, FileText, CheckSquare, Brain, Zap } from 'lucide-react';
import { useState, useEffect } from 'react';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (screen: string) => void;
}

export default function SearchModal({ isOpen, onClose, onNavigate }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const screens = [
    { id: 'fleet', label: 'Fleet Overview', icon: Hash },
    { id: 'command', label: 'Command Center', icon: Hash },
    { id: 'tasks', label: 'Task Board', icon: Hash },
    { id: 'projects', label: 'Projects', icon: Hash },
    { id: 'calendar', label: 'Calendar', icon: Hash },
    { id: 'crons', label: 'Cron Jobs', icon: Hash },
    { id: 'memory', label: 'Memory', icon: Hash },
    { id: 'docs', label: 'Docs', icon: Hash },
    { id: 'team', label: 'Team', icon: Hash },
    { id: 'analytics', label: 'Analytics', icon: Hash },
    { id: 'approvals', label: 'Approvals', icon: Hash },
    { id: 'activity', label: 'Activity', icon: Hash },
    { id: 'system', label: 'System', icon: Hash },
  ];

  const recentScreens = [
    { id: 'fleet', label: 'Fleet Overview', icon: Hash },
    { id: 'tasks', label: 'Task Board', icon: Hash },
    { id: 'command', label: 'Command Center', icon: Hash },
  ];

  const tasks = [
    { label: 'Build Mission Control', icon: CheckSquare },
    { label: 'Fethr Health website', icon: CheckSquare },
    { label: 'Dubai trip planning', icon: CheckSquare },
  ];

  const memory = [
    { label: 'MEMORY.md', icon: Brain },
    { label: '2026-03-05.md', icon: Brain },
  ];

  const actions = [
    { label: 'Create new task', icon: Zap },
    { label: 'View approvals', icon: Zap },
    { label: 'Check agent status', icon: Zap },
  ];

  const allResults = [
    ...recentScreens.map(s => ({ ...s, category: 'Recent' })),
    ...screens.map(s => ({ ...s, category: 'Screens' })),
    ...tasks.map(t => ({ ...t, category: 'Tasks', id: 'tasks' })),
    ...memory.map(m => ({ ...m, category: 'Memory', id: 'memory' })),
    ...actions.map(a => ({ ...a, category: 'Actions', id: null })),
  ];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % allResults.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + allResults.length) % allResults.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const selected = allResults[selectedIndex];
        if (selected.id) {
          onNavigate(selected.id);
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, allResults, onNavigate, onClose]);

  if (!isOpen) return null;

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Recent': return '🕐';
      case 'Screens': return '📺';
      case 'Tasks': return '✓';
      case 'Memory': return '🧠';
      case 'Actions': return '⚡';
      default: return '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-[#18181b] border border-[#27272a] rounded-lg shadow-2xl overflow-hidden">
        {/* Search Input */}
        <div className="p-4 border-b border-[#27272a]">
          <div className="flex items-center gap-3">
            <Search size={20} className="text-zinc-500" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search screens, tasks, memory..."
              autoFocus
              className="flex-1 bg-transparent text-white placeholder:text-zinc-500 focus:outline-none"
            />
            <kbd className="px-2 py-1 text-xs text-zinc-500 bg-[#1f1f23] border border-[#27272a] rounded">ESC</kbd>
          </div>
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto p-2">
          {['Recent', 'Screens', 'Tasks', 'Memory', 'Actions'].map((category) => {
            const items = allResults.filter((r) => r.category === category);
            if (items.length === 0) return null;

            return (
              <div key={category} className="mb-4">
                <div className="flex items-center gap-2 px-3 py-2">
                  <span className="text-sm">{getCategoryIcon(category)}</span>
                  <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">{category}</h3>
                </div>
                <div className="space-y-1">
                  {items.map((item, idx) => {
                    const globalIndex = allResults.indexOf(item);
                    const Icon = item.icon;
                    return (
                      <button
                        key={`${category}-${idx}`}
                        onClick={() => {
                          if (item.id) {
                            onNavigate(item.id);
                            onClose();
                          }
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors ${
                          selectedIndex === globalIndex
                            ? 'bg-[#1f1f23] text-white'
                            : 'text-zinc-400 hover:bg-[#1f1f23] hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon size={16} />
                          <span>{item.label}</span>
                        </div>
                        {selectedIndex === globalIndex && <ArrowRight size={14} />}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 bg-[#09090b] border-t border-[#27272a] flex items-center justify-between text-xs text-zinc-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-[#1f1f23] border border-[#27272a] rounded">↑↓</kbd>
              Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-[#1f1f23] border border-[#27272a] rounded">↵</kbd>
              Select
            </span>
          </div>
          <span>⌘K to open</span>
        </div>
      </div>
    </div>
  );
}
