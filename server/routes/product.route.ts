import { Hono } from "hono";
import { adminOnly, authMiddleware } from "@/middleware/auth";
import { ProductController } from "@/controllers/product.controller";

const products = new Hono();
// products.use(authMiddleware, adminOnly);

products.get("", ProductController.getAllProducts);
products.post("", ProductController.createProduct);
products.put("/:id", ProductController.updateProduct);
products.delete("/:id", ProductController.deleteProduct);
products.get("/:id", ProductController.getProductById);

export default products;
