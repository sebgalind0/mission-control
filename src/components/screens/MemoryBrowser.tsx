'use client';

import { useState, useEffect } from 'react';
import { Search, FileText, Brain, Clock, Loader2 } from 'lucide-react';

interface MemoryFile {
  key: string;
  name: string;
  agent: string;
  agentId: string;
  type: 'core' | 'daily' | 'state';
  size: number;
  modified: string;
}

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

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(isoDate: string): string {
  const date = new Date(isoDate);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return '1d ago';
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

export default function MemoryBrowser() {
  const [files, setFiles] = useState<MemoryFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<MemoryFile | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [contentLoading, setContentLoading] = useState(false);
  const [scope, setScope] = useState<'curated' | 'all'>('curated');

  // Load file list
  useEffect(() => {
    setLoading(true);
    fetch(`/api/memory?scope=${scope}`)
      .then(res => res.json())
      .then(data => {
        if (data.files) {
          setFiles(data.files);
          if (data.files.length > 0) {
            setSelectedFile(data.files[0]);
          }
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [scope]);

  // Load file content when selected
  useEffect(() => {
    if (!selectedFile) return;
    
    setContentLoading(true);
    fetch(`/api/memory?file=${encodeURIComponent(selectedFile.key)}`)
      .then(res => res.json())
      .then(data => {
        if (data.content) {
          setFileContent(data.content);
        }
      })
      .catch(console.error)
      .finally(() => setContentLoading(false));
  }, [selectedFile]);

  const filteredFiles = searchQuery
    ? files.filter(f => `${f.name} ${f.agent}`.toLowerCase().includes(searchQuery.toLowerCase()))
    : files;

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <div>
        <p className="text-[11px] font-medium uppercase tracking-widest text-zinc-500 mb-2">
          Mission Control › Memory Browser
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-white">Memory Browser</h1>
        <p className="text-sm text-zinc-500 mt-1">Focused by default on active company memory, with the option to widen into full archives.</p>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => setScope('curated')}
          className={`text-[11px] px-3 py-1.5 rounded-full font-medium transition-colors ${
            scope === 'curated'
              ? 'bg-blue-600 text-white'
              : 'bg-[#18181b] border border-[#27272a] text-zinc-400 hover:text-white hover:border-[#3f3f46]'
          }`}
        >
          Focused
        </button>
        <button
          onClick={() => setScope('all')}
          className={`text-[11px] px-3 py-1.5 rounded-full font-medium transition-colors ${
            scope === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-[#18181b] border border-[#27272a] text-zinc-400 hover:text-white hover:border-[#3f3f46]'
          }`}
        >
          All Memory
        </button>
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
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 size={20} className="text-zinc-500 animate-spin" />
              </div>
            ) : filteredFiles.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-zinc-500">
                No files found
              </div>
            ) : (
              filteredFiles.map((file) => {
                const Icon = typeIcons[file.type] || FileText;
                const isSelected = selectedFile?.name === file.name;
                return (
                  <button
                    key={file.key}
                    onClick={() => setSelectedFile(file)}
                    className={`w-full text-left px-4 py-3 border-b border-[#27272a]/50 transition-colors ${
                      isSelected ? 'bg-[#1f1f23]' : 'hover:bg-[#1f1f23]/50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon size={14} style={{ color: typeColors[file.type] || '#6b7280' }} />
                        <div className={`${isSelected ? 'text-white' : 'text-zinc-300'}`}>
                          <div className="text-sm font-medium">{file.name}</div>
                          <div className="text-[11px] text-zinc-500 mt-0.5">{file.agent}</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 mt-1 ml-[22px]">
                      <span className="text-[11px] text-zinc-600">{formatFileSize(file.size)}</span>
                      <span className="text-[11px] text-zinc-700">·</span>
                      <span className="text-[11px] text-zinc-600">{formatDate(file.modified)}</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Panel - Content Preview */}
        <div className="bg-[#18181b] flex flex-col">
          {selectedFile && (
            <>
              <div className="p-4 border-b border-[#27272a] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {(() => {
                    const Icon = typeIcons[selectedFile.type] || FileText;
                    return <Icon size={14} style={{ color: typeColors[selectedFile.type] || '#6b7280' }} />;
                  })()}
                  <span className="text-sm font-medium text-white">{selectedFile.name}</span>
                </div>
                <span className="text-[11px] text-zinc-500">
                  {formatFileSize(selectedFile.size)} · Modified {formatDate(selectedFile.modified)}
                </span>
              </div>
              <div className="flex-1 p-6 overflow-y-auto">
                {contentLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 size={20} className="text-zinc-500 animate-spin" />
                  </div>
                ) : (
                  <div className="prose prose-invert prose-sm max-w-none">
                    <pre className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap font-mono bg-transparent border-none p-0">
                      {fileContent}
                    </pre>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
