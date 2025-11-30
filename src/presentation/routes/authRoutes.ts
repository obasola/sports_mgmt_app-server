// src/presentation/routes/authRoutes.ts
import { Router } from "express";
import { AuthController } from "@/presentation/controllers/AuthController";

const controller = new AuthController();
export const authRoutes = Router();

authRoutes.post("/register", controller.register.bind(controller));
authRoutes.get("/verify-email/:token", controller.verifyEmail.bind(controller));
authRoutes.post("/login", controller.login.bind(controller));
authRoutes.post("/refresh", controller.refresh.bind(controller));
authRoutes.post("/logout", controller.logout.bind(controller));
authRoutes.post("/forgot-password", controller.forgotPassword.bind(controller));
authRoutes.post("/reset-password", controller.resetPassword.bind(controller));
