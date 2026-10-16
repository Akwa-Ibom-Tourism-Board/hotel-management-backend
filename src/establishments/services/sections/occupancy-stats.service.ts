import errorUtilities from "../../../configurations/error-handler";
import responseUtilities from "../../../configurations/response";
import { StatusCodes } from "../../../configurations/statusCodes";
import { OccupancyStat } from "../../OccupancyStat";
import { assertEstablishmentAccess } from "./shared";

export interface OccupancyStatInput {
  reportingYear: number;
  status: string;
  availableRooms?: number | null;
  roomNightsAvailable?: number | null;
  roomNightsSold?: number | null;
  totalGuestNights?: number | null;
}

const withOccupancyRate = (row: OccupancyStat | null, reportingYear: number) => {
  const json: any = row?.toJSON() ?? { reportingYear, status: "draft" };
  const available = Number(json.roomNightsAvailable) || 0;
  const sold = Number(json.roomNightsSold) || 0;
  const occupancyRate = available > 0 ? Math.round((sold / available) * 1000) / 10 : 0;
  return { ...json, occupancyRate };
};

export const getOccupancyStats = errorUtilities.withServiceErrorHandling(
  async (establishmentId: string, reportingYear: number, requireOwnerId?: string) => {
    await assertEstablishmentAccess(establishmentId, requireOwnerId);

    const row = await OccupancyStat.findOne({ where: { establishmentId, reportingYear } });

    return responseUtilities.handleServicesResponse(
      StatusCodes.OK,
      "Occupancy statistics fetched successfully",
      withOccupancyRate(row, reportingYear),
    );
  },
);

export const upsertOccupancyStats = errorUtilities.withServiceErrorHandling(
  async (establishmentId: string, payload: OccupancyStatInput, requireOwnerId?: string) => {
    await assertEstablishmentAccess(establishmentId, requireOwnerId);

    const [row] = await OccupancyStat.findOrCreate({
      where: { establishmentId, reportingYear: payload.reportingYear },
      defaults: { establishmentId, reportingYear: payload.reportingYear } as any,
    });
    await row.update({
      availableRooms: payload.availableRooms ?? null,
      roomNightsAvailable: payload.roomNightsAvailable ?? null,
      roomNightsSold: payload.roomNightsSold ?? null,
      totalGuestNights: payload.totalGuestNights ?? null,
      status: payload.status,
    });

    return responseUtilities.handleServicesResponse(
      StatusCodes.OK,
      "Occupancy statistics saved successfully",
      withOccupancyRate(row, payload.reportingYear),
    );
  },
);
