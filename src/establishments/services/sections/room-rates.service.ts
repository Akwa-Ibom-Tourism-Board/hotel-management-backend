import errorUtilities from "../../../configurations/error-handler";
import responseUtilities from "../../../configurations/response";
import { StatusCodes } from "../../../configurations/statusCodes";
import { AccommodationCategory } from "../../AccommodationCategory";
import { RoomRate } from "../../RoomRate";
import { assertEstablishmentAccess } from "./shared";

export interface RoomRateInput {
  accommodationCategoryId: string;
  rate?: number | null;
}

/**
 * Room categories belong to the Accommodation section, not to this one —
 * this always reads the establishment's current category list fresh and
 * merges in whatever rate (if any) exists for the requested year, so a
 * category added/removed in Accommodation is reflected here immediately
 * without any syncing step.
 */
export const getRoomRates = errorUtilities.withServiceErrorHandling(
  async (establishmentId: string, reportingYear: number, requireOwnerId?: string) => {
    await assertEstablishmentAccess(establishmentId, requireOwnerId);

    const categories = await AccommodationCategory.findAll({
      where: { establishmentId },
      order: [["createdAt", "ASC"]],
    });

    const rates = await RoomRate.findAll({
      where: { establishmentId, reportingYear },
    });
    const rateByCategory = new Map(rates.map((rate) => [rate.get("accommodationCategoryId") as string, rate]));

    const merged = categories.map((category) => {
      const categoryJson = category.toJSON() as any;
      const rateRow = rateByCategory.get(categoryJson.id);
      const rateJson = rateRow?.toJSON() as any;
      return {
        accommodationCategoryId: categoryJson.id,
        category: categoryJson.category,
        categoryLabel: categoryJson.categoryLabel,
        rate: rateJson?.rate ?? null,
        status: rateJson?.status ?? "draft",
      };
    });

    return responseUtilities.handleServicesResponse(StatusCodes.OK, "Room rates fetched successfully", {
      reportingYear,
      hasRoomTypes: categories.length > 0,
      categories: merged,
    });
  },
);

export const upsertRoomRates = errorUtilities.withServiceErrorHandling(
  async (
    establishmentId: string,
    payload: { reportingYear: number; status: string; rates: RoomRateInput[] },
    requireOwnerId?: string,
  ) => {
    await assertEstablishmentAccess(establishmentId, requireOwnerId);

    // Only rate categories that actually belong to this establishment —
    // accommodationCategoryId is client-supplied, so this is a real
    // authorization boundary, not just data hygiene.
    const validCategoryIds = new Set(
      (
        await AccommodationCategory.findAll({
          where: { establishmentId },
          attributes: ["id"],
        })
      ).map((row) => row.get("id") as string),
    );

    const toSave = payload.rates.filter((rate) => validCategoryIds.has(rate.accommodationCategoryId));

    await Promise.all(
      toSave.map(async (rateInput) => {
        const [row] = await RoomRate.findOrCreate({
          where: { accommodationCategoryId: rateInput.accommodationCategoryId, reportingYear: payload.reportingYear },
          defaults: {
            establishmentId,
            accommodationCategoryId: rateInput.accommodationCategoryId,
            reportingYear: payload.reportingYear,
          } as any,
        });
        await row.update({ rate: rateInput.rate ?? null, status: payload.status });
      }),
    );

    return getRoomRates(establishmentId, payload.reportingYear, requireOwnerId);
  },
);
