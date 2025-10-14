import { Context } from "hono";
import { verify } from "hono/jwt";
import { HTTPException } from "hono/http-exception";

export async function authMiddleware(c: Context, next: () => Promise<void>) {
  // get token from Authorization header
  const authHeader = c.req.header("Authorization");

  // split token from bearer
  const token = authHeader?.split(" ")[1];

  //   if no token,  throw unauthorized
  if (!token) {
    throw new HTTPException(401, { message: "Unauthorized" });
  }

  //   verify token and decode
  const decode = await verify(token, process.env.ACCESS_SECRET!);

  //   if no decode, throw unauthorized
  if (!decode) {
    throw new HTTPException(401, { message: "Unauthorized : Invalid token" });
  }

  //   set user to context
  c.set("user", decode);

  //   continue to next middleware
  await next();
}

export async function adminOnly(c: Context, next: () => Promise<void>) {
  const user = c.get("user");
  if (user.role !== "ADMIN") {
    throw new HTTPException(403, { message: "Forbidden" });
  }
  await next();
}
