'use client';

import { useState } from 'react';
import { Search, FileText, Brain, Clock } from 'lucide-react';

const memoryFiles = [
  { id: 1, name: 'MEMORY.md', type: 'core', size: '4.2 KB', modified: '2h ago', preview: 'Long-term memory store. Contains curated insights, decisions, and lessons learned across sessions...' },
  { id: 2, name: '2026-03-05.md', type: 'daily', size: '2.8 KB', modified: '30m ago', preview: 'Mission Control UI rewrite in progress. All 18 screens being rebuilt from scratch. Dubai trip decision deadline April 1...' },
  { id: 3, name: '2026-03-04.md', type: 'daily', size: '3.1 KB', modified: '1d ago', preview: 'Completed Phase 4 of Mission Control. Jorge still MIA - day 4. LinkedIn post hit 10K impressions...' },
  { id: 4, name: '2026-03-03.md', type: 'daily', size: '2.4 KB', modified: '2d ago', preview: 'War briefing Day 6 delivered. Tesla voice ID issue resolved. WHOOP recovery trending upward...' },
  { id: 5, name: '2026-03-02.md', type: 'daily', size: '1.9 KB', modified: '3d ago', preview: 'Team check-ins delivered via voice. Fabricio needs motivation push. Carlos should be more proactive...' },
  { id: 6, name: '2026-03-01.md', type: 'daily', size: '2.6 KB', modified: '4d ago', preview: 'March begins. Sprint planning completed. New robotics module started for Nico...' },
  { id: 7, name: 'heartbeat-state.json', type: 'state', size: '0.3 KB', modified: '5m ago', preview: '{ "lastChecks": { "email": 1709654400, "calendar": 1709650800, "weather": null } }' },
  { id: 8, name: 'SOUL.md', type: 'core', size: '1.1 KB', modified: '5d ago', preview: 'Core identity file. Defines personality, values, and behavioral guidelines...' },
  { id: 9, name: 'USER.md', type: 'core', size: '0.8 KB', modified: '7d ago', preview: 'Sebastian Galindo. CEO. Concise, smart, no BS. Hates fluff. Get to the point...' },
  { id: 10, name: 'TOOLS.md', type: 'core', size: '5.6 KB', modified: '3d ago', preview: 'Local tool notes. ElevenLabs TTS, Slack webhooks, WhatsApp contacts, email configuration...' },
];

const typeIcons: Record<string, typeof FileText> = {
  core: Brain,
  daily: Clock,
  state: FileText,
};

const typeColors: Record<string, string> = {
  core: '#3b82f6',
  daily: '#22c55e',
  state: '#f59e0b',
};

export default function MemoryBrowser() {
  const [selectedFile, setSelectedFile] = useState(memoryFiles[0]);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFiles = searchQuery
    ? memoryFiles.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : memoryFiles;

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <div>
        <p className="text-[11px] font-medium uppercase tracking-widest text-zinc-500 mb-2">
          Mission Control › Memory Browser
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-white">Memory Browser</h1>
        <p className="text-sm text-zinc-500 mt-1">Browse and inspect agent memory files</p>
      </div>

      {/* Split Layout */}
      <div className="grid grid-cols-[320px_1fr] gap-0 rounded-xl overflow-hidden border border-[#27272a]" style={{ height: 'calc(100vh - 280px)' }}>
        {/* Left Panel - File List */}
        <div className="bg-[#18181b] border-r border-[#27272a] flex flex-col">
          {/* Search */}
          <div className="p-4 border-b border-[#27272a]">
            <div className="flex items-center gap-2 px-3 py-2 bg-[#111113] border border-[#27272a] rounded-lg">
              <Search size={14} className="text-zinc-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search files..."
                className="flex-1 bg-transparent text-sm text-white placeholder:text-zinc-600 focus:outline-none"
              />
            </div>
          </div>

          {/* File List */}
          <div className="flex-1 overflow-y-auto">
            {filteredFiles.map((file) => {
              const Icon = typeIcons[file.type] || FileText;
              const isSelected = selectedFile.id === file.id;
              return (
                <button
                  key={file.id}
                  onClick={() => setSelectedFile(file)}
                  className={`w-full text-left px-4 py-3 border-b border-[#27272a]/50 transition-colors ${
                    isSelected ? 'bg-[#1f1f23]' : 'hover:bg-[#1f1f23]/50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon size={14} style={{ color: typeColors[file.type] || '#6b7280' }} />
                    <span className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-zinc-300'}`}>{file.name}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1 ml-[22px]">
                    <span className="text-[11px] text-zinc-600">{file.size}</span>
                    <span className="text-[11px] text-zinc-700">·</span>
                    <span className="text-[11px] text-zinc-600">{file.modified}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Panel - Content Preview */}
        <div className="bg-[#18181b] flex flex-col">
          <div className="p-4 border-b border-[#27272a] flex items-center justify-between">
            <div className="flex items-center gap-2">
              {(() => {
                const Icon = typeIcons[selectedFile.type] || FileText;
                return <Icon size={14} style={{ color: typeColors[selectedFile.type] || '#6b7280' }} />;
              })()}
              <span className="text-sm font-medium text-white">{selectedFile.name}</span>
            </div>
            <span className="text-[11px] text-zinc-500">{selectedFile.size} · Modified {selectedFile.modified}</span>
          </div>
          <div className="flex-1 p-6 overflow-y-auto">
            <pre className="text-sm text-zinc-400 leading-relaxed whitespace-pre-wrap font-mono">
              {selectedFile.preview}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
