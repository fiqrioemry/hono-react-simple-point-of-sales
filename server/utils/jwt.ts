import { Context } from "hono";
import { sign } from "hono/jwt";
import { deleteCookie, setCookie } from "hono/cookie";

export const generateTTL = (seconds: number) => {
  return Math.floor(Date.now() / 1000) + seconds;
};

export async function generateAccessToken(data: Object): Promise<string> {
  const payload = {
    ...data,
    exp:
      Math.floor(Date.now() / 1000) + parseInt(process.env.ACCESS_EXPIRES_IN!),
  };

  console.log("ACCESS SECRET:", process.env.ACCESS_SECRET!);

  return sign(payload, process.env.ACCESS_SECRET!);
}

export async function generateRefreshToken(data: Object): Promise<string> {
  const payload = {
    ...data,
    exp:
      Math.floor(Date.now() / 1000) + parseInt(process.env.REFRESH_EXPIRES_IN!),
  };

  return sign(payload, process.env.REFRESH_SECRET!);
}

export function setAccessTokenCookie(c: Context, token: string) {
  setCookie(c, "accessToken", token, {
    path: "/",
    secure: process.env.NODE_ENV === "production" ? true : false,
    domain: process.env.NODE_ENV === "production" ? ".domain.com" : "localhost",
    httpOnly: true,
    maxAge: 1000 * 60 * 15,
    sameSite: process.env.NODE_ENV === "production" ? "lax" : "strict",
  });
}

export function setRefreshTokenCookie(c: Context, token: string) {
  setCookie(c, "refreshToken", token, {
    path: "/",
    secure: process.env.NODE_ENV === "production" ? true : false,
    domain: process.env.NODE_ENV === "production" ? ".domain.com" : "localhost",
    httpOnly: true,
    maxAge: 1000 * 60 * 15,
    sameSite: process.env.NODE_ENV === "production" ? "lax" : "strict",
  });
}

// 4. Clear refresh token from cookie (logout)
export function clearRefreshTokenCookie(c: Context) {
  deleteCookie(c, "refreshToken", {
    path: "/",
    secure: process.env.NODE_ENV === "production" ? true : false,
    domain: process.env.NODE_ENV === "production" ? ".domain.com" : "localhost",
  });
}

export function clearAccessTokenCookie(c: Context) {
  deleteCookie(c, "accessToken", {
    path: "/",
    secure: process.env.NODE_ENV === "production" ? true : false,
    domain: process.env.NODE_ENV === "production" ? ".domain.com" : "localhost",
  });
}
