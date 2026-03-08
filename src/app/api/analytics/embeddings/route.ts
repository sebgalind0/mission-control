import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // For now, return zero usage since we don't have embedding events tracked yet
    // This can be extended when embedding usage is added to the Event model
    const embeddingsUsage = [
      {
        service: 'OpenAI',
        requests: 0,
        tokens: 0,
        cost: 0.0000,
      },
      {
        service: 'Wixie Flow',
        requests: 0,
        tokens: 0,
        cost: 0.0000,
      },
    ];

    return NextResponse.json({ embeddingsUsage });
  } catch (error) {
    console.error('Embeddings API error:', error);
    return NextResponse.json({ embeddingsUsage: [] });
  }
}
