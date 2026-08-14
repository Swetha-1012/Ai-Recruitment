import { NextResponse } from "next/server";

// In-memory cache to map IP request frequencies
const ipRequestCache = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(ip: string, limit = 60, windowMs = 60000) {
  const now = Date.now();
  const record = ipRequestCache.get(ip);

  if (!record) {
    ipRequestCache.set(ip, { count: 1, resetTime: now + windowMs });
    return { success: true, count: 1, limit, resetTime: now + windowMs };
  }

  if (now > record.resetTime) {
    record.count = 1;
    record.resetTime = now + windowMs;
    return { success: true, count: 1, limit, resetTime: now + windowMs };
  }

  record.count += 1;
  if (record.count > limit) {
    return { success: false, count: record.count, limit, resetTime: record.resetTime };
  }

  return { success: true, count: record.count, limit, resetTime: record.resetTime };
}

export function getClientIp(req: Request): string {
  const xForwardedFor = req.headers.get("x-forwarded-for");
  if (xForwardedFor) {
    return xForwardedFor.split(",")[0].trim();
  }
  return "127.0.0.1";
}

export function rateLimitResponse(resetTime: number) {
  const retryAfter = Math.ceil((resetTime - Date.now()) / 1000);
  return NextResponse.json(
    { error: "Too many requests. Please try again later." },
    {
      status: 429,
      headers: {
        "Retry-After": retryAfter.toString(),
        "X-RateLimit-Limit": "60",
        "X-RateLimit-Remaining": "0",
        "X-RateLimit-Reset": Math.ceil(resetTime / 1000).toString(),
      },
    }
  );
}
