// src/domain/auth/entities/PasswordResetToken.ts
export class PasswordResetToken {
  constructor(
    public readonly id: number | null,
    public readonly personId: number,
    public readonly token: string,
    public readonly expiresAt: Date,
    public readonly createdAt: Date
  ) {}

  isExpired(now: Date = new Date()): boolean {
    return now > this.expiresAt;
  }
}
