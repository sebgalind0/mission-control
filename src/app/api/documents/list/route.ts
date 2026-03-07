import { NextRequest, NextResponse } from 'next/server';
import { readdir, stat } from 'fs/promises';
import { join } from 'path';
import { homedir } from 'os';

const WORKSPACE_PATH = join(homedir(), '.openclaw/workspace-larry');
const EXCLUDED_DIRS = new Set(['node_modules', '.git', 'temp', '.next', 'dist', 'build']);

interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: FileNode[];
}

async function scanDirectory(dirPath: string, relativePath: string = ''): Promise<FileNode[]> {
  const nodes: FileNode[] = [];
  
  try {
    const entries = await readdir(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      // Skip excluded directories
      if (EXCLUDED_DIRS.has(entry.name)) continue;
      
      const fullPath = join(dirPath, entry.name);
      const relPath = relativePath ? join(relativePath, entry.name) : entry.name;
      
      if (entry.isDirectory()) {
        const children = await scanDirectory(fullPath, relPath);
        if (children.length > 0) {
          nodes.push({
            name: entry.name,
            path: relPath,
            type: 'directory',
            children
          });
        }
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        nodes.push({
          name: entry.name,
          path: relPath,
          type: 'file'
        });
      }
    }
  } catch (error) {
    console.error(`Error scanning directory ${dirPath}:`, error);
  }
  
  return nodes.sort((a, b) => {
    // Directories first, then files
    if (a.type !== b.type) return a.type === 'directory' ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
}

export async function GET(request: NextRequest) {
  try {
    const fileTree = await scanDirectory(WORKSPACE_PATH);
    
    return NextResponse.json({
      success: true,
      workspace: WORKSPACE_PATH,
      tree: fileTree
    });
  } catch (error) {
    console.error('Error listing documents:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to list documents',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
