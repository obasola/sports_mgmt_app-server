import { IPersonRepository } from "@/domain/person/repositories/IPersonRepository";
import { PasswordHasher } from "@/domain/auth/services/PasswordHasher";
import { SecureTokenGenerator } from "@/domain/auth/services/SecureTokenGenerator";
import type { MailService } from '@/domain/mail/services/MailService';
import type { MailMessage } from '@/domain/mail/value-objects/MailMessage';
import { Person } from "@/domain/person/entities/Person";
import { NewPersonInput } from "@/domain/person/entities/Person";
import { EmailVerificationToken } from "@/domain/auth/entities/EmailVerificationToken";
import { PersonMapper } from "@/domain/person/mapper/PersonMapper";
import { RegisterInputDTO, RegisterResponse } from "./RegisterDTO";

export class RegisterUseCase {
  constructor(
    private readonly personRepo: IPersonRepository,
    private readonly hasher: PasswordHasher,
    private readonly tokenGen: SecureTokenGenerator,
    private readonly mailer: MailService
    //private readonly mailer: { send: (opts: { to: string; subject: string; html: string }) => Promise<void> }
  ) {}

  async execute(input: RegisterInputDTO): Promise<RegisterResponse> {
    // 1. Uniqueness checks
    const existing = await this.personRepo.findByUserName(input.userName);
    if (existing) {
      throw new Error('Username already exists');
    }

    const existingEmail = await this.personRepo.findByEmail(input.emailAddress);
    if (existingEmail) {
      throw new Error('Email already exists');
    }

    // 2. Hash password (use plain text from DTO)
    if (!input.password) {
      throw new Error('Password is required');
    }

    const hashedPassword = await this.hasher.hash(input.password);

    // 3. Create Person entity
    const person = Person.create({
      userName: input.userName,
      emailAddress: input.emailAddress,
      passwordHash: hashedPassword,
      firstName: input.firstName,
      lastName: input.lastName,
    });

    const saved = await this.personRepo.createPerson(
      PersonMapper.mapPersonToNewPersonInput(person)
    );

    // 4. Create email verification token
    const { token, expiresAt } = this.tokenGen.generateExpiring(60 * 24); // 24 hours

    const tokenEntity = new EmailVerificationToken(
      null,
      saved.pid!,
      token,      
      new Date(),
      expiresAt
    );

    

    await this.personRepo.createEmailVerificationToken(tokenEntity);

    // 5. Send email
    const frontendUrl = process.env.FRONTEND_URL;
    if (!frontendUrl) {
      // fail fast if misconfigured
      throw new Error('FRONTEND_URL is not configured');
    }

    const message: MailMessage = {
      to: saved.emailAddress,
      subject: 'Verify Your Email',
      html: `
        <h1>Welcome to Sports Mgmt App</h1>
        <p>Click below to verify your email:</p>
        <a href="${frontendUrl}/verify-email/${token}">
          Verify Email
        </a>
      `,
    };
    await this.mailer.send(message);
    return { pid: saved.pid!, emailVerificationToken: tokenEntity.token };
  }
}
