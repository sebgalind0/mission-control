import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join, normalize, sep } from 'path';
import { homedir } from 'os';

const WORKSPACE_PATH = join(homedir(), '.openclaw/workspace-larry');

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const relativePath = searchParams.get('path');
    
    if (!relativePath) {
      return NextResponse.json(
        { success: false, error: 'Missing path parameter' },
        { status: 400 }
      );
    }
    
    // Security: Prevent directory traversal
    const normalizedPath = normalize(relativePath);
    if (normalizedPath.startsWith('..') || normalizedPath.includes(`${sep}..${sep}`)) {
      return NextResponse.json(
        { success: false, error: 'Invalid path' },
        { status: 403 }
      );
    }
    
    // Only allow .md files
    if (!normalizedPath.endsWith('.md')) {
      return NextResponse.json(
        { success: false, error: 'Only markdown files are allowed' },
        { status: 403 }
      );
    }
    
    const fullPath = join(WORKSPACE_PATH, normalizedPath);
    
    // Verify the resolved path is still within workspace
    if (!fullPath.startsWith(WORKSPACE_PATH)) {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      );
    }
    
    const content = await readFile(fullPath, 'utf-8');
    
    return NextResponse.json({
      success: true,
      path: relativePath,
      content,
      fullPath
    });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return NextResponse.json(
        { success: false, error: 'File not found' },
        { status: 404 }
      );
    }
    
    console.error('Error reading document:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to read document',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
