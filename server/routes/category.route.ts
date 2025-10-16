import { Hono } from "hono";
import { adminOnly, authMiddleware } from "@/middleware/auth";
import { CategoryController } from "@/controllers/category.controller";

const category = new Hono();

// category.use(authMiddleware, adminOnly);
category.get("", CategoryController.getAllParentCategories);
category.get("/:parentId/children", CategoryController.getAllChildCategories);
category.post("", CategoryController.createCategory);
category.put("/:id", CategoryController.updateCategory);
category.delete("/:id", CategoryController.deleteCategory);

export default category;
