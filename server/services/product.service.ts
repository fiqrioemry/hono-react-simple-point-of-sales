import { prisma } from "@/config/database";
import {
  CreateProductRequest,
  ProductQuery,
  productResponse,
  ProductResponse,
  UpdateProductRequest,
} from "@/schema/product.schema";
import { pagination, Pagination } from "@/schema/user.schema";
import { deleteImage, uploadImage } from "@/utils/uploader";
import { HTTPException } from "hono/http-exception";

export class ProductService {
  static async getAll(
    query: ProductQuery
  ): Promise<{ response: ProductResponse[]; meta: Pagination }> {
    const q = query.q || "";
    const category = query.category || null;
    const sort = query.sort || "stock_desc";
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;

    // build search condition
    let where = {};
    if (q) {
      where = {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
        ],
      };
    }

    // filter by category
    if (category) {
      where = { ...where, categoryId: category };
    }

    let field = "stock";
    let order: "asc" | "desc" = "desc";

    if (sort) {
      [field, order] = sort.split("_") as [string, "asc" | "desc"];
    }

    const orderBy = { [field]: order };

    // Get total items count
    const totalItems = await prisma.product.count({
      where: {
        name: { contains: q, mode: "insensitive" },
      },
    });

    // Calculate offset & total pages
    const totalPages = Math.ceil(totalItems / limit);
    const offset = (page - 1) * limit;

    const products = await prisma.product.findMany({
      where,
      include: { category: { select: { id: true, name: true } } },
      orderBy,
      skip: offset,
      take: limit,
    });
    return {
      response: productResponse.array().parse(products),
      meta: pagination.parse({ page, limit, totalItems, totalPages }),
    };
  }

  static async create(req: CreateProductRequest): Promise<string> {
    const imageUrl = await uploadImage(req.image);

    await prisma.product.create({
      data: {
        ...req,
        image: imageUrl,
      },
    });

    return `Product ${req.name} created successfully`;
  }

  static async update(req: UpdateProductRequest): Promise<string> {
    const oldProduct = await prisma.product.findUnique({
      where: { id: req.id },
    });
    if (!oldProduct) {
      throw new HTTPException(404, { message: "Product not found" });
    }

    let imageUrl = oldProduct.image;
    if (req.image instanceof File) {
      imageUrl = await uploadImage(req.image);

      deleteImage(oldProduct.image);
    }

    await prisma.product.update({
      where: { id: req.id },
      data: {
        ...req,
        image: imageUrl,
      },
    });

    return `Product ${req.id} updated successfully`;
  }

  static async delete(productId: string): Promise<string> {
    // check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) {
      throw new HTTPException(404, { message: "Product not found" });
    }

    // delete image if exist
    if (product.image) {
      deleteImage(product.image);
    }

    // delete product
    await prisma.product.delete({ where: { id: productId } });

    return `Product with id ${productId} deleted successfully`;
  }

  static async getById(
    productId: string
  ): Promise<{ message: string; response: any }> {
    // implementation here
    return {
      message: "Product fetched successfully",
      response: { id: productId },
    };
  }
}
