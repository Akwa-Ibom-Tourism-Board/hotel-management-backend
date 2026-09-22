import dayjs from "dayjs";
import { Op, fn, col, literal } from "sequelize";
import errorUtilities from "../../../../configurations/error-handler";
import responseUtilities from "../../../../configurations/response";
import { StatusCodes } from "../../../../configurations/statusCodes";
import { HospitalityEstablishment } from "../../../../establishments/HospitalityEstablishment";

const adminAnalyticsSummaryService = errorUtilities.withServiceErrorHandling(
  async () => {
    const startOfMonth = dayjs().startOf("month").toDate();
    const endOfMonth = dayjs().endOf("month").toDate();

    const totalEntities = await HospitalityEstablishment.count();

    const entityTypeCounts: any = await HospitalityEstablishment.findAll({
      attributes: ["entityType", [fn("COUNT", col("id")), "count"]],
      group: ["entityType"],
      raw: true,
    });

    const getCountByType = (type: string) =>
      Number(entityTypeCounts.find((row: any) => row.entityType === type)?.count || 0);

    const totalHotels = getCountByType("hotel");
    const totalRestaurants = getCountByType("restaurant");
    const totalBarsAndLounges = getCountByType("bar") + getCountByType("lounge");

    const totalRegistrationsThisMonth = await HospitalityEstablishment.count({
      where: { submittedAt: { [Op.between]: [startOfMonth, endOfMonth] } },
    });

    const topLocalGovernmentRegistered: any = await HospitalityEstablishment.findOne({
      attributes: ["localGovernment", [fn("COUNT", col("id")), "count"]],
      group: ["localGovernment"],
      order: [[literal("count"), "DESC"]],
      raw: true,
    });

    return responseUtilities.handleServicesResponse(StatusCodes.OK, "Analytics data fetched successfully", {
      totalEntities,
      totalHotels,
      totalRestaurants,
      totalBarsAndLounges,
      totalRegistrationsThisMonth,
      topLocalGovernmentRegistered: topLocalGovernmentRegistered
        ? {
            localGovernment: topLocalGovernmentRegistered.localGovernment,
            count: Number(topLocalGovernmentRegistered.count),
          }
        : null,
    });
  },
);

export default adminAnalyticsSummaryService;
