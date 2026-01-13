import "express";
import type { AuthUser } from "./authUser";

declare module "express-serve-static-core" {
  interface Request {
    user?: AuthUser;
  }
}
