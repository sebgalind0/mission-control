'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const events = [
  { id: 1, title: 'Team standup', date: 5, color: '#3b82f6', time: '9:00 AM' },
  { id: 2, title: 'WHOOP review', date: 5, color: '#22c55e', time: '10:30 AM' },
  { id: 3, title: 'Robotics session', date: 7, color: '#06b6d4', time: '2:00 PM' },
  { id: 4, title: 'Couples therapy', date: 8, color: '#a855f7', time: '4:00 PM' },
  { id: 5, title: 'Dubai deadline', date: 12, color: '#f59e0b', time: 'All day' },
  { id: 6, title: 'LinkedIn review', date: 14, color: '#3b82f6', time: '11:00 AM' },
  { id: 7, title: 'Health check-in', date: 15, color: '#22c55e', time: '9:00 AM' },
  { id: 8, title: 'Fethr demo', date: 18, color: '#3b82f6', time: '3:00 PM' },
  { id: 9, title: 'Robotics review', date: 21, color: '#06b6d4', time: '2:00 PM' },
  { id: 10, title: 'Sprint planning', date: 24, color: '#3b82f6', time: '10:00 AM' },
  { id: 11, title: 'Therapy session', date: 25, color: '#a855f7', time: '4:00 PM' },
  { id: 12, title: 'Monthly report', date: 28, color: '#f59e0b', time: 'All day' },
];

const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function Calendar() {
  const [currentMonth] = useState('March 2026');
  const today = 5;
  const firstDayOffset = 0; // March 2026 starts on Sunday
  const daysInMonth = 31;

  const calendarDays = [];
  for (let i = 0; i < firstDayOffset; i++) {
    calendarDays.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(i);
  }

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <div>
        <p className="text-[11px] font-medium uppercase tracking-widest text-zinc-500 mb-2">
          Mission Control › Calendar
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-white">Calendar</h1>
        <p className="text-sm text-zinc-500 mt-1">Schedule and upcoming events</p>
      </div>

      {/* Calendar Card */}
      <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-6">
        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white">{currentMonth}</h2>
          <div className="flex items-center gap-2">
            <button className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors">
              <ChevronLeft size={16} />
            </button>
            <button className="px-3 py-1 rounded-lg text-xs text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors font-medium">
              Today
            </button>
            <button className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Day Headers */}
        <div className="grid grid-cols-7 mb-2">
          {daysOfWeek.map((day) => (
            <div key={day} className="text-center text-[11px] font-medium uppercase tracking-wider text-zinc-500 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7">
          {calendarDays.map((day, idx) => {
            const dayEvents = day ? events.filter(e => e.date === day) : [];
            const isToday = day === today;
            return (
              <div
                key={idx}
                className={`min-h-[80px] p-2 border-t border-[#27272a]/50 ${day ? 'hover:bg-[#1f1f23] transition-colors cursor-pointer' : ''}`}
              >
                {day && (
                  <>
                    <div className={`w-7 h-7 flex items-center justify-center rounded-full text-xs mb-1 ${
                      isToday ? 'bg-blue-600 text-white font-semibold ring-2 ring-blue-500/30' : 'text-zinc-400'
                    }`}>
                      {day}
                    </div>
                    <div className="space-y-1">
                      {dayEvents.slice(0, 2).map((event) => (
                        <div
                          key={event.id}
                          className="text-[10px] px-1.5 py-0.5 rounded truncate font-medium"
                          style={{ backgroundColor: `${event.color}15`, color: event.color }}
                        >
                          {event.title}
                        </div>
                      ))}
                      {dayEvents.length > 2 && (
                        <p className="text-[10px] text-zinc-500 px-1">+{dayEvents.length - 2} more</p>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Upcoming Events */}
      <div>
        <h2 className="text-sm font-medium text-zinc-400 mb-3">Upcoming Events</h2>
        <div className="space-y-2">
          {events.filter(e => e.date >= today).slice(0, 6).map((event) => (
            <div
              key={event.id}
              className="bg-[#18181b] border border-[#27272a] rounded-xl p-4 hover:border-[#3f3f46] transition-colors flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-1 h-8 rounded-full" style={{ backgroundColor: event.color }} />
                <div>
                  <p className="text-sm text-white font-medium">{event.title}</p>
                  <p className="text-xs text-zinc-500">Mar {event.date} · {event.time}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
