import { Resend } from 'resend';
import dotenv from 'dotenv';
import path from 'path';
 
dotenv.config({ path: ".env.development" });

async function main() {
  console.log("+++++++++++++++++++++++++++++++")
  console.log("API_KEY = "+process.env.RESEND_API_KEY)
  console.log("+++++++++++++++++++++++++++++++")
  const resend = new Resend(process.env.RESEND_API_KEY);
  

  try {
    const { data, error } = await resend.emails.send({
      from: "noreply@draftproanalytics.com",
      to: "dthompson98@gmail.com",
      subject: "Test Email from Resend (DraftProAnalytics)",
      html: "<h2>It works!</h2><p>You just received an email via Resend.</p>",
    });

    if (error) {
      console.error("Resend error:", error);
      process.exit(1);
    }

    console.log("Email sent:", data);
  } catch (err) {
    console.error("Unexpected error:", err);
  }
}

main();

