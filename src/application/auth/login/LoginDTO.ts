// src/application/auth/login/LoginDTO.ts
export interface LoginInputDTO {
  userName: string;
  password: string;
}

export interface LoginResponseDTO {
  accessToken: string;
  personId: number;
  userName: string;
}
