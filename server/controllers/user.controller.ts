import { Context } from "hono";
import { parseForm, validate } from "@/utils/validator";
import { successResponse } from "@/utils/response";
import { UserService } from "@/services/user.service";
import { updateProfileRequest, userQuery } from "@/schema/user.schema";

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

  //   TODO : implement these methods
  static async changeRole(c: Context) {
    const request = validate(c,)
    return successResponse(c, "User role changed successfully");
  }

  static async createUsers(c: Context) {
    return successResponse(c, "User created successfully");
  }

  static async updateUsers(c: Context) {
    return successResponse(c, "User updated successfully");
  }
}
