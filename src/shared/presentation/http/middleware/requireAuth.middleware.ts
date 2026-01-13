import type { Request, Response, NextFunction } from "express";
import type { AccessTokenClaims } from "@/modules/auth/infrastructure/security/JwtTokenService";
import { JwtTokenService } from "@/modules/auth/infrastructure/security/JwtTokenService";
import { AuthUser } from "../authUser";
/*
declare module "express-serve-static-core" {
  interface Request {
    user?: AuthUser;
  }
}
*/
function readBearerToken(req: Request): string | null {
  const h = req.header("authorization");
  if (!h) return null;
  const [scheme, token] = h.split(" ");
  if (!scheme || !token) return null;
  if (scheme.toLowerCase() !== "bearer") return null;
  return token;
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const token = readBearerToken(req);
  if (!token) {
    res.status(401).json({ error: "NOT_AUTHENTICATED" });
    return;
  }

  try {
    const svc = new JwtTokenService();
    req.user = svc.verifyAccessToken(token);
    next();
  } catch {
    res.status(401).json({ error: "NOT_AUTHENTICATED" });
  }
}
