export class EmailVerificationService {
  generateToken(): string {
    return crypto.randomUUID().replace(/-/g, '');
  }

  createExpiry(hours = 24): Date {
    return new Date(Date.now() + hours * 60 * 60 * 1000);
  }
}
