import { connectDB } from "./db";
import { EmailLog } from "./models";

export async function sendMockEmail(recipient: string, subject: string, body: string) {
  try {
    await connectDB();
    await EmailLog.create({
      recipient,
      subject,
      body,
      sentAt: new Date(),
    });
    console.log(`[EMAIL SIMULATOR] Sent Email:\nTo: ${recipient}\nSubject: ${subject}\nBody: ${body}\n`);
    return true;
  } catch (err) {
    console.error("Failed to log mock email:", err);
    return false;
  }
}
