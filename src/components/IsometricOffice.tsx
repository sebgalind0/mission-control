'use client';

import { useEffect, useRef, useState } from 'react';
import * as PIXI from 'pixi.js';
import { gsap } from 'gsap';
import OrgChartModal from './OrgChartModal';

interface Agent {
  id: string;
  name: string;
  role: string;
  dept: string;
  status: 'working' | 'idle' | 'blocked';
  zone: 'cafe' | 'conference' | 'exec' | 'engineering' | 'design' | 'help-desk' | 'operations';
  initial: string;
  color: string;
}

// Hardcoded agent data with zone assignments
const agents: Agent[] = [
  // Executive Zone
  { id: 'main', name: 'Rick Sanchez', role: 'CEO', dept: 'Executive', status: 'working', zone: 'exec', initial: 'R', color: '#3b82f6' },
  
  // Engineering Zone
  { id: 'larry', name: 'Larry', role: 'CTO', dept: 'Engineering', status: 'working', zone: 'engineering', initial: 'L', color: '#10b981' },
  { id: 'neo', name: 'Neo', role: 'Frontend', dept: 'Engineering', status: 'working', zone: 'engineering', initial: 'N', color: '#6366f1' },
  { id: 'bolt', name: 'Bolt', role: 'Backend', dept: 'Engineering', status: 'working', zone: 'engineering', initial: 'B', color: '#eab308' },
  { id: 'roger', name: 'Roger', role: 'Infrastructure', dept: 'Engineering', status: 'idle', zone: 'engineering', initial: 'Ro', color: '#f97316' },
  { id: 'kai', name: 'Kai', role: 'Mobile / iOS', dept: 'Engineering', status: 'working', zone: 'engineering', initial: 'K', color: '#ec4899' },
  
  // Marketing (Conference Zone)
  { id: 'caesar', name: 'Julius Caesar', role: 'CMO', dept: 'Marketing', status: 'working', zone: 'conference', initial: 'JC', color: '#ef4444' },
  { id: 'elon', name: 'Elon', role: 'X / Twitter', dept: 'Marketing', status: 'working', zone: 'conference', initial: 'E', color: '#f97316' },
  { id: 'vegeta', name: 'Vegeta', role: 'LinkedIn', dept: 'Marketing', status: 'idle', zone: 'conference', initial: 'V', color: '#8b5cf6' },
  { id: 'thoth', name: 'Thoth', role: 'Content / Blog', dept: 'Marketing', status: 'working', zone: 'conference', initial: 'T', color: '#d97706' },
  
  // Operations Zone
  { id: 'achilles', name: 'Achilles', role: 'COO', dept: 'Operations', status: 'working', zone: 'operations', initial: 'A', color: '#3b82f6' },
  { id: 'olivia', name: 'Olivia', role: 'Exec Assistant', dept: 'Operations', status: 'working', zone: 'operations', initial: 'O', color: '#f472b6' },
  
  // Design Zone
  { id: 'george', name: 'George', role: 'Head of Design', dept: 'Design', status: 'working', zone: 'design', initial: 'G', color: '#f59e0b' },
  { id: 'jobs', name: 'Steve Jobs', role: 'UI/UX Designer', dept: 'Design', status: 'working', zone: 'design', initial: 'SJ', color: '#a3a3a3' },
  
  // Help Desk / Contractors
  { id: 'popeye', name: 'Cleopatra', role: 'Health Coach', dept: 'Contractors', status: 'working', zone: 'help-desk', initial: 'C', color: '#22c55e' },
  { id: 'nico', name: 'El Father', role: 'Academic (Nico)', dept: 'Contractors', status: 'idle', zone: 'help-desk', initial: 'E', color: '#f59e0b' },
  { id: 'together', name: 'Dr. Ashley', role: 'Couples Therapy', dept: 'Contractors', status: 'idle', zone: 'help-desk', initial: 'A', color: '#a855f7' },
  { id: 'tesla', name: 'Tesla', role: 'Robotics Tutor', dept: 'Contractors', status: 'working', zone: 'help-desk', initial: 'T', color: '#06b6d4' },
];

// Zone positions in isometric space (X, Y in pixels)
const zonePositions: Record<string, { x: number; y: number; agents: Array<{ dx: number; dy: number }> }> = {
  'exec': { 
    x: 400, 
    y: 200,
    agents: [{ dx: 0, dy: 0 }]
  },
  'engineering': { 
    x: 800, 
    y: 300,
    agents: [
      { dx: -60, dy: -30 },
      { dx: 60, dy: -30 },
      { dx: -60, dy: 30 },
      { dx: 60, dy: 30 },
      { dx: 0, dy: 0 }
    ]
  },
  'design': { 
    x: 600, 
    y: 500,
    agents: [
      { dx: -40, dy: 0 },
      { dx: 40, dy: 0 }
    ]
  },
  'conference': { 
    x: 1100, 
    y: 400,
    agents: [
      { dx: -50, dy: -25 },
      { dx: 50, dy: -25 },
      { dx: -50, dy: 25 },
      { dx: 50, dy: 25 }
    ]
  },
  'operations': { 
    x: 400, 
    y: 600,
    agents: [
      { dx: -40, dy: 0 },
      { dx: 40, dy: 0 }
    ]
  },
  'help-desk': { 
    x: 1000, 
    y: 700,
    agents: [
      { dx: -60, dy: -30 },
      { dx: 60, dy: -30 },
      { dx: -30, dy: 30 },
      { dx: 30, dy: 30 }
    ]
  },
  'cafe': { 
    x: 200, 
    y: 400,
    agents: []
  }
};

// Sprite creator functions
function createWorkingSprite(color: string, initial: string): PIXI.Container {
  const container = new PIXI.Container();
  const colorValue = parseInt(color.replace('#', ''), 16);

  // Desk (simple rectangle)
  const desk = new PIXI.Graphics();
  desk.rect(-18, 10, 36, 20);
  desk.fill({ color: 0x3f3f46 });
  desk.stroke({ color: 0x52525b, width: 1 });
  container.addChild(desk);

  // Agent body (rounded rectangle sitting at desk)
  const body = new PIXI.Graphics();
  body.roundRect(-12, -10, 24, 20, 4);
  body.fill({ color: colorValue });
  body.stroke({ color: 0xffffff, width: 1, alpha: 0.3 });
  container.addChild(body);

  // Head (circle)
  const head = new PIXI.Graphics();
  head.circle(0, -18, 8);
  head.fill({ color: colorValue });
  head.stroke({ color: 0xffffff, width: 1, alpha: 0.3 });
  container.addChild(head);

  // Initial text on head
  const text = new PIXI.Text({
    text: initial,
    style: {
      fontFamily: 'Inter, system-ui, sans-serif',
      fontSize: 8,
      fontWeight: '600',
      fill: 0xffffff,
      align: 'center',
    }
  });
  text.anchor.set(0.5);
  text.y = -18;
  container.addChild(text);

  // Keyboard indicator (small rectangle)
  const keyboard = new PIXI.Graphics();
  keyboard.rect(-8, 15, 16, 6);
  keyboard.fill({ color: 0x52525b });
  container.addChild(keyboard);

  return container;
}

function createIdleSprite(color: string, initial: string): PIXI.Container {
  const container = new PIXI.Container();
  const colorValue = parseInt(color.replace('#', ''), 16);

  // Body (standing - taller rectangle)
  const body = new PIXI.Graphics();
  body.roundRect(-10, -5, 20, 30, 4);
  body.fill({ color: colorValue, alpha: 0.7 });
  body.stroke({ color: 0xffffff, width: 1, alpha: 0.3 });
  container.addChild(body);

  // Head (circle)
  const head = new PIXI.Graphics();
  head.circle(0, -18, 8);
  head.fill({ color: colorValue, alpha: 0.7 });
  head.stroke({ color: 0xffffff, width: 1, alpha: 0.3 });
  container.addChild(head);

  // Initial text on head
  const text = new PIXI.Text({
    text: initial,
    style: {
      fontFamily: 'Inter, system-ui, sans-serif',
      fontSize: 8,
      fontWeight: '600',
      fill: 0xffffff,
      align: 'center',
    }
  });
  text.anchor.set(0.5);
  text.y = -18;
  container.addChild(text);

  // Arms (casual pose)
  const leftArm = new PIXI.Graphics();
  leftArm.rect(-12, 0, 4, 12);
  leftArm.fill({ color: colorValue, alpha: 0.7 });
  container.addChild(leftArm);

  const rightArm = new PIXI.Graphics();
  rightArm.rect(8, 0, 4, 12);
  rightArm.fill({ color: colorValue, alpha: 0.7 });
  container.addChild(rightArm);

  return container;
}

function createBlockedSprite(color: string, initial: string): PIXI.Container {
  const container = new PIXI.Container();
  const colorValue = parseInt(color.replace('#', ''), 16);

  // Body (standing - taller rectangle)
  const body = new PIXI.Graphics();
  body.roundRect(-10, -5, 20, 30, 4);
  body.fill({ color: colorValue });
  body.stroke({ color: 0xef4444, width: 2 });
  container.addChild(body);

  // Head (circle)
  const head = new PIXI.Graphics();
  head.circle(0, -18, 8);
  head.fill({ color: colorValue });
  head.stroke({ color: 0xef4444, width: 2 });
  container.addChild(head);

  // Initial text on head
  const text = new PIXI.Text({
    text: initial,
    style: {
      fontFamily: 'Inter, system-ui, sans-serif',
      fontSize: 8,
      fontWeight: '600',
      fill: 0xffffff,
      align: 'center',
    }
  });
  text.anchor.set(0.5);
  text.y = -18;
  container.addChild(text);

  // Question mark overhead
  const questionMark = new PIXI.Text({
    text: '?',
    style: {
      fontFamily: 'Inter, system-ui, sans-serif',
      fontSize: 16,
      fontWeight: 'bold',
      fill: 0xef4444,
      align: 'center',
    }
  });
  questionMark.anchor.set(0.5);
  questionMark.y = -35;
  container.addChild(questionMark);

  return container;
}

interface IsometricOfficeProps {
  onAgentClick?: (name: string, emoji: string) => void;
}

export default function IsometricOffice({ onAgentClick }: IsometricOfficeProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<PIXI.Application | null>(null);
  const [hoveredAgent, setHoveredAgent] = useState<Agent | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isOrgChartOpen, setIsOrgChartOpen] = useState(false);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Create PixiJS app
    const app = new PIXI.Application();
    appRef.current = app;

    // Initialize the app
    (async () => {
      await app.init({
        width: 1600,
        height: 1000,
        backgroundColor: 0x09090b,
        antialias: true,
      });

      canvasRef.current?.appendChild(app.canvas as HTMLCanvasElement);

      // Draw isometric grid (simple floor tiles)
      const gridContainer = new PIXI.Container();
      app.stage.addChild(gridContainer);

      // Draw simple isometric floor grid
      for (let row = 0; row < 10; row++) {
        for (let col = 0; col < 15; col++) {
          const isoX = (col - row) * 48;
          const isoY = (col + row) * 24;
          
          const tile = new PIXI.Graphics();
          tile.rect(0, 0, 96, 48);
          tile.fill({ color: 0x18181b, alpha: 0.3 });
          tile.stroke({ color: 0x27272a, width: 1 });
          
          tile.x = 400 + isoX;
          tile.y = 200 + isoY;
          
          gridContainer.addChild(tile);
        }
      }

      // Group agents by zone
      const agentsByZone = agents.reduce((acc, agent) => {
        if (!acc[agent.zone]) acc[agent.zone] = [];
        acc[agent.zone].push(agent);
        return acc;
      }, {} as Record<string, Agent[]>);

      // Place agents in their zones
      Object.entries(agentsByZone).forEach(([zone, zoneAgents]) => {
        const zonePos = zonePositions[zone];
        if (!zonePos) return;

        zoneAgents.forEach((agent, index) => {
          const agentOffset = zonePos.agents[index] || { dx: 0, dy: 0 };
          const x = zonePos.x + agentOffset.dx;
          const y = zonePos.y + agentOffset.dy;

          // Create agent sprite based on status
          let sprite: PIXI.Container;
          if (agent.status === 'working') {
            sprite = createWorkingSprite(agent.color, agent.initial);
          } else if (agent.status === 'idle') {
            sprite = createIdleSprite(agent.color, agent.initial);
          } else {
            sprite = createBlockedSprite(agent.color, agent.initial);
          }

          sprite.x = x;
          sprite.y = y;

          // Make interactive
          sprite.eventMode = 'static';
          sprite.cursor = 'pointer';

          // Click handler
          sprite.on('pointerdown', () => {
            alert(`${agent.name}\n${agent.role}\nStatus: ${agent.status}`);
          });

          // Hover handlers
          sprite.on('pointerover', (event) => {
            setHoveredAgent(agent);
            sprite.scale.set(1.1);
          });

          sprite.on('pointerout', () => {
            setHoveredAgent(null);
            sprite.scale.set(1);
          });

          sprite.on('pointermove', (event) => {
            const canvasBounds = (app.canvas as HTMLCanvasElement).getBoundingClientRect();
            setMousePos({
              x: event.globalX - canvasBounds.left,
              y: event.globalY - canvasBounds.top
            });
          });

          app.stage.addChild(sprite);

          // Add GSAP animations based on status
          if (agent.status === 'working') {
            // Gentle bounce (typing motion)
            gsap.to(sprite, {
              y: y - 2,
              duration: 0.4,
              repeat: -1,
              yoyo: true,
              ease: 'power1.inOut'
            });
          } else if (agent.status === 'idle') {
            // Slow sway
            gsap.to(sprite, {
              x: x + 3,
              duration: 2,
              repeat: -1,
              yoyo: true,
              ease: 'sine.inOut'
            });
          } else if (agent.status === 'blocked') {
            // Question mark pulsing
            const questionMark = sprite.children.find(child => 
              child instanceof PIXI.Text && (child as PIXI.Text).text === '?'
            );
            if (questionMark) {
              gsap.to(questionMark, {
                alpha: 0.3,
                duration: 0.8,
                repeat: -1,
                yoyo: true,
                ease: 'power1.inOut'
              });
            }
          }
        });
      });
    })();

    return () => {
      gsap.killTweensOf('*'); // Clean up all GSAP animations
      app.destroy(true, { children: true });
    };
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-white mb-2">Fleet Overview</h1>
        <p className="text-sm text-zinc-400">
          {agents.length} agents • {agents.filter(a => a.status === 'working').length} working • 
          {' '}{agents.filter(a => a.status === 'idle').length} idle •
          {' '}{agents.filter(a => a.status === 'blocked').length} blocked
        </p>
      </div>

      {/* Canvas Container */}
      <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-5 relative overflow-hidden">
        <div 
          ref={canvasRef}
          className="relative"
          style={{ width: '1600px', height: '1000px', margin: '0 auto' }}
        />

        {/* Tooltip */}
        {hoveredAgent && (
          <div
            className="absolute pointer-events-none bg-[#09090b] border border-[#27272a] rounded-lg px-3 py-2 shadow-xl z-50"
            style={{
              left: `${mousePos.x + 10}px`,
              top: `${mousePos.y + 10}px`,
            }}
          >
            <div className="text-sm font-medium text-white">{hoveredAgent.name}</div>
            <div className="text-xs text-zinc-400">{hoveredAgent.role}</div>
            <div className="text-xs text-zinc-500 mt-1 capitalize">
              Status: <span className={
                hoveredAgent.status === 'working' ? 'text-green-400' :
                hoveredAgent.status === 'idle' ? 'text-yellow-400' :
                'text-red-400'
              }>{hoveredAgent.status}</span>
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-400"></div>
          <span className="text-zinc-400">Working (typing)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-yellow-400 opacity-50"></div>
          <span className="text-zinc-400">Idle (swaying)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-400"></div>
          <span className="text-zinc-400">Blocked (?)</span>
        </div>
      </div>
    </div>
  );
}
