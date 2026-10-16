import errorUtilities from "../../../../configurations/error-handler";
import responseUtilities from "../../../../configurations/response";
import { StatusCodes } from "../../../../configurations/statusCodes";
import { HospitalityEstablishment } from "../../../../establishments/HospitalityEstablishment";

// Protected fields: identity/generated (id, uniqueBusinessId), the
// review-decision fields owned exclusively by the approve/reject endpoints,
// the disable/enable fields owned by their own dedicated endpoints (so a
// disable always goes through the email-sending flow, never silently via a
// generic PATCH), and ownerId (owned by the owner's self-registration claim
// flow and the admin "send welcome email" flow).
const PROTECTED_FIELDS = [
  "id",
  "uniqueBusinessId",
  "submittedAt",
  "approvedAt",
  "approvedBy",
  "registrationStatus",
  "rejectionReason",
  "isDisabled",
  "disabledAt",
  "disabledReason",
  "ownerId",
];

const updateService = errorUtilities.withServiceErrorHandling(
  async (id: string, payload: Record<string, any>) => {
    const establishment = await HospitalityEstablishment.findByPk(id);

    if (!establishment) {
      throw errorUtilities.createError("Establishment not found", StatusCodes.NOT_FOUND);
    }

    const safePayload = { ...payload };
    for (const field of PROTECTED_FIELDS) {
      delete safePayload[field];
    }

    await establishment.update(safePayload);

    return responseUtilities.handleServicesResponse(
      StatusCodes.OK,
      "Establishment updated successfully",
      establishment,
    );
  },
);

export default updateService;
