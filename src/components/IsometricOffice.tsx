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

// Zone colors for floor tinting
const zoneColors: Record<string, number> = {
  'exec': 0x3b82f6,      // Blue
  'engineering': 0x3b82f6, // Blue
  'design': 0x8b5cf6,     // Purple
  'conference': 0xef4444,  // Red
  'operations': 0x10b981,  // Green
  'help-desk': 0xeab308,   // Yellow
  'cafe': 0xf97316        // Warm orange
};

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

// Isometric helpers
function toIso(x: number, y: number): { x: number; y: number } {
  return {
    x: (x - y) * 24,
    y: (x + y) * 12
  };
}

// Draw isometric floor tile
function createFloorTile(color1: number, color2: number, tint: number): PIXI.Graphics {
  const tile = new PIXI.Graphics();
  
  // Diamond shape (isometric tile)
  tile.moveTo(0, -12);
  tile.lineTo(24, 0);
  tile.lineTo(0, 12);
  tile.lineTo(-24, 0);
  tile.lineTo(0, -12);
  tile.fill({ color: color1, alpha: 0.8 });
  
  // Zone tint overlay
  tile.moveTo(0, -12);
  tile.lineTo(24, 0);
  tile.lineTo(0, 12);
  tile.lineTo(-24, 0);
  tile.lineTo(0, -12);
  tile.fill({ color: tint, alpha: 0.15 });
  
  // Border
  tile.moveTo(0, -12);
  tile.lineTo(24, 0);
  tile.lineTo(0, 12);
  tile.lineTo(-24, 0);
  tile.lineTo(0, -12);
  tile.stroke({ color: 0x27272a, width: 1 });
  
  return tile;
}

// Create desk furniture - REAL SPRITE
function createDesk(): PIXI.Sprite {
  const sprite = PIXI.Sprite.from('/sprites/desk.png');
  sprite.anchor.set(0.5, 0.7);
  sprite.scale.set(3, 3);
  return sprite;
}

// Create chair furniture - REAL SPRITE
function createChair(): PIXI.Sprite {
  const sprite = PIXI.Sprite.from('/sprites/chair.png');
  sprite.anchor.set(0.5, 0.7);
  sprite.scale.set(3, 3);
  return sprite;
}

// Create plant furniture - REAL SPRITE
function createPlant(): PIXI.Sprite {
  const sprite = PIXI.Sprite.from('/sprites/plant.png');
  sprite.anchor.set(0.5, 0.8);
  sprite.scale.set(3, 3);
  return sprite;
}

// Create conference table - REAL SPRITE
function createTable(): PIXI.Sprite {
  const sprite = PIXI.Sprite.from('/sprites/table.png');
  sprite.anchor.set(0.5, 0.7);
  sprite.scale.set(3, 3);
  return sprite;
}

// Sprite creator functions - Habbo Hotel style REAL PIXEL ART
function createWorkingSprite(color: string, name: string): PIXI.Container {
  const container = new PIXI.Container();
  const colorValue = parseInt(color.replace('#', ''), 16);

  // Load the REAL sprite PNG
  const charSprite = PIXI.Sprite.from('/sprites/char-working.png');
  charSprite.anchor.set(0.5, 0.85);
  charSprite.scale.set(3, 3);
  charSprite.tint = colorValue; // Colorize the sprite
  container.addChild(charSprite);

  // NAME TAG (floating above head)
  const nameTag = new PIXI.Graphics();
  nameTag.roundRect(-20, -36, 40, 10, 3);
  nameTag.fill({ color: 0x18181b, alpha: 0.9 });
  nameTag.stroke({ color: colorValue, width: 1 });
  container.addChild(nameTag);
  
  const nameText = new PIXI.Text({
    text: name,
    style: {
      fontFamily: 'Inter, system-ui, sans-serif',
      fontSize: 7,
      fontWeight: '600',
      fill: 0xffffff,
      align: 'center',
    }
  });
  nameText.anchor.set(0.5);
  nameText.position.set(0, -31);
  container.addChild(nameText);

  return container;
}

function createIdleSprite(color: string, name: string): PIXI.Container {
  const container = new PIXI.Container();
  const colorValue = parseInt(color.replace('#', ''), 16);

  // Load the REAL sprite PNG
  const charSprite = PIXI.Sprite.from('/sprites/char-idle.png');
  charSprite.anchor.set(0.5, 0.85);
  charSprite.scale.set(3, 3);
  charSprite.tint = colorValue;
  charSprite.alpha = 0.7; // Slightly transparent for idle state
  container.addChild(charSprite);

  // NAME TAG
  const nameTag = new PIXI.Graphics();
  nameTag.roundRect(-20, -40, 40, 10, 3);
  nameTag.fill({ color: 0x18181b, alpha: 0.8 });
  nameTag.stroke({ color: colorValue, width: 1, alpha: 0.7 });
  container.addChild(nameTag);
  
  const nameText = new PIXI.Text({
    text: name,
    style: {
      fontFamily: 'Inter, system-ui, sans-serif',
      fontSize: 7,
      fontWeight: '600',
      fill: 0xffffff,
      align: 'center',
    }
  });
  nameText.anchor.set(0.5);
  nameText.position.set(0, -35);
  nameText.alpha = 0.8;
  container.addChild(nameText);

  return container;
}

function createBlockedSprite(color: string, name: string): PIXI.Container {
  const container = new PIXI.Container();
  const colorValue = parseInt(color.replace('#', ''), 16);

  // Load the REAL sprite PNG
  const charSprite = PIXI.Sprite.from('/sprites/char-idle.png');
  charSprite.anchor.set(0.5, 0.85);
  charSprite.scale.set(3, 3);
  charSprite.tint = colorValue;
  container.addChild(charSprite);

  // Add red outline effect for stress
  const outline = new PIXI.Graphics();
  outline.rect(-16, -24, 32, 48);
  outline.stroke({ color: 0xef4444, width: 2 });
  container.addChild(outline);

  // NAME TAG (red border for blocked)
  const nameTag = new PIXI.Graphics();
  nameTag.roundRect(-20, -40, 40, 10, 3);
  nameTag.fill({ color: 0x18181b, alpha: 0.9 });
  nameTag.stroke({ color: 0xef4444, width: 1.5 });
  container.addChild(nameTag);
  
  const nameText = new PIXI.Text({
    text: name,
    style: {
      fontFamily: 'Inter, system-ui, sans-serif',
      fontSize: 7,
      fontWeight: '600',
      fill: 0xef4444,
      align: 'center',
    }
  });
  nameText.anchor.set(0.5);
  nameText.position.set(0, -35);
  container.addChild(nameText);

  // Question mark overhead (pulsing)
  const questionMark = new PIXI.Text({
    text: '?',
    style: {
      fontFamily: 'Inter, system-ui, sans-serif',
      fontSize: 18,
      fontWeight: 'bold',
      fill: 0xef4444,
      align: 'center',
    }
  });
  questionMark.anchor.set(0.5);
  questionMark.y = -52;
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
  
  // Camera controls state
  const [cameraOffset, setCameraOffset] = useState({ x: 0, y: 0 });
  const [cameraZoom, setCameraZoom] = useState(1);
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  // Reset camera to default position
  const resetCamera = () => {
    if (!appRef.current) return;
    
    gsap.to(appRef.current.stage, {
      x: 0,
      y: 0,
      duration: 0.3,
      ease: 'power2.out',
      onUpdate: () => {
        setCameraOffset({ x: appRef.current!.stage.x, y: appRef.current!.stage.y });
      }
    });
    
    gsap.to(appRef.current.stage.scale, {
      x: 1,
      y: 1,
      duration: 0.3,
      ease: 'power2.out',
      onUpdate: () => {
        setCameraZoom(appRef.current!.stage.scale.x);
      }
    });
  };

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

      // Layer 1: Floor tiles (checkered isometric pattern)
      const floorContainer = new PIXI.Container();
      app.stage.addChild(floorContainer);

      const gridWidth = 30;
      const gridHeight = 20;
      const baseX = 600;
      const baseY = 200;

      for (let row = 0; row < gridHeight; row++) {
        for (let col = 0; col < gridWidth; col++) {
          const iso = toIso(col, row);
          const x = baseX + iso.x;
          const y = baseY + iso.y;
          
          // Checkered pattern
          const isLight = (col + row) % 2 === 0;
          const baseColor1 = isLight ? 0x18181b : 0x27272a;
          const baseColor2 = isLight ? 0x27272a : 0x18181b;
          
          // Determine zone tint based on position
          let zoneTint = 0x18181b;
          if (col >= 8 && col < 16 && row >= 6 && row < 12) {
            zoneTint = zoneColors['engineering']; // Blue zone
          } else if (col >= 16 && col < 24 && row >= 8 && row < 14) {
            zoneTint = zoneColors['design']; // Purple zone
          } else if (col >= 20 && col < 28 && row >= 2 && row < 8) {
            zoneTint = zoneColors['conference']; // Red zone
          } else if (col >= 2 && col < 8 && row >= 10 && row < 16) {
            zoneTint = zoneColors['operations']; // Green zone
          } else if (col >= 18 && col < 26 && row >= 14 && row < 18) {
            zoneTint = zoneColors['help-desk']; // Yellow zone
          } else if (col >= 0 && col < 6 && row >= 4 && row < 10) {
            zoneTint = zoneColors['cafe']; // Warm zone
          }
          
          const tile = createFloorTile(baseColor1, baseColor2, zoneTint);
          tile.x = x;
          tile.y = y;
          floorContainer.addChild(tile);
        }
      }

      // Layer 2: Furniture
      const furnitureContainer = new PIXI.Container();
      app.stage.addChild(furnitureContainer);

      // Engineering zone furniture
      for (let i = 0; i < 5; i++) {
        const desk = createDesk();
        desk.x = 800 + (i % 2 === 0 ? -80 : 80);
        desk.y = 300 + Math.floor(i / 2) * 60 - 40;
        furnitureContainer.addChild(desk);
        
        const chair = createChair();
        chair.x = desk.x;
        chair.y = desk.y + 30;
        furnitureContainer.addChild(chair);
      }

      // Design zone furniture
      const designDesk1 = createDesk();
      designDesk1.x = 560;
      designDesk1.y = 480;
      furnitureContainer.addChild(designDesk1);
      
      const designDesk2 = createDesk();
      designDesk2.x = 640;
      designDesk2.y = 480;
      furnitureContainer.addChild(designDesk2);

      // Conference zone - big table
      const conferenceTable = createTable();
      conferenceTable.x = 1100;
      conferenceTable.y = 380;
      furnitureContainer.addChild(conferenceTable);

      // Add some plants around the office
      const plantPositions = [
        { x: 700, y: 250 },
        { x: 900, y: 450 },
        { x: 500, y: 550 },
        { x: 1050, y: 650 },
        { x: 350, y: 350 }
      ];
      
      plantPositions.forEach(pos => {
        const plant = createPlant();
        plant.x = pos.x;
        plant.y = pos.y;
        furnitureContainer.addChild(plant);
      });

      // Operations zone furniture
      const opsDesk = createDesk();
      opsDesk.x = 400;
      opsDesk.y = 580;
      furnitureContainer.addChild(opsDesk);

      // Help desk zone furniture
      for (let i = 0; i < 4; i++) {
        const helpDesk = createDesk();
        helpDesk.x = 1000 + (i % 2 === 0 ? -80 : 80);
        helpDesk.y = 700 + Math.floor(i / 2) * 50 - 40;
        furnitureContainer.addChild(helpDesk);
      }

      // Cafe zone - small tables
      const cafeTable1 = createTable();
      cafeTable1.x = 200;
      cafeTable1.y = 380;
      cafeTable1.scale.set(0.6);
      furnitureContainer.addChild(cafeTable1);
      
      const cafeTable2 = createTable();
      cafeTable2.x = 200;
      cafeTable2.y = 450;
      cafeTable2.scale.set(0.6);
      furnitureContainer.addChild(cafeTable2);

      // Layer 3: Agents
      const agentsContainer = new PIXI.Container();
      app.stage.addChild(agentsContainer);

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
            sprite = createWorkingSprite(agent.color, agent.name);
          } else if (agent.status === 'idle') {
            sprite = createIdleSprite(agent.color, agent.name);
          } else {
            sprite = createBlockedSprite(agent.color, agent.name);
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

          agentsContainer.addChild(sprite);

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

  // Pan handler (click + drag)
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    dragStartRef.current = { x: e.clientX - cameraOffset.x, y: e.clientY - cameraOffset.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current || !appRef.current) return;
    
    const newX = e.clientX - dragStartRef.current.x;
    const newY = e.clientY - dragStartRef.current.y;
    
    appRef.current.stage.x = newX;
    appRef.current.stage.y = newY;
    setCameraOffset({ x: newX, y: newY });
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  // Zoom handler (scroll wheel)
  const handleWheel = (e: React.WheelEvent) => {
    if (!appRef.current) return;
    e.preventDefault();
    
    const delta = -e.deltaY * 0.001;
    const newZoom = Math.min(Math.max(cameraZoom + delta, 0.5), 2.0);
    
    gsap.to(appRef.current.stage.scale, {
      x: newZoom,
      y: newZoom,
      duration: 0.3,
      ease: 'power2.out',
      onUpdate: () => {
        setCameraZoom(appRef.current!.stage.scale.x);
      }
    });
  };

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
        {/* Reset View Button */}
        <button
          onClick={resetCamera}
          className="absolute top-8 right-8 z-10 px-4 py-2 bg-[#27272a] hover:bg-[#3f3f46] border border-[#3f3f46] rounded-lg text-sm text-white transition-colors"
        >
          Reset View
        </button>
        
        <div 
          ref={canvasRef}
          className="relative cursor-grab active:cursor-grabbing"
          style={{ width: '1600px', height: '1000px', margin: '0 auto' }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
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
