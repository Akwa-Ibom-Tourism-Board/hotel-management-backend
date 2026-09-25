import { Op } from "sequelize";
import errorUtilities from "../../../../configurations/error-handler";
import responseUtilities from "../../../../configurations/response";
import { StatusCodes } from "../../../../configurations/statusCodes";
import { User } from "../../../../auth/User";
import { HospitalityEstablishment } from "../../../../establishments/HospitalityEstablishment";
import { escapeLikePattern } from "../../../../establishments/helpers/format-name.helpers";
import {
  getPagination,
  buildPaginationMeta,
  toSequelizeOptions,
  PaginationQuery,
} from "../../../../configurations/pagination";

const EXCLUDED_ATTRIBUTES = [
  "password",
  "refreshToken",
  "emailOtpHash",
  "emailOtpExpiresAt",
  "passwordResetTokenHash",
  "passwordResetExpiresAt",
];

// Whitelisted for the same reason as the user list's SORTABLE_COLUMNS —
// feeds a raw `order` clause, never taken from the request unvalidated.
const SORTABLE_COLUMNS = [
  "businessName",
  "entityType",
  "registrationStatus",
  "submittedAt",
  "createdAt",
] as const;

export interface AdminGetUserEstablishmentFilters extends PaginationQuery {
  search?: string;
  entityType?: string;
  registrationStatus?: string;
  sortBy?: (typeof SORTABLE_COLUMNS)[number];
  sortOrder?: "asc" | "desc";
}

const getOneUserService = errorUtilities.withServiceErrorHandling(
  async (id: string, filters: AdminGetUserEstablishmentFilters) => {
    const user = await User.findByPk(id, { attributes: { exclude: EXCLUDED_ATTRIBUTES } });

    if (!user) {
      throw errorUtilities.createError("User not found", StatusCodes.NOT_FOUND);
    }

    const sortBy = SORTABLE_COLUMNS.includes(filters.sortBy as any) ? filters.sortBy! : "createdAt";
    const sortOrder = filters.sortOrder === "asc" ? "ASC" : "DESC";
    const pagination = getPagination(filters);

    // Deliberately not excluding Draft here (unlike the general admin
    // establishments list) — this is an audit view of everything a specific
    // user owns, not the cross-owner review queue.
    const where: Record<string, any> = {
      ownerId: id,
      parentEstablishmentId: null,
    };

    if (filters.entityType) {
      where.entityType = filters.entityType;
    }

    if (filters.registrationStatus) {
      where.registrationStatus = filters.registrationStatus;
    }

    if (filters.search) {
      const safePattern = `%${escapeLikePattern(filters.search.trim())}%`;
      where[Op.or as any] = [
        { businessName: { [Op.iLike]: safePattern } },
        { uniqueBusinessId: { [Op.iLike]: safePattern } },
      ];
    }

    const { rows, count } = await HospitalityEstablishment.findAndCountAll({
      where,
      include: [{ association: "branches" }],
      order: [[sortBy, sortOrder]],
      ...toSequelizeOptions(pagination),
      distinct: true,
    });

    // Nested inside the user object rather than response headers — this
    // endpoint's primary resource is the user, not the establishments list,
    // so the pagination metadata for that one embedded list travels with it.
    const json: any = user.toJSON();
    json.establishments = rows;
    json.establishmentCount = count;
    json.establishmentsPagination = buildPaginationMeta(count, pagination);

    return responseUtilities.handleServicesResponse(
      StatusCodes.OK,
      "User fetched successfully",
      json,
    );
  },
);

export default getOneUserService;
