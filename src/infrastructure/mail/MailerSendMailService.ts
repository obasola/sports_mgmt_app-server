import { MailService } from '@/domain/mail/services/MailService';
import { MailMessage } from '@/domain/mail/value-objects/MailMessage';
import { MailerSend, EmailParams, Recipient } from 'mailersend';

export class MailerSendMailService implements MailService {
  private mailer: MailerSend;

  constructor(private apiKey: string) {
    this.mailer = new MailerSend({ apiKey });
  }

  async send({ to, subject, html, from }: MailMessage): Promise<void> {
    const recipients = [new Recipient(to)];

    const emailParams = new EmailParams()
      .setFrom({
        email: from ?? "noreply@draftproanalytics.com",
        name: "DraftProAnalytics"
      })
      .setTo(recipients)
      .setSubject(subject)
      .setHtml(html);

    try {
      await this.mailer.email.send(emailParams);
    } catch (err: any) {
      throw new Error(`MailerSend error: ${err?.message}`);
    }
  }
}
