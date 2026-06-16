import { NextResponse, type NextRequest } from 'next/server';

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitRecord>();

// Simple cleanup interval to prevent the Map from growing infinitely.
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of store.entries()) {
    if (record.resetAt <= now) {
      store.delete(key);
    }
  }
}, 60000); // Run every minute

export function rateLimit(
  req: NextRequest,
  limit: number,
  windowMs: number
): NextResponse | null {
  // Use x-forwarded-for if behind a proxy (like Cloud Run), otherwise fallback to 'unknown'
  // as standard App Router handlers don't expose socket IP directly.
  const ip = req.headers.get('x-forwarded-for') ?? 'unknown';
  const now = Date.now();

  const record = store.get(ip);

  if (record && record.resetAt > now) {
    if (record.count >= limit) {
      const retryAfterSeconds = Math.ceil((record.resetAt - now) / 1000);
      return NextResponse.json(
        { error: 'Too Many Requests' },
        {
          status: 429,
          headers: { 'Retry-After': retryAfterSeconds.toString() },
        }
      );
    }
    record.count++;
    return null;
  }

  // Create or reset the record
  store.set(ip, { count: 1, resetAt: now + windowMs });
  return null;
}
