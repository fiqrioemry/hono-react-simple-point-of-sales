import { prisma } from "@/config/database";
import { sendNewAccountPassword } from "@/config/mailer";
import { userResponse, UserResponse } from "@/schema/auth.schema";
import {
  pagination,
  Pagination,
  UserQuery,
  ChangeRoleRequest,
  CreateUserRequest,
  UpdateProfileRequest,
  UpdateUserRequest,
} from "@/schema/user.schema";
import { HTTPException } from "hono/http-exception";
import { deleteImage, uploadImage } from "@/utils/uploader";

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
  ): Promise<{message : string, data : UserResponse}> {
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

    return {
      message : "Profile updated successfully",
      data : userResponse.parse(updatedUser),
    }
  }

  static async change(req : ChangeRoleRequest): Promise<string>{
    // check if user exists
    const isExist = await prisma.user.findUnique({where : {id:req.userId}})
    
    if (!isExist){
      throw new HTTPException(404, {message : "User not found"});
    }

    // update role
    await prisma.user.update({where : {id : req.userId}, data : {role : req.role}})

    return "Role changed successfully";
  }

  static async create(req: CreateUserRequest): Promise<string> {
    // check if email already exists
    const isExist = await prisma.user.findUnique({
      where: { email: req.email },
    });

    // if email already exists, throw error
    if (isExist) {
      throw new HTTPException(400, { message: "Email already exists" });
    }

    // generate random password and hash before save
    const randomPassword = Math.random().toString(24).slice(-8);
    const hashedPassword = await Bun.password.hash(randomPassword);

 
    // upload image for avatar
    let imageUrl = null;
    if (req.image instanceof File) {
      imageUrl = await uploadImage(req.image);
    }

    // create new user
    await prisma.user.create({
      data: {
        name: req.name,
        email: req.email,
        role: req.role,
        image: imageUrl,
        password: hashedPassword,
      },
    });

    // send email to user with new password
    await sendNewAccountPassword({
      to: req.email,
      subject: "Your new account password",
      password: randomPassword,
    });

    // return response message
    return "User created successfully";

  }

  static async update(req : UpdateUserRequest) : Promise<{message : string, data : UserResponse}>{
    // check if user exists
    const isExist = await prisma.user.findUnique({where : {id:req.userId}})

    if (!isExist){
      throw new HTTPException(404, {message : "User not found"});
    }

    const emailExist = await prisma.user.findUnique({where : {email : req.email}})
    // if email is being updated, check if it already exists
    if (req.email && emailExist && emailExist.id !== req.userId){
      throw new HTTPException(400, {message : "Email already exists"});
    }

    let imageUrl = isExist.image;
    // if new image is uploaded, upload it and delete old one
    if (req.image instanceof File) {
      imageUrl = await uploadImage(req.image);
      deleteImage(isExist.image); // let this synchronous
    }

    // update user
    const updatedUser = await prisma.user.update({where : {id : req.userId}, data : {
      name : req.name,
      email : req.email,
      image : imageUrl
    }})

    return {
      message : "User updated successfully",
      data : userResponse.parse(updatedUser)
    }

    }
  }
