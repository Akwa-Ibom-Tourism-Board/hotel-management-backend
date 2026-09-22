import { wrapEmailHtml } from "../../configurations/email";

export const loginOtpTemplate = (otp: string) => ({
  subject: "Your login code — Akwa Ibom Hotels and Tourism Development Commission",
  htmlBody: wrapEmailHtml(
    `You requested to log in using a one-time code.<br><br>
     Your login code is:<br><br>
     <strong style="font-size: 28px; letter-spacing: 4px;">${otp}</strong><br><br>
     This code expires in 10 minutes. If you didn't request this, you can safely ignore this email.`,
  ),
});
