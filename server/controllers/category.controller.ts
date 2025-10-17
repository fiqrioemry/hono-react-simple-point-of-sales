import { Context } from "hono";
import { successResponse } from "@/utils/response";
import { CategoryService } from "@/services/category.service";
import { categoryId, createCategoryRequest, getChildParams, updateCategoryRequest } from "@/schema/category.schema";

export class CategoryController {
  static async getAllParentCategories(c: Context) {
    const { message, response } = await CategoryService.getAllParent();
    return successResponse(c, message, response);
  }

  static async getAllChildCategories(c: Context) {
    const parentId = c.req.param("parentId");
    const level = Number(c.req.query("level") ?? 1);
    const params = getChildParams.parse({ parentId, level });
    const { message, response } = await CategoryService.getAllChild(params);
    return successResponse(c, message, response);
  }

  static async createCategory(c: Context) {
    const request = createCategoryRequest.parse(await c.req.json());
    const response = await CategoryService.create(request);
    return successResponse(c, response);
  }

  static async updateCategory(c: Context) {
    const id = c.req.param("id");
    const request = await c.req.json();
    const parsedRequest = updateCategoryRequest.parse({ ...request, id });
    const response = await CategoryService.update(parsedRequest);
    return successResponse(c, response);
  }

  static async deleteCategory(c: Context) {
    const id = c.req.param("id");
    const request = categoryId.parse(id);
    const response = await CategoryService.delete(request);
    return successResponse(c, response);
  }
}
