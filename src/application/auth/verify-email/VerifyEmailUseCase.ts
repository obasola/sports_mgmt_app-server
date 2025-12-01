// src/application/auth/verify-email/VerifyEmailUseCase.ts
import { EmailVerificationTokenMapper } from '@/domain/auth/mappers/EmailVerificationTokenMapper';
import { IPersonRepository } from '@/domain/person/repositories/IPersonRepository';
import { DebugLogger } from '@/infrastructure/logging/DebugLogger';

export class VerifyEmailUseCase {
  constructor(private readonly personRepo: IPersonRepository) {}

  /**
   * Verifies the user's email based on the verification token.
   *
   * Throws:
   * - Error("Invalid verification token") if not found
   * - Error("Verification token expired") if expired
   */
  logger:DebugLogger = DebugLogger.getInstance();
  async execute(token: string): Promise<void> {
    const tokenDTO = await this.personRepo.findEmailVerificationToken(token);
    this.logger.log("Token value = "+token)
    if (!tokenDTO) {
      this.logger.log("NO EMAIL verifcation for Token value = "+token)
      throw new Error('Invalid verification token');
    }
    const tokenRecord = EmailVerificationTokenMapper.toEntity(tokenDTO);
    if (!tokenRecord) {
      this.logger.log("Failed to map Token values for Token: "+token)
      throw new Error('Invalid verification token');
    }
    let tokenDate = new Date()
    if (tokenRecord.isExpired(tokenDate)) {
      this.logger.log("Token is EXPIRED for value = "+token+" and Date: "+tokenDate)
      throw new Error('Verification token expired');
    }

    await this.personRepo.markEmailVerified(tokenRecord.personId);
    // Remove token so it can't be reused
    await this.personRepo.deleteEmailVerificationToken(tokenRecord.id!);
  }
}
