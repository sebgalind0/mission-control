'use client';

import { ArrowUp } from 'lucide-react';

const agents = [
  { id: 'main', name: 'Rick Sanchez', color: '#3b82f6', initial: 'R' },
  { id: 'popeye', name: 'Cleopatra', color: '#22c55e', initial: 'C' },
  { id: 'nico', name: 'El Father', color: '#f59e0b', initial: 'E' },
  { id: 'together', name: 'Dr. Ashley', color: '#a855f7', initial: 'A' },
  { id: 'tesla', name: 'Tesla', color: '#06b6d4', initial: 'T' },
];

const tools = [
  {
    id: 1,
    title: 'Web Scraper Pro',
    description: 'Advanced web scraping with anti-detection, proxy rotation, and structured data extraction.',
    proposer: 'main',
    votes: 14,
    status: 'approved',
    category: 'Data',
  },
  {
    id: 2,
    title: 'PDF Analyzer',
    description: 'Extract text, tables, and charts from PDF documents with OCR support.',
    proposer: 'nico',
    votes: 11,
    status: 'approved',
    category: 'Analysis',
  },
  {
    id: 3,
    title: 'Notion Integration',
    description: 'Two-way sync between agent memory and Notion workspace for collaboration.',
    proposer: 'main',
    votes: 9,
    status: 'proposed',
    category: 'Integration',
  },
  {
    id: 4,
    title: 'Image Generator',
    description: 'Generate images using DALL-E or Midjourney API for visual content creation.',
    proposer: 'main',
    votes: 7,
    status: 'proposed',
    category: 'Creative',
  },
  {
    id: 5,
    title: 'Code Executor Sandbox',
    description: 'Isolated sandbox for running Python, Node.js, and shell scripts safely.',
    proposer: 'tesla',
    votes: 12,
    status: 'approved',
    category: 'Engineering',
  },
  {
    id: 6,
    title: 'Meal Planner',
    description: 'Nutrition-aware meal planning based on WHOOP recovery and fitness goals.',
    proposer: 'popeye',
    votes: 5,
    status: 'proposed',
    category: 'Health',
  },
  {
    id: 7,
    title: 'Voice Cloner',
    description: 'Clone voices for personalized TTS across different agent personalities.',
    proposer: 'main',
    votes: 3,
    status: 'review',
    category: 'Audio',
  },
  {
    id: 8,
    title: 'Relationship Journal',
    description: 'Structured journaling framework for tracking relationship insights and growth.',
    proposer: 'together',
    votes: 4,
    status: 'proposed',
    category: 'Therapy',
  },
];

const statusConfig: Record<string, { bg: string; text: string }> = {
  approved: { bg: 'bg-emerald-500/10', text: 'text-emerald-400' },
  proposed: { bg: 'bg-blue-500/10', text: 'text-blue-400' },
  review: { bg: 'bg-amber-500/10', text: 'text-amber-400' },
  rejected: { bg: 'bg-red-500/10', text: 'text-red-400' },
};

export default function Marketplace() {
  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <div>
        <p className="text-[11px] font-medium uppercase tracking-widest text-zinc-500 mb-2">
          Mission Control › Marketplace
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-white">Marketplace</h1>
        <p className="text-sm text-zinc-500 mt-1">Propose, vote on, and install tools for the fleet</p>
      </div>

      {/* Tool Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {tools.map((tool) => {
          const agent = agents.find(a => a.id === tool.proposer);
          const status = statusConfig[tool.status] || statusConfig.proposed;
          return (
            <div
              key={tool.id}
              className="bg-[#18181b] border border-[#27272a] rounded-xl p-6 hover:border-[#3f3f46] transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-sm font-semibold text-white">{tool.title}</h3>
                    <span className={`text-[11px] px-2 py-0.5 rounded-md font-medium ${status.bg} ${status.text}`}>
                      {tool.status}
                    </span>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 font-medium">
                    {tool.category}
                  </span>
                </div>

                {/* Vote Button */}
                <button className="flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg border border-[#27272a] hover:border-[#3f3f46] hover:bg-[#1f1f23] transition-colors group">
                  <ArrowUp size={14} className="text-zinc-500 group-hover:text-blue-400 transition-colors" />
                  <span className="text-xs font-semibold text-zinc-400 group-hover:text-blue-400 transition-colors">{tool.votes}</span>
                </button>
              </div>

              <p className="text-xs text-zinc-500 mb-4 leading-relaxed">{tool.description}</p>

              <div className="flex items-center gap-2">
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: agent?.color || '#6b7280' }}
                >
                  <span className="text-white text-[9px] font-semibold">{agent?.initial}</span>
                </div>
                <span className="text-[11px] text-zinc-500">Proposed by {agent?.name}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
