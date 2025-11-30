import { IPersonRepository } from "@/domain/person/repositories/IPersonRepository";
import { PasswordHasher } from "@/domain/auth/services/PasswordHasher";
import { SecureTokenGenerator } from "@/domain/auth/services/SecureTokenGenerator";
import { MailService } from "@/domain/mail/services/MailService";
import { Person } from "@/domain/person/entities/Person";
import { NewPersonInput } from "@/domain/person/entities/Person";
import { EmailVerificationToken } from "@/domain/auth/entities/EmailVerificationToken";
import { PersonMapper } from "@/domain/person/mapper/PersonMapper";

interface RegisterResponse {
  pid: number;
  emailVerificationToken: string;
}

export class RegisterUseCase {
  constructor(
    private readonly personRepo: IPersonRepository,
    private readonly hasher: PasswordHasher,
    private readonly tokenGen: SecureTokenGenerator,
    private readonly mailer: MailService
  ) {}

  async execute(input: NewPersonInput): Promise<RegisterResponse> {
    const existing = await this.personRepo.findByUserName(input.userName);
    if (existing) {
      throw new Error("Username already exists");
    }
    const existingEmail = await this.personRepo.findByEmail(input.emailAddress);
    if (existingEmail) {
      throw new Error("Email already exists");
    }

    // Hash password
    const hashedPassword = await this.hasher.hash(input.passwordHash);

    // Create Person entity
    const person = Person.create({
      ...input,
      passwordHash: hashedPassword
    });

    const saved = await this.personRepo.createPerson(
      PersonMapper.mapPersonToNewPersonInput(person));

    // Create email verification token
    const { token, expiresAt } = this.tokenGen.generateExpiring(60 * 24); // 24 hours
    const tokenEntity = new EmailVerificationToken(
      null,
      saved.pid!,
      token,
      expiresAt,
      new Date()
    );
    await this.personRepo.createEmailVerificationToken(tokenEntity);

    // Send email
    await this.mailer.send({
      to: saved.emailAddress,
      subject: "Verify Your Email",
      html: `
        <h1>Welcome to Sports Mgmt App</h1>
        <p>Click below to verify your email:</p>
        <a href="${process.env.FRONTEND_URL}/verify-email/${token}">
          Verify Email
        </a>
      `
    });

    return { pid: saved.pid!, emailVerificationToken: token };
  }
}
