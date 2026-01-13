// src/domain/auth/services/AuthTokenService.ts
export interface AuthTokenService {
  generateAccessToken(personId: number, userName: string, activeRid: number): string;
  generateRefreshToken(): { token: string; expiresAt: Date };
  verifyAccessToken(token: string): { personId: number; userName: string, activeRid: number };
}
