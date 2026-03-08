'use client';

import { X } from 'lucide-react';

interface NotificationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationsPanel({ isOpen, onClose }: NotificationsPanelProps) {
  const notifications = [
    { id: 1, type: 'urgent', message: 'X payment to Twitter failed — $40', time: '2h ago', read: false },
    { id: 2, type: 'urgent', message: 'Jorge MIA 4 days — needs escalation', time: '3h ago', read: false },
    { id: 3, type: 'info', message: 'Phase 4 build complete', time: '5m ago', read: true },
    { id: 4, type: 'info', message: 'LinkedIn hit 10K impressions', time: '4h ago', read: true },
    { id: 5, type: 'read', message: 'Dubai refund reminder set for Mar 12', time: '5h ago', read: true },
    { id: 6, type: 'read', message: 'War briefing Day 6 delivered', time: '6h ago', read: true },
    { id: 7, type: 'read', message: 'Tesla voice ID fixed', time: '8h ago', read: true },
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  const dotColors = {
    urgent: 'bg-red-500',
    info: 'bg-yellow-500',
    read: 'bg-zinc-500',
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed top-16 right-4 left-4 md:left-auto z-50 w-auto md:w-96 bg-[#18181b] border border-[#27272a] rounded-lg shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#27272a]">
          <div className="flex items-center gap-2">
            <h3 className="text-white font-medium">Notifications</h3>
            {unreadCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </div>
          <button
            onClick={() => {}}
            className="text-xs text-blue-500 hover:text-blue-400 transition-colors"
          >
            Mark all read
          </button>
        </div>

        {/* Notifications List */}
        <div className="max-h-96 overflow-y-auto">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className="flex items-start gap-3 p-4 border-b border-[#27272a] hover:bg-[#1f1f23] transition-colors cursor-pointer"
            >
              <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${dotColors[notification.type as keyof typeof dotColors]}`}></div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white">{notification.message}</p>
                <p className="text-xs text-zinc-500 mt-1">{notification.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
