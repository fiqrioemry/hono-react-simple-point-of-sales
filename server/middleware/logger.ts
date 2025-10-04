import { Context } from "hono";

export async function logging(c: Context, next: () => Promise<void>) {
  const start = Date.now();
  try {
    await next();
    const ms = Date.now() - start;
    console.log(`${c.req.method} ${c.req.path} - ${c.res.status} - ${ms}ms`);
  } catch (error) {
    const ms = Date.now() - start;
    console.log(
      {
        method: c.req.method,
        path: c.req.path,
        status: 500,
        duration: `${ms}ms`,
        error: (error as Error).message,
      },
      "HTTP Error"
    );
    throw error;
  }
}
