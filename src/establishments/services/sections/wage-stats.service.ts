import errorUtilities from "../../../configurations/error-handler";
import responseUtilities from "../../../configurations/response";
import { StatusCodes } from "../../../configurations/statusCodes";
import { WageStat } from "../../WageStat";
import { assertEstablishmentAccess } from "./shared";

export interface WageStatInput {
  reportingYear: number;
  status: string;
  employeesPaidCount?: number | null;
  minimumMonthlySalaryGross?: number | null;
}

const toJson = (row: WageStat | null, reportingYear: number) =>
  row?.toJSON() ?? { reportingYear, status: "draft", employeesPaidCount: null, minimumMonthlySalaryGross: null };

export const getWageStats = errorUtilities.withServiceErrorHandling(
  async (establishmentId: string, reportingYear: number, requireOwnerId?: string) => {
    await assertEstablishmentAccess(establishmentId, requireOwnerId);

    const row = await WageStat.findOne({ where: { establishmentId, reportingYear } });

    return responseUtilities.handleServicesResponse(
      StatusCodes.OK,
      "Wage and salary statistics fetched successfully",
      toJson(row, reportingYear),
    );
  },
);

export const upsertWageStats = errorUtilities.withServiceErrorHandling(
  async (establishmentId: string, payload: WageStatInput, requireOwnerId?: string) => {
    await assertEstablishmentAccess(establishmentId, requireOwnerId);

    const [row] = await WageStat.findOrCreate({
      where: { establishmentId, reportingYear: payload.reportingYear },
      defaults: { establishmentId, reportingYear: payload.reportingYear } as any,
    });
    await row.update({
      employeesPaidCount: payload.employeesPaidCount ?? null,
      minimumMonthlySalaryGross: payload.minimumMonthlySalaryGross ?? null,
      status: payload.status,
    });

    return responseUtilities.handleServicesResponse(
      StatusCodes.OK,
      "Wage and salary statistics saved successfully",
      toJson(row, payload.reportingYear),
    );
  },
);
