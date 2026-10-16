import errorUtilities from "../../../../configurations/error-handler";
import responseUtilities from "../../../../configurations/response";
import { StatusCodes } from "../../../../configurations/statusCodes";
import { database } from "../../../../configurations/database";
import { queueEmail } from "../../../../configurations/email-queue";
import { User } from "../../../../auth/User";
import { HospitalityEstablishment } from "../../../../establishments/HospitalityEstablishment";
import { serializeUser } from "../../../../auth/auth.helpers";
import { accountDeactivatedTemplate } from "../../../../auth/emailTemplates/accountDeactivated";

/** Disabling a user also disables every establishment they own — branches
 * share their parent's ownerId already, so one WHERE clause covers them
 * too. Both updates happen in one transaction. */
const disableUserService = errorUtilities.withServiceErrorHandling(
  async (id: string, reason?: string) => {
    const user = await User.findByPk(id);

    if (!user) {
      throw errorUtilities.createError("User not found", StatusCodes.NOT_FOUND);
    }

    await database.transaction(async (transaction) => {
      await user.update({ isActive: false }, { transaction });
      await HospitalityEstablishment.update(
        { isDisabled: true, disabledAt: new Date(), disabledReason: reason ?? "Account deactivated" },
        { where: { ownerId: id }, transaction },
      );
    });

    const template = accountDeactivatedTemplate((user.get("firstName") as string | null) ?? "there");
    await queueEmail({ to: user.get("email") as string, subject: template.subject, htmlBody: template.htmlBody });

    return responseUtilities.handleServicesResponse(
      StatusCodes.OK,
      "User and their establishments deactivated successfully",
      serializeUser(user),
    );
  },
);

export default disableUserService;
