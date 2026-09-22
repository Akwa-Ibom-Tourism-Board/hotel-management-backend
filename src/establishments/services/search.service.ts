import { Op } from "sequelize";
import errorUtilities from "../../configurations/error-handler";
import responseUtilities from "../../configurations/response";
import { StatusCodes } from "../../configurations/statusCodes";
import { HospitalityEstablishment } from "../HospitalityEstablishment";
import { escapeLikePattern } from "../helpers/format-name.helpers";

const searchService = errorUtilities.withServiceErrorHandling(
  async (query: string) => {
    // ILIKE is already case-insensitive at the DB level — no need to case-fold
    // here — but the raw term still needs its own wildcard chars escaped
    // before being embedded in our own %…% pattern.
    const safePattern = `%${escapeLikePattern(query.trim())}%`;

    const establishments = await HospitalityEstablishment.findAll({
      where: {
        businessName: { [Op.iLike]: safePattern },
      },
      attributes: ["id", "businessName", "entityType", "localGovernment", "ownerId"],
      limit: 50,
      order: [["businessName", "ASC"]],
    });

    return responseUtilities.handleServicesResponse(
      StatusCodes.OK,
      "Search results fetched successfully",
      establishments,
    );
  },
);

export default searchService;
