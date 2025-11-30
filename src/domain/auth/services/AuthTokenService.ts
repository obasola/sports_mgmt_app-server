export interface AuthTokenService {
  generateAccessToken(personId: number, userName: string): string;
  generateRefreshToken(): { token: string; expiresAt: Date };
  verifyAccessToken(token: string): { personId: number; userName: string };
}
