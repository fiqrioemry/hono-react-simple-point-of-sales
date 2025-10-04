import { Hono } from "hono";
import auth from "./auth.route";
import user from "./user.route";
import category from "./category.route";
import products from "./product.route";

const router = new Hono();

router.get("/", (c) => {
  return c.redirect("/health");
});

router.get("/health", (c) => {
  return c.json({
    status: "OK",
    message: "condition healthy",
    timestamp: new Date().toISOString(),
  });
});

router.route("/api/v1/auth", auth);
router.route("/api/v1/users", user);
router.route("/api/v1/products", products);
router.route("/api/v1/categories", category);

export default router;
