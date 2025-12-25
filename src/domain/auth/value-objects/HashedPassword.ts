// src/domain/auth/value-objects/HashedPassword.ts
export class HashedPassword {
  private constructor(private readonly value: string) {}

  static fromHash(hash: string): HashedPassword {
    return new HashedPassword(hash);
  }

  get raw(): string {
    return this.value;
  }
}
