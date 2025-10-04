import { Hono } from "hono";
import { limitter } from "@/middleware/limitter";
import { AuthController } from "@/controllers/auth.controller";
import { authMiddleware } from "@/middleware/auth";

const auth = new Hono();

auth.post("/logout", AuthController.logout);
auth.post("/verify", AuthController.verifyEmail);
auth.post("/login", limitter(3, 60), AuthController.login);
auth.post("/register", limitter(10, 60), AuthController.register);
auth.post("/get-session", limitter(30, 60), AuthController.getSession);
auth.post("/forgot-password", limitter(3, 60), AuthController.forgotPassword);
auth.post("/reset-password", limitter(5, 60), AuthController.resetPassword);
auth.put("/change-password", authMiddleware, AuthController.changePassword);

export default auth;
