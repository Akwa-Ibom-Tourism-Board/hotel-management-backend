import errorUtilities from "../../../../configurations/error-handler";
import responseUtilities from "../../../../configurations/response";
import { StatusCodes } from "../../../../configurations/statusCodes";
import { queueEmail } from "../../../../configurations/email-queue";
import { HospitalityEstablishment } from "../../../../establishments/HospitalityEstablishment";
import { User, Roles } from "../../../../auth/User";
import { hashData, generateTemporaryPassword, serializeUser } from "../../../../auth/auth.helpers";
import { welcomeWithTemporaryPasswordTemplate } from "../../../../auth/emailTemplates/welcomeWithTemporaryPassword";

/**
 * Provisions portal access for an establishment's owner — for establishments
 * registered without a self-service account (e.g. via admin bulk-add).
 * Looks up an existing User by the establishment's `ownerEmail`; if one
 * exists it's simply linked (no email, since they already have a working
 * login), otherwise a new account is created with a generated temporary
 * password (mustChangePassword: true) and emailed to them.
 */
const sendWelcomeEmailService = errorUtilities.withServiceErrorHandling(
  async (establishmentId: string) => {
    const establishment = await HospitalityEstablishment.findByPk(establishmentId);

    if (!establishment) {
      throw errorUtilities.createError("Establishment not found", StatusCodes.NOT_FOUND);
    }

    if (establishment.get("ownerId")) {
      throw errorUtilities.createError(
        "This establishment already has an owner account linked",
        StatusCodes.CONFLICT,
      );
    }

    const ownerEmail = establishment.get("ownerEmail") as string | null;
    const ownerFirstName = establishment.get("ownerFirstName") as string | null;
    const ownerLastName = establishment.get("ownerLastName") as string | null;

    if (!ownerEmail || !ownerFirstName || !ownerLastName) {
      throw errorUtilities.createError(
        "Add the owner's first name, last name, and email in the Owner Details section first",
        StatusCodes.BAD_REQUEST,
      );
    }

    const businessName = (establishment.get("businessName") as string | null) ?? "your establishment";
    let owner = await User.findOne({ where: { email: ownerEmail } });

    if (owner) {
      await establishment.update({ ownerId: owner.get("id") as string });
      return responseUtilities.handleServicesResponse(
        StatusCodes.OK,
        `Linked to the existing account for ${ownerEmail}`,
        { establishment, owner: serializeUser(owner) },
      );
    }

    const temporaryPassword = generateTemporaryPassword();
    owner = await User.create({
      email: ownerEmail,
      firstName: ownerFirstName,
      lastName: ownerLastName,
      fullName: `${ownerFirstName} ${ownerLastName}`,
      password: await hashData(temporaryPassword),
      role: Roles.User,
      emailVerified: true,
      mustChangePassword: true,
    } as any);

    await establishment.update({ ownerId: owner.get("id") as string });

    const template = welcomeWithTemporaryPasswordTemplate(
      `${ownerFirstName} ${ownerLastName}`,
      ownerEmail,
      temporaryPassword,
      businessName,
    );
    await queueEmail({ to: ownerEmail, subject: template.subject, htmlBody: template.htmlBody });

    return responseUtilities.handleServicesResponse(
      StatusCodes.CREATED,
      `Account created and welcome email sent to ${ownerEmail}`,
      { establishment, owner: serializeUser(owner) },
    );
  },
);

export default sendWelcomeEmailService;
