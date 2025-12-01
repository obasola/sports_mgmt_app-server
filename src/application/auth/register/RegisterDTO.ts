// src/application/auth/register/RegisterDTO.ts
export interface RegisterInputDTO {
  userName: string;
  emailAddress: string;
  password: string;      // plain text from client
  firstName: string;
  lastName: string;
}

export interface RegisterResponse {
  pid: number;
  emailVerificationToken: string;
}
