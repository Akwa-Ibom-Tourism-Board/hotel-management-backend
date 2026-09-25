import { Op } from "sequelize";
import errorUtilities from "../../../../configurations/error-handler";
import responseUtilities from "../../../../configurations/response";
import { StatusCodes } from "../../../../configurations/statusCodes";
import { HospitalityEstablishment, RegistrationStatus } from "../../../../establishments/HospitalityEstablishment";
import { escapeLikePattern } from "../../../../establishments/helpers/format-name.helpers";
import {
  getPagination,
  buildPaginationMeta,
  toSequelizeOptions,
  PaginationQuery,
} from "../../../../configurations/pagination";

export interface AdminListFilters extends PaginationQuery {
  registrationStatus?: string;
  entityType?: string;
  search?: string;
}

const listService = errorUtilities.withServiceErrorHandling(
  async (filters: AdminListFilters) => {
    const where: Record<string, any> = {
      registrationStatus: { [Op.ne]: RegistrationStatus.Draft },
    };

    // Draft rows are owner-private and never shown here, even if explicitly
    // requested — the exclude-Draft default above is the floor, not a
    // default that a status filter can override.
    if (filters.registrationStatus && filters.registrationStatus !== RegistrationStatus.Draft) {
      where.registrationStatus = filters.registrationStatus;
    }

    if (filters.entityType) {
      where.entityType = filters.entityType;
    }

    if (filters.search) {
      const safePattern = `%${escapeLikePattern(filters.search.trim())}%`;
      where[Op.or as any] = [
        { businessName: { [Op.iLike]: safePattern } },
        { uniqueBusinessId: { [Op.iLike]: safePattern } },
      ];
    }

    // This list spans every owner (557+ rows and growing) — pagination is
    // mandatory here, not opt-in like the owner-scoped lists.
    const pagination = getPagination(filters);

    const { rows, count } = await HospitalityEstablishment.findAndCountAll({
      where,
      // Branches are returned flat in this same list (no parentEstablishmentId
      // filter above) since they're licensable entities in their own right —
      // `parent` lets the admin UI label a branch row as "Branch of X"
      // without a second round trip.
      include: [
        { association: "branches" },
        { association: "parent", attributes: ["id", "businessName", "uniqueBusinessId"] },
      ],
      order: [["updatedAt", "DESC"]],
      ...toSequelizeOptions(pagination),
      distinct: true,
    });

    return responseUtilities.handleServicesResponse(
      StatusCodes.OK,
      "Establishments fetched successfully",
      rows,
      buildPaginationMeta(count, pagination),
    );
  },
);

export default listService;
