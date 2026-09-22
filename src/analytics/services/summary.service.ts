import { fn, col } from "sequelize";
import errorUtilities from "../../configurations/error-handler";
import responseUtilities from "../../configurations/response";
import { StatusCodes } from "../../configurations/statusCodes";
import { HospitalityEstablishment, RegistrationStatus } from "../../establishments/HospitalityEstablishment";

const summaryService = errorUtilities.withServiceErrorHandling(
  async (ownerId: string) => {
    const statusCounts: any = await HospitalityEstablishment.findAll({
      where: { ownerId },
      attributes: ["registrationStatus", [fn("COUNT", col("id")), "count"]],
      group: ["registrationStatus"],
      raw: true,
    });

    const entityTypeCounts: any = await HospitalityEstablishment.findAll({
      where: { ownerId },
      attributes: ["entityType", [fn("COUNT", col("id")), "count"]],
      group: ["entityType"],
      raw: true,
    });

    const getStatusCount = (status: RegistrationStatus) =>
      Number(statusCounts.find((row: any) => row.registrationStatus === status)?.count || 0);

    const total = statusCounts.reduce((sum: number, row: any) => sum + Number(row.count), 0);

    const byEntityType: Record<string, number> = {};
    for (const row of entityTypeCounts) {
      byEntityType[row.entityType] = Number(row.count);
    }

    return responseUtilities.handleServicesResponse(StatusCodes.OK, "Analytics summary fetched successfully", {
      total,
      licensed: getStatusCount(RegistrationStatus.Approved),
      unlicensed: getStatusCount(RegistrationStatus.Pending) + getStatusCount(RegistrationStatus.Rejected),
      drafts: getStatusCount(RegistrationStatus.Draft),
      byEntityType,
    });
  },
);

export default summaryService;
