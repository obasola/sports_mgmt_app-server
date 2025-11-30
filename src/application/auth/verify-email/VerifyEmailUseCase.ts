// src/application/auth/verify-email/VerifyEmailUseCase.ts
import { EmailVerificationTokenMapper } from '@/domain/auth/mappers/EmailVerificationTokenMapper';
import { IPersonRepository } from '@/domain/person/repositories/IPersonRepository';

export class VerifyEmailUseCase {
  constructor(private readonly personRepo: IPersonRepository) {}

  /**
   * Verifies the user's email based on the verification token.
   *
   * Throws:
   * - Error("Invalid verification token") if not found
   * - Error("Verification token expired") if expired
   */
  async execute(token: string): Promise<void> {
    const tokenDTO = await this.personRepo.findEmailVerificationToken(token);

    if (!tokenDTO) {
      throw new Error('Invalid verification token');
    }
    const tokenRecord = EmailVerificationTokenMapper.toEntity(tokenDTO);
    if (!tokenRecord) {
      throw new Error('Invalid verification token');
    }

    if (tokenRecord.isExpired(new Date())) {
      throw new Error('Verification token expired');
    }

    await this.personRepo.markEmailVerified(tokenRecord.personId);
    // Remove token so it can't be reused
    await this.personRepo.deleteEmailVerificationToken(tokenRecord.id!);
  }
}
