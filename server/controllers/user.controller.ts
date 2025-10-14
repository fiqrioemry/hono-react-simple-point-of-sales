import { Context } from "hono";
import { parseForm } from "@/utils/validator";
import { successResponse } from "@/utils/response";
import { UserService } from "@/services/user.service";
import { changeRoleRequest, createUserRequest, updateProfileRequest, userQuery } from "@/schema/user.schema";

export class UserController {
  static async getUsers(c: Context) {
    const query = userQuery.parse(c.req.query());
    const response = await UserService.search(query);
    return successResponse(c, "Users fetched successfully", response);
  }

  static async updateProfile(c: Context) {
    const userId = c.get("user").userId;
    const request = await parseForm(c, updateProfileRequest);
    const response = await UserService.updateProfile(userId, request);
    return successResponse(c, "user profile updated successfully", response);
  }

  static async changeRole(c: Context) {
    const request = changeRoleRequest.parse(await c.req.json());
    const message = await UserService.change(request);
    return successResponse(c, message);
  }

  static async createUsers(c: Context) {
    const request = createUserRequest.parse(await c.req.json());
    const message = await UserService.create(request);
    return successResponse(c, message);
  }

  static async updateUsers(c: Context) {
    return successResponse(c, "User updated successfully");
  }
}
