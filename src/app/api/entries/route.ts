import { type NextRequest, NextResponse } from 'next/server';
import { historyEntrySchema } from '@/lib/schemas';
import { getRepository } from '@/lib/repository';
import { rateLimit } from '@/lib/rate-limit';

// Security: Max 100 entries per device to prevent unlimited growth
const MAX_HISTORY = 100;

export async function GET(req: NextRequest) {
  const limitResponse = rateLimit(req, 20, 60_000);
  if (limitResponse) return limitResponse;

  const { searchParams } = new URL(req.url);
  const deviceId = searchParams.get('deviceId');

  if (!deviceId) {
    return NextResponse.json({ error: 'Missing deviceId' }, { status: 400 });
  }

  try {
    const repo = getRepository();
    const entries = await repo.getEntries(deviceId, MAX_HISTORY);
    return NextResponse.json({ entries });
  } catch (error) {
    console.error('Error fetching history:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const limitResponse = rateLimit(req, 20, 60_000);
  if (limitResponse) return limitResponse;

  try {
    const body = await req.json();
    
    // Ensure payload has a deviceId
    if (!body.deviceId || typeof body.deviceId !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid deviceId' }, { status: 400 });
    }

    const parsed = historyEntrySchema.safeParse(body.entry);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid history entry' }, { status: 400 });
    }

    const entry = parsed.data;
    const repo = getRepository();
    
    const result = await repo.saveEntry(body.deviceId, entry);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error saving history entry:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

