import { MailService } from '@/domain/mail/services/MailService';
import { MailMessage } from '@/domain/mail/value-objects/MailMessage';

export class SendEmailUseCase {
  constructor(private readonly mailer: MailService) {}

  async execute(message: MailMessage): Promise<void> {
    // Basic validation
    if (!message.to) throw new Error("Missing 'to' field");
    if (!message.subject) throw new Error("Missing 'subject'");
    if (!message.html) throw new Error("Missing 'html' body");

    await this.mailer.send(message);
  }
}
