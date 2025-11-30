// src/domain/auth/mappers/RefreshTokenMapper.ts
import { RefreshToken, RefreshTokenProps } from '../entities/RefreshToken';
import { RefreshTokenDTO } from '../dtos/RefreshTokenDTO';

export class RefreshTokenMapper {
  // ENTITY - DTO
  static toDTO(entity: RefreshToken): RefreshTokenDTO {
    return {
      id: entity.id ? entity.id : null,
      createdAt: entity.createdAt,
      personId: entity.personId,
      token: entity.tokenHash,
      expiresAt: entity.expiresAt
    };
  }

  // DTO → ENTITY
  static toEntity(dto: RefreshTokenDTO): RefreshToken {
    const row: RefreshTokenProps = {
      id:  dto.id ?? undefined,      
      personId:dto.personId,
      tokenHash: dto.token,
      createdAt: new Date(dto.createdAt),
      expiresAt: new Date(dto.expiresAt)
    }
    return RefreshToken.create(row)
  }

  // TO PROPS
  static toProps(
  idNbr: number | undefined, 
  personID: number, 
  token: string, 
  created: Date, 
  expires: Date
): RefreshTokenProps {
  return {
    id: idNbr,
    personId: personID,
    tokenHash: token,
    createdAt: created,
    expiresAt: expires,
  }
}

}
