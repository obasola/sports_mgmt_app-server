// src/domain/auth/value-objects/PlainPassword.ts
export class PlainPassword {
  private constructor(private readonly value: string) {}

  static create(input: string): PlainPassword {
    const v = input.trim();

    if (!v) throw new Error("Password is required");
    if (v.length < 8) throw new Error("Password must be at least 8 characters");
    if (v.length > 100) throw new Error("Password too long");

    return new PlainPassword(v);
  }

  get raw(): string {
    return this.value;
  }
}
