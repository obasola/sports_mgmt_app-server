export interface SecureTokenGenerator {
  generateToken(): string;
  generateExpiring(minutes: number): { token: string; expiresAt: Date };
}
