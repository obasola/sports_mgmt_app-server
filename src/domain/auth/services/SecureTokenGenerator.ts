// src/domain/auth/services/SecureTokenGenerator.ts
export interface SecureTokenGenerator {
  generateToken(): string;
  generateExpiring(minutes: number): { token: string; expiresAt: Date };
}
