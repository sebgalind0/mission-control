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
  status: 'online' | 'idle' | 'blocked';
  zone: 'exec' | 'engineering' | 'design' | 'cafe' | 'conference' | 'help-desk' | 'operations';
  initial: string;
  color: string;
}

// Agent data with zone assignments
const agents: Agent[] = [
  // Executive Zone
  { id: 'main', name: 'Rick Sanchez', role: 'CEO', dept: 'Executive', status: 'online', zone: 'exec', initial: 'R', color: '#3b82f6' },
  
  // Engineering Zone
  { id: 'larry', name: 'Larry', role: 'CTO', dept: 'Engineering', status: 'online', zone: 'engineering', initial: 'L', color: '#10b981' },
  { id: 'neo', name: 'Neo', role: 'Frontend', dept: 'Engineering', status: 'online', zone: 'engineering', initial: 'N', color: '#6366f1' },
  { id: 'bolt', name: 'Bolt', role: 'Backend', dept: 'Engineering', status: 'online', zone: 'engineering', initial: 'B', color: '#eab308' },
  { id: 'roger', name: 'Roger', role: 'Infrastructure', dept: 'Engineering', status: 'idle', zone: 'engineering', initial: 'Ro', color: '#f97316' },
  { id: 'kai', name: 'Kai', role: 'Mobile / iOS', dept: 'Engineering', status: 'online', zone: 'engineering', initial: 'K', color: '#ec4899' },
  
  // Marketing (Conference Zone)
  { id: 'caesar', name: 'Julius Caesar', role: 'CMO', dept: 'Marketing', status: 'online', zone: 'conference', initial: 'JC', color: '#ef4444' },
  { id: 'elon', name: 'Elon', role: 'X / Twitter', dept: 'Marketing', status: 'online', zone: 'conference', initial: 'E', color: '#f97316' },
  { id: 'vegeta', name: 'Vegeta', role: 'LinkedIn', dept: 'Marketing', status: 'idle', zone: 'conference', initial: 'V', color: '#8b5cf6' },
  { id: 'thoth', name: 'Thoth', role: 'Content / Blog', dept: 'Marketing', status: 'online', zone: 'conference', initial: 'T', color: '#d97706' },
  
  // Operations Zone
  { id: 'achilles', name: 'Achilles', role: 'COO', dept: 'Operations', status: 'online', zone: 'operations', initial: 'A', color: '#3b82f6' },
  { id: 'olivia', name: 'Olivia', role: 'Exec Assistant', dept: 'Operations', status: 'online', zone: 'operations', initial: 'O', color: '#f472b6' },
  
  // Design Zone
  { id: 'george', name: 'George', role: 'Head of Design', dept: 'Design', status: 'online', zone: 'design', initial: 'G', color: '#f59e0b' },
  { id: 'jobs', name: 'Steve Jobs', role: 'UI/UX Designer', dept: 'Design', status: 'online', zone: 'design', initial: 'SJ', color: '#a3a3a3' },
  
  // Help Desk / Contractors
  { id: 'popeye', name: 'Cleopatra', role: 'Health Coach', dept: 'Contractors', status: 'online', zone: 'help-desk', initial: 'C', color: '#22c55e' },
  { id: 'nico', name: 'El Father', role: 'Academic (Nico)', dept: 'Contractors', status: 'idle', zone: 'help-desk', initial: 'E', color: '#f59e0b' },
  { id: 'together', name: 'Dr. Ashley', role: 'Couples Therapy', dept: 'Contractors', status: 'idle', zone: 'help-desk', initial: 'A', color: '#a855f7' },
  { id: 'tesla', name: 'Tesla', role: 'Robotics Tutor', dept: 'Contractors', status: 'online', zone: 'help-desk', initial: 'T', color: '#06b6d4' },
];

// Zone definitions with colors and furniture
const zones = {
  exec: { 
    name: 'Executive Office', 
    color: 0x3b82f6, 
    gridX: 2, 
    gridY: 2, 
    width: 3, 
    height: 3,
    furniture: [
      { sprite: 'desk_SE', x: 1, y: 1 },
      { sprite: 'chairDesk_SE', x: 1.5, y: 1.5 },
      { sprite: 'lampSquareFloor_SE', x: 0.5, y: 0.5 },
    ]
  },
  engineering: { 
    name: 'Engineering', 
    color: 0x10b981, 
    gridX: 7, 
    gridY: 2, 
    width: 5, 
    height: 4,
    furniture: [
      { sprite: 'desk_SE', x: 1, y: 1 },
      { sprite: 'chairDesk_SE', x: 1.5, y: 1.5 },
      { sprite: 'desk_SW', x: 3, y: 1 },
      { sprite: 'chairDesk_SW', x: 3.5, y: 1.5 },
      { sprite: 'desk_SE', x: 1, y: 3 },
      { sprite: 'chairDesk_SE', x: 1.5, y: 3.5 },
      { sprite: 'desk_SW', x: 3, y: 3 },
      { sprite: 'chairDesk_SW', x: 3.5, y: 3.5 },
      { sprite: 'cabinetBed_SE', x: 0.5, y: 0.5 },
    ]
  },
  design: { 
    name: 'Design Studio', 
    color: 0x8b5cf6, 
    gridX: 2, 
    gridY: 7, 
    width: 4, 
    height: 3,
    furniture: [
      { sprite: 'tableCloth_SE', x: 1, y: 1 },
      { sprite: 'chairModernCushion_SE', x: 0.5, y: 1 },
      { sprite: 'chairModernCushion_SW', x: 2, y: 1 },
      { sprite: 'lampSquareTable_SE', x: 1, y: 1.5 },
    ]
  },
  cafe: { 
    name: 'Cafe', 
    color: 0xf97316, 
    gridX: 13, 
    gridY: 2, 
    width: 3, 
    height: 3,
    furniture: [
      { sprite: 'tableCoffeeGlassSquare_SE', x: 1, y: 1 },
      { sprite: 'loungeChair_NE', x: 0.5, y: 1.5 },
      { sprite: 'loungeChair_NW', x: 1.5, y: 1.5 },
    ]
  },
  conference: { 
    name: 'Conference Room', 
    color: 0xef4444, 
    gridX: 7, 
    gridY: 7, 
    width: 5, 
    height: 4,
    furniture: [
      { sprite: 'tableCloth_SE', x: 2, y: 2 },
      { sprite: 'chairCushion_NE', x: 1, y: 2.5 },
      { sprite: 'chairCushion_NW', x: 3, y: 2.5 },
      { sprite: 'chairCushion_SE', x: 1, y: 1.5 },
      { sprite: 'chairCushion_SW', x: 3, y: 1.5 },
    ]
  },
  'help-desk': { 
    name: 'Help Desk', 
    color: 0xeab308, 
    gridX: 13, 
    gridY: 6, 
    width: 3, 
    height: 4,
    furniture: [
      { sprite: 'desk_SE', x: 1, y: 1 },
      { sprite: 'chairDesk_SE', x: 1.5, y: 1.5 },
      { sprite: 'desk_SE', x: 1, y: 3 },
      { sprite: 'chairDesk_SE', x: 1.5, y: 3.5 },
    ]
  },
  operations: { 
    name: 'Operations', 
    color: 0x06b6d4, 
    gridX: 13, 
    gridY: 11, 
    width: 3, 
    height: 3,
    furniture: [
      { sprite: 'desk_SE', x: 1, y: 1 },
      { sprite: 'chairDesk_SE', x: 1.5, y: 1.5 },
    ]
  },
};

// Isometric conversion helpers
const TILE_WIDTH = 64;
const TILE_HEIGHT = 32;

function gridToIso(gridX: number, gridY: number) {
  return {
    x: (gridX - gridY) * (TILE_WIDTH / 2),
    y: (gridX + gridY) * (TILE_HEIGHT / 2),
  };
}

// Desk positions within each zone (relative to zone origin)
const deskPositions = {
  exec: [
    { x: 1.5, y: 1.5 }, // Rick's executive desk
  ],
  engineering: [
    { x: 1.2, y: 1.2 }, // Desk 1
    { x: 3.2, y: 1.2 }, // Desk 2
    { x: 1.2, y: 2.8 }, // Desk 3
    { x: 3.2, y: 2.8 }, // Desk 4
    { x: 2.2, y: 2.0 }, // Desk 5 (center)
  ],
  design: [
    { x: 1.0, y: 1.5 }, // Desk 1
    { x: 2.5, y: 1.5 }, // Desk 2
  ],
  cafe: [
    { x: 0.8, y: 1.0 }, // Casual spot 1
    { x: 1.5, y: 0.8 }, // Casual spot 2
    { x: 2.2, y: 1.2 }, // Casual spot 3
    { x: 1.0, y: 2.0 }, // Casual spot 4
    { x: 2.0, y: 2.2 }, // Casual spot 5
  ],
  conference: [
    { x: 1.5, y: 1.5 }, // Seat 1
    { x: 2.5, y: 1.5 }, // Seat 2
    { x: 3.5, y: 1.5 }, // Seat 3
    { x: 1.5, y: 2.5 }, // Seat 4
    { x: 2.5, y: 2.5 }, // Seat 5
    { x: 3.5, y: 2.5 }, // Seat 6
  ],
  'help-desk': [
    { x: 1.5, y: 1.2 }, // Support station 1
    { x: 1.5, y: 3.0 }, // Support station 2
  ],
  operations: [
    { x: 1.2, y: 1.2 }, // Desk 1
    { x: 1.8, y: 1.8 }, // Desk 2
  ],
};

// Get agent position based on status
function getAgentPosition(agent: Agent, agentIndex: number): { gridX: number; gridY: number } {
  let targetZone = agent.zone;
  
  // Status-based positioning
  if (agent.status === 'idle') {
    targetZone = 'cafe'; // Idle agents go to cafe
  } else if (agent.status === 'blocked') {
    targetZone = 'help-desk'; // Blocked agents go to help desk
  }
  
  const zone = zones[targetZone];
  if (!zone) return { gridX: 0, gridY: 0 };
  
  const positions = deskPositions[targetZone];
  if (!positions || positions.length === 0) {
    // Fallback to center if no positions defined
    return {
      gridX: zone.gridX + zone.width / 2,
      gridY: zone.gridY + zone.height / 2,
    };
  }
  
  // Assign desk position based on agent index within the zone
  const posIndex = agentIndex % positions.length;
  const pos = positions[posIndex];
  
  return {
    gridX: zone.gridX + pos.x,
    gridY: zone.gridY + pos.y,
  };
}

export default function PixelOffice() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<PIXI.Application | null>(null);
  const spritesRef = useRef<Map<string, PIXI.Texture>>(new Map());
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [isOrgChartOpen, setIsOrgChartOpen] = useState(false);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Initialize PixiJS
    const app = new PIXI.Application();
    appRef.current = app;

    (async () => {
      await app.init({
        width: 1400,
        height: 800,
        backgroundColor: 0x09090b,
        antialias: true,
      });

      if (canvasRef.current) {
        canvasRef.current.appendChild(app.canvas as HTMLCanvasElement);
      }

      // Create main container for office
      const officeContainer = new PIXI.Container();
      officeContainer.x = 700;
      officeContainer.y = 100;
      app.stage.addChild(officeContainer);

      // Load sprites
      const spriteNames = [
        'desk_SE', 'desk_SW', 'chairDesk_SE', 'chairDesk_SW',
        'tableCloth_SE', 'chairModernCushion_SE', 'chairModernCushion_SW',
        'lampSquareTable_SE', 'lampSquareFloor_SE',
        'tableCoffeeGlassSquare_SE', 'loungeChair_NE', 'loungeChair_NW',
        'chairCushion_NE', 'chairCushion_NW', 'chairCushion_SE', 'chairCushion_SW',
        'cabinetBed_SE',
      ];

      // Load sprites with error handling
      for (const name of spriteNames) {
        try {
          const texture = await PIXI.Assets.load(`/sprites/Isometric/${name}.png`);
          spritesRef.current.set(name, texture);
        } catch (error) {
          console.warn(`Failed to load sprite: ${name}`, error);
          // Create placeholder texture
          const graphics = new PIXI.Graphics();
          graphics.rect(0, 0, 64, 64);
          graphics.fill(0x333333);
          const texture = app.renderer.generateTexture(graphics);
          spritesRef.current.set(name, texture);
        }
      }

      // Render zones
      Object.entries(zones).forEach(([, zone]) => {
        const zoneContainer = new PIXI.Container();
        officeContainer.addChild(zoneContainer);

        // Draw zone floor tiles
        for (let y = 0; y < zone.height; y++) {
          for (let x = 0; x < zone.width; x++) {
            const tileGraphics = new PIXI.Graphics();
            const isoPos = gridToIso(zone.gridX + x, zone.gridY + y);
            
            // Draw isometric tile (diamond shape)
            tileGraphics.poly([
              0, TILE_HEIGHT / 2,
              TILE_WIDTH / 2, 0,
              TILE_WIDTH, TILE_HEIGHT / 2,
              TILE_WIDTH / 2, TILE_HEIGHT,
            ]);
            tileGraphics.fill({ color: zone.color, alpha: 0.15 });
            tileGraphics.stroke({ color: zone.color, alpha: 0.3, width: 1 });

            tileGraphics.x = isoPos.x;
            tileGraphics.y = isoPos.y;
            zoneContainer.addChild(tileGraphics);
          }
        }

        // Add zone label
        const labelText = new PIXI.Text({
          text: zone.name,
          style: {
            fontSize: 12,
            fill: 0xffffff,
            fontWeight: 'bold',
          }
        });
        const centerPos = gridToIso(
          zone.gridX + zone.width / 2,
          zone.gridY - 0.5
        );
        labelText.x = centerPos.x - labelText.width / 2;
        labelText.y = centerPos.y;
        labelText.alpha = 0.7;
        zoneContainer.addChild(labelText);

        // Place furniture
        zone.furniture.forEach((item) => {
          const texture = spritesRef.current.get(item.sprite);
          if (texture) {
            const sprite = new PIXI.Sprite(texture);
            const isoPos = gridToIso(zone.gridX + item.x, zone.gridY + item.y);
            sprite.x = isoPos.x;
            sprite.y = isoPos.y;
            sprite.anchor.set(0.5, 0.8); // Bottom-center anchor for isometric
            sprite.scale.set(0.8);
            zoneContainer.addChild(sprite);
          }
        });
      });

      // Add agents with proper desk positioning
      // Group agents by their target zone (accounting for status)
      const agentsByTargetZone = new Map<string, Agent[]>();
      agents.forEach((agent) => {
        let targetZone = agent.zone;
        if (agent.status === 'idle') targetZone = 'cafe';
        if (agent.status === 'blocked') targetZone = 'help-desk';
        
        if (!agentsByTargetZone.has(targetZone)) {
          agentsByTargetZone.set(targetZone, []);
        }
        agentsByTargetZone.get(targetZone)!.push(agent);
      });

      agents.forEach((agent) => {
        const zone = zones[agent.zone];
        if (!zone) return;

        // Determine target zone based on status
        let targetZone = agent.zone;
        if (agent.status === 'idle') targetZone = 'cafe';
        if (agent.status === 'blocked') targetZone = 'help-desk';

        // Get agent index within its target zone
        const zoneAgents = agentsByTargetZone.get(targetZone) || [];
        const agentIndexInZone = zoneAgents.indexOf(agent);

        // Calculate agent position using new function
        const { gridX: agentGridX, gridY: agentGridY } = getAgentPosition(agent, agentIndexInZone);
        const agentPos = gridToIso(agentGridX, agentGridY);

        // Create agent container
        const agentContainer = new PIXI.Container();
        agentContainer.x = agentPos.x;
        agentContainer.y = agentPos.y;

        // Draw agent circle (placeholder for Part 2 character sprites)
        const circle = new PIXI.Graphics();
        circle.circle(0, 0, 16);
        circle.fill(parseInt(agent.color.replace('#', ''), 16));
        circle.stroke({ color: 0xffffff, width: 2 });
        agentContainer.addChild(circle);

        // Add initial text
        const initialText = new PIXI.Text({
          text: agent.initial,
          style: {
            fontSize: 12,
            fill: 0xffffff,
            fontWeight: 'bold',
          }
        });
        initialText.anchor.set(0.5);
        agentContainer.addChild(initialText);

        // Add status indicator
        const statusDot = new PIXI.Graphics();
        statusDot.circle(12, -12, 4);
        statusDot.fill(agent.status === 'online' ? 0x22c55e : agent.status === 'idle' ? 0xeab308 : 0xef4444);
        agentContainer.addChild(statusDot);

        // Add name label
        const nameText = new PIXI.Text({
          text: agent.name,
          style: {
            fontSize: 10,
            fill: 0xffffff,
          }
        });
        nameText.anchor.set(0.5, 0);
        nameText.y = 20;
        nameText.alpha = 0.8;
        agentContainer.addChild(nameText);

        // Make interactive
        agentContainer.eventMode = 'static';
        agentContainer.cursor = 'pointer';
        agentContainer.on('pointerdown', () => {
          setSelectedAgent(agent);
        });

        // Idle animation
        gsap.to(agentContainer, {
          y: agentPos.y - 5,
          duration: 2,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        });

        officeContainer.addChild(agentContainer);
      });
    })();

    return () => {
      app.destroy(true, { children: true, texture: true });
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-widest text-zinc-500 mb-2">
            Mission Control › Fleet Overview
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-white">Pixel Office</h1>
          <p className="text-sm text-zinc-500 mt-1">Isometric view • 18 agents across 7 zones</p>
        </div>
        <button
          onClick={() => setIsOrgChartOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#18181b] border border-[#27272a] rounded-lg text-sm text-white hover:border-[#3f3f46] hover:bg-[#1f1f23] transition-all"
        >
          View Org Chart
        </button>
      </div>

      {/* Canvas */}
      <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-6 overflow-hidden">
        <div ref={canvasRef} className="flex justify-center" />
      </div>

      {/* Selected Agent Info */}
      {selectedAgent && (
        <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-5">
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ backgroundColor: selectedAgent.color }}
            >
              <span className="text-white text-sm font-bold">{selectedAgent.initial}</span>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white">{selectedAgent.name}</h3>
              <p className="text-sm text-zinc-400">{selectedAgent.role} • {selectedAgent.dept}</p>
            </div>
            <div className={`flex items-center gap-2 text-sm ${selectedAgent.status === 'online' ? 'text-emerald-400' : selectedAgent.status === 'idle' ? 'text-amber-400' : 'text-red-400'}`}>
              <span className={`w-2 h-2 rounded-full ${selectedAgent.status === 'online' ? 'bg-emerald-400' : selectedAgent.status === 'idle' ? 'bg-amber-400' : 'bg-red-400'}`}></span>
              {selectedAgent.status}
            </div>
          </div>
        </div>
      )}

      {/* Zone Legend */}
      <div className="grid grid-cols-7 gap-3">
        {Object.entries(zones).map(([id, zone]) => (
          <div key={id} className="bg-[#18181b] border border-[#27272a] rounded-lg p-3">
            <div 
              className="w-4 h-4 rounded mb-2" 
              style={{ backgroundColor: `#${zone.color.toString(16).padStart(6, '0')}` }}
            />
            <p className="text-xs font-medium text-white">{zone.name}</p>
            <p className="text-[10px] text-zinc-500 mt-1">
              {agents.filter(a => a.zone === id).length} agents
            </p>
          </div>
        ))}
      </div>

      <OrgChartModal isOpen={isOrgChartOpen} onClose={() => setIsOrgChartOpen(false)} />
    </div>
  );
}
