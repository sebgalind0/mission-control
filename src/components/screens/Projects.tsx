'use client';

const agents = [
  { id: 'main', name: 'Rick Sanchez', color: '#3b82f6', initial: 'R' },
  { id: 'popeye', name: 'Cleopatra', color: '#22c55e', initial: 'C' },
  { id: 'nico', name: 'El Father', color: '#f59e0b', initial: 'E' },
  { id: 'together', name: 'Dr. Ashley', color: '#a855f7', initial: 'A' },
  { id: 'tesla', name: 'Tesla', color: '#06b6d4', initial: 'T' },
];

const projects = [
  {
    id: 'p1',
    title: 'Mission Control Dashboard',
    status: 'active',
    description: 'Fleet management UI for monitoring and controlling all AI agents from a single interface.',
    progress: 85,
    team: ['main', 'tesla'],
    startDate: 'Feb 28, 2026',
    dueDate: 'Mar 10, 2026',
  },
  {
    id: 'p2',
    title: 'Fethr Health Platform',
    status: 'active',
    description: 'Health and wellness platform with WHOOP integration, coaching, and analytics.',
    progress: 62,
    team: ['main', 'popeye'],
    startDate: 'Jan 15, 2026',
    dueDate: 'Apr 1, 2026',
  },
  {
    id: 'p3',
    title: 'Robotics Curriculum',
    status: 'active',
    description: 'Structured learning path for Nico covering servos, kinematics, and autonomous navigation.',
    progress: 68,
    team: ['tesla', 'nico'],
    startDate: 'Feb 1, 2026',
    dueDate: 'May 15, 2026',
  },
  {
    id: 'p4',
    title: 'Dubai Trip Planning',
    status: 'planning',
    description: 'Research and logistics for potential April Dubai trip. Hotels, flights, activities.',
    progress: 25,
    team: ['main'],
    startDate: 'Mar 1, 2026',
    dueDate: 'Apr 1, 2026',
  },
  {
    id: 'p5',
    title: 'Couples Therapy Framework',
    status: 'active',
    description: 'Structured conversation frameworks and exercises for relationship growth.',
    progress: 45,
    team: ['together'],
    startDate: 'Feb 10, 2026',
    dueDate: 'Ongoing',
  },
  {
    id: 'p6',
    title: 'LinkedIn Growth Strategy',
    status: 'paused',
    description: 'Content calendar, engagement tracking, and audience growth for Seb\'s LinkedIn.',
    progress: 40,
    team: ['main'],
    startDate: 'Jan 1, 2026',
    dueDate: 'Ongoing',
  },
];

const statusColors: Record<string, { bg: string; text: string }> = {
  active: { bg: 'bg-emerald-500/10', text: 'text-emerald-400' },
  planning: { bg: 'bg-blue-500/10', text: 'text-blue-400' },
  paused: { bg: 'bg-yellow-500/10', text: 'text-yellow-400' },
  completed: { bg: 'bg-zinc-500/10', text: 'text-zinc-400' },
};

export default function Projects() {
  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <div>
        <p className="text-[11px] font-medium uppercase tracking-widest text-zinc-500 mb-2">
          Mission Control › Projects
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-white">Projects</h1>
        <p className="text-sm text-zinc-500 mt-1">Active and upcoming projects across the fleet</p>
      </div>

      {/* Project Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {projects.map((project) => {
          const status = statusColors[project.status] || statusColors.active;
          return (
            <div
              key={project.id}
              className="bg-[#18181b] border border-[#27272a] rounded-xl p-6 hover:border-[#3f3f46] transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-sm font-semibold text-white">{project.title}</h3>
                <span className={`text-[11px] px-2 py-0.5 rounded-md font-medium ${status.bg} ${status.text}`}>
                  {project.status}
                </span>
              </div>
              <p className="text-xs text-zinc-500 mb-4 leading-relaxed">{project.description}</p>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] text-zinc-500">Progress</span>
                  <span className="text-[11px] text-zinc-400 font-medium">{project.progress}%</span>
                </div>
                <div className="h-1.5 bg-[#27272a] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between">
                <div className="flex items-center -space-x-2">
                  {project.team.map((agentId) => {
                    const agent = agents.find(a => a.id === agentId);
                    return (
                      <div
                        key={agentId}
                        className="w-7 h-7 rounded-full flex items-center justify-center border-2 border-[#18181b]"
                        style={{ backgroundColor: agent?.color || '#6b7280' }}
                      >
                        <span className="text-white text-[10px] font-semibold">{agent?.initial}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="text-[11px] text-zinc-600">
                  {project.startDate} → {project.dueDate}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
