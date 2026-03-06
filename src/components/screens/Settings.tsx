'use client';

import { useState } from 'react';

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 ${
        enabled ? 'bg-blue-600' : 'bg-[#27272a]'
      }`}
    >
      <span
        className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
          enabled ? 'translate-x-5' : 'translate-x-0.5'
        }`}
      />
    </button>
  );
}

export default function Settings() {
  const [settings, setSettings] = useState({
    darkMode: true,
    notifications: true,
    sounds: false,
    voiceMode: true,
    autoApprove: false,
    telemetry: true,
    compactMode: false,
    animations: true,
  });

  const toggle = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <div>
        <p className="text-[11px] font-medium uppercase tracking-widest text-zinc-500 mb-2">
          Mission Control › Settings
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-white">Settings</h1>
        <p className="text-sm text-zinc-500 mt-1">Configure Mission Control preferences</p>
      </div>

      {/* General */}
      <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-6">
        <h2 className="text-sm font-semibold text-white mb-1">General</h2>
        <p className="text-xs text-zinc-500 mb-6">Basic application settings</p>

        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-300">Application Name</p>
              <p className="text-xs text-zinc-600 mt-0.5">Display name in the sidebar and title bar</p>
            </div>
            <input
              type="text"
              defaultValue="Mission Control"
              className="w-56 bg-[#111113] border border-[#27272a] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-colors"
            />
          </div>

          <div className="border-t border-[#27272a]/50" />

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-300">Default Model</p>
              <p className="text-xs text-zinc-600 mt-0.5">Model used for new agent instances</p>
            </div>
            <select className="w-56 bg-[#111113] border border-[#27272a] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-colors appearance-none cursor-pointer">
              <option>Claude Opus 4.6</option>
              <option>Sonnet 4.5</option>
              <option>GPT-4o</option>
              <option>Gemini 2.5 Pro</option>
            </select>
          </div>

          <div className="border-t border-[#27272a]/50" />

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-300">Timezone</p>
              <p className="text-xs text-zinc-600 mt-0.5">Used for cron scheduling and timestamps</p>
            </div>
            <select className="w-56 bg-[#111113] border border-[#27272a] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-colors appearance-none cursor-pointer">
              <option>America/New_York (EST)</option>
              <option>America/Chicago (CST)</option>
              <option>America/Los_Angeles (PST)</option>
              <option>UTC</option>
            </select>
          </div>
        </div>
      </div>

      {/* Appearance */}
      <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-6">
        <h2 className="text-sm font-semibold text-white mb-1">Appearance</h2>
        <p className="text-xs text-zinc-500 mb-6">Customize the look and feel</p>

        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-300">Dark Mode</p>
              <p className="text-xs text-zinc-600 mt-0.5">Use dark theme throughout the app</p>
            </div>
            <Toggle enabled={settings.darkMode} onChange={() => toggle('darkMode')} />
          </div>

          <div className="border-t border-[#27272a]/50" />

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-300">Compact Mode</p>
              <p className="text-xs text-zinc-600 mt-0.5">Reduce spacing for more content on screen</p>
            </div>
            <Toggle enabled={settings.compactMode} onChange={() => toggle('compactMode')} />
          </div>

          <div className="border-t border-[#27272a]/50" />

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-300">Animations</p>
              <p className="text-xs text-zinc-600 mt-0.5">Enable transition animations</p>
            </div>
            <Toggle enabled={settings.animations} onChange={() => toggle('animations')} />
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-6">
        <h2 className="text-sm font-semibold text-white mb-1">Notifications</h2>
        <p className="text-xs text-zinc-500 mb-6">Control how you receive alerts</p>

        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-300">Push Notifications</p>
              <p className="text-xs text-zinc-600 mt-0.5">Receive desktop notifications for important events</p>
            </div>
            <Toggle enabled={settings.notifications} onChange={() => toggle('notifications')} />
          </div>

          <div className="border-t border-[#27272a]/50" />

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-300">Sound Effects</p>
              <p className="text-xs text-zinc-600 mt-0.5">Play sounds for notifications and actions</p>
            </div>
            <Toggle enabled={settings.sounds} onChange={() => toggle('sounds')} />
          </div>

          <div className="border-t border-[#27272a]/50" />

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-300">Voice Mode</p>
              <p className="text-xs text-zinc-600 mt-0.5">Enable voice input for the Command Center</p>
            </div>
            <Toggle enabled={settings.voiceMode} onChange={() => toggle('voiceMode')} />
          </div>
        </div>
      </div>

      {/* API & Data */}
      <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-6">
        <h2 className="text-sm font-semibold text-white mb-1">API & Data</h2>
        <p className="text-xs text-zinc-500 mb-6">API access and data management</p>

        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-300">Auto-Approve Low Risk</p>
              <p className="text-xs text-zinc-600 mt-0.5">Automatically approve low-risk actions without review</p>
            </div>
            <Toggle enabled={settings.autoApprove} onChange={() => toggle('autoApprove')} />
          </div>

          <div className="border-t border-[#27272a]/50" />

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-300">Usage Telemetry</p>
              <p className="text-xs text-zinc-600 mt-0.5">Help improve Mission Control by sharing anonymous usage data</p>
            </div>
            <Toggle enabled={settings.telemetry} onChange={() => toggle('telemetry')} />
          </div>

          <div className="border-t border-[#27272a]/50" />

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-300">API Key</p>
              <p className="text-xs text-zinc-600 mt-0.5">Your OpenClaw API key for external access</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="password"
                defaultValue="oc_sk_1234567890abcdef"
                className="w-48 bg-[#111113] border border-[#27272a] rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-blue-500/50 transition-colors"
                readOnly
              />
              <button className="px-3 py-2 text-xs font-medium rounded-lg border border-[#27272a] text-zinc-400 hover:text-white hover:border-[#3f3f46] transition-colors">
                Copy
              </button>
            </div>
          </div>

          <div className="border-t border-[#27272a]/50" />

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-400">Danger Zone</p>
              <p className="text-xs text-zinc-600 mt-0.5">Permanently delete all agent data and memory files</p>
            </div>
            <button className="px-4 py-2 text-xs font-medium rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors">
              Reset All Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
