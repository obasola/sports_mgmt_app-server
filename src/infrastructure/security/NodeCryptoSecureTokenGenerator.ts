import { SecureTokenGenerator } from "@/domain/auth/services/SecureTokenGenerator";
import crypto from "crypto";

export class NodeCryptoSecureTokenGenerator implements SecureTokenGenerator {
  generateToken(): string {
    return crypto.randomBytes(32).toString("hex");
  }

  generateExpiring(minutes: number): { token: string; expiresAt: Date } {
    const token = this.generateToken();
    const expiresAt = new Date(Date.now() + minutes * 60_000);
    return { token, expiresAt };
  }
}

