import errorUtilities from "../../../../configurations/error-handler";
import responseUtilities from "../../../../configurations/response";
import { StatusCodes } from "../../../../configurations/statusCodes";
import { HospitalityEstablishment } from "../../../../establishments/HospitalityEstablishment";

const enableEstablishmentService = errorUtilities.withServiceErrorHandling(
  async (id: string) => {
    const establishment = await HospitalityEstablishment.findByPk(id);

    if (!establishment) {
      throw errorUtilities.createError("Establishment not found", StatusCodes.NOT_FOUND);
    }

    await establishment.update({ isDisabled: false, disabledAt: null, disabledReason: null });

    return responseUtilities.handleServicesResponse(
      StatusCodes.OK,
      "Establishment re-enabled successfully",
      establishment,
    );
  },
);

export default enableEstablishmentService;
