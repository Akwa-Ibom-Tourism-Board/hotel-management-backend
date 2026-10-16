import { wrapEmailHtml } from "../../configurations/email";

export const accountDeactivatedTemplate = (fullName: string) => ({
  subject: "Your Commission portal account has been deactivated",
  htmlBody: wrapEmailHtml(
    `Hello ${fullName},<br><br>
     Your account on the Akwa Ibom State Hotels and Tourism Development Commission Portal, and every establishment registered under it, has been deactivated by the Commission.<br><br>
     If you believe this is a mistake, please reach out to the Commission by phone or in person at the office address below to resolve this.`,
  ),
});
