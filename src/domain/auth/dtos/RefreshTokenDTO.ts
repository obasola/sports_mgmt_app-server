// src/domain/auth/dtos/RefreshTokenDTO.ts
export type RefreshTokenDTO = {
  id: number | null;
  createdAt: Date;
  personId: number;
  token: string;
  expiresAt: Date;
}
