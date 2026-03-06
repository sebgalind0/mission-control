'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Filter, CalendarDays, X } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description: string;
  assignee: string;
  status: string;
  priority: string;
  tag: string;
  deadline: string | null;
  createdAt: string;
}

interface CalendarEvent {
  id: string;
  title: string;
  date: number;
  color: string;
  time: string;
  assignee: string;
  tag: string;
  priority: string;
  description: string;
}

const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// Agent colors mapping
const agentColors: Record<string, string> = {
  main: '#3b82f6',
  larry: '#10b981',
  neo: '#6366f1',
  bolt: '#eab308',
  roger: '#f97316',
  kai: '#ec4899',
  caesar: '#ef4444',
  elon: '#f97316',
  vegeta: '#8b5cf6',
  thoth: '#d97706',
  achilles: '#3b82f6',
  olivia: '#f472b6',
  george: '#f59e0b',
  jobs: '#a3a3a3',
  popeye: '#22c55e',
  nico: '#f59e0b',
  together: '#a855f7',
  tesla: '#06b6d4',
};

export default function Calendar() {
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');
  const [currentDate, setCurrentDate] = useState(new Date(2026, 2, 5)); // March 5, 2026
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showAgenda, setShowAgenda] = useState(false);
  const [filterAgent, setFilterAgent] = useState<string>('all');
  const [filterDept, setFilterDept] = useState<string>('all');
  const [filterProject, setFilterProject] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Fetch tasks from API and convert to calendar events
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch('/api/tasks');
        const data = await response.json();
        const tasks: Task[] = data.tasks || [];

        // Convert tasks to calendar events
        const calendarEvents: CalendarEvent[] = tasks
          .filter((task) => task.deadline)
          .map((task) => {
            const deadline = new Date(task.deadline!);
            return {
              id: task.id,
              title: task.title,
              date: deadline.getDate(),
              color: agentColors[task.assignee] || '#3b82f6',
              time: deadline.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
              assignee: task.assignee,
              tag: task.tag,
              priority: task.priority,
              description: task.description,
            };
          });

        setEvents(calendarEvents);
      } catch (error) {
        console.error('Failed to fetch tasks:', error);
      }
    };

    fetchTasks();
  }, []);

  const today = currentDate.getDate();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const calendarDays = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(i);
  }

  const filteredEvents = events.filter((event) => {
    if (filterAgent !== 'all' && event.assignee !== filterAgent) return false;
    if (filterProject !== 'all' && event.tag !== filterProject) return false;
    return true;
  });

  const todaysEvents = filteredEvents.filter((e) => e.date === today);

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(currentDate.getMonth() - 1);
    } else {
      newDate.setMonth(currentDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date(2026, 2, 5));
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      {/* Breadcrumb */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-widest text-zinc-500 mb-2">
            Mission Control › Calendar
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-white">Calendar</h1>
          <p className="text-sm text-zinc-500 mt-1">Schedule and upcoming events</p>
        </div>

        {/* Today's Agenda Button */}
        <button
          onClick={() => setShowAgenda(!showAgenda)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-500 transition-colors"
        >
          <CalendarDays size={16} />
          Today's Agenda ({todaysEvents.length})
        </button>
      </div>

      {/* View Tabs + Filters */}
      <div className="flex items-center justify-between">
        {/* View Tabs */}
        <div className="flex items-center gap-1 bg-[#18181b] border border-[#27272a] rounded-lg p-1">
          {(['month', 'week', 'day'] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                view === v
                  ? 'bg-blue-600 text-white'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>

        {/* Filter Bar */}
        <div className="relative">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-[#18181b] border border-[#27272a] rounded-lg text-sm text-white hover:border-[#3f3f46] transition-all"
          >
            <Filter size={16} />
            Filters
            {(filterAgent !== 'all' || filterDept !== 'all' || filterProject !== 'all') && (
              <span className="w-2 h-2 bg-blue-500 rounded-full" />
            )}
          </button>

          {showFilters && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowFilters(false)} />
              <div className="absolute top-full mt-2 right-0 z-20 w-72 bg-[#18181b] border border-[#27272a] rounded-lg shadow-xl p-4 space-y-3">
                <div>
                  <label className="text-xs text-zinc-500 font-medium mb-1.5 block">Agent</label>
                  <select
                    value={filterAgent}
                    onChange={(e) => setFilterAgent(e.target.value)}
                    className="w-full bg-[#09090b] border border-[#27272a] rounded-lg px-3 py-2 text-sm text-white"
                  >
                    <option value="all">All Agents</option>
                    {Object.keys(agentColors).map((agent) => (
                      <option key={agent} value={agent}>{agent}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-zinc-500 font-medium mb-1.5 block">Department</label>
                  <select
                    value={filterDept}
                    onChange={(e) => setFilterDept(e.target.value)}
                    className="w-full bg-[#09090b] border border-[#27272a] rounded-lg px-3 py-2 text-sm text-white"
                  >
                    <option value="all">All Departments</option>
                    <option value="engineering">Engineering</option>
                    <option value="marketing">Marketing</option>
                    <option value="operations">Operations</option>
                    <option value="design">Design</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-zinc-500 font-medium mb-1.5 block">Project</label>
                  <select
                    value={filterProject}
                    onChange={(e) => setFilterProject(e.target.value)}
                    className="w-full bg-[#09090b] border border-[#27272a] rounded-lg px-3 py-2 text-sm text-white"
                  >
                    <option value="all">All Projects</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Health">Health</option>
                    <option value="Communication">Communication</option>
                  </select>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Calendar Card */}
      <div className="bg-[#18181b] border border-[#27272a] rounded-xl flex-1 flex flex-col" style={{ minHeight: '80vh' }}>
        {/* Month Navigation */}
        <div className="flex items-center justify-between p-6 border-b border-[#27272a]">
          <h2 className="text-lg font-semibold text-white">
            {monthNames[currentMonth]} {currentYear}
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigateMonth('prev')}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={goToToday}
              className="px-3 py-1 rounded-lg text-xs text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors font-medium"
            >
              Today
            </button>
            <button
              onClick={() => navigateMonth('next')}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Day Headers */}
        <div className="grid grid-cols-7 border-b border-[#27272a]">
          {daysOfWeek.map((day) => (
            <div key={day} className="text-center text-[11px] font-medium uppercase tracking-wider text-zinc-500 py-3">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 flex-1">
          {calendarDays.map((day, idx) => {
            const dayEvents = day ? filteredEvents.filter((e) => e.date === day) : [];
            const isToday = day === today;
            return (
              <div
                key={idx}
                className={`min-h-[120px] p-3 border-r border-b border-[#27272a]/50 ${
                  day ? 'hover:bg-[#1f1f23] transition-colors cursor-pointer' : ''
                } ${idx % 7 === 6 ? 'border-r-0' : ''}`}
              >
                {day && (
                  <>
                    <div
                      className={`w-7 h-7 flex items-center justify-center rounded-full text-xs mb-2 ${
                        isToday
                          ? 'bg-blue-600 text-white font-semibold ring-2 ring-blue-500/30'
                          : 'text-zinc-400'
                      }`}
                    >
                      {day}
                    </div>
                    <div className="space-y-1">
                      {dayEvents.slice(0, 3).map((event) => (
                        <div
                          key={event.id}
                          className="text-[10px] px-2 py-1 rounded truncate font-medium cursor-pointer hover:opacity-80 transition-opacity"
                          style={{ backgroundColor: `${event.color}15`, color: event.color }}
                          onClick={() => setSelectedEvent(event)}
                        >
                          {event.title}
                        </div>
                      ))}
                      {dayEvents.length > 3 && (
                        <p className="text-[10px] text-zinc-500 px-2">+{dayEvents.length - 3} more</p>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Event Details Modal */}
      {selectedEvent && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-8"
          onClick={() => setSelectedEvent(null)}
        >
          <div
            className="bg-[#18181b] border border-[#27272a] rounded-xl w-full max-w-lg p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-12 rounded-full" style={{ backgroundColor: selectedEvent.color }} />
                <div>
                  <h3 className="text-lg font-semibold text-white">{selectedEvent.title}</h3>
                  <p className="text-sm text-zinc-500 mt-1">
                    {monthNames[currentMonth]} {selectedEvent.date} · {selectedEvent.time}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-zinc-500 font-medium mb-1">Description</p>
                <p className="text-sm text-zinc-300">{selectedEvent.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-zinc-500 font-medium mb-1">Assignee</p>
                  <p className="text-sm text-white">{selectedEvent.assignee}</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 font-medium mb-1">Priority</p>
                  <p className="text-sm text-white">{selectedEvent.priority}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-zinc-500 font-medium mb-1">Tag</p>
                <span
                  className="inline-block text-xs px-2 py-1 rounded-full font-medium"
                  style={{ backgroundColor: `${selectedEvent.color}15`, color: selectedEvent.color }}
                >
                  {selectedEvent.tag}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Today's Agenda Sidebar */}
      {showAgenda && (
        <>
          <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={() => setShowAgenda(false)} />
          <div className="fixed top-0 right-0 z-50 w-96 h-full bg-[#18181b] border-l border-[#27272a] shadow-2xl">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="px-6 py-5 border-b border-[#27272a] flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-white">Today's Agenda</h2>
                  <p className="text-sm text-zinc-500 mt-0.5">
                    {monthNames[currentMonth]} {today}, {currentYear}
                  </p>
                </div>
                <button
                  onClick={() => setShowAgenda(false)}
                  className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Events List */}
              <div className="flex-1 overflow-y-auto p-6">
                {todaysEvents.length === 0 ? (
                  <div className="text-center py-12">
                    <CalendarDays size={48} className="text-zinc-700 mx-auto mb-3" />
                    <p className="text-sm text-zinc-500">No events scheduled for today</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {todaysEvents.map((event) => (
                      <div
                        key={event.id}
                        className="bg-[#09090b] border border-[#27272a] rounded-lg p-4 hover:border-[#3f3f46] transition-colors cursor-pointer"
                        onClick={() => {
                          setSelectedEvent(event);
                          setShowAgenda(false);
                        }}
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-1 h-12 rounded-full flex-shrink-0" style={{ backgroundColor: event.color }} />
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-semibold text-white mb-1">{event.title}</h3>
                            <p className="text-xs text-zinc-500">{event.time}</p>
                            <p className="text-xs text-zinc-600 mt-1 truncate">{event.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
