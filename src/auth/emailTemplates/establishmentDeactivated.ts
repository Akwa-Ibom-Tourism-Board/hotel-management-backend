import { wrapEmailHtml } from "../../configurations/email";

export const establishmentDeactivatedTemplate = (fullName: string, businessName: string) => ({
  subject: `${businessName} has been deactivated`,
  htmlBody: wrapEmailHtml(
    `Hello ${fullName},<br><br>
     Your establishment <strong>${businessName}</strong> has been deactivated by the Akwa Ibom State Hotels and Tourism Development Commission. Your other establishments and your account are not affected.<br><br>
     If you believe this is a mistake, please reach out to the Commission by phone or in person at the office address below to resolve this.`,
  ),
});
