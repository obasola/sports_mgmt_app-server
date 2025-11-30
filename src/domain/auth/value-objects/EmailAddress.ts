export class EmailAddress {
  private constructor(private readonly value: string) {}

  static create(input: string): EmailAddress {
    const v = input.trim();

    if (!v) throw new Error("Email is required");
    if (v.length > 75) throw new Error("Email must be <= 75 characters");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(v)) throw new Error("Invalid email format");

    return new EmailAddress(v);
  }

  get raw(): string {
    return this.value;
  }
}
