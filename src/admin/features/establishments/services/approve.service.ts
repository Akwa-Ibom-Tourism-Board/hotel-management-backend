import errorUtilities from "../../../../configurations/error-handler";
import responseUtilities from "../../../../configurations/response";
import { StatusCodes } from "../../../../configurations/statusCodes";
import { HospitalityEstablishment, RegistrationStatus } from "../../../../establishments/HospitalityEstablishment";

const approveService = errorUtilities.withServiceErrorHandling(
  async (id: string, adminId: string) => {
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
      registrationStatus: RegistrationStatus.Approved,
      approvedAt: new Date(),
      approvedBy: adminId,
      rejectionReason: null,
    });

    return responseUtilities.handleServicesResponse(
      StatusCodes.OK,
      "Establishment approved successfully",
      establishment,
    );
  },
);

export default approveService;
