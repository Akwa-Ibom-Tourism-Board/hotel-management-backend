import errorUtilities from "../../../../configurations/error-handler";
import responseUtilities from "../../../../configurations/response";
import { StatusCodes } from "../../../../configurations/statusCodes";
import { HospitalityEstablishment } from "../../../../establishments/HospitalityEstablishment";

// Protected fields: identity/generated (id, uniqueBusinessId) and the
// review-decision fields owned exclusively by the approve/reject endpoints.
const PROTECTED_FIELDS = [
  "id",
  "uniqueBusinessId",
  "submittedAt",
  "approvedAt",
  "approvedBy",
  "registrationStatus",
  "rejectionReason",
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
