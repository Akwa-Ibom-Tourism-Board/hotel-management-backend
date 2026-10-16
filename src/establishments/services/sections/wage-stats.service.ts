import errorUtilities from "../../../configurations/error-handler";
import responseUtilities from "../../../configurations/response";
import { StatusCodes } from "../../../configurations/statusCodes";
import { WageStat } from "../../WageStat";
import { assertEstablishmentAccess } from "./shared";

export interface WageStatInput {
  reportingYear: number;
  status: string;
  employeesPaidCount?: number | null;
  totalWageSalary?: number | null;
}

/** Pure arithmetic of the other two fields — never stored, always derived
 * fresh, so it can never drift out of sync with what was actually entered. */
const withAverageMonthlyWage = (row: WageStat | null, reportingYear: number) => {
  const json: any = row?.toJSON() ?? { reportingYear, status: "draft" };
  const total = Number(json.totalWageSalary) || 0;
  const count = Number(json.employeesPaidCount) || 0;
  const averageMonthlyWage = count > 0 ? total / count / 12 : 0;
  return { ...json, averageMonthlyWage };
};

export const getWageStats = errorUtilities.withServiceErrorHandling(
  async (establishmentId: string, reportingYear: number, requireOwnerId?: string) => {
    await assertEstablishmentAccess(establishmentId, requireOwnerId);

    const row = await WageStat.findOne({ where: { establishmentId, reportingYear } });

    return responseUtilities.handleServicesResponse(
      StatusCodes.OK,
      "Wage and salary statistics fetched successfully",
      withAverageMonthlyWage(row, reportingYear),
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
      totalWageSalary: payload.totalWageSalary ?? null,
      status: payload.status,
    });

    return responseUtilities.handleServicesResponse(
      StatusCodes.OK,
      "Wage and salary statistics saved successfully",
      withAverageMonthlyWage(row, payload.reportingYear),
    );
  },
);
