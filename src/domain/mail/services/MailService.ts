// src/domain/email/services/MailService.ts
import { MailMessage } from '../value-objects/MailMessage';

export interface MailService {
  send(message: MailMessage): Promise<void>;
}
