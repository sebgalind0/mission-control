'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Filter, CalendarDays, X, Download } from 'lucide-react';

interface CalendarEvent {
  id: string;
  type: 'task' | 'cron' | 'activity';
  title: string;
  agent: string | null;
  department: string | null;
  project: string | null;
  start: string;
  end: string | null;
  status: 'scheduled' | 'in_review' | 'completed';
  description: string;
}

interface AgendaItem {
  id: string;
  type: 'task' | 'cron' | 'activity';
  title: string;
  agent: string | null;
  time: string;
  countdown: string;
  status: 'scheduled' | 'in_review' | 'completed';
  description: string;
}

interface FilterOptions {
  agents: Array<{ id: string; name: string; department: string | null }>;
  departments: string[];
  projects: string[];
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
  rick: '#ef4444',
  fuse: '#3b82f6',
  lumen: '#eab308',
  eva: '#ec4899',
  nova: '#8b5cf6',
  ada: '#10b981',
  sage: '#f59e0b',
};

export default function Calendar() {
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showAgenda, setShowAgenda] = useState(false);
  const [agendaData, setAgendaData] = useState<{ morning: AgendaItem[]; afternoon: AgendaItem[]; evening: AgendaItem[] }>({
    morning: [],
    afternoon: [],
    evening: [],
  });
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({ agents: [], departments: [], projects: [] });
  const [filterAgent, setFilterAgent] = useState<string>('all');
  const [filterDept, setFilterDept] = useState<string>('all');
  const [filterProject, setFilterProject] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch filter options
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const response = await fetch('/api/calendar/filters');
        const data = await response.json();
        setFilterOptions(data);
      } catch (error) {
        console.error('Failed to fetch filters:', error);
      }
    };
    fetchFilters();
  }, []);

  // Fetch events when date or filters change
  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();
        
        // Get first and last day of current month
        const startDate = new Date(currentYear, currentMonth, 1);
        const endDate = new Date(currentYear, currentMonth + 1, 0);
        
        const startStr = startDate.toISOString().split('T')[0];
        const endStr = endDate.toISOString().split('T')[0];
        
        // Build query params
        const params = new URLSearchParams({
          start: startStr,
          end: endStr,
        });
        
        if (filterAgent !== 'all') {
          params.append('agents', filterAgent);
        }
        
        if (filterProject !== 'all') {
          params.append('projects', filterProject);
        }
        
        const response = await fetch(`/api/calendar/events?${params}`);
        const data = await response.json();
        setEvents(data.events || []);
      } catch (error) {
        console.error('Failed to fetch events:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [currentDate, filterAgent, filterProject]);

  // Fetch today's agenda when agenda panel opens
  useEffect(() => {
    if (!showAgenda) return;

    const fetchAgenda = async () => {
      try {
        const dateStr = currentDate.toISOString().split('T')[0];
        const response = await fetch(`/api/calendar/agenda?date=${dateStr}`);
        const data = await response.json();
        setAgendaData(data.agenda || { morning: [], afternoon: [], evening: [] });
      } catch (error) {
        console.error('Failed to fetch agenda:', error);
      }
    };

    fetchAgenda();
  }, [showAgenda, currentDate]);

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

  // Filter events by department if selected
  const filteredEvents = events.filter((event) => {
    if (filterDept !== 'all') {
      // Find agent's department
      const agent = filterOptions.agents.find(a => a.id === event.agent);
      if (!agent || agent.department !== filterDept) return false;
    }
    return true;
  });

  // Get events for a specific day
  const getEventsForDay = (day: number) => {
    const dayDate = new Date(currentYear, currentMonth, day);
    return filteredEvents.filter((event) => {
      const eventDate = new Date(event.start);
      return eventDate.getDate() === day &&
             eventDate.getMonth() === currentMonth &&
             eventDate.getFullYear() === currentYear;
    });
  };

  const todaysEvents = getEventsForDay(today);

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
    setCurrentDate(new Date());
  };

  const handleExport = async () => {
    try {
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();
      const startDate = new Date(currentYear, currentMonth, 1);
      const endDate = new Date(currentYear, currentMonth + 1, 0);
      
      const params = new URLSearchParams({
        start: startDate.toISOString().split('T')[0],
        end: endDate.toISOString().split('T')[0],
      });
      
      if (filterAgent !== 'all') params.append('agents', filterAgent);
      if (filterProject !== 'all') params.append('projects', filterProject);
      
      window.open(`/api/calendar/export?${params}`, '_blank');
    } catch (error) {
      console.error('Failed to export calendar:', error);
    }
  };

  const getEventColor = (event: CalendarEvent) => {
    if (event.agent && agentColors[event.agent.toLowerCase()]) {
      return agentColors[event.agent.toLowerCase()];
    }
    return '#3b82f6';
  };

  const allAgendaItems = [...agendaData.morning, ...agendaData.afternoon, ...agendaData.evening];

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

        <div className="flex items-center gap-2">
          {/* Export Button */}
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-[#18181b] border border-[#27272a] text-zinc-300 rounded-lg text-sm hover:border-[#3f3f46] transition-colors"
          >
            <Download size={16} />
            Export
          </button>
          
          {/* Today's Agenda Button */}
          <button
            onClick={() => setShowAgenda(!showAgenda)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-500 transition-colors"
          >
            <CalendarDays size={16} />
            Today's Agenda ({todaysEvents.length})
          </button>
        </div>
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
                    {filterOptions.agents.map((agent) => (
                      <option key={agent.id} value={agent.id}>{agent.name}</option>
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
                    {filterOptions.departments.map((dept) => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
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
                    {filterOptions.projects.map((project) => (
                      <option key={project} value={project}>{project}</option>
                    ))}
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
            const dayEvents = day ? getEventsForDay(day) : [];
            const isToday = day === today && currentMonth === new Date().getMonth() && currentYear === new Date().getFullYear();
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
                      {dayEvents.slice(0, 3).map((event) => {
                        const color = getEventColor(event);
                        return (
                          <div
                            key={event.id}
                            className="text-[10px] px-2 py-1 rounded truncate font-medium cursor-pointer hover:opacity-80 transition-opacity"
                            style={{ backgroundColor: `${color}15`, color: color }}
                            onClick={() => setSelectedEvent(event)}
                          >
                            {event.title}
                          </div>
                        );
                      })}
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
                <div className="w-2 h-12 rounded-full" style={{ backgroundColor: getEventColor(selectedEvent) }} />
                <div>
                  <h3 className="text-lg font-semibold text-white">{selectedEvent.title}</h3>
                  <p className="text-sm text-zinc-500 mt-1">
                    {new Date(selectedEvent.start).toLocaleString('en-US', { 
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
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
                  <p className="text-xs text-zinc-500 font-medium mb-1">Agent</p>
                  <p className="text-sm text-white">{selectedEvent.agent || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 font-medium mb-1">Status</p>
                  <p className="text-sm text-white capitalize">{selectedEvent.status.replace('_', ' ')}</p>
                </div>
              </div>
              {selectedEvent.project && (
                <div>
                  <p className="text-xs text-zinc-500 font-medium mb-1">Project</p>
                  <span
                    className="inline-block text-xs px-2 py-1 rounded-full font-medium"
                    style={{ backgroundColor: `${getEventColor(selectedEvent)}15`, color: getEventColor(selectedEvent) }}
                  >
                    {selectedEvent.project}
                  </span>
                </div>
              )}
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

              {/* Agenda List */}
              <div className="flex-1 overflow-y-auto p-6">
                {allAgendaItems.length === 0 ? (
                  <div className="text-center py-12">
                    <CalendarDays size={48} className="text-zinc-700 mx-auto mb-3" />
                    <p className="text-sm text-zinc-500">No events scheduled for today</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {agendaData.morning.length > 0 && (
                      <div>
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-3">Morning</h3>
                        <div className="space-y-2">
                          {agendaData.morning.map((item) => (
                            <div
                              key={item.id}
                              className="bg-[#09090b] border border-[#27272a] rounded-lg p-4 hover:border-[#3f3f46] transition-colors cursor-pointer"
                              onClick={() => {
                                const event = events.find(e => e.id === item.id);
                                if (event) {
                                  setSelectedEvent(event);
                                  setShowAgenda(false);
                                }
                              }}
                            >
                              <div className="flex items-start gap-3">
                                <div className="w-1 h-12 rounded-full flex-shrink-0" style={{ backgroundColor: getEventColor({ agent: item.agent } as CalendarEvent) }} />
                                <div className="flex-1 min-w-0">
                                  <h3 className="text-sm font-semibold text-white mb-1">{item.title}</h3>
                                  <p className="text-xs text-zinc-500">{item.time} · {item.countdown}</p>
                                  <p className="text-xs text-zinc-600 mt-1 truncate">{item.description}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {agendaData.afternoon.length > 0 && (
                      <div>
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-3">Afternoon</h3>
                        <div className="space-y-2">
                          {agendaData.afternoon.map((item) => (
                            <div
                              key={item.id}
                              className="bg-[#09090b] border border-[#27272a] rounded-lg p-4 hover:border-[#3f3f46] transition-colors cursor-pointer"
                              onClick={() => {
                                const event = events.find(e => e.id === item.id);
                                if (event) {
                                  setSelectedEvent(event);
                                  setShowAgenda(false);
                                }
                              }}
                            >
                              <div className="flex items-start gap-3">
                                <div className="w-1 h-12 rounded-full flex-shrink-0" style={{ backgroundColor: getEventColor({ agent: item.agent } as CalendarEvent) }} />
                                <div className="flex-1 min-w-0">
                                  <h3 className="text-sm font-semibold text-white mb-1">{item.title}</h3>
                                  <p className="text-xs text-zinc-500">{item.time} · {item.countdown}</p>
                                  <p className="text-xs text-zinc-600 mt-1 truncate">{item.description}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {agendaData.evening.length > 0 && (
                      <div>
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-3">Evening</h3>
                        <div className="space-y-2">
                          {agendaData.evening.map((item) => (
                            <div
                              key={item.id}
                              className="bg-[#09090b] border border-[#27272a] rounded-lg p-4 hover:border-[#3f3f46] transition-colors cursor-pointer"
                              onClick={() => {
                                const event = events.find(e => e.id === item.id);
                                if (event) {
                                  setSelectedEvent(event);
                                  setShowAgenda(false);
                                }
                              }}
                            >
                              <div className="flex items-start gap-3">
                                <div className="w-1 h-12 rounded-full flex-shrink-0" style={{ backgroundColor: getEventColor({ agent: item.agent } as CalendarEvent) }} />
                                <div className="flex-1 min-w-0">
                                  <h3 className="text-sm font-semibold text-white mb-1">{item.title}</h3>
                                  <p className="text-xs text-zinc-500">{item.time} · {item.countdown}</p>
                                  <p className="text-xs text-zinc-600 mt-1 truncate">{item.description}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
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
