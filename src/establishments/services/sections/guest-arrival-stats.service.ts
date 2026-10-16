import errorUtilities from "../../../configurations/error-handler";
import responseUtilities from "../../../configurations/response";
import { StatusCodes } from "../../../configurations/statusCodes";
import { GuestArrivalStat } from "../../GuestArrivalStat";
import { assertEstablishmentAccess } from "./shared";

export interface GuestArrivalStatInput {
  reportingYear: number;
  status: string;
  akwaIbomResidents?: number | null;
  otherNigerianStates?: number | null;
  internationalGuests?: number | null;
  mostStateOfArrival?: string | null;
  mostCountryOfArrival?: string | null;
}

const withTotalGuests = (row: GuestArrivalStat | null, reportingYear: number) => {
  const json: any = row?.toJSON() ?? { reportingYear, status: "draft" };
  const totalGuests =
    (Number(json.akwaIbomResidents) || 0) +
    (Number(json.otherNigerianStates) || 0) +
    (Number(json.internationalGuests) || 0);
  return { ...json, totalGuests };
};

export const getGuestArrivalStats = errorUtilities.withServiceErrorHandling(
  async (establishmentId: string, reportingYear: number, requireOwnerId?: string) => {
    await assertEstablishmentAccess(establishmentId, requireOwnerId);

    const row = await GuestArrivalStat.findOne({ where: { establishmentId, reportingYear } });

    return responseUtilities.handleServicesResponse(
      StatusCodes.OK,
      "Guest arrival statistics fetched successfully",
      withTotalGuests(row, reportingYear),
    );
  },
);

export const upsertGuestArrivalStats = errorUtilities.withServiceErrorHandling(
  async (establishmentId: string, payload: GuestArrivalStatInput, requireOwnerId?: string) => {
    await assertEstablishmentAccess(establishmentId, requireOwnerId);

    const [row] = await GuestArrivalStat.findOrCreate({
      where: { establishmentId, reportingYear: payload.reportingYear },
      defaults: { establishmentId, reportingYear: payload.reportingYear } as any,
    });
    await row.update({
      akwaIbomResidents: payload.akwaIbomResidents ?? null,
      otherNigerianStates: payload.otherNigerianStates ?? null,
      internationalGuests: payload.internationalGuests ?? null,
      mostStateOfArrival: payload.mostStateOfArrival ?? null,
      mostCountryOfArrival: payload.mostCountryOfArrival ?? null,
      status: payload.status,
    });

    return responseUtilities.handleServicesResponse(
      StatusCodes.OK,
      "Guest arrival statistics saved successfully",
      withTotalGuests(row, payload.reportingYear),
    );
  },
);
