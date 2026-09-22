import errorUtilities from "../../../../configurations/error-handler";
import responseUtilities from "../../../../configurations/response";
import { StatusCodes } from "../../../../configurations/statusCodes";
import { HospitalityEstablishment } from "../../../../establishments/HospitalityEstablishment";

const getOneService = errorUtilities.withServiceErrorHandling(
  async (id: string) => {
    const establishment = await HospitalityEstablishment.findByPk(id, {
      include: [
        { association: "branches" },
        {
          association: "owner",
          attributes: {
            exclude: ["password", "refreshToken", "emailOtpHash", "passwordResetTokenHash"],
          },
        },
      ],
    });

    if (!establishment) {
      throw errorUtilities.createError("Establishment not found", StatusCodes.NOT_FOUND);
    }

    return responseUtilities.handleServicesResponse(
      StatusCodes.OK,
      "Establishment fetched successfully",
      establishment,
    );
  },
);

export default getOneService;
