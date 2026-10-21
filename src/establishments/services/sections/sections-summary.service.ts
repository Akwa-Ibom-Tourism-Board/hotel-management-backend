import errorUtilities from "../../../configurations/error-handler";
import responseUtilities from "../../../configurations/response";
import { StatusCodes } from "../../../configurations/statusCodes";
import { Model, ModelStatic } from "sequelize";
import { AccommodationCategory } from "../../AccommodationCategory";
import { EmploymentStat } from "../../EmploymentStat";
import { WageStat } from "../../WageStat";
import { GuestArrivalStat } from "../../GuestArrivalStat";
import { OccupancyStat } from "../../OccupancyStat";
import { RoomRate } from "../../RoomRate";
import { assertEstablishmentAccess } from "./shared";

/** One row per year that has ANY data for this multi-row-per-year section —
 * all rows for a year always share the same status (kept in sync by the
 * section's own full-replace upsert), so the first row's status stands in
 * for the whole year. */
const yearStatusSummary = async (
  model: ModelStatic<Model>,
  establishmentId: string,
): Promise<{ reportingYear: number; status: string }[]> => {
  const rows = await model.findAll({
    where: { establishmentId },
    attributes: ["reportingYear", "status"],
    group: ["reportingYear", "status"],
    order: [["reportingYear", "DESC"]],
  });
  return rows.map((row) => row.toJSON() as any);
};

const singleRowYearStatusSummary = async (
  model: typeof WageStat | typeof GuestArrivalStat | typeof OccupancyStat,
  establishmentId: string,
) => {
  const rows = await model.findAll({
    where: { establishmentId },
    attributes: ["reportingYear", "status"],
    order: [["reportingYear", "DESC"]],
  });
  return rows.map((row) => row.toJSON() as any);
};

export const getSectionsSummary = errorUtilities.withServiceErrorHandling(
  async (establishmentId: string, requireOwnerId?: string) => {
    await assertEstablishmentAccess(establishmentId, requireOwnerId);

    const [accommodationRows, employmentStats, wageStats, guestArrivalStats, occupancyStats, roomRates] =
      await Promise.all([
        AccommodationCategory.findAll({ where: { establishmentId }, attributes: ["status"], limit: 1 }),
        yearStatusSummary(EmploymentStat, establishmentId),
        singleRowYearStatusSummary(WageStat, establishmentId),
        singleRowYearStatusSummary(GuestArrivalStat, establishmentId),
        singleRowYearStatusSummary(OccupancyStat, establishmentId),
        yearStatusSummary(RoomRate, establishmentId),
      ]);

    return responseUtilities.handleServicesResponse(StatusCodes.OK, "Sections summary fetched successfully", {
      accommodation: {
        hasData: accommodationRows.length > 0,
        status: (accommodationRows[0]?.toJSON() as any)?.status ?? null,
      },
      employmentStats,
      wageStats,
      guestArrivalStats,
      occupancyStats,
      roomRates,
    });
  },
);
