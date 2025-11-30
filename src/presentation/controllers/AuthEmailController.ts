import { SendEmailUseCase } from "@/application/mail/SendEmailUseCase";
import { createMailService } from "@/infrastructure/mail/MailServiceFactory";


const mailer = createMailService();
const sendEmailUseCase = new SendEmailUseCase(mailer);

import { Request, Response } from 'express';

type SendTestEmailBody = {
  email: string;
};

export async function sendTestEmail(
  req: Request<{}, {}, SendTestEmailBody>, 
  res: Response
) {
  try {
    if (!req.body || !req.body.email) {
      res.status(400).json({ error: "Email is required" });
      return;
    }

    await sendEmailUseCase.execute({
      to: req.body.email,
      subject: "Test Email from SportsMgmt App",
      html: "<h2>It works!</h2>"
    });

    res.json({ message: "Email sent successfully" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
