import type { Request } from "express";
import type { AuthUser } from "./authUser";

export function requireUser(req: Request): AuthUser {
  const u = req.user;
  if (!u) throw new Error("NOT_AUTHENTICATED");
  return u;
}
