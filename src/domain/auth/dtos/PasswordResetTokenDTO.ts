
// src/domain/auth/dtos/PasswordResetTokenDTO.ts
export type PasswordResetTokenDTO = {
  id: number | null;
  createdAt: Date;
  personId: number;
  token: string;
  expiresAt: Date;

}
