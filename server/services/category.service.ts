import { CategoryResponse, categoryResponse, CreateCategoryRequest, GetChildParams, UpdateCategoryRequest } from "@/schema/category.schema";
import { prisma } from "@/config/database";
import { HTTPException } from "hono/http-exception";

export class CategoryService {
  static async getAllParent(): Promise<{
    message: string;
    response: CategoryResponse[];
  }> {
    // get all categories
    const categories = await prisma.category.findMany({
      where: { parentId: null, level: 0 },
      include: {
        _count: {
          select: { products: true, children: true },
        },
      },
    });

    const result = categories.map((cat) => ({
      ...cat,
      totalChild: cat._count.children,
      totalProducts: cat._count.products,
      canDelete: cat._count.products === 0 && cat._count.children === 0,
    }));

    const response = categoryResponse.array().parse(result);

    return {
      message: "Categories fetched successfully",
      response,
    };
  }

  static async getAllChild(params: GetChildParams): Promise<{
    message: string;
    response: CategoryResponse[];
  }> {
    // get all categories
    const childCategories = await prisma.category.findMany({
      where: { parentId: params.parentId, level: params.level },
      include: {
        _count: { select: { products: true, children: true } },
      },
    });

    const result = childCategories.map((cat) => ({
      ...cat,
      totalChild: cat._count.children,
      totalProducts: cat._count.products,
      canDelete: cat._count.children === 0,
    }));

    return {
      message: "Child Categories fetched successfully",
      response: categoryResponse.array().parse(result),
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
