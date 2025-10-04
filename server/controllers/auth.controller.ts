import {
  tokenQuery,
  loginRequest,
  registerRequest,
  emailRequest,
  resetPasswordRequest,
  changePassRequest,
} from "@/schema/auth.schema";
import { Context } from "hono";
import { successResponse } from "@/utils/response";
import { AuthService } from "@/services/auth.service";

export class AuthController {
  static async register(c: Context) {
    const request = registerRequest.parse(await c.req.json());
    const message = await AuthService.register(request);
    return successResponse(c, message);
  }

  static async verifyEmail(c: Context) {
    const token = tokenQuery.parse(c.req.query("token") ?? "");
    const response = await AuthService.verifyToken(c, token);
    return successResponse(c, "Email verified successfully", response.user);
  }

  static async login(c: Context) {
    const request = loginRequest.parse(await c.req.json());
    const response = await AuthService.login(c, request);
    return successResponse(c, "Login successful", response);
  }

  static async getSession(c: Context) {
    const response = await AuthService.refresh(c);
    return successResponse(c, "Session refreshed", response);
  }

  static async logout(c: Context) {
    const message = await AuthService.logout(c);
    return successResponse(c, message);
  }

  static async forgotPassword(c: Context) {
    const email = emailRequest.parse(await c.req.json());
    const message = await AuthService.forgot(email);
    return successResponse(c, message);
  }

  static async resetPassword(c: Context) {
    const token = tokenQuery.parse(c.req.query("token") ?? "");
    const request = resetPasswordRequest.parse(await c.req.json());
    const response = await AuthService.reset(token, request.newPassword);
    return successResponse(c, "Password reset successfully", response);
  }

  static async changePassword(c: Context) {
    const user = c.get("user");
    const request = changePassRequest.parse(await c.req.json());
    const message = await AuthService.change(request, user.userId);
    return successResponse(c, message);
  }
}
