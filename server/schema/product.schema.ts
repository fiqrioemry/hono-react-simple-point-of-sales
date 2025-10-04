import { categoryResponse } from "@/schema/category.schema";
import { z } from "zod";

const imageFile = z
  .instanceof(File, { message: "Please upload a valid image file" })
  .refine((file) => file.size <= 1000 * 1024, {
    message: "Image must be less than 1MB",
  })
  .refine(
    (file) =>
      ["image/png", "image/jpeg", "image/jpg", "image/webp"].includes(
        file.type
      ),
    { message: "Only PNG, JPEG, JPG, or WEBP images are allowed" }
  );

const singleImage = z.union([imageFile, z.url("Invalid image URL")]);

export const productId = z.uuid("Invalid Product ID");

export const productQuery = z.object({
  q: z.string().nullable().optional(),
  category: z.uuid("Invalid Category ID").nullable().optional(),
  page: z.string().min(1).max(100).default("1").optional(),
  limit: z.string().min(1).max(100).default("10").optional(),
  sort: z
    .enum(["stock_asc", "stock_desc", "price_asc", "price_desc"])
    .nullable()
    .optional(),
});

export const productResponse = z
  .object({
    id: z.string().uuid(),
    name: z.string(),
    description: z.string().nullable(),
    price: z.number(),
    stock: z.number(),
    image: z.string().nullable(),
    category: categoryResponse,
    createdAt: z.date().transform((date) => date.toISOString()),
    updatedAt: z.date().transform((date) => date.toISOString()),
  })
  .transform((data) => ({
    ...data,
    stockStatus:
      data.stock === 0
        ? "Out of Stock"
        : data.stock < 5
        ? "Low Stock"
        : "In Stock",
  }));

export const createProductRequest = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  price: z
    .string()
    .transform((val) => Number(val))
    .pipe(z.number().min(0, "Price must be at least 0")),
  stock: z
    .string()
    .transform((val) => Number(val))
    .pipe(z.number().min(0, "Stock must be at least 0")),
  categoryId: z.uuid("Invalid Category ID"),
  image: singleImage,
});

export const updateProductRequest = z.object({
  id: z.uuid("Invalid Product ID"),
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  price: z
    .string()
    .transform((val) => Number(val))
    .pipe(z.number().min(0, "Price must be at least 0")),
  stock: z
    .string()
    .transform((val) => Number(val))
    .pipe(z.number().min(0, "Stock must be at least 0")),
  categoryId: z.uuid("Invalid Category ID"),
  image: singleImage.nullable().optional(),
});

export type ProductQuery = z.infer<typeof productQuery>;
export type ProductResponse = z.infer<typeof productResponse>;
export type CreateProductRequest = z.infer<typeof createProductRequest>;
export type UpdateProductRequest = z.infer<typeof updateProductRequest>;
