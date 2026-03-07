'use client';

import { useState } from 'react';
import { Network, Grid3x3, List } from 'lucide-react';
import OrgChartModal from '../OrgChartModal';
import FleetActionButtons from '../FleetActionButtons';
import PixelOffice from '../PixelOffice';

interface FleetOverviewProps {
  onAgentClick?: (name: string, emoji: string) => void;
}

const agents = [
  // Executive
  { id: 'main', name: 'Rick Sanchez', role: 'CEO', dept: 'Executive', model: 'Claude Opus 4.6', status: 'online', color: '#3b82f6', initial: 'R', crons: 8, skills: ['Orchestration', 'Intel', 'Ops'], lastActive: '2m ago' },
  // Engineering
  { id: 'larry', name: 'Larry', role: 'CTO', dept: 'Engineering', model: 'Sonnet 4.5', status: 'online', color: '#10b981', initial: 'L', crons: 0, skills: ['Architecture', 'Code Review'], lastActive: 'new' },
  { id: 'neo', name: 'Neo', role: 'Frontend', dept: 'Engineering', model: 'Sonnet 4.5', status: 'online', color: '#6366f1', initial: 'N', crons: 0, skills: ['React', 'Next.js'], lastActive: 'new' },
  { id: 'bolt', name: 'Bolt', role: 'Backend', dept: 'Engineering', model: 'Sonnet 4.5', status: 'online', color: '#eab308', initial: 'B', crons: 0, skills: ['APIs', 'Database'], lastActive: 'new' },
  { id: 'roger', name: 'Roger', role: 'Infrastructure', dept: 'Engineering', model: 'Sonnet 4.5', status: 'online', color: '#f97316', initial: 'Ro', crons: 0, skills: ['AWS', 'DevOps'], lastActive: 'new' },
  { id: 'kai', name: 'Kai', role: 'Mobile / iOS', dept: 'Engineering', model: 'Sonnet 4.5', status: 'online', color: '#ec4899', initial: 'K', crons: 0, skills: ['Swift', 'iOS'], lastActive: 'new' },
  // Marketing
  { id: 'caesar', name: 'Julius Caesar', role: 'CMO', dept: 'Marketing', model: 'Sonnet 4.5', status: 'online', color: '#ef4444', initial: 'JC', crons: 0, skills: ['Analytics', 'Strategy'], lastActive: 'new' },
  { id: 'elon', name: 'Elon', role: 'X / Twitter', dept: 'Marketing', model: 'Sonnet 4.5', status: 'online', color: '#f97316', initial: 'E', crons: 0, skills: ['X', 'Engagement'], lastActive: 'new' },
  { id: 'vegeta', name: 'Vegeta', role: 'LinkedIn', dept: 'Marketing', model: 'Sonnet 4.5', status: 'online', color: '#8b5cf6', initial: 'V', crons: 0, skills: ['LinkedIn', 'Content'], lastActive: 'new' },
  { id: 'thoth', name: 'Thoth', role: 'Content / Blog', dept: 'Marketing', model: 'Sonnet 4.5', status: 'online', color: '#d97706', initial: 'T', crons: 0, skills: ['Writing', 'SEO'], lastActive: 'new' },
  // Operations
  { id: 'achilles', name: 'Achilles', role: 'COO', dept: 'Operations', model: 'Sonnet 4.5', status: 'online', color: '#3b82f6', initial: 'A', crons: 0, skills: ['Intel', 'Research'], lastActive: 'new' },
  { id: 'olivia', name: 'Olivia', role: 'Exec Assistant', dept: 'Operations', model: 'Sonnet 4.5', status: 'online', color: '#f472b6', initial: 'O', crons: 0, skills: ['Email', 'Calendar'], lastActive: 'new' },
  // Design
  { id: 'george', name: 'George', role: 'Head of Design', dept: 'Design', model: 'Sonnet 4.5', status: 'online', color: '#f59e0b', initial: 'G', crons: 0, skills: ['UI/UX', 'Systems'], lastActive: 'new' },
  { id: 'jobs', name: 'Steve Jobs', role: 'UI/UX Designer', dept: 'Design', model: 'Sonnet 4.5', status: 'online', color: '#a3a3a3', initial: 'SJ', crons: 0, skills: ['Components', 'QA'], lastActive: 'new' },
  // Contractors
  { id: 'popeye', name: 'Cleopatra', role: 'Health Coach', dept: 'Contractors', model: 'Sonnet 4.5', status: 'online', color: '#22c55e', initial: 'C', crons: 3, skills: ['Health', 'WHOOP'], lastActive: '5m ago' },
  { id: 'nico', name: 'El Father', role: 'Academic (Nico)', dept: 'Contractors', model: 'Sonnet 4.5', status: 'online', color: '#f59e0b', initial: 'E', crons: 2, skills: ['Academic', 'Writing'], lastActive: '12m ago' },
  { id: 'together', name: 'Dr. Ashley', role: 'Couples Therapy', dept: 'Contractors', model: 'Sonnet 4.5', status: 'idle', color: '#a855f7', initial: 'A', crons: 1, skills: ['Therapy'], lastActive: '1h ago' },
  { id: 'tesla', name: 'Tesla', role: 'Robotics Tutor', dept: 'Contractors', model: 'Sonnet 4.5', status: 'online', color: '#06b6d4', initial: 'T', crons: 5, skills: ['Hardware', 'Robotics'], lastActive: '8m ago' },
];

export default function FleetOverview({ onAgentClick }: FleetOverviewProps) {
  const [isOrgChartOpen, setIsOrgChartOpen] = useState(false);
  const [view, setView] = useState<'list' | 'office'>('office');
  const onlineCount = agents.filter(a => a.status === 'online').length;
  const totalCrons = agents.reduce((sum, a) => sum + a.crons, 0);
  const totalSkills = agents.reduce((sum, a) => sum + a.skills.length, 0);
  const depts = [...new Set(agents.map(a => a.dept))];

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-widest text-zinc-500 mb-2">
            Mission Control › Fleet Overview
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-white">Fleet Overview</h1>
          <p className="text-sm text-zinc-500 mt-1">18 agents across 5 departments</p>
        </div>
        <div className="flex gap-2">
          <div className="flex gap-1 bg-[#18181b] border border-[#27272a] rounded-lg p-1">
            <button
              onClick={() => setView('office')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm transition-all ${
                view === 'office'
                  ? 'bg-[#3b82f6] text-white'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Grid3x3 size={14} />
              Office
            </button>
            <button
              onClick={() => setView('list')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm transition-all ${
                view === 'list'
                  ? 'bg-[#3b82f6] text-white'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <List size={14} />
              List
            </button>
          </div>
          <button
            onClick={() => setIsOrgChartOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#18181b] border border-[#27272a] rounded-lg text-sm text-white hover:border-[#3f3f46] hover:bg-[#1f1f23] transition-all"
          >
            <Network size={16} />
            Org Chart
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Agents', value: agents.length.toString(), desc: 'Across all departments' },
          { label: 'Online Now', value: onlineCount.toString(), desc: '● All systems nominal' },
          { label: 'Active Crons', value: totalCrons.toString(), desc: 'Scheduled jobs running' },
          { label: 'Departments', value: depts.length.toString(), desc: 'Engineering · Marketing · Ops · Design · Contractors' },
        ].map((stat) => (
          <div key={stat.label} className="bg-[#18181b] border border-[#27272a] rounded-xl p-5">
            <p className="text-xs text-zinc-500 font-medium mb-2">{stat.label}</p>
            <p className="text-3xl font-bold text-white tracking-tight">{stat.value}</p>
            <p className="text-xs text-zinc-600 mt-1">{stat.desc}</p>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      {view === 'list' && <FleetActionButtons />}

      {/* Pixel Office View */}
      {view === 'office' && (
        <div className="bg-[#18181b] border border-[#27272a] rounded-xl overflow-hidden">
          <PixelOffice />
        </div>
      )}

      {/* Agents by Department (List View) */}
      {view === 'list' && depts.map((dept) => {
        const deptAgents = agents.filter(a => a.dept === dept);
        return (
          <div key={dept}>
            <h2 className="text-[13px] font-medium uppercase tracking-widest text-zinc-500/70 mb-4">
              {dept === 'Executive' ? '👑' : dept === 'Engineering' ? '💊' : dept === 'Marketing' ? '⚔️' : dept === 'Operations' ? '🕶️' : dept === 'Design' ? '🎨' : '📋'} {dept}
            </h2>
            <div className="space-y-2">
              {deptAgents.map((agent) => (
                <div
                  key={agent.id}
                  className="bg-[#18181b] border border-[#27272a] rounded-xl p-5 hover:border-[#3f3f46] hover:bg-[#1f1f23] transition-all cursor-pointer"
                  onClick={() => onAgentClick?.(agent.name, agent.initial)}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: agent.color }}
                    >
                      <span className="text-white text-xs font-bold">{agent.initial}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2.5">
                        <h3 className="text-sm font-semibold text-white">{agent.name}</h3>
                        <span className={`inline-flex items-center gap-1 text-[11px] font-medium ${agent.status === 'online' ? 'text-emerald-400' : 'text-amber-400'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${agent.status === 'online' ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
                          {agent.status}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500 mt-0.5">{agent.role}</p>
                    </div>
                    <div className="flex gap-1.5 flex-shrink-0">
                      {agent.skills.map((skill) => (
                        <span key={skill} className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: `${agent.color}15`, color: agent.color }}>
                          {skill}
                        </span>
                      ))}
                    </div>
                    <div className="text-right flex-shrink-0 w-36">
                      <p className="text-[11px] text-zinc-400">{agent.model}</p>
                      <p className="text-[11px] text-zinc-600">{agent.crons} crons · {agent.lastActive}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* Org Chart Modal */}
      <OrgChartModal isOpen={isOrgChartOpen} onClose={() => setIsOrgChartOpen(false)} />
    </div>
  );
}
