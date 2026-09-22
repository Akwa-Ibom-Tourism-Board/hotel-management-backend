import errorUtilities from "../../configurations/error-handler";
import responseUtilities from "../../configurations/response";
import { StatusCodes } from "../../configurations/statusCodes";
import { HospitalityEstablishment } from "../HospitalityEstablishment";

const getOneService = errorUtilities.withServiceErrorHandling(
  async (id: string, userId: string) => {
    const establishment = await HospitalityEstablishment.findByPk(id, {
      include: [{ association: "branches" }],
    });

    if (!establishment) {
      throw errorUtilities.createError("Establishment not found", StatusCodes.NOT_FOUND);
    }

    const ownerId = establishment.get("ownerId");
    if (ownerId !== null && ownerId !== userId) {
      throw errorUtilities.createError(
        "You are not permitted to view this establishment",
        StatusCodes.FORBIDDEN,
      );
    }

    return responseUtilities.handleServicesResponse(
      StatusCodes.OK,
      "Establishment fetched successfully",
      establishment,
    );
  },
);

export default getOneService;
