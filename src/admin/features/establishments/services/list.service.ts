import { Op } from "sequelize";
import errorUtilities from "../../../../configurations/error-handler";
import responseUtilities from "../../../../configurations/response";
import { StatusCodes } from "../../../../configurations/statusCodes";
import { HospitalityEstablishment, RegistrationStatus } from "../../../../establishments/HospitalityEstablishment";
import { escapeLikePattern } from "../../../../establishments/helpers/format-name.helpers";

export interface AdminListFilters {
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

    const establishments = await HospitalityEstablishment.findAll({
      where,
      include: [{ association: "branches" }],
      order: [["updatedAt", "DESC"]],
    });

    return responseUtilities.handleServicesResponse(
      StatusCodes.OK,
      "Establishments fetched successfully",
      establishments,
    );
  },
);

export default listService;
