'use client';

import { useState } from 'react';
import { Zap } from 'lucide-react';

interface Agent {
  id: string;
  name: string;
  status: string;
}

export default function StarOfficeSync({ agents }: { agents: Agent[] }) {
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);

  const syncAllAgents = async () => {
    setSyncing(true);
    try {
      const promises = agents.map((agent) =>
        fetch('/api/star-office/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            agentId: agent.id,
            name: agent.name,
            status: agent.status,
            detail: `Mission Control - ${agent.name}`,
          }),
        })
      );

      await Promise.all(promises);
      setLastSync(new Date().toLocaleTimeString());
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={syncAllAgents}
        disabled={syncing}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Zap size={16} />
        {syncing ? 'Syncing...' : 'Sync to Star-Office'}
      </button>
      {lastSync && (
        <span className="text-xs text-zinc-500">
          Last sync: {lastSync}
        </span>
      )}
    </div>
  );
}
