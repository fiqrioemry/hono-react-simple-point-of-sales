import {
  CategoryResponse,
  categoryResponse,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from "@/schema/category.schema";
import { prisma } from "@/config/database";
import { HTTPException } from "hono/http-exception";

export class CategoryService {
  static async getAll(): Promise<{
    message: string;
    response: CategoryResponse[];
  }> {
    // get all categories
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    const result = categories.map((cat) => ({
      ...cat,
      totalProducts: cat._count.products,
      canDelete: cat._count.products === 0,
    }));

    const response = categoryResponse.array().parse(result);

    return {
      message: "Categories fetched successfully",
      response,
    };
  }
  static async create(req: CreateCategoryRequest): Promise<string> {
    // check for unique category name
    const existing = await prisma.category.findUnique({
      where: { name: req.name },
    });
    if (existing) {
      throw new HTTPException(400, { message: "Category must be unique" });
    }

    // create new category
    const category = await prisma.category.create({
      data: {
        name: req.name,
      },
    });

    // return success message
    return `Category ${category.name} created successfully`;
  }
  static async update(req: UpdateCategoryRequest): Promise<string> {
    // check for existing category
    const category = await prisma.category.findUnique({
      where: { id: req.id },
    });

    if (!category) {
      throw new HTTPException(404, { message: "Category not found" });
    }

    if (req.name === category.name) {
      throw new HTTPException(400, {
        message: "Please use a different name to update",
      });
    }

    // update category
    await prisma.category.update({
      where: { id: req.id },
      data: {
        name: req.name,
      },
    });

    // return success message
    return `Category ${category.name} updated successfully`;
  }

  static async delete(categoryId: string): Promise<string> {
    // check for existing category
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    if (!category) {
      throw new HTTPException(404, { message: "Category not found" });
    }

    if (category?._count.products! > 0) {
      throw new HTTPException(400, {
        message: "Cannot delete category with active product",
      });
    }

    // delete category
    await prisma.category.delete({
      where: { id: categoryId },
    });

    // return success message
    return `Category ${category.name} deleted successfully`;
  }
}
