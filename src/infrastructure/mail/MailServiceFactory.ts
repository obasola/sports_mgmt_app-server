import { MailService } from '@/domain/mail/services/MailService';
import { ResendMailService } from './ResendMailService';
import { SendGridMailService } from './SendGridMailService';
import { MailerSendMailService } from './MailerSendMailService';

export function createMailService(): MailService {
  const provider = process.env.MAIL_PROVIDER;

  switch (provider) {
    case 'sendgrid':
      return new SendGridMailService(process.env.SENDGRID_API_KEY!);

    case 'mailersend':
      return new MailerSendMailService(process.env.MAILERSEND_API_KEY!);

    case 'resend':
    default:
      return new ResendMailService(process.env.RESEND_API_KEY!);
  }
}
