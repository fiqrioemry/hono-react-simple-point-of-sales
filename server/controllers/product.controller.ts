import { Context } from "hono";
import {
  productId,
  productQuery,
  createProductRequest,
  updateProductRequest,
} from "@/schema/product.schema";
import { parseForm } from "@/utils/validator";
import { successResponse } from "@/utils/response";
import { ProductService } from "@/services/product.service";

export class ProductController {
  static async getAllProducts(c: Context) {
    const query = productQuery.parse(c.req.query());
    const response = await ProductService.getAll(query);
    return successResponse(c, "product fetched successfully", response);
  }

  static async createProduct(c: Context) {
    const request = await parseForm(c, createProductRequest);
    const response = await ProductService.create(request);
    return successResponse(c, response);
  }

  static async updateProduct(c: Context) {
    const productId = c.req.param("id");
    (await c.req.formData()).append("id", productId);
    const parsedRequest = await parseForm(c, updateProductRequest);
    const response = await ProductService.update(parsedRequest);
    return successResponse(c, response);
  }

  static async deleteProduct(c: Context) {
    const id = c.req.param("id");
    const request = productId.parse(id);
    const response = await ProductService.delete(request);
    return successResponse(c, response);
  }

  static async getProductById(c: Context) {
    const id = c.req.param("id");
    const request = productId.parse(id);
    const { message, response } = await ProductService.getById(request);
    return successResponse(c, message, response);
  }
}
