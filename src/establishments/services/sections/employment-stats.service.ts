import errorUtilities from "../../../configurations/error-handler";
import responseUtilities from "../../../configurations/response";
import { StatusCodes } from "../../../configurations/statusCodes";
import { database } from "../../../configurations/database";
import { EmploymentStat } from "../../EmploymentStat";
import { assertEstablishmentAccess, sumField } from "./shared";

export interface EmploymentStatInput {
  category: string;
  categoryLabel: string;
  akwaIbomIndigenes?: number | null;
  nonIndigenes?: number | null;
  foreignEmployees?: number | null;
}

const withTotals = (reportingYear: number, categories: EmploymentStat[]) => {
  const rows = categories.map((c) => c.toJSON() as any);
  return {
    reportingYear,
    categories,
    totals: {
      akwaIbomIndigenes: sumField(rows, "akwaIbomIndigenes"),
      nonIndigenes: sumField(rows, "nonIndigenes"),
      foreignEmployees: sumField(rows, "foreignEmployees"),
    },
  };
};

export const getEmploymentStats = errorUtilities.withServiceErrorHandling(
  async (establishmentId: string, reportingYear: number, requireOwnerId?: string) => {
    await assertEstablishmentAccess(establishmentId, requireOwnerId);

    const categories = await EmploymentStat.findAll({
      where: { establishmentId, reportingYear },
      order: [["createdAt", "ASC"]],
    });

    return responseUtilities.handleServicesResponse(
      StatusCodes.OK,
      "Employment statistics fetched successfully",
      withTotals(reportingYear, categories),
    );
  },
);

export const upsertEmploymentStats = errorUtilities.withServiceErrorHandling(
  async (
    establishmentId: string,
    payload: { reportingYear: number; status: string; categories: EmploymentStatInput[] },
    requireOwnerId?: string,
  ) => {
    await assertEstablishmentAccess(establishmentId, requireOwnerId);

    const categories = await database.transaction(async (transaction) => {
      await EmploymentStat.destroy({
        where: { establishmentId, reportingYear: payload.reportingYear },
        transaction,
      });

      if (payload.categories.length === 0) return [];

      return EmploymentStat.bulkCreate(
        payload.categories.map((category) => ({
          ...category,
          establishmentId,
          reportingYear: payload.reportingYear,
          status: payload.status,
        })) as any,
        { transaction },
      );
    });

    return responseUtilities.handleServicesResponse(
      StatusCodes.OK,
      "Employment statistics saved successfully",
      withTotals(payload.reportingYear, categories),
    );
  },
);
