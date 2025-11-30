import { AuthTokenService } from "@/domain/auth/services/AuthTokenService";
import jwt from "jsonwebtoken";
import crypto from 'crypto';

export class JwtAuthTokenService implements AuthTokenService {
  private readonly accessSecret: string;
  private readonly refreshMinutes: number;

  constructor() {
    this.accessSecret = process.env.JWT_ACCESS_SECRET!;
    this.refreshMinutes = Number(process.env.JWT_REFRESH_MINUTES ?? "43200"); // 30 days
  }

  generateAccessToken(personId: number, userName: string): string {
    return jwt.sign(
      { sub: personId, userName },
      this.accessSecret,
      { expiresIn: "15m" }
    );
  }

  generateRefreshToken(): { token: string; expiresAt: Date } {
    const token = crypto.randomBytes(40).toString("hex");
    const expiresAt = new Date(Date.now() + this.refreshMinutes * 60_000);
    return { token, expiresAt };
  }

  verifyAccessToken(token: string): { personId: number; userName: string } {
    const decoded = jwt.verify(token, this.accessSecret);

    if (typeof decoded === 'string' || !decoded.sub || !decoded.userName) {
      throw new Error('Invalid token format');
    }
    const personId = typeof decoded.sub === 'number' 
      ? decoded.sub 
      : parseInt(decoded.sub, 10);

    if (isNaN(personId)) {
      throw new Error('Invalid person ID in token');
    }

    return { personId, userName: decoded.userName as string };
  }
}

