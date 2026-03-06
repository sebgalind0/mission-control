'use client';

import { useState, useEffect } from 'react';
import { MessageSquare, Mic, Loader2, Bell } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import IsometricOffice from '@/components/IsometricOffice';
import CommandCenter from '@/components/screens/CommandCenter';
import TaskBoard from '@/components/screens/TaskBoard';
import Projects from '@/components/screens/Projects';
import Calendar from '@/components/screens/Calendar';
import CronJobs from '@/components/screens/CronJobs';
import MemoryBrowser from '@/components/screens/MemoryBrowser';
import DocsLibrary from '@/components/screens/DocsLibrary';
import TeamOrgChart from '@/components/screens/TeamOrgChart';
import Analytics from '@/components/screens/Analytics';
import Approvals from '@/components/screens/Approvals';
import ActivityFeed from '@/components/screens/ActivityFeed';
import SystemInfo from '@/components/screens/SystemInfo';
import Integrations from '@/components/screens/Integrations';
import Gamification from '@/components/screens/Gamification';
import Reports from '@/components/screens/Reports';
import Marketplace from '@/components/screens/Marketplace';
import Settings from '@/components/screens/Settings';
import CoPilotSidebar from '@/components/CoPilotSidebar';
import SearchModal from '@/components/SearchModal';
import ChatLogModal from '@/components/ChatLogModal';
import NotificationsPanel from '@/components/NotificationsPanel';

export default function Home() {
  const [activeScreen, setActiveScreen] = useState('fleet');
  const [isCoPilotOpen, setIsCoPilotOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [voiceMode, setVoiceMode] = useState<'idle' | 'listening' | 'processing'>('idle');
  const [transcript, setTranscript] = useState('');
  const [chatLogModal, setChatLogModal] = useState<{ isOpen: boolean; agentName: string; agentEmoji: string }>({
    isOpen: false,
    agentName: '',
    agentEmoji: '',
  });

  // Keyboard listener for ⌘K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Voice mode handler
  const handleVoiceClick = () => {
    if (voiceMode === 'idle') {
      setVoiceMode('listening');
      setTranscript('');
      // Simulate speech recognition
      setTimeout(() => {
        setTranscript('Hey Rick, what\'s the status on the Fethr project?');
      }, 1500);
    } else if (voiceMode === 'listening') {
      setVoiceMode('processing');
      setTimeout(() => {
        setVoiceMode('idle');
        setTranscript('');
      }, 1000);
    }
  };

  const renderScreen = () => {
    switch (activeScreen) {
      case 'fleet':
        return <IsometricOffice onAgentClick={(name, emoji) => setChatLogModal({ isOpen: true, agentName: name, agentEmoji: emoji })} />;
      case 'command':
        return <CommandCenter onAgentClick={(name, emoji) => setChatLogModal({ isOpen: true, agentName: name, agentEmoji: emoji })} />;
      case 'tasks':
        return <TaskBoard />;
      case 'projects':
        return <Projects />;
      case 'calendar':
        return <Calendar />;
      case 'crons':
        return <CronJobs />;
      case 'memory':
        return <MemoryBrowser />;
      case 'docs':
        return <DocsLibrary />;
      case 'team':
        return <TeamOrgChart onAgentClick={(name, emoji) => setChatLogModal({ isOpen: true, agentName: name, agentEmoji: emoji })} />;
      case 'analytics':
        return <Analytics />;
      case 'approvals':
        return <Approvals />;
      case 'activity':
        return <ActivityFeed />;
      case 'system':
        return <SystemInfo />;
      case 'integrations':
        return <Integrations />;
      case 'gamification':
        return <Gamification />;
      case 'reports':
        return <Reports />;
      case 'marketplace':
        return <Marketplace />;
      case 'settings':
        return <Settings />;
      default:
        return <IsometricOffice onAgentClick={(name, emoji) => setChatLogModal({ isOpen: true, agentName: name, agentEmoji: emoji })} />;
    }
  };

  return (
    <div className="flex h-screen bg-[#09090b]">
      <Sidebar onNavigate={setActiveScreen} activeScreen={activeScreen} />
      <main className="flex-1 overflow-y-auto relative ml-0">
        {/* Top Bar */}
        <div className="sticky top-0 z-10 h-[56px] flex items-center justify-end px-12 bg-[#09090b]/80 backdrop-blur-sm border-b border-[#27272a]">
          <div className="flex items-center gap-2">
          {/* Notifications Button */}
          <button
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="relative p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors"
            title="Notifications"
          >
            <Bell size={18} />
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-blue-600 text-white text-[10px] rounded-full flex items-center justify-center font-medium">
              2
            </span>
          </button>
          
          {/* Co-Pilot Toggle Button */}
          <button
            onClick={() => setIsCoPilotOpen(!isCoPilotOpen)}
            className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors"
            title="Toggle Co-Pilot"
          >
            <MessageSquare size={18} />
          </button>
          </div>
        </div>

        {/* Content area */}
        <div className="w-full px-12 py-8">
          {renderScreen()}
        </div>
      </main>

      {/* Co-Pilot Sidebar */}
      <CoPilotSidebar
        isOpen={isCoPilotOpen}
        onClose={() => setIsCoPilotOpen(false)}
        currentScreen={activeScreen}
      />

      {/* Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onNavigate={(screen) => {
          setActiveScreen(screen);
          setIsSearchOpen(false);
        }}
      />

      {/* Chat Log Modal */}
      <ChatLogModal
        isOpen={chatLogModal.isOpen}
        onClose={() => setChatLogModal({ isOpen: false, agentName: '', agentEmoji: '' })}
        agentName={chatLogModal.agentName}
        agentEmoji={chatLogModal.agentEmoji}
      />

      {/* Notifications Panel */}
      <NotificationsPanel
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />

      {/* Voice Mode Button */}
      <div className="fixed bottom-6 right-6 z-50">
        {/* Voice Popup */}
        {voiceMode !== 'idle' && (
          <div className="absolute bottom-16 right-0 w-80 bg-[#18181b] border border-[#27272a] rounded-xl p-4 shadow-xl mb-2">
            <div className="space-y-3">
              {/* Listening indicator */}
              <div className="flex items-center gap-3">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="w-1 bg-red-500 rounded-full animate-pulse"
                      style={{
                        height: `${12 + Math.random() * 20}px`,
                        animationDelay: `${i * 0.1}s`,
                      }}
                    />
                  ))}
                </div>
                <span className="text-sm text-white">
                  {voiceMode === 'listening' ? 'Listening...' : 'Processing...'}
                </span>
              </div>

              {/* Transcript */}
              {transcript && (
                <div className="text-sm text-zinc-400 pt-2 border-t border-[#27272a]">
                  {transcript}
                </div>
              )}

              {/* Send button */}
              {transcript && (
                <button className="w-full px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-500 transition-colors">
                  Send to Command Center
                </button>
              )}
            </div>
          </div>
        )}

        {/* Voice Button */}
        <button
          onClick={handleVoiceClick}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
            voiceMode === 'listening'
              ? 'bg-red-500 animate-pulse shadow-lg shadow-red-500/50'
              : voiceMode === 'processing'
              ? 'bg-[#3b82f6]'
              : 'bg-[#3b82f6] hover:bg-[#60a5fa]'
          }`}
          title={voiceMode === 'idle' ? 'Voice Mode' : voiceMode === 'listening' ? 'Listening...' : 'Processing...'}
        >
          {voiceMode === 'processing' ? (
            <Loader2 size={20} className="text-white animate-spin" />
          ) : (
            <Mic size={20} className="text-white" />
          )}
        </button>
      </div>
    </div>
  );
}
