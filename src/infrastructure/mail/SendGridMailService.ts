import { MailService } from '@/domain/mail/services/MailService';
import { MailMessage } from '@/domain/mail/value-objects/MailMessage';
import sgMail from '@sendgrid/mail';

export class SendGridMailService implements MailService {
  constructor(apiKey: string) {
    sgMail.setApiKey(apiKey);
  }

  async send({ to, subject, html, from }: MailMessage): Promise<void> {
    try {
      await sgMail.send({
        to,
        subject,
        html,
        from: from ?? "noreply@draftproanalytics.com",
      });
    } catch (err: any) {
      throw new Error(`SendGrid sending failed: ${err?.message}`);
    }
  }
}
