'use client';

import { Trophy, Star, Zap, Shield, Target } from 'lucide-react';

const agents = [
  { id: 'main', name: 'Rick Sanchez', color: '#3b82f6', initial: 'R', xp: 4820, level: 12, rank: 1 },
  { id: 'tesla', name: 'Tesla', color: '#06b6d4', initial: 'T', xp: 3450, level: 9, rank: 2 },
  { id: 'popeye', name: 'Cleopatra', color: '#22c55e', initial: 'C', xp: 2890, level: 8, rank: 3 },
  { id: 'nico', name: 'El Father', color: '#f59e0b', initial: 'E', xp: 1920, level: 6, rank: 4 },
  { id: 'together', name: 'Dr. Ashley', color: '#a855f7', initial: 'A', xp: 980, level: 4, rank: 5 },
];

const maxXP = 5000;

const achievements = [
  { id: 1, title: 'First Contact', description: 'Complete first interaction with a user', icon: Zap, earned: true, color: '#3b82f6' },
  { id: 2, title: 'Night Owl', description: 'Successfully run a task between midnight and 5am', icon: Star, earned: true, color: '#a855f7' },
  { id: 3, title: 'Iron Streak', description: 'Maintain 7-day uptime without errors', icon: Shield, earned: true, color: '#22c55e' },
  { id: 4, title: 'Overachiever', description: 'Complete 100 tasks in a single week', icon: Trophy, earned: true, color: '#f59e0b' },
  { id: 5, title: 'Sharpshooter', description: 'Achieve 99.9% uptime for 30 days', icon: Target, earned: false, color: '#6b7280' },
  { id: 6, title: 'Fleet Commander', description: 'Orchestrate all 5 agents in a single task chain', icon: Star, earned: false, color: '#6b7280' },
];

export default function Gamification() {
  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <div>
        <p className="text-[11px] font-medium uppercase tracking-widest text-zinc-500 mb-2">
          Mission Control › Gamification
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-white">Gamification</h1>
        <p className="text-sm text-zinc-500 mt-1">Agent leaderboard, XP, and achievements</p>
      </div>

      {/* Leaderboard */}
      <div>
        <h2 className="text-sm font-medium text-zinc-400 mb-4">Leaderboard</h2>
        <div className="bg-[#18181b] border border-[#27272a] rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#27272a]">
                <th className="text-left text-[11px] font-medium uppercase tracking-wider text-zinc-500 px-6 py-4 w-16">Rank</th>
                <th className="text-left text-[11px] font-medium uppercase tracking-wider text-zinc-500 px-6 py-4">Agent</th>
                <th className="text-left text-[11px] font-medium uppercase tracking-wider text-zinc-500 px-6 py-4">XP Progress</th>
                <th className="text-right text-[11px] font-medium uppercase tracking-wider text-zinc-500 px-6 py-4">XP</th>
                <th className="text-right text-[11px] font-medium uppercase tracking-wider text-zinc-500 px-6 py-4">Level</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#27272a]/50">
              {agents.map((agent) => (
                <tr key={agent.id} className="hover:bg-[#1f1f23] transition-colors">
                  <td className="px-6 py-4">
                    <span className={`text-sm font-bold ${
                      agent.rank === 1 ? 'text-amber-400' :
                      agent.rank === 2 ? 'text-zinc-300' :
                      agent.rank === 3 ? 'text-orange-400' :
                      'text-zinc-500'
                    }`}>
                      #{agent.rank}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: agent.color }}
                      >
                        <span className="text-white text-xs font-semibold">{agent.initial}</span>
                      </div>
                      <span className="text-sm font-medium text-white">{agent.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="w-full max-w-[200px]">
                      <div className="h-2 bg-[#27272a] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${(agent.xp / maxXP) * 100}%`, backgroundColor: agent.color }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-300 text-right font-mono">{agent.xp.toLocaleString()}</td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-[11px] px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-400 font-semibold">
                      Lv.{agent.level}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Achievements */}
      <div>
        <h2 className="text-sm font-medium text-zinc-400 mb-4">Achievements</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {achievements.map((ach) => {
            const Icon = ach.icon;
            return (
              <div
                key={ach.id}
                className={`bg-[#18181b] border rounded-xl p-5 transition-colors ${
                  ach.earned
                    ? 'border-[#27272a] hover:border-[#3f3f46]'
                    : 'border-[#27272a]/50 opacity-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${ach.color}15` }}
                  >
                    <Icon size={18} style={{ color: ach.color }} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">{ach.title}</h3>
                    <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">{ach.description}</p>
                    {ach.earned && (
                      <span className="text-[11px] text-emerald-400 mt-1.5 inline-block">✓ Earned</span>
                    )}
                    {!ach.earned && (
                      <span className="text-[11px] text-zinc-600 mt-1.5 inline-block">Locked</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
