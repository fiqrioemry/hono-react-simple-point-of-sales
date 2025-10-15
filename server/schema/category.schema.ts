import { z } from "zod";

export const categoryResponse = z.object({
  id: z.uuid(),
  parentId: z.uuid().nullable().optional(),
  level: z.number().default(0).optional(),
  name: z.string(),
  createdAt: z
    .date()
    .transform((date) => date.toISOString())
    .nullable()
    .optional(),
  updatedAt: z
    .date()
    .transform((date) => date.toISOString())
    .nullable()
    .optional(),
  totalProducts: z.number().nullable().optional(),
  canDelete: z.boolean().nullable().optional(),
});

export const createCategoryRequest = z.object({
  name: z.string().min(1, "Name is required"),
});

export const updateCategoryRequest = z.object({
  id: z.uuid("Invalid ID"),
  name: z.string().min(1, "Name is required"),
});

export const categoryId = z.uuid("Invalid ID");

export type CategoryResponse = z.infer<typeof categoryResponse>;
export type CreateCategoryRequest = z.infer<typeof createCategoryRequest>;
export type UpdateCategoryRequest = z.infer<typeof updateCategoryRequest>;
