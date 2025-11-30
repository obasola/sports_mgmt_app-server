import { MailService } from '@/domain/mail/services/MailService';
import { MailMessage } from '@/domain/mail/value-objects/MailMessage';

export class ResendMailService implements MailService {
  constructor(private readonly apiKey: string) {}

  async send({ to, subject, html, from }: MailMessage): Promise<void> {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: from ?? "noreply@draftproanalytics.com",
        to,
        subject,
        html,
      })
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Resend sending failed: ${res.status} ${body}`);
    }
  }
}
