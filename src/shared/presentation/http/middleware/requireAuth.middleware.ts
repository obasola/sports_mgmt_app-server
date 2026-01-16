import type { Request, Response, NextFunction } from "express";
import { JwtTokenService } from "@/modules/auth/infrastructure/security/JwtTokenService";
import type { AuthUser } from "../authUser";

type AuthedRequest = Request & { user?: AuthUser };

function readBearerToken(req: Request): string | null {
  const h = req.header("authorization");
  if (!h) return null;
  const [scheme, token] = h.split(" ");
  if (!scheme || !token) return null;
  if (scheme.toLowerCase() !== "bearer") return null;
  return token;
}

export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction): void {
  const token = readBearerToken(req);
  if (!token) {
    res.status(401).json({ error: "NOT_AUTHENTICATED" });
    return;
  }

  try {
    const svc = new JwtTokenService();
    req.user = svc.verifyAccessToken(token) as AuthUser; // cast if verifyAccessToken isn't typed as AuthUser
    next();
  } catch {
    res.status(401).json({ error: "NOT_AUTHENTICATED" });
  }
}
