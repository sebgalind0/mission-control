import { NextResponse } from 'next/server';
import { readdir, readFile, stat } from 'fs/promises';
import { join } from 'path';
import { homedir } from 'os';

const WORKSPACE_DIR = join(homedir(), '.openclaw/workspace-larry');

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const file = searchParams.get('file');

  try {
    // If file is specified, return its content
    if (file) {
      const filePath = join(WORKSPACE_DIR, file);
      const content = await readFile(filePath, 'utf-8');
      return NextResponse.json({ content });
    }

    // Otherwise, return list of files (excluding memory/ directory)
    const files = await readdir(WORKSPACE_DIR);
    const fileDetails = await Promise.all(
      files
        .filter(f => {
          // Exclude directories and hidden files (except .md files)
          if (f === 'memory') return false;
          if (f.startsWith('.') && !f.endsWith('.md')) return false;
          return true;
        })
        .map(async (filename) => {
          const filePath = join(WORKSPACE_DIR, filename);
          const stats = await stat(filePath);
          
          // Skip directories
          if (stats.isDirectory()) return null;
          
          const ext = filename.split('.').pop()?.toLowerCase();
          let type = 'file';
          if (['md', 'markdown'].includes(ext || '')) type = 'markdown';
          else if (['js', 'ts', 'tsx', 'jsx', 'sh', 'py'].includes(ext || '')) type = 'code';
          else if (['json', 'yaml', 'yml', 'toml', 'env'].includes(ext || '')) type = 'config';
          else if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(ext || '')) type = 'media';

          return {
            name: filename,
            size: stats.size,
            modified: stats.mtime.toISOString(),
            type
          };
        })
    );

    // Filter out nulls and sort by type then name
    const validFiles = fileDetails.filter(f => f !== null);
    validFiles.sort((a, b) => {
      if (a!.type !== b!.type) return a!.type.localeCompare(b!.type);
      return a!.name.localeCompare(b!.name);
    });

    return NextResponse.json({ files: validFiles });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read workspace directory' }, { status: 500 });
  }
}
