import { Context } from "hono";
import { redis } from "../config/redis";
import { getCookie, setCookie } from "hono/cookie";
import { HTTPException } from "hono/http-exception";

export function limitter(limit: number, windowSec: number) {
  return async (c: Context, next: () => Promise<void>) => {
    const userId = c.get("user")?.userId || getCookie(c, "guest_id");

    if (!userId) {
      const guest_id = crypto.randomUUID();
      setCookie(c, "guest_id", guest_id, { path: "/", httpOnly: true });
      next();
    }

    const key = `ratelimit:${userId}:${c.req.path}`;

    const current = await redis.incr(key);

    if (current === 1) {
      await redis.expire(key, windowSec);
    }

    if (current > limit) {
      throw new HTTPException(429, { message: "Too many requests" });
    }
    await next();
  };
}
