import { readFile } from 'fs/promises';
import { join, resolve } from 'path';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const skillPath = searchParams.get('path');
  const language = searchParams.get('lang') || 'en';

  if (!skillPath) {
    return NextResponse.json(
      { error: 'Missing path parameter' },
      { status: 400 }
    );
  }

  try {
    // Sanitize path to prevent directory traversal
    // Only allow alphanumeric, hyphens, and slashes
    const sanitized = skillPath.replace(/[^a-z0-9-]/gi, '');
    
    if (!sanitized || sanitized !== skillPath) {
      return NextResponse.json(
        { error: 'Invalid path format' },
        { status: 400 }
      );
    }
    
    // Determine file extension based on language
    const fileExt = language === 'zh' ? 'SKILL-zh.md' : 'SKILL.md';
    
    // Build path from gstack project root (parent of web directory)
    // process.cwd() points to the web directory
    // We need to go up one level to reach the gstack root
    const gstackRoot = resolve(process.cwd(), '..');
    const filePath = join(gstackRoot, sanitized, fileExt);
    
    // Security: ensure the resolved path is still within gstack root
    if (!filePath.startsWith(gstackRoot)) {
      return NextResponse.json(
        { error: 'Invalid path' },
        { status: 400 }
      );
    }
    
    const content = await readFile(filePath, 'utf-8');
    
    return NextResponse.json({ content });
  } catch (error) {
    console.error('Error reading skill file:', error);
    return NextResponse.json(
      { error: 'Failed to read skill file', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 404 }
    );
  }
}
