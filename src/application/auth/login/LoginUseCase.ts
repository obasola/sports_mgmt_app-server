import { IPersonRepository } from "@/domain/person/repositories/IPersonRepository";
import { PasswordHasher } from "@/domain/auth/services/PasswordHasher";
import { AuthTokenService } from "@/domain/auth/services/AuthTokenService";
import { RefreshToken, RefreshTokenProps } from "@/domain/auth/entities/RefreshToken";
import { RefreshTokenMapper } from "@/domain/auth/mappers/RefreshTokenMapper";

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
}

export class LoginUseCase {
  constructor(
    private readonly personRepo: IPersonRepository,
    private readonly hasher: PasswordHasher,
    private readonly authTokens: AuthTokenService
  ) {}

  async execute(userName: string, password: string): Promise<LoginResponse> {
    const person = await this.personRepo.findByUserName(userName);
    if (!person) throw new Error("Invalid credentials");

    if (!person.emailVerified) {
      throw new Error("Email not verified");
    }
    const pswdHash = person.passwordHash  ? person.passwordHash : '';
    const validPassword = await this.hasher.compare(password, pswdHash);
    if (!validPassword) throw new Error("Invalid credentials");

    // Create access token
    const accessToken = this.authTokens.generateAccessToken(
      person.pid!,
      person.userName
    );

    // Create refresh token and store hash
    const { token: refreshToken, expiresAt } =
      this.authTokens.generateRefreshToken();

    const refreshTokenHash = await this.hasher.hash(refreshToken);
    let input: RefreshTokenProps = {
      id: undefined,
      personId: person.pid!,
      tokenHash: refreshTokenHash,
      createdAt: new Date(),
      expiresAt: expiresAt,
    }
    const tokenEntity = RefreshToken.create(
      input
    );

    await this.personRepo.createRefreshToken(RefreshTokenMapper.toDTO((tokenEntity)));

    return { accessToken, refreshToken };
  }
}
