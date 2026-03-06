'use client';

import { FileDown, LayoutGrid, UserPlus, ChevronDown } from 'lucide-react';
import { useState } from 'react';

interface FleetActionButtonsProps {
  onAddAgent?: () => void;
  onToggleDepartmentView?: () => void;
}

export default function FleetActionButtons({ onAddAgent, onToggleDepartmentView }: FleetActionButtonsProps) {
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [isDepartmentView, setIsDepartmentView] = useState(true);

  const handleExport = (format: 'pdf' | 'csv') => {
    console.log(`Exporting fleet report as ${format.toUpperCase()}...`);
    // TODO: Implement actual export logic
    setShowExportMenu(false);
  };

  const handleToggleView = () => {
    setIsDepartmentView(!isDepartmentView);
    onToggleDepartmentView?.();
  };

  return (
    <div className="flex items-center gap-3">
      {/* Export Fleet Report */}
      <div className="relative">
        <button
          onClick={() => setShowExportMenu(!showExportMenu)}
          className="flex items-center gap-2 px-4 py-2 bg-[#18181b] border border-[#27272a] rounded-lg text-sm text-white hover:border-[#3f3f46] hover:bg-[#1f1f23] transition-all"
        >
          <FileDown size={16} />
          Export Report
          <ChevronDown size={14} className="text-zinc-500" />
        </button>

        {showExportMenu && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowExportMenu(false)}
            />
            {/* Dropdown Menu */}
            <div className="absolute top-full mt-2 left-0 z-20 w-48 bg-[#18181b] border border-[#27272a] rounded-lg shadow-xl overflow-hidden">
              <button
                onClick={() => handleExport('pdf')}
                className="w-full px-4 py-2.5 text-left text-sm text-white hover:bg-[#1f1f23] transition-colors flex items-center gap-2"
              >
                <FileDown size={14} className="text-zinc-500" />
                Export as PDF
              </button>
              <button
                onClick={() => handleExport('csv')}
                className="w-full px-4 py-2.5 text-left text-sm text-white hover:bg-[#1f1f23] transition-colors flex items-center gap-2 border-t border-[#27272a]"
              >
                <FileDown size={14} className="text-zinc-500" />
                Export as CSV
              </button>
            </div>
          </>
        )}
      </div>

      {/* Department View Toggle */}
      <button
        onClick={handleToggleView}
        className={`flex items-center gap-2 px-4 py-2 border rounded-lg text-sm transition-all ${
          isDepartmentView
            ? 'bg-blue-600/10 border-blue-600/30 text-blue-400'
            : 'bg-[#18181b] border-[#27272a] text-white hover:border-[#3f3f46] hover:bg-[#1f1f23]'
        }`}
      >
        <LayoutGrid size={16} />
        Department View
      </button>

      {/* Add Agent */}
      <button
        onClick={onAddAgent}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-500 transition-colors"
      >
        <UserPlus size={16} />
        Add Agent
      </button>
    </div>
  );
}
