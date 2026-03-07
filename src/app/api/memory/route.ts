import { NextResponse } from 'next/server';
import { readdir, readFile, stat } from 'fs/promises';
import { join } from 'path';
import { homedir } from 'os';

const MEMORY_DIR = join(homedir(), '.openclaw/workspace-larry/memory');

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const file = searchParams.get('file');

  try {
    // If file is specified, return its content
    if (file) {
      const filePath = join(MEMORY_DIR, file);
      const content = await readFile(filePath, 'utf-8');
      return NextResponse.json({ content });
    }

    // Otherwise, return list of files
    const files = await readdir(MEMORY_DIR);
    const fileDetails = await Promise.all(
      files
        .filter(f => f.endsWith('.md') || f.endsWith('.json'))
        .map(async (filename) => {
          const filePath = join(MEMORY_DIR, filename);
          const stats = await stat(filePath);
          return {
            name: filename,
            size: stats.size,
            modified: stats.mtime.toISOString(),
            type: filename.endsWith('.json') ? 'state' : 
                  filename === 'MEMORY.md' ? 'core' : 
                  /^\d{4}-\d{2}-\d{2}\.md$/.test(filename) ? 'daily' : 'core'
          };
        })
    );

    // Sort: MEMORY.md first, then daily files (newest first), then others
    fileDetails.sort((a, b) => {
      if (a.name === 'MEMORY.md') return -1;
      if (b.name === 'MEMORY.md') return 1;
      if (a.type === 'daily' && b.type === 'daily') return b.name.localeCompare(a.name);
      if (a.type === 'daily') return -1;
      if (b.type === 'daily') return 1;
      return a.name.localeCompare(b.name);
    });

    return NextResponse.json({ files: fileDetails });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read memory directory' }, { status: 500 });
  }
}
