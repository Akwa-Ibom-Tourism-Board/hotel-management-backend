import { wrapEmailHtml } from "../../configurations/email";
import configurations from "../../configurations";

export const welcomeWithTemporaryPasswordTemplate = (
  fullName: string,
  email: string,
  temporaryPassword: string,
  businessName: string,
) => ({
  subject: "Your Akwa Ibom Hotels and Tourism Development Commission portal account",
  htmlBody: wrapEmailHtml(
    `Hello ${fullName},<br><br>
     An account has been created for you on the Akwa Ibom State Hotels and Tourism Development Commission Portal, linked to <strong>${businessName}</strong>.<br><br>
     <strong>Email:</strong> ${email}<br>
     <strong>Temporary password:</strong> ${temporaryPassword}<br><br>
     Please log in using the details above — you'll be asked to set a new password the first time you sign in. You can then share access with your team members or admin staff as needed.`,
    `${configurations.FRONTEND_URL}/login`,
    "Log In",
  ),
});
