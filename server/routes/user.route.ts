import { Hono } from "hono";
import { adminOnly, authMiddleware } from "@/middleware/auth";
import { UserController } from "@/controllers/user.controller";

const user = new Hono();
user.use(authMiddleware);
user.put("/profile", UserController.updateProfile);

user.use(adminOnly);
user.get("", UserController.getUsers);
user.post("/create", UserController.createUsers);
user.put("/:id/update", UserController.updateUsers);
user.patch("/:id/role", UserController.changeRole);

export default user;
