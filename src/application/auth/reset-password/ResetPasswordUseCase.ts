// src/application/auth/reset-password/ResetPasswordUseCase.ts
import { IPersonRepository } from "@/domain/person/repositories/IPersonRepository";
import { PasswordHasher } from "@/domain/auth/services/PasswordHasher";
import { PasswordResetToken } from "@/domain/auth/entities/PasswordResetToken";
import { PasswordResetTokenMapper } from "@/domain/auth/mappers/PasswordResetTokenMapper";

export class ResetPasswordUseCase {
  constructor(
    private readonly personRepo: IPersonRepository,
    private readonly hasher: PasswordHasher
  ) {}

  async execute(token: string, newPassword: string): Promise<void> {
    const tokenDTO = await this.personRepo.findPasswordResetToken(token);
    if (!tokenDTO) throw new Error("Invalid reset token");
    const tokenRecord = PasswordResetTokenMapper.toEntity(tokenDTO);
    if (tokenRecord.isExpired(new Date())) throw new Error("Reset token expired");

    const hashed = await this.hasher.hash(newPassword);

    await this.personRepo.updatePassword(tokenRecord.personId, hashed);
    await this.personRepo.deletePasswordResetToken(tokenRecord.id!);
  }
}
