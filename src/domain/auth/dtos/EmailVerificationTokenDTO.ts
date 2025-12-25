// src/domain/auth/dtos/EmailVerificationTokenDTO.ts
export type EmailVerificationTokenDTO = {
  id: number | null;
  createdAt: Date;
  personId: number;
  token: string;
  expiresAt: Date;
};

