// src/infrastructure/jwt/JwtAuthTokenService.ts
import jwt, { JwtPayload, TokenExpiredError } from "jsonwebtoken";
import crypto from 'crypto';
import type { AuthTokenService } from '@/domain/auth/services/AuthTokenService';

type AccessTokenPayload = JwtPayload & {
  sub: string;      // 👈 store personId as string
  userName: string;
};

export class JwtAuthTokenService implements AuthTokenService {
  private readonly accessSecret: string;
  private readonly refreshMinutes: number;

  constructor() {
    const accessSecret = process.env.JWT_ACCESS_SECRET;
    if (!accessSecret) {
      throw new Error('JWT_ACCESS_SECRET is not configured');
    }
    this.accessSecret = accessSecret;

    const refreshMinutesRaw = process.env.JWT_REFRESH_MINUTES ?? '43200'; // 30 days
    const refreshMinutesNum = Number(refreshMinutesRaw);

    if (!Number.isFinite(refreshMinutesNum) || refreshMinutesNum <= 0) {
      throw new Error(
        `JWT_REFRESH_MINUTES is invalid: "${refreshMinutesRaw}". Expected a positive number.`
      );
    }

    this.refreshMinutes = refreshMinutesNum;
  }

  generateAccessToken(personId: number, userName: string): string {
    const payload: AccessTokenPayload = {
      sub: personId.toString(),   // 👈 store as string to satisfy JwtPayload
      userName,
    };

    return jwt.sign(payload, this.accessSecret, { expiresIn: '15m' });
  }

  generateRefreshToken(): { token: string; expiresAt: Date } {
    const token = crypto.randomBytes(40).toString('hex');
    const expiresAt = new Date(Date.now() + this.refreshMinutes * 60_000);
    return { token, expiresAt };
  }

  verifyAccessToken(token: string): { personId: number; userName: string } {
    let decoded: AccessTokenPayload;

    try {
      decoded = jwt.verify(token, this.accessSecret) as AccessTokenPayload;
    } catch (err) {
      if (err instanceof TokenExpiredError) {
        const e = new Error("JWT_EXPIRED");
        (e as any).statusCode = 401;
        throw e;
      }

      const e = new Error("JWT_INVALID");
      (e as any).statusCode = 401;
      throw e;
    }

    if (!decoded || typeof decoded.userName !== "string" || typeof decoded.sub !== "string") {
      const e = new Error("JWT_INVALID_PAYLOAD");
      (e as any).statusCode = 401;
      throw e;
    }

    const personId = Number.parseInt(decoded.sub, 10);
    if (!Number.isFinite(personId)) {
      const e = new Error("JWT_INVALID_SUB");
      (e as any).statusCode = 401;
      throw e;
    }

    return {
      personId,
      userName: decoded.userName
    };
  }
}
