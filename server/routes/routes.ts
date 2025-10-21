import { Hono } from "hono";
import auth from "./auth.route";
import user from "./user.route";
import outlet from "./outlet.route";
import category from "./category.route";
import products from "./product.route";

const router = new Hono();


export default router;
