import { IPersonRepository } from "@/domain/person/repositories/IPersonRepository";
import { PasswordHasher } from "@/domain/auth/services/PasswordHasher";

export class LogoutUseCase {
  constructor(
    private readonly personRepo: IPersonRepository,
    private readonly hasher: PasswordHasher
  ) {}

  async execute(refreshToken: string, personId: number): Promise<void> {
    const tokenDto = await this.personRepo.findRefreshToken(String(personId));
    if(tokenDto) {
      let tokenHash = tokenDto.token ? tokenDto?.token : '';
      if (await this.hasher.compare(refreshToken,tokenHash)) {
        await this.personRepo.deleteRefreshToken(tokenDto.id!);
      }
    }   
  }
}
