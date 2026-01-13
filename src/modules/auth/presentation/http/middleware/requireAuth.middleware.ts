import type { Request, Response, NextFunction } from "express";
import { container } from "tsyringe";
import type { AuthUser } from "@/shared/presentation/http/authUser";
import { JwtTokenService } from "@/modules/auth/infrastructure/security/JwtTokenService";

function readBearerToken(req: Request): string | null {
  const h = req.header("authorization");
  if (!h) return null;

  const parts = h.split(" ");
  if (parts.length !== 2) return null;
  if (parts[0].toLowerCase() !== "bearer") return null;

  const token = parts[1];
  return typeof token === "string" && token.length > 0 ? token : null;
}

function readCookieAccessToken(req: Request): string | null {
  // If you add cookie-parser later, req.cookies will exist.
  const cookiesUnknown = (req as unknown as { cookies?: unknown }).cookies;
  if (!cookiesUnknown || typeof cookiesUnknown !== "object") return null;

  const token = (cookiesUnknown as Record<string, unknown>)["accessToken"];
  return typeof token === "string" && token.length > 0 ? token : null;
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const token = readBearerToken(req) ?? readCookieAccessToken(req);
  if (!token) {
    res.status(401).json({ error: "NOT_AUTHENTICATED" });
    return;
  }

  try {
    const jwtSvc = container.resolve(JwtTokenService);
    const user: AuthUser = jwtSvc.verifyAccessToken(token);

    req.user = user;
    next();
  } catch {
    res.status(401).json({ error: "NOT_AUTHENTICATED" });
  }
}
