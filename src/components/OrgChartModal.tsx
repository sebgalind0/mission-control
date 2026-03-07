'use client';

import { X } from 'lucide-react';
import { useEffect } from 'react';

interface OrgChartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const orgData = [
  // CEO
  {
    id: 'rick',
    name: 'Rick Sanchez',
    role: 'CEO',
    dept: 'Executive',
    color: '#3b82f6',
    initial: 'R',
    level: 0,
    status: 'working',
    children: ['larry', 'george']
  },
  // CTO
  {
    id: 'larry',
    name: 'Larry',
    role: 'CTO',
    dept: 'Engineering',
    color: '#10b981',
    initial: 'L',
    level: 1,
    status: 'working',
    parent: 'rick',
    children: ['neo', 'bolt', 'roger', 'kai']
  },
  // Engineering Team
  {
    id: 'neo',
    name: 'Neo',
    role: 'Frontend Engineer',
    dept: 'Engineering',
    color: '#6366f1',
    initial: 'N',
    level: 2,
    status: 'working',
    parent: 'larry'
  },
  {
    id: 'bolt',
    name: 'Bolt',
    role: 'Backend Engineer',
    dept: 'Engineering',
    color: '#eab308',
    initial: 'B',
    level: 2,
    status: 'working',
    parent: 'larry'
  },
  {
    id: 'roger',
    name: 'Roger',
    role: 'Infrastructure',
    dept: 'Engineering',
    color: '#f97316',
    initial: 'Ro',
    level: 2,
    status: 'idle',
    parent: 'larry'
  },
  {
    id: 'kai',
    name: 'Kai',
    role: 'Mobile / iOS',
    dept: 'Engineering',
    color: '#ec4899',
    initial: 'K',
    level: 2,
    status: 'working',
    parent: 'larry'
  },
  // Design Team (parallel to Larry)
  {
    id: 'george',
    name: 'George',
    role: 'Head of Design',
    dept: 'Design',
    color: '#f59e0b',
    initial: 'G',
    level: 1,
    status: 'working',
    parent: 'rick',
    children: ['jobs']
  },
  {
    id: 'jobs',
    name: 'Steve Jobs',
    role: 'UI/UX Designer',
    dept: 'Design',
    color: '#a3a3a3',
    initial: 'SJ',
    level: 2,
    status: 'working',
    parent: 'george'
  }
];

export default function OrgChartModal({ isOpen, onClose }: OrgChartModalProps) {
  // ESC key handler
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
      return () => window.removeEventListener('keydown', handleEsc);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const renderAgent = (agent: typeof orgData[0]) => (
    <div key={agent.id} className="flex flex-col items-center">
      <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-4 hover:border-[#3f3f46] transition-colors min-w-[160px]">
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ backgroundColor: agent.color }}
            >
              <span className="text-white text-sm font-bold">{agent.initial}</span>
            </div>
            {/* Status indicator */}
            <div
              className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-[#18181b] ${
                agent.status === 'working' ? 'bg-green-400' :
                agent.status === 'idle' ? 'bg-yellow-400' :
                'bg-red-400'
              }`}
            />
          </div>
          <div className="text-center">
            <h3 className="text-sm font-semibold text-white">{agent.name}</h3>
            <p className="text-xs text-zinc-500 mt-0.5">{agent.role}</p>
            <p className="text-[10px] text-zinc-600 mt-1">{agent.dept}</p>
          </div>
        </div>
      </div>
    </div>
  );

  const ceo = orgData.find(a => a.level === 0);
  const level1 = orgData.filter(a => a.level === 1);
  const level2ByParent = (parentId: string) => orgData.filter(a => a.level === 2 && a.parent === parentId);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-8"
      onClick={onClose}
    >
      <div
        className="bg-[#09090b] border border-[#27272a] rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-[#09090b] border-b border-[#27272a] px-8 py-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">Organization Chart</h2>
            <p className="text-sm text-zinc-500 mt-1">Team hierarchy and structure</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Org Chart */}
        <div className="p-12">
          <div className="flex flex-col items-center gap-12">
            {/* CEO Level */}
            {ceo && (
              <div className="flex flex-col items-center gap-6">
                {renderAgent(ceo)}
                <div className="w-px h-12 bg-[#27272a]" />
              </div>
            )}

            {/* Level 1 (Larry + George) */}
            <div className="flex items-start gap-24">
              {level1.map((manager) => {
                const reports = level2ByParent(manager.id);
                return (
                  <div key={manager.id} className="flex flex-col items-center gap-6">
                    {renderAgent(manager)}
                    {reports.length > 0 && (
                      <>
                        <div className="w-px h-12 bg-[#27272a]" />
                        <div className="flex gap-6">
                          {reports.map((report) => renderAgent(report))}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
