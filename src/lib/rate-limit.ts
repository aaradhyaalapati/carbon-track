import { NextResponse, type NextRequest } from 'next/server';

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitRecord>();

export function rateLimit(req: NextRequest, limit: number, windowMs: number): NextResponse | null {
  const ip = req.headers.get('x-forwarded-for') ?? 'unknown';
  const now = Date.now();

  // Lazy cleanup: clear expired entries on-the-fly to avoid background interval leaks
  // and optimize memory usage in serverless environments.
  if (store.size > 1000) {
    // arbitrary threshold to prevent unbounded growth
    for (const [key, record] of store.entries()) {
      if (record.resetAt <= now) {
        store.delete(key);
      }
    }
  }

  const record = store.get(ip);

  if (record && record.resetAt > now) {
    if (record.count >= limit) {
      const retryAfterSeconds = Math.ceil((record.resetAt - now) / 1000);
      return NextResponse.json(
        { error: 'Too Many Requests' },
        {
          status: 429,
          headers: { 'Retry-After': retryAfterSeconds.toString() },
        },
      );
    }
    record.count++;
    return null;
  }

  // Create or reset the record
  store.set(ip, { count: 1, resetAt: now + windowMs });
  return null;
}
