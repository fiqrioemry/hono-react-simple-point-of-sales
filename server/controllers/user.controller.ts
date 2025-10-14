import { Context } from "hono";
import { parseForm } from "@/utils/validator";
import { successResponse } from "@/utils/response";
import { UserService } from "@/services/user.service";
import { changeRoleRequest, createUserRequest, updateProfileRequest, updateUserRequest, userQuery } from "@/schema/user.schema";

export class UserController {
  static async getUsers(c: Context) {
    const query = userQuery.parse(c.req.query());
    const response = await UserService.search(query);
    return successResponse(c, "user fetched successfully", response)
  }

  static async updateProfile(c: Context) {
    const userId = c.get("user").userId;
    const request = await parseForm(c, updateProfileRequest);
    const response = await UserService.updateProfile(userId, request);
    return successResponse(c, response.message, response.data);
  }

  static async changeRole(c: Context) {
    const id = c.req.param("id");
    const request = changeRoleRequest.parse({ ...await c.req.json(), userId: id });
    const message = await UserService.change(request);
    return successResponse(c, message);
  }

  static async createUsers(c: Context) {
    const request =  await parseForm(c, createUserRequest);
    const message = await UserService.create(request);
    return successResponse(c, message);
  }

  static async updateUsers(c: Context) {
    const id = c.req.param("id");
    const request = updateUserRequest.parse({ ...await c.req.json(), userId: id });
    const response = await UserService.update(request);
    return successResponse(c, response.message, response.data);
  }
}
