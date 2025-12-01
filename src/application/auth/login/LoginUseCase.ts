// src/application/auth/login/LoginUseCase.ts
import type { IPersonRepository } from '@/domain/person/repositories/IPersonRepository';
import type { PasswordHasher } from '@/domain/auth/services/PasswordHasher';
import type { AuthTokenService } from '@/domain/auth/services/AuthTokenService';
import type { LoginInputDTO, LoginResponseDTO } from './LoginDTO';

export class LoginUseCase {
  constructor(
    private readonly personRepo: IPersonRepository,
    private readonly hasher: PasswordHasher,
    private readonly tokens: AuthTokenService
  ) {}

  async execute(input: LoginInputDTO): Promise<LoginResponseDTO> {
    const { userName, password } = input;

    // 1. Find user
    const person = await this.personRepo.findByUserName(userName);
    if (!person || !person.passwordHash) {
      throw new Error('Invalid credentials');
    }

    // 2. Optional: require verified email
    if (!person.emailVerified) {
      throw new Error('Email not verified');
    }

    // 3. Compare password using hasher
    const ok = await this.hasher.compare(password, person.passwordHash);
    if (!ok) {
      throw new Error('Invalid credentials');
    }

    if (!person.pid) {
      throw new Error('Person ID missing');
    }

    // 4. Issue access token (and optionally refresh)
    const accessToken = this.tokens.generateAccessToken(person.pid, person.userName);
    // If you later wire refresh tokens, do it here with tokens.generateRefreshToken()

    return {
      accessToken,
      personId: person.pid,
      userName: person.userName,
    };
  }
}
