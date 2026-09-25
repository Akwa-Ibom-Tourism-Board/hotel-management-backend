import { Op } from "sequelize";
import errorUtilities from "../../configurations/error-handler";
import responseUtilities from "../../configurations/response";
import { StatusCodes } from "../../configurations/statusCodes";
import { HospitalityEstablishment } from "../HospitalityEstablishment";
import { escapeLikePattern } from "../helpers/format-name.helpers";
import {
  getPagination,
  buildPaginationMeta,
  toSequelizeOptions,
  PaginationQuery,
} from "../../configurations/pagination";

const searchService = errorUtilities.withServiceErrorHandling(
  async (query: string, paginationQuery: PaginationQuery) => {
    // ILIKE is already case-insensitive at the DB level — no need to case-fold
    // here — but the raw term still needs its own wildcard chars escaped
    // before being embedded in our own %…% pattern.
    const safePattern = `%${escapeLikePattern(query.trim())}%`;

    // Default limit of 50 preserved exactly when no page/limit is sent
    // (this is a debounced-typeahead endpoint, not a full table browser).
    const pagination = getPagination(paginationQuery, { defaultLimit: 50, maxLimit: 50 });

    const { rows, count } = await HospitalityEstablishment.findAndCountAll({
      where: {
        businessName: { [Op.iLike]: safePattern },
      },
      attributes: ["id", "businessName", "entityType", "localGovernment", "ownerId"],
      ...toSequelizeOptions(pagination),
      order: [["businessName", "ASC"]],
    });

    return responseUtilities.handleServicesResponse(
      StatusCodes.OK,
      "Search results fetched successfully",
      rows,
      buildPaginationMeta(count, pagination),
    );
  },
);

export default searchService;
