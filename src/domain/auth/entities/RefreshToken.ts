// src/domain/auth/entities/RefreshTokenEntity.ts
export type RefreshTokenProps = {
  id?: number;
  personId: number;
  tokenHash: string;
  createdAt: Date;
  expiresAt: Date;
};

export class RefreshToken {
  private constructor(private props: RefreshTokenProps) {}

  static create(input: {
    personId: number;
    tokenHash: string;
    expiresAt: Date;
  }): RefreshToken {
    const now = new Date();

    return new RefreshToken({
      id: undefined,
      personId: input.personId,
      tokenHash: input.tokenHash,
      createdAt: now,
      expiresAt: input.expiresAt,
    });
  }

  static fromPersistence(row: {
    id: number;
    personId: number;
    tokenHash: string;
    createdAt: Date;
    expiresAt: Date;
  }): RefreshToken {
    return new RefreshToken({
      id: row.id,
      personId: row.personId,
      tokenHash: row.tokenHash,
      createdAt: row.createdAt,
      expiresAt: row.expiresAt,
    });
  }

  toPersistence(): {
    id: number | undefined;
    personId: number;
    tokenHash: string;
    createdAt: Date;
    expiresAt: Date;
  } {
    return {
      id: this.props.id,
      personId: this.props.personId,
      tokenHash: this.props.tokenHash,
      createdAt: this.props.createdAt,
      expiresAt: this.props.expiresAt,
    };
  }

    // Getters
  get id(): number | undefined {
    return this.props.id;
  }

  get personId(): number {
    return this.props.personId;
  }

  get tokenHash(): string {
    return this.props.tokenHash;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get expiresAt(): Date {
    return this.props.expiresAt;
  }

  get isExpired(): boolean {
    return this.props.expiresAt <= new Date();
  }
}
