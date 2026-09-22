import { wrapEmailHtml } from "../../configurations/email";

export const emailVerificationOtpTemplate = (otp: string) => ({
  subject: "Verify your email — Akwa Ibom Hotels and Tourism Development Commission",
  htmlBody: wrapEmailHtml(
    `Thank you for registering on the Akwa Ibom State Hotels and Tourism Development Commission Portal.<br><br>
     Your email verification code is:<br><br>
     <strong style="font-size: 28px; letter-spacing: 4px;">${otp}</strong><br><br>
     This code expires in 10 minutes. If you didn't request this, you can safely ignore this email.`,
  ),
});
