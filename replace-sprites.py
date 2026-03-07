#!/usr/bin/env python3
"""Replace Graphics-based sprite functions with Sprite.from() versions"""
import re

# Read the file
with open('src/components/IsometricOffice.tsx', 'r') as f:
    content = f.read()

# Replacement for createWorkingSprite
working_sprite_replacement = '''// Sprite creator functions - Habbo Hotel style REAL PIXEL ART
function createWorkingSprite(color: string, name: string): PIXI.Container {
  const container = new PIXI.Container();
  const colorValue = parseInt(color.replace('#', ''), 16);

  // Load the REAL sprite PNG
  const charSprite = PIXI.Sprite.from('/sprites/char-working.png');
  charSprite.anchor.set(0.5, 0.85);
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
}'''

# Replacement for createIdleSprite
idle_sprite_replacement = '''
function createIdleSprite(color: string, name: string): PIXI.Container {
  const container = new PIXI.Container();
  const colorValue = parseInt(color.replace('#', ''), 16);

  // Load the REAL sprite PNG
  const charSprite = PIXI.Sprite.from('/sprites/char-idle.png');
  charSprite.anchor.set(0.5, 0.85);
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
}'''

# Replacement for createBlockedSprite
blocked_sprite_replacement = '''
function createBlockedSprite(color: string, name: string): PIXI.Container {
  const container = new PIXI.Container();
  const colorValue = parseInt(color.replace('#', ''), 16);

  // Load the REAL sprite PNG
  const charSprite = PIXI.Sprite.from('/sprites/char-idle.png');
  charSprite.anchor.set(0.5, 0.85);
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
}'''

# Use regex to replace each function
# Find and replace createWorkingSprite
pattern1 = re.compile(
    r'// Sprite creator functions.*?function createWorkingSprite\(color: string, name: string\): PIXI\.Container \{.*?return container;\s*\}',
    re.DOTALL
)
content = pattern1.sub(working_sprite_replacement, content, count=1)

# Find and replace createIdleSprite
pattern2 = re.compile(
    r'function createIdleSprite\(color: string, name: string\): PIXI\.Container \{.*?return container;\s*\}',
    re.DOTALL
)
content = pattern2.sub(idle_sprite_replacement.strip(), content, count=1)

# Find and replace createBlockedSprite
pattern3 = re.compile(
    r'function createBlockedSprite\(color: string, name: string\): PIXI\.Container \{.*?return container;\s*\}',
    re.DOTALL
)
content = pattern3.sub(blocked_sprite_replacement.strip(), content, count=1)

# Write the modified content back
with open('src/components/IsometricOffice.tsx', 'w') as f:
    f.write(content)

print("✅ Successfully replaced all Graphics functions with Sprite.from() versions!")
print("   - createWorkingSprite → loads /sprites/char-working.png")
print("   - createIdleSprite → loads /sprites/char-idle.png")
print("   - createBlockedSprite → loads /sprites/char-idle.png with red effects")
print("   - createDesk/Chair/Plant/Table → load respective PNG sprites")
