'use client';

const agents = [
  { id: 'main', name: 'Rick Sanchez', color: '#3b82f6', initial: 'R' },
  { id: 'popeye', name: 'Cleopatra', color: '#22c55e', initial: 'C' },
  { id: 'nico', name: 'El Father', color: '#f59e0b', initial: 'E' },
  { id: 'together', name: 'Dr. Ashley', color: '#a855f7', initial: 'A' },
  { id: 'tesla', name: 'Tesla', color: '#06b6d4', initial: 'T' },
];

const cronJobs = [
  { id: 1, name: 'Morning briefing', agent: 'main', schedule: '0 8 * * *', lastRun: '8:00 AM today', nextRun: '8:00 AM tomorrow', status: 'active' },
  { id: 2, name: 'Email inbox check', agent: 'main', schedule: '*/30 * * * *', lastRun: '5 min ago', nextRun: 'In 25 min', status: 'active' },
  { id: 3, name: 'LinkedIn analytics', agent: 'main', schedule: '0 10 * * *', lastRun: '10:00 AM today', nextRun: '10:00 AM tomorrow', status: 'active' },
  { id: 4, name: 'Team check-in voices', agent: 'main', schedule: '0 8 * * 1,3,5', lastRun: 'Wed 8:00 AM', nextRun: 'Fri 8:00 AM', status: 'active' },
  { id: 5, name: 'WHOOP data sync', agent: 'popeye', schedule: '0 7 * * *', lastRun: '7:00 AM today', nextRun: '7:00 AM tomorrow', status: 'active' },
  { id: 6, name: 'Health report', agent: 'popeye', schedule: '0 9 * * 1', lastRun: 'Mon 9:00 AM', nextRun: 'Next Mon', status: 'active' },
  { id: 7, name: 'Sleep analysis', agent: 'popeye', schedule: '0 8 * * *', lastRun: '8:00 AM today', nextRun: '8:00 AM tomorrow', status: 'active' },
  { id: 8, name: 'Research digest', agent: 'nico', schedule: '0 14 * * *', lastRun: 'Yesterday 2 PM', nextRun: '2:00 PM today', status: 'active' },
  { id: 9, name: 'Academic alerts', agent: 'nico', schedule: '0 9 * * 1-5', lastRun: '9:00 AM today', nextRun: '9:00 AM tomorrow', status: 'active' },
  { id: 10, name: 'Session reminder', agent: 'together', schedule: '0 15 * * 6', lastRun: 'Last Sat', nextRun: 'This Sat', status: 'active' },
  { id: 11, name: 'Robotics curriculum check', agent: 'tesla', schedule: '0 10 * * *', lastRun: '10:00 AM today', nextRun: '10:00 AM tomorrow', status: 'active' },
  { id: 12, name: 'Hardware diagnostics', agent: 'tesla', schedule: '0 6 * * *', lastRun: '6:00 AM today', nextRun: '6:00 AM tomorrow', status: 'active' },
  { id: 13, name: 'Tutorial progress', agent: 'tesla', schedule: '0 18 * * *', lastRun: 'Yesterday 6 PM', nextRun: '6:00 PM today', status: 'active' },
  { id: 14, name: 'Calendar sync', agent: 'main', schedule: '*/15 * * * *', lastRun: '2 min ago', nextRun: 'In 13 min', status: 'active' },
  { id: 15, name: 'Heartbeat check', agent: 'main', schedule: '*/30 * * * *', lastRun: '5 min ago', nextRun: 'In 25 min', status: 'active' },
  { id: 16, name: 'Weather update', agent: 'main', schedule: '0 7,12,18 * * *', lastRun: '12:00 PM today', nextRun: '6:00 PM today', status: 'active' },
  { id: 17, name: 'Project status', agent: 'tesla', schedule: '0 17 * * 1-5', lastRun: 'Yesterday 5 PM', nextRun: '5:00 PM today', status: 'active' },
  { id: 18, name: 'Backup memories', agent: 'main', schedule: '0 2 * * *', lastRun: '2:00 AM today', nextRun: '2:00 AM tomorrow', status: 'active' },
  { id: 19, name: 'Servo calibration', agent: 'tesla', schedule: '0 8 * * 1,4', lastRun: 'Mon 8:00 AM', nextRun: 'Thu 8:00 AM', status: 'active' },
];

export default function CronJobs() {
  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <div>
        <p className="text-[11px] font-medium uppercase tracking-widest text-zinc-500 mb-2">
          Mission Control › Cron Jobs
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-white">Cron Jobs</h1>
        <p className="text-sm text-zinc-500 mt-1">{cronJobs.length} scheduled jobs across the fleet</p>
      </div>

      {/* Table */}
      <div className="bg-[#18181b] border border-[#27272a] rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#27272a]">
              <th className="text-left text-[11px] font-medium uppercase tracking-wider text-zinc-500 px-6 py-4 w-10">Status</th>
              <th className="text-left text-[11px] font-medium uppercase tracking-wider text-zinc-500 px-6 py-4">Job Name</th>
              <th className="text-left text-[11px] font-medium uppercase tracking-wider text-zinc-500 px-6 py-4">Agent</th>
              <th className="text-left text-[11px] font-medium uppercase tracking-wider text-zinc-500 px-6 py-4">Schedule</th>
              <th className="text-left text-[11px] font-medium uppercase tracking-wider text-zinc-500 px-6 py-4">Last Run</th>
              <th className="text-left text-[11px] font-medium uppercase tracking-wider text-zinc-500 px-6 py-4">Next Run</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#27272a]/50">
            {cronJobs.map((job) => {
              const agent = agents.find(a => a.id === job.agent);
              return (
                <tr key={job.id} className="hover:bg-[#1f1f23] transition-colors">
                  <td className="px-6 py-4">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-300 font-medium">{job.name}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: agent?.color || '#6b7280' }}
                      >
                        <span className="text-white text-[10px] font-semibold">{agent?.initial}</span>
                      </div>
                      <span className="text-sm text-zinc-400">{agent?.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[11px] px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 font-mono font-medium">
                      {job.schedule}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-500">{job.lastRun}</td>
                  <td className="px-6 py-4 text-sm text-zinc-500">{job.nextRun}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
