// src/infrastructure/email/SendGridMailService.ts
import sgMail, { MailDataRequired } from '@sendgrid/mail';
import type { MailService } from '@/domain/mail/services/MailService';
import type { MailMessage } from '@/domain/mail/value-objects/MailMessage';

export class SendGridMailService implements MailService {
  constructor(private readonly defaultFrom: string) {
    const apiKey = process.env.SENDGRID_API_KEY;
    if (!apiKey) {
      throw new Error('SENDGRID_API_KEY is not configured');
    }
    sgMail.setApiKey(apiKey);
  }

  async send(message: MailMessage): Promise<void> {
    const mail: MailDataRequired = {
      to: message.to,
      from: this.defaultFrom,
      subject: message.subject,
      html: message.html,
      // if your MailMessage carries text/plain, you can add text: message.text,
    };

    await sgMail.send(mail);
  }
}
