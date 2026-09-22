import errorUtilities from "../../../../configurations/error-handler";
import responseUtilities from "../../../../configurations/response";
import { StatusCodes } from "../../../../configurations/statusCodes";
import { HospitalityEstablishment, RegistrationStatus } from "../../../../establishments/HospitalityEstablishment";

const rejectService = errorUtilities.withServiceErrorHandling(
  async (id: string, rejectionReason: string) => {
    const establishment = await HospitalityEstablishment.findByPk(id);

    if (!establishment) {
      throw errorUtilities.createError("Establishment not found", StatusCodes.NOT_FOUND);
    }

    if (establishment.get("registrationStatus") === RegistrationStatus.Draft) {
      throw errorUtilities.createError(
        "Draft establishments are owner-only and can't be reviewed",
        StatusCodes.CONFLICT,
      );
    }

    await establishment.update({
      registrationStatus: RegistrationStatus.Rejected,
      rejectionReason,
      approvedAt: null,
      approvedBy: null,
    });

    return responseUtilities.handleServicesResponse(
      StatusCodes.OK,
      "Establishment rejected successfully",
      establishment,
    );
  },
);

export default rejectService;
