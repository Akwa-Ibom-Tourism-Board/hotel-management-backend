import { wrapEmailHtml } from "../../configurations/email";
import configurations from "../../configurations";

export const passwordResetRequestedTemplate = (token: string) => ({
  subject: "Reset your password — Akwa Ibom Hotels and Tourism Development Commission",
  htmlBody: wrapEmailHtml(
    `We received a request to reset your password for the Akwa Ibom State Hotels and Tourism Development Commission Portal.<br><br>
     Click the button below to create a new password. This link will expire in 1 hour for security reasons. If you didn't request this, you can safely ignore this email.`,
    `${configurations.FRONTEND_URL}/reset-password?token=${token}`,
    "Reset Password",
  ),
});
