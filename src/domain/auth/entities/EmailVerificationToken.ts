import { DebugLogger } from "@/infrastructure/logging/DebugLogger";

export class EmailVerificationToken {
  logger: DebugLogger = DebugLogger.getInstance()
  constructor(
    public readonly id: number | null,
    public readonly personId: number,
    public readonly token: string,    
    public readonly createdAt: Date,
    public readonly expiresAt: Date,
  ) {
    this.logger.log("EmailVerificationToken::constructor - Token: "+token+" Token created at: "+createdAt+" Token Expires at"+ expiresAt)
  }

  isExpired(now: Date = new Date()): boolean {
    return now > this.expiresAt;
  }
}
