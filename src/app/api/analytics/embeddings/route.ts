import { NextResponse } from 'next/server';

export async function GET() {
  try {
    return NextResponse.json({ embeddingsUsage: [] });
  } catch (error) {
    console.error('Embeddings API error:', error);
    return NextResponse.json({ embeddingsUsage: [] });
  }
}
