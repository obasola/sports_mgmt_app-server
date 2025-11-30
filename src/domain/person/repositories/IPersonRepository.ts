import { EmailVerificationTokenDTO } from "@/domain/auth/dtos/EmailVerificationTokenDTO";
import { PasswordResetTokenDTO } from "@/domain/auth/dtos/PasswordResetTokenDTO";
import { RefreshTokenDTO } from "@/domain/auth/dtos/RefreshTokenDTO";
import { Person } from "@/domain/person/entities/Person";
import type { NewPersonInput } from "@/domain/person/entities/Person";
import { PaginationParams, PaginatedResponse } from "@/shared/types/common";
import { PersonFilters } from "./PersonFilters";

export interface IPersonRepository {

  // ───────────────────────────────────────────
  // PERSON
  // ───────────────────────────────────────────
  findAll(
    filters?: PersonFilters,
    pagination?: PaginationParams
  ): Promise<PaginatedResponse<Person>>;
  findById(pid: number): Promise<Person | null>;
  findByEmail(email: string): Promise<Person | null>;
  findByUserName(username: string): Promise<Person | null>;

  exists(pid: number): Promise<boolean>; 
  existsByEmailAddress(emailAddress: string): Promise<boolean>;
  existsByUserName(userName: string): Promise<boolean>;

  createPerson(input: NewPersonInput): Promise<Person>;
  updatePerson(person: Person): Promise<Person>;
  delete(pid: number): Promise<void>;
  // ───────────────────────────────────────────
  // EMAIL VERIFICATION TOKENS
  // ───────────────────────────────────────────
  createEmailVerificationToken(token: EmailVerificationTokenDTO): Promise<void>;
  findEmailVerificationToken(token: string): Promise<EmailVerificationTokenDTO | null>;
  markEmailVerified(personId: number): Promise<void>;
  deleteEmailVerificationToken(id: number): Promise<void>;

  // ───────────────────────────────────────────
  // PASSWORD RESET TOKENS
  // ───────────────────────────────────────────
  createPasswordResetToken(token: PasswordResetTokenDTO): Promise<void>;
  findPasswordResetToken(token: string): Promise<PasswordResetTokenDTO | null>;
  updatePassword(personId: number, hashedPassword: string): Promise<void>;
  deletePasswordResetToken(id: number): Promise<void>;

  // ───────────────────────────────────────────
  // REFRESH TOKENS
  // ───────────────────────────────────────────
  createRefreshToken(token: RefreshTokenDTO): Promise<void>;
  findRefreshToken(token: string): Promise<RefreshTokenDTO | null>;
  saveRefreshToken(dto: RefreshTokenDTO): Promise<void>;
  deleteRefreshToken(id: number): Promise<void>;


}
