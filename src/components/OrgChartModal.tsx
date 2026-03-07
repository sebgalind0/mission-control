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
    children: ['larry', 'julius', 'achilles', 'george']
  },
  // CTO - Engineering
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
  {
    id: 'neo',
    name: 'Neo',
    role: 'Frontend',
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
    role: 'Backend',
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
  // CMO - Marketing
  {
    id: 'julius',
    name: 'Julius Caesar',
    role: 'CMO',
    dept: 'Marketing',
    color: '#ef4444',
    initial: 'JC',
    level: 1,
    status: 'working',
    parent: 'rick',
    children: ['elon', 'vegeta', 'thoth']
  },
  {
    id: 'elon',
    name: 'Elon',
    role: 'X / Twitter',
    dept: 'Marketing',
    color: '#f97316',
    initial: 'E',
    level: 2,
    status: 'working',
    parent: 'julius'
  },
  {
    id: 'vegeta',
    name: 'Vegeta',
    role: 'LinkedIn',
    dept: 'Marketing',
    color: '#8b5cf6',
    initial: 'V',
    level: 2,
    status: 'working',
    parent: 'julius'
  },
  {
    id: 'thoth',
    name: 'Thoth',
    role: 'Content / Blog',
    dept: 'Marketing',
    color: '#d97706',
    initial: 'T',
    level: 2,
    status: 'working',
    parent: 'julius'
  },
  // COO - Operations
  {
    id: 'achilles',
    name: 'Achilles',
    role: 'COO',
    dept: 'Operations',
    color: '#3b82f6',
    initial: 'A',
    level: 1,
    status: 'working',
    parent: 'rick',
    children: ['olivia']
  },
  {
    id: 'olivia',
    name: 'Olivia',
    role: 'Exec Assistant',
    dept: 'Operations',
    color: '#f472b6',
    initial: 'O',
    level: 2,
    status: 'working',
    parent: 'achilles'
  },
  // Head of Design
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

// Contractors (no reporting structure, shown separately)
const contractors = [
  { name: 'Cleopatra', role: 'Health Coach', dept: 'Contractors', color: '#22c55e', initial: 'C', status: 'working' },
  { name: 'El Father', role: 'Academic (Nico)', dept: 'Contractors', color: '#f59e0b', initial: 'E', status: 'working' },
  { name: 'Dr. Ashley', role: 'Couples Therapy', dept: 'Contractors', color: '#a855f7', initial: 'A', status: 'idle' },
  { name: 'Tesla', role: 'Robotics Tutor', dept: 'Contractors', color: '#06b6d4', initial: 'T', status: 'working' },
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

  const renderAgent = (agent: typeof orgData[0] | typeof contractors[0]) => (
    <div key={'id' in agent ? agent.id : agent.name} className="flex flex-col items-center">
      <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-4 hover:border-[#3f3f46] transition-colors min-w-[140px]">
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
        className="bg-[#09090b] border border-[#27272a] rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-[#09090b] border-b border-[#27272a] px-8 py-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">Organization Chart</h2>
            <p className="text-sm text-zinc-500 mt-1">18 agents · 5 departments</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Org Chart */}
        <div className="p-8">
          <div className="flex flex-col items-center gap-8">
            {/* CEO Level */}
            {ceo && (
              <div className="flex flex-col items-center gap-4">
                {renderAgent(ceo)}
                <div className="w-px h-8 bg-[#27272a]" />
              </div>
            )}

            {/* Level 1 (Department Heads) */}
            <div className="flex items-start gap-6 flex-wrap justify-center max-w-5xl">
              {level1.map((manager) => {
                const reports = level2ByParent(manager.id);
                return (
                  <div key={manager.id} className="flex flex-col items-center gap-4">
                    {renderAgent(manager)}
                    {reports.length > 0 && (
                      <>
                        <div className="w-px h-8 bg-[#27272a]" />
                        <div className="flex gap-3 flex-wrap justify-center max-w-xs">
                          {reports.map((report) => renderAgent(report))}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Contractors Section */}
            {contractors.length > 0 && (
              <>
                <div className="w-full border-t border-[#27272a]" />
                <div className="flex flex-col items-center gap-4">
                  <div className="text-center">
                    <h3 className="text-base font-semibold text-white">Contractors</h3>
                    <p className="text-xs text-zinc-500 mt-1">Independent specialists · {contractors.length} total</p>
                  </div>
                  <div className="flex gap-3 flex-wrap justify-center">
                    {contractors.map((contractor) => renderAgent(contractor))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
