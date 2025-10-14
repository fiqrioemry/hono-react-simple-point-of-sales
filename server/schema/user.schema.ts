import { z } from "zod";

export const userQuery = z.object({
  q: z.string().nullable().optional(),
  role: z.enum(["STAFF", "ADMIN"]).nullable().optional(),
  page: z.string().min(1).max(100).default("1").optional(),
  limit: z.string().min(1).max(100).default("10").optional(),
  sort: z.enum(["asc", "desc"]).nullable().optional(),
});

export const pagination = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).default(10),
  totalItems: z.number().min(0).default(0),
  totalPages: z.number().min(0).default(0),
});

const imageFile = z
  .instanceof(File, { message: "Please upload a valid image file" })
  .refine((file) => file.size <= 500 * 1024, {
    message: "Image must be less than 500KB",
  })
  .refine(
    (file) =>
      ["image/png", "image/jpeg", "image/jpg", "image/webp"].includes(
        file.type
      ),
    { message: "Only PNG, JPEG, JPG, or WEBP images are allowed" }
  );

const singleImage = z.union([
  imageFile,
  z.url("Invalid image URL"),
]);
export const updateProfileRequest = z.object({
  name: z.string().min(1, "Name is required").max(100),
  image: singleImage.optional(),
});

export const changeRoleRequest = z.object({
  userId : z.uuid("Invalid UUID"),
  role : z.enum(["STAFF", "ADMIN"])
})

export const createUserRequest = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.email("Invalid email address"),
  role: z.enum(["STAFF", "ADMIN"]).default("STAFF"),
  image: singleImage
})

export const updateUserRequest = z.object({
  userId : z.uuid("Invalid UUID"),
  name: z.string().min(1, "Name is required").max(100).optional(),
  email: z.email("Invalid email address").optional(),
  image: singleImage.optional()
})


export type UpdateUserRequest = z.infer<typeof updateUserRequest>;
export type CreateUserRequest = z.infer<typeof createUserRequest>;
export type ChangeRoleRequest = z.infer<typeof changeRoleRequest>;
export type UserQuery = z.infer<typeof userQuery>;
export type Pagination = z.infer<typeof pagination>;
export type UpdateProfileRequest = z.infer<typeof updateProfileRequest>;
