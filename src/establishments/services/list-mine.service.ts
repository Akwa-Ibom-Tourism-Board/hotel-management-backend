import errorUtilities from "../../configurations/error-handler";
import responseUtilities from "../../configurations/response";
import { StatusCodes } from "../../configurations/statusCodes";
import { HospitalityEstablishment } from "../HospitalityEstablishment";

const listMineService = errorUtilities.withServiceErrorHandling(
  async (ownerId: string) => {
    const establishments = await HospitalityEstablishment.findAll({
      where: { ownerId, parentEstablishmentId: null },
      include: [{ association: "branches" }],
      order: [["createdAt", "DESC"]],
    });

    return responseUtilities.handleServicesResponse(
      StatusCodes.OK,
      "Establishments fetched successfully",
      establishments,
    );
  },
);

export default listMineService;
