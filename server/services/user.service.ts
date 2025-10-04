import { prisma } from "@/config/database";
import { userResponse, UserResponse } from "@/schema/auth.schema";
import {
  pagination,
  Pagination,
  UpdateProfileRequest,
  UserQuery,
} from "@/schema/user.schema";
import { deleteImage, uploadImage } from "@/utils/uploader";
import { HTTPException } from "hono/http-exception";

export class UserService {
  static async search(
    query: UserQuery
  ): Promise<{ data: UserResponse[]; meta: Pagination }> {
    const q = query.q || "";
    const sort = query.sort || "desc";
    const role = query.role || null;
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;

    let where = {};
    if (q) {
      where = {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { email: { contains: q, mode: "insensitive" } },
        ],
      };
    }

    if (role) {
      where = { ...where, role };
    }

    // Get total items count
    const totalItems = await prisma.user.count({ where });

    // Calculate offset & total pages
    const totalPages = Math.ceil(totalItems / limit);
    const offset = (page - 1) * limit;

    // Fetch users with pagination
    const users = await prisma.user.findMany({
      where,
      skip: offset,
      take: limit,
      orderBy: { createdAt: sort as "asc" | "desc" },
    });

    return {
      data: userResponse.array().parse(users),
      meta: pagination.parse({ page, limit, totalItems, totalPages }),
    };
  }

  static async updateProfile(
    userId: string,
    req: UpdateProfileRequest
  ): Promise<any> {
    // get user data

    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new HTTPException(404, { message: "User not found" });
    }

    // upload new image if exist and delete old one
    let imageUrl = user.image;
    if (req.image instanceof File && user.image) {
      imageUrl = await uploadImage(req.image);

      //   no need to wait just fire and forget
      deleteImage(user.image);
    }

    // update user data
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { name: req.name, image: imageUrl },
    });

    return userResponse.parse(updatedUser);
  }
}
