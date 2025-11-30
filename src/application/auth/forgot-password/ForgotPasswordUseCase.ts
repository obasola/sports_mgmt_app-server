import { IPersonRepository } from "@/domain/person/repositories/IPersonRepository";
import { SecureTokenGenerator } from "@/domain/auth/services/SecureTokenGenerator";
import { MailService } from "@/domain/mail/services/MailService";
import { PasswordResetToken } from "@/domain/auth/entities/PasswordResetToken";

export class ForgotPasswordUseCase {
  constructor(
    private readonly personRepo: IPersonRepository,
    private readonly tokenGen: SecureTokenGenerator,
    private readonly mailer: MailService
  ) {}

  async execute(email: string): Promise<void> {
    const person = await this.personRepo.findByEmail(email);
    if (!person) return;

    const { token, expiresAt } = this.tokenGen.generateExpiring(60);
    const tokenEntity = new PasswordResetToken(
      null,
      person.pid!,
      token,
      expiresAt,
      new Date()
    );

    await this.personRepo.createPasswordResetToken(tokenEntity);

    await this.mailer.send({
      to: email,
      subject: "Password Reset Request",
      html: `
        <p>Click the link below to reset your password:</p>
        <a href="${process.env.FRONTEND_URL}/reset-password/${token}">
          Reset Password
        </a>
      `
    });
  }
}
