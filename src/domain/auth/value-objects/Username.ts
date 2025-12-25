// src/domain/auth/value-objects/UserName.ts
export class Username {
  private constructor(private readonly value: string) {}

  static create(input: string): Username {
    const v = input.trim();

    if (!v) throw new Error("Username is required");
    if (v.length > 25) throw new Error("Username must be <= 25 characters");

    return new Username(v);
  }

  get raw(): string {
    return this.value;
  }
}
