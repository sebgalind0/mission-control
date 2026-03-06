'use client';

import { useState } from 'react';
import { FileText, Code, Image, File } from 'lucide-react';

const fileTypes = [
  { id: 'all', label: 'All', count: 12 },
  { id: 'markdown', label: 'Markdown', count: 6 },
  { id: 'code', label: 'Code', count: 3 },
  { id: 'config', label: 'Config', count: 2 },
  { id: 'media', label: 'Media', count: 1 },
];

const documents = [
  { id: 1, name: 'AGENTS.md', type: 'markdown', size: '8.2 KB', modified: '1d ago', description: 'Workspace configuration and agent behavior rules', icon: FileText },
  { id: 2, name: 'SOUL.md', type: 'markdown', size: '1.1 KB', modified: '5d ago', description: 'Core identity and personality definitions', icon: FileText },
  { id: 3, name: 'USER.md', type: 'markdown', size: '0.8 KB', modified: '7d ago', description: 'User profile and preferences for Sebastian', icon: FileText },
  { id: 4, name: 'TOOLS.md', type: 'markdown', size: '5.6 KB', modified: '3d ago', description: 'Tool configuration, API keys, and integration notes', icon: FileText },
  { id: 5, name: 'IDENTITY.md', type: 'markdown', size: '0.4 KB', modified: '10d ago', description: 'Agent identity card — name, emoji, vibe', icon: FileText },
  { id: 6, name: 'MEMORY.md', type: 'markdown', size: '4.2 KB', modified: '2h ago', description: 'Long-term curated memory store', icon: FileText },
  { id: 7, name: 'outlook-email.sh', type: 'code', size: '3.4 KB', modified: '2w ago', description: 'Microsoft Graph email access script', icon: Code },
  { id: 8, name: 'tts-elevenlabs.sh', type: 'code', size: '1.2 KB', modified: '1w ago', description: 'ElevenLabs text-to-speech wrapper', icon: Code },
  { id: 9, name: 'deploy.sh', type: 'code', size: '2.1 KB', modified: '3d ago', description: 'Deployment automation script', icon: Code },
  { id: 10, name: 'package.json', type: 'config', size: '1.8 KB', modified: '1d ago', description: 'Mission Control project configuration', icon: File },
  { id: 11, name: 'tsconfig.json', type: 'config', size: '0.6 KB', modified: '5d ago', description: 'TypeScript compiler configuration', icon: File },
  { id: 12, name: 'architecture.png', type: 'media', size: '245 KB', modified: '1w ago', description: 'System architecture diagram', icon: Image },
];

const typeColors: Record<string, string> = {
  markdown: '#3b82f6',
  code: '#22c55e',
  config: '#f59e0b',
  media: '#a855f7',
};

export default function DocsLibrary() {
  const [activeFilter, setActiveFilter] = useState('all');

  const filteredDocs = activeFilter === 'all'
    ? documents
    : documents.filter(d => d.type === activeFilter);

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <div>
        <p className="text-[11px] font-medium uppercase tracking-widest text-zinc-500 mb-2">
          Mission Control › Documents
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-white">Documents</h1>
        <p className="text-sm text-zinc-500 mt-1">Browse workspace files and documentation</p>
      </div>

      {/* Filter Pills */}
      <div className="flex items-center gap-2">
        {fileTypes.map((ft) => (
          <button
            key={ft.id}
            onClick={() => setActiveFilter(ft.id)}
            className={`text-[11px] px-3 py-1.5 rounded-full font-medium transition-colors ${
              activeFilter === ft.id
                ? 'bg-blue-600 text-white'
                : 'bg-[#18181b] border border-[#27272a] text-zinc-400 hover:text-white hover:border-[#3f3f46]'
            }`}
          >
            {ft.label} ({ft.count})
          </button>
        ))}
      </div>

      {/* Document Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredDocs.map((doc) => {
          const Icon = doc.icon;
          const color = typeColors[doc.type] || '#6b7280';
          return (
            <div
              key={doc.id}
              className="bg-[#18181b] border border-[#27272a] rounded-xl p-6 hover:border-[#3f3f46] transition-colors cursor-pointer"
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${color}15` }}>
                  <Icon size={16} style={{ color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-white truncate">{doc.name}</h3>
                  <span className="text-[11px] px-2 py-0.5 rounded-md font-medium mt-1 inline-block"
                    style={{ backgroundColor: `${color}15`, color }}>
                    {doc.type}
                  </span>
                </div>
              </div>
              <p className="text-xs text-zinc-500 mb-3 leading-relaxed">{doc.description}</p>
              <div className="flex items-center justify-between text-[11px] text-zinc-600">
                <span>{doc.size}</span>
                <span>{doc.modified}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
