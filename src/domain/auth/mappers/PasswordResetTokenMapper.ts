// src/domain/auth/mappers/PasswordResetTokenMapper.ts
import { PasswordResetToken } from '../entities/PasswordResetToken';
import { PasswordResetTokenDTO } from '../dtos/PasswordResetTokenDTO';

export class PasswordResetTokenMapper {
  static toDTO(entity: PasswordResetToken): PasswordResetTokenDTO {
    return {
      id: entity.id,
      createdAt: entity.createdAt,
      personId: entity.personId,
      token: entity.token,
      expiresAt: entity.expiresAt
    };
  }
  // DTO → ENTITY
  static toEntity(dto: PasswordResetTokenDTO): PasswordResetToken {
    return new PasswordResetToken(
      dto.id ?? null,      
      dto.personId,
      dto.token,
      new Date(dto.createdAt),
      new Date(dto.expiresAt)
    );
  }
}
