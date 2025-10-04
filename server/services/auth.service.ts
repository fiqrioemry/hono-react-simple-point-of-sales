import {
  UserResponse,
  userResponse,
  LoginRequest,
  RegisterRequest,
  ChangePassRequest,
} from "@/schema/auth.schema";
import {
  generateAccessToken,
  generateRefreshToken,
  setAccessTokenCookie,
  setRefreshTokenCookie,
} from "@/utils/jwt";
import { Context } from "hono";
import { verify } from "hono/jwt";
import { redis } from "@/config/redis";
import { getCookie } from "hono/cookie";
import { prisma } from "@/config/database";
import { HTTPException } from "hono/http-exception";
import { generateAvatarUrl } from "@/utils/generate";
import { sendResetLink, sendVerificationLink } from "@/config/mailer";

export class AuthService {
  static async register(req: RegisterRequest): Promise<string> {
    // check if email already exists

    const existingEmail = await prisma.user.findUnique({
      where: { email: req.email },
    });
    // throw error if email exists
    if (existingEmail) {
      throw new HTTPException(401, { message: "Email already exists" });
    }

    // create key to store OTP
    const activationToken = crypto.randomUUID();

    // hash password
    const hashedPassword = await Bun.password.hash(req.password);

    //   prepare user data
    const userData = {
      name: req.name,
      email: req.email,
      password: hashedPassword,
    };

    // store in redis with 30 minutes expiry
    await redis.set(
      `activation_token:${activationToken}`,
      JSON.stringify(userData),
      "EX",
      60 * 30
    );

    // send email with verification link
    const subject = "Verify your email";
    const verifyLink = `${process.env.FRONTEND_URL}/verify-email?token=${activationToken}`;
    await sendVerificationLink({ to: req.email, subject, url: verifyLink });

    return "OTP sent to email";
  }

  static async verifyToken(
    c: Context,
    token: string
  ): Promise<{ user: UserResponse; accessToken: string }> {
    // get user data from redis
    const userData = await redis.get(`activation_token:${token}`);

    // if no user data, throw error
    if (!userData) {
      throw new HTTPException(400, { message: "Invalid or expired token" });
    }

    const parsedData = JSON.parse(userData);
    const image = generateAvatarUrl(parsedData.name);

    // create user in database
    const newUser = await prisma.user.create({
      data: {
        ...parsedData,
        image,
      },
    });

    // delete token from redis
    await redis.del(`activation_token:${token}`);

    // create jwt payload
    const payload = {
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role,
    };

    // generate token
    const accessToken = await generateAccessToken(payload);
    const refreshToken = await generateRefreshToken(payload);

    setAccessTokenCookie(c, accessToken);
    setRefreshTokenCookie(c, refreshToken);

    // build response data
    return {
      user: userResponse.parse(newUser),
      accessToken,
    };
  }

  static async login(
    c: Context,
    req: LoginRequest
  ): Promise<{ user: UserResponse; accessToken: string }> {
    // find user by email
    const user = await prisma.user.findUnique({
      where: { email: req.email },
    });

    // if no user, throw error
    if (!user) {
      throw new HTTPException(401, { message: "Invalid email or password" });
    }

    // verify password
    const isPasswordValid = await Bun.password.verify(
      req.password,
      user.password
    );
    if (!isPasswordValid) {
      throw new HTTPException(401, { message: "Invalid email or password" });
    }

    // create jwt payload
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    // generate token
    const accessToken = await generateAccessToken(payload);
    const refreshToken = await generateRefreshToken(payload);

    // set token as https only cookies
    setAccessTokenCookie(c, accessToken);
    setRefreshTokenCookie(c, refreshToken);

    return { user: userResponse.parse(user), accessToken };
  }

  static async refresh(
    c: Context
  ): Promise<{ user: UserResponse; accessToken: string }> {
    // get refresh token from cookie
    const token = getCookie(c, "refreshToken");

    // trhow error if no token
    if (!token) {
      throw new HTTPException(401, {
        message: "Unauthorized : token required",
      });
    }

    // verify token
    const decode = await verify(token, process.env.REFRESH_SECRET!);

    if (!decode) {
      throw new HTTPException(401, { message: "Unauthorized : Invalid token" });
    }

    // find user by id
    const user = await prisma.user.findUnique({
      where: { id: (decode as any).userId },
    });

    if (!user) {
      throw new HTTPException(404, { message: "User not found" });
    }

    // assign payload data
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    // generate new token
    const accessToken = await generateAccessToken(payload);

    // set token as https only cookies
    setAccessTokenCookie(c, accessToken);

    return { user: userResponse.parse(user), accessToken };
  }

  static async logout(c: Context): Promise<string> {
    const refreshToken = getCookie(c, "refreshToken");

    if (!refreshToken) {
      throw new HTTPException(400, { message: "No active session" });
    }

    return "Logged out successfully";
  }

  static async forgot(email: string): Promise<string> {
    const isExist = await prisma.user.findUnique({
      where: { email },
    });

    if (!isExist) {
      return "If that email is registered, you will receive a password reset link.";
    }

    // create token to store
    const resetToken = crypto.randomUUID();

    // store in redis with 30 minutes expiry
    await redis.set(
      `reset_token:${resetToken}`,
      JSON.stringify(email),
      "EX",
      60 * 30
    );

    const subject = "Reset your password";
    const url = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    await sendResetLink({ to: email, subject, url });

    return "OTP sent to email";
  }

  static async reset(token: string, newPassword: string): Promise<string> {
    // get user data from redis
    const userData = await redis.get(`reset_token:${token}`);

    // if no user data, throw error
    if (!userData) {
      throw new HTTPException(401, { message: "Invalid or expired token" });
    }

    // parse email from redis
    const email = JSON.parse(userData);

    // hash password
    const passwordHash = await Bun.password.hash(newPassword);

    // update user password in database
    await prisma.user.update({
      where: { email },
      data: { password: passwordHash },
    });

    // remove token from redis
    await redis.del(`reset_token:${token}`);

    return "Password reset successfully";
  }

  static async change(req: ChangePassRequest, userId: string): Promise<string> {
    // check for user
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new HTTPException(404, { message: "User not found" });
    }

    // verify current password
    const isPasswordValid = await Bun.password.verify(
      req.currentPassword,
      user.password
    );

    if (!isPasswordValid) {
      throw new HTTPException(401, {
        message: "Current password is incorrect",
      });
    }

    // hash new password
    const newHashedPassword = await Bun.password.hash(req.newPassword);

    // update password in database
    await prisma.user.update({
      where: { id: userId },
      data: { password: newHashedPassword },
    });

    return "Password changed successfully";
  }
}
