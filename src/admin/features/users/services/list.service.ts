import { Op, literal } from "sequelize";
import errorUtilities from "../../../../configurations/error-handler";
import responseUtilities from "../../../../configurations/response";
import { StatusCodes } from "../../../../configurations/statusCodes";
import { User } from "../../../../auth/User";
import { escapeLikePattern } from "../../../../establishments/helpers/format-name.helpers";
import {
  getPagination,
  buildPaginationMeta,
  toSequelizeOptions,
  PaginationQuery,
} from "../../../../configurations/pagination";

// Never returned to any client — auth secrets/tokens only.
const EXCLUDED_ATTRIBUTES = [
  "password",
  "refreshToken",
  "emailOtpHash",
  "emailOtpExpiresAt",
  "passwordResetTokenHash",
  "passwordResetExpiresAt",
];

// Whitelisted, never taken from the request directly — sortBy/sortOrder feed
// into a raw Sequelize `order` clause, so only known-safe column names may
// reach it.
const SORTABLE_COLUMNS = ["fullName", "firstName", "lastName", "email", "createdAt", "updatedAt"] as const;

export interface AdminListUsersFilters extends PaginationQuery {
  search?: string;
  role?: string;
  sortBy?: (typeof SORTABLE_COLUMNS)[number];
  sortOrder?: "asc" | "desc";
}

const listUsersService = errorUtilities.withServiceErrorHandling(
  async (filters: AdminListUsersFilters) => {
    const pagination = getPagination(filters);
    const sortBy = SORTABLE_COLUMNS.includes(filters.sortBy as any) ? filters.sortBy! : "createdAt";
    const sortOrder = filters.sortOrder === "asc" ? "ASC" : "DESC";

    const where: Record<string, any> = {};

    if (filters.role) {
      where.role = filters.role;
    }

    if (filters.search) {
      const safePattern = `%${escapeLikePattern(filters.search.trim())}%`;
      where[Op.or as any] = [
        { fullName: { [Op.iLike]: safePattern } },
        { firstName: { [Op.iLike]: safePattern } },
        { lastName: { [Op.iLike]: safePattern } },
        { email: { [Op.iLike]: safePattern } },
        { phoneNumber: { [Op.iLike]: safePattern } },
      ];
    }

    const { rows, count } = await User.findAndCountAll({
      where,
      attributes: {
        exclude: EXCLUDED_ATTRIBUTES,
        include: [
          [
            literal(
              '(SELECT COUNT(*) FROM "BusinessRegistration" WHERE "BusinessRegistration"."ownerId" = "User"."id")',
            ),
            "establishmentCount",
          ],
        ],
      },
      order: [[sortBy, sortOrder]],
      ...toSequelizeOptions(pagination),
    });

    // Postgres COUNT(*) comes back as a bigint-string via the pg driver —
    // normalize it to a number before it reaches the client.
    const users = rows.map((row) => {
      const json: any = row.toJSON();
      json.establishmentCount = Number(json.establishmentCount) || 0;
      return json;
    });

    return responseUtilities.handleServicesResponse(
      StatusCodes.OK,
      "Users fetched successfully",
      users,
      buildPaginationMeta(count, pagination),
    );
  },
);

export default listUsersService;
