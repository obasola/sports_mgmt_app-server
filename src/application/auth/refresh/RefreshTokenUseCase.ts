import { IPersonRepository } from "@/domain/person/repositories/IPersonRepository";
import { PasswordHasher } from "@/domain/auth/services/PasswordHasher";
import { AuthTokenService } from "@/domain/auth/services/AuthTokenService";
import { RefreshToken } from "@/domain/auth/entities/RefreshToken";
import { RefreshTokenMapper } from "@/domain/auth/mappers/RefreshTokenMapper";

interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

export class RefreshTokenUseCase {
  constructor(
    private readonly personRepo: IPersonRepository,
    private readonly hasher: PasswordHasher,
    private readonly tokens: AuthTokenService
  ) {}

  async execute(oldToken: string, personId: number): Promise<RefreshResponse> {
    const token = await this.personRepo.findRefreshToken(String(personId));
    if (!token) throw new Error("No refresh token found");

    let matchFound = false;
    let matchedToken: RefreshToken | null = null;

    if (await this.hasher.compare(oldToken, token.token)) {
        matchFound = true;
        matchedToken = RefreshTokenMapper.toEntity(token);
    }

    if (!matchFound || !matchedToken) {
      throw new Error("Invalid refresh token");
    }
    if (matchedToken.isExpired) {
      throw new Error("Refresh token expired");
    }

    // Delete old refresh token
    await this.personRepo.deleteRefreshToken(matchedToken.id!);

    // Issue new JWTs
    const accessToken = this.tokens.generateAccessToken(
      personId,
      (await this.personRepo.findById(personId))!.userName
    );

    const { token: newRefresh, expiresAt } = this.tokens.generateRefreshToken();
    const hash = await this.hasher.hash(newRefresh);

    await this.personRepo.saveRefreshToken(RefreshTokenMapper.toDTO(
      
      RefreshToken.create(RefreshTokenMapper.toProps(undefined, personId, hash, expiresAt, new Date()) ))
    );

    return { accessToken, refreshToken: newRefresh };
  }
}
