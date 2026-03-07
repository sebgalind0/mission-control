#!/usr/bin/env python3
"""Generate simple isometric pixel art sprites for office environment"""
from PIL import Image, ImageDraw
import os

# Create sprites directory
os.makedirs('public/sprites', exist_ok=True)

def hex_to_rgb(hex_color):
    """Convert hex color to RGB tuple"""
    hex_color = hex_color.lstrip('#')
    return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))

def create_character_sprite(color_hex, filename):
    """Create an isometric character sprite"""
    img = Image.new('RGBA', (32, 48), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    color = hex_to_rgb(color_hex)
    dark = tuple(max(0, c - 40) for c in color)
    
    # Shadow
    draw.ellipse([8, 42, 24, 46], fill=(0, 0, 0, 50))
    
    # Legs (sitting)
    draw.rectangle([10, 30, 14, 38], fill=color)
    draw.rectangle([18, 30, 22, 38], fill=color)
    
    # Desk base
    draw.polygon([(16, 32), (26, 36), (16, 40), (6, 36)], fill=(60, 60, 70))
    draw.polygon([(16, 40), (26, 36), (26, 40), (16, 44)], fill=(40, 40, 50))
    
    # Body/Torso
    draw.polygon([(16, 18), (22, 20), (22, 32), (16, 34), (10, 32), (10, 20)], fill=color)
    draw.polygon([(16, 18), (10, 20), (10, 32), (16, 34)], fill=dark)  # Side shading
    
    # Arms (typing pose)
    draw.rectangle([8, 24, 11, 34], fill=dark)  # Left arm
    draw.rectangle([21, 24, 24, 34], fill=dark)  # Right arm
    
    # Head
    draw.polygon([(16, 10), (20, 12), (20, 18), (16, 20), (12, 18), (12, 12)], fill=(255, 220, 180))
    draw.rectangle([14, 14, 15, 15], fill=(50, 50, 50))  # Left eye
    draw.rectangle([17, 14, 18, 15], fill=(50, 50, 50))  # Right eye
    
    # Hair
    draw.rectangle([12, 9, 20, 13], fill=(80, 50, 30))
    
    img.save(f'public/sprites/{filename}')
    print(f"Created {filename}")

def create_idle_sprite(color_hex, filename):
    """Create a standing idle character"""
    img = Image.new('RGBA', (32, 48), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    color = hex_to_rgb(color_hex)
    dark = tuple(max(0, c - 40) for c in color)
    
    # Shadow
    draw.ellipse([10, 42, 22, 46], fill=(0, 0, 0, 50))
    
    # Legs (standing)
    draw.rectangle([12, 32, 15, 42], fill=color)
    draw.rectangle([17, 32, 20, 42], fill=color)
    
    # Body
    draw.polygon([(16, 20), (22, 22), (22, 34), (16, 36), (10, 34), (10, 22)], fill=color)
    draw.polygon([(16, 20), (10, 22), (10, 34), (16, 36)], fill=dark)
    
    # Arms (relaxed)
    draw.rectangle([8, 24, 11, 32], fill=dark)
    draw.rectangle([21, 24, 24, 32], fill=dark)
    
    # Head
    draw.polygon([(16, 8), (20, 10), (20, 16), (16, 18), (12, 16), (12, 10)], fill=(255, 220, 180))
    draw.rectangle([14, 12, 15, 13], fill=(50, 50, 50))
    draw.rectangle([17, 12, 18, 13], fill=(50, 50, 50))
    
    # Hair
    draw.rectangle([12, 7, 20, 11], fill=(80, 50, 30))
    
    img.save(f'public/sprites/{filename}', optimize=True)
    print(f"Created {filename}")

def create_desk():
    """Create desk sprite"""
    img = Image.new('RGBA', (48, 32), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Shadow
    draw.ellipse([4, 24, 44, 30], fill=(0, 0, 0, 40))
    
    # Desktop (isometric)
    draw.polygon([(24, 8), (44, 16), (24, 24), (4, 16)], fill=(60, 60, 70))
    # Front face
    draw.polygon([(24, 24), (44, 16), (44, 20), (24, 28)], fill=(40, 40, 50))
    
    # Computer monitor
    draw.rectangle([18, 4, 30, 12], fill=(30, 30, 40))
    draw.rectangle([20, 6, 28, 10], fill=(60, 120, 200))
    
    img.save('public/sprites/desk.png')
    print("Created desk.png")

def create_chair():
    """Create chair sprite"""
    img = Image.new('RGBA', (24, 32), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Shadow
    draw.ellipse([4, 26, 20, 30], fill=(0, 0, 0, 40))
    
    # Seat
    draw.polygon([(12, 12), (18, 14), (12, 16), (6, 14)], fill=(60, 60, 70))
    
    # Backrest
    draw.rectangle([8, 6, 16, 14], fill=(70, 70, 80))
    
    img.save('public/sprites/chair.png')
    print("Created chair.png")

def create_plant():
    """Create plant sprite"""
    img = Image.new('RGBA', (32, 40), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Shadow
    draw.ellipse([6, 34, 26, 38], fill=(0, 0, 0, 40))
    
    # Pot (isometric)
    draw.polygon([(16, 20), (22, 22), (16, 24), (10, 22)], fill=(70, 70, 80))
    draw.polygon([(16, 24), (22, 22), (22, 28), (16, 30)], fill=(50, 50, 60))
    
    # Leaves (simple circles for pixel art look)
    draw.ellipse([8, 8, 16, 16], fill=(34, 197, 94))
    draw.ellipse([16, 10, 24, 18], fill=(22, 163, 74))
    draw.ellipse([10, 14, 20, 24], fill=(21, 128, 61))
    
    img.save('public/sprites/plant.png')
    print("Created plant.png")

def create_table():
    """Create conference table sprite"""
    img = Image.new('RGBA', (96, 64), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Shadow
    draw.ellipse([8, 54, 88, 62], fill=(0, 0, 0, 40))
    
    # Table top
    draw.polygon([(48, 16), (80, 28), (48, 40), (16, 28)], fill=(70, 70, 80))
    # Front face
    draw.polygon([(48, 40), (80, 28), (80, 32), (48, 44)], fill=(50, 50, 60))
    
    img.save('public/sprites/table.png')
    print("Created table.png")

# Generate base sprites
create_character_sprite('#3b82f6', 'char-working.png')
create_idle_sprite('#3b82f6', 'char-idle.png')
create_desk()
create_chair()
create_plant()
create_table()

print("\n✅ All sprites created successfully!")
print("Sprites are in: public/sprites/")
