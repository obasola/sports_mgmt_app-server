// src/domain/auth/mappers/EmailVerificationTokenMapper.ts
import { EmailVerificationToken } from '../entities/EmailVerificationToken';
import { EmailVerificationTokenDTO } from '../dtos/EmailVerificationTokenDTO';

export class EmailVerificationTokenMapper {
  static toDTO(entity: EmailVerificationToken): 
    EmailVerificationTokenDTO {
    return {
      id: entity.id,
      createdAt: entity.createdAt,
      personId: entity.personId,
      token: entity.token,
      expiresAt: entity.expiresAt,
      
    };
  }
// DTO → ENTITY (rehydration)
  static toEntity(dto: EmailVerificationTokenDTO): EmailVerificationToken {
    return new EmailVerificationToken(
      dto.id ?? null,      
      dto.personId,
      dto.token,
      new Date(dto.createdAt),
      new Date(dto.expiresAt)
    );
  }
}
