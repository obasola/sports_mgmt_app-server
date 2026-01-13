// src/application/auth/refresh/RefreshTokenUseCase.ts
import crypto from "node:crypto";
import type { IPersonRepository } from "@/domain/person/repositories/IPersonRepository";
import type { PasswordHasher } from "@/domain/auth/services/PasswordHasher";
import { RefreshToken } from "@/domain/auth/entities/RefreshToken";
import { RefreshTokenMapper } from "@/domain/auth/mappers/RefreshTokenMapper";
import { JwtTokenService } from "@/modules/auth/infrastructure/security/JwtTokenService";

interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

function generateOpaqueRefreshToken(expiresInDays = 30): { token: string; expiresAt: Date } {
  // 48 bytes => ~64 chars base64url; plenty of entropy
  const token = crypto.randomBytes(48).toString("base64url");
  const expiresAt = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000);
  return { token, expiresAt };
}

export class RefreshTokenUseCase {
  constructor(
    private readonly personRepo: IPersonRepository,
    private readonly hasher: PasswordHasher,
    private readonly tokens: JwtTokenService
  ) {}

  public async execute(oldToken: string, personId: number): Promise<RefreshResponse> {
    // 1) Load stored refresh token hash for this person
    const stored = await this.personRepo.findRefreshToken(String(personId));
    if (!stored) throw new Error("No refresh token found");

    // 2) Compare provided refresh token to stored hash
    const matches = await this.hasher.compare(oldToken, stored.token);
    if (!matches) throw new Error("Invalid refresh token");

    const matchedToken = RefreshTokenMapper.toEntity(stored);
    if (matchedToken.isExpired) {
      throw new Error("Refresh token expired");
    }
    if (!matchedToken.id) {
      throw new Error("Refresh token id missing");
    }

    // 3) Delete old refresh token
    await this.personRepo.deleteRefreshToken(matchedToken.id);

    // 4) Load current person so we can embed the CURRENT activeRid into the access JWT
    const person = await this.personRepo.findById(personId);
    if (!person) throw new Error("Person not found");

    const effectiveActiveRid = typeof person.activeRid === "number" ? person.activeRid : 1;

    const { accessToken } = this.tokens.issueTokens({
      personId,
      userName: person.userName,
      activeRid: effectiveActiveRid,
    });

    // 5) Issue a NEW opaque refresh token and store hash
    const { token: newRefresh, expiresAt } = generateOpaqueRefreshToken(30);
    const hash = await this.hasher.hash(newRefresh);

    const dto = RefreshTokenMapper.toDTO(
      RefreshToken.create(
        RefreshTokenMapper.toProps(undefined, personId, hash, expiresAt, new Date())
      )
    );

    await this.personRepo.saveRefreshToken(dto);

    return { accessToken, refreshToken: newRefresh };
  }
}
