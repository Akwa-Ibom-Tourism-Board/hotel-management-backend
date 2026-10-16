import errorUtilities from "../../../../configurations/error-handler";
import responseUtilities from "../../../../configurations/response";
import { StatusCodes } from "../../../../configurations/statusCodes";
import { queueEmail } from "../../../../configurations/email-queue";
import { HospitalityEstablishment } from "../../../../establishments/HospitalityEstablishment";
import { User } from "../../../../auth/User";
import { establishmentDeactivatedTemplate } from "../../../../auth/emailTemplates/establishmentDeactivated";

/** Disables exactly this one establishment — no cascade to siblings or the
 * owner's account (that's the separate /admin/users/:id/disable flow). */
const disableEstablishmentService = errorUtilities.withServiceErrorHandling(
  async (id: string, reason?: string) => {
    const establishment = await HospitalityEstablishment.findByPk(id);

    if (!establishment) {
      throw errorUtilities.createError("Establishment not found", StatusCodes.NOT_FOUND);
    }

    await establishment.update({
      isDisabled: true,
      disabledAt: new Date(),
      disabledReason: reason ?? null,
    });

    const ownerId = establishment.get("ownerId") as string | null;
    if (ownerId) {
      const owner = await User.findByPk(ownerId);
      if (owner) {
        const template = establishmentDeactivatedTemplate(
          (owner.get("firstName") as string | null) ?? "there",
          (establishment.get("businessName") as string | null) ?? "your establishment",
        );
        await queueEmail({ to: owner.get("email") as string, subject: template.subject, htmlBody: template.htmlBody });
      }
    }

    return responseUtilities.handleServicesResponse(
      StatusCodes.OK,
      "Establishment deactivated successfully",
      establishment,
    );
  },
);

export default disableEstablishmentService;
