import { Request, Response, NextFunction } from "express";
import { jwtTokens } from "@/infrastructure/dependencies";

export interface AuthRequest extends Request {
  personId?: number;
  userName?: string;
}

export function jwtAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    res.status(401).json({ error: "Missing token" });
    return;
  }

  const token = header.substring("Bearer ".length);

  try {
    const decoded = jwtTokens.verifyAccessToken(token);
    req.personId = decoded.personId;
    req.userName = decoded.userName;
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}

