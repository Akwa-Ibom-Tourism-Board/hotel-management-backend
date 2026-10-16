import errorUtilities from "../../../configurations/error-handler";
import responseUtilities from "../../../configurations/response";
import { StatusCodes } from "../../../configurations/statusCodes";
import { database } from "../../../configurations/database";
import { AccommodationCategory } from "../../AccommodationCategory";
import { assertEstablishmentAccess, sumField } from "./shared";

export interface AccommodationCategoryInput {
  category: string;
  categoryLabel: string;
  roomCount?: number | null;
  bedCount?: number | null;
}

const withTotals = (categories: AccommodationCategory[]) => ({
  categories,
  totals: {
    roomCount: sumField(categories.map((c) => c.toJSON() as any), "roomCount"),
    bedCount: sumField(categories.map((c) => c.toJSON() as any), "bedCount"),
  },
});

export const getAccommodation = errorUtilities.withServiceErrorHandling(
  async (establishmentId: string, requireOwnerId?: string) => {
    await assertEstablishmentAccess(establishmentId, requireOwnerId);

    const categories = await AccommodationCategory.findAll({
      where: { establishmentId },
      order: [["createdAt", "ASC"]],
    });

    return responseUtilities.handleServicesResponse(
      StatusCodes.OK,
      "Accommodation fetched successfully",
      withTotals(categories),
    );
  },
);

export const upsertAccommodation = errorUtilities.withServiceErrorHandling(
  async (
    establishmentId: string,
    payload: { status: string; categories: AccommodationCategoryInput[] },
    requireOwnerId?: string,
  ) => {
    await assertEstablishmentAccess(establishmentId, requireOwnerId);

    const categories = await database.transaction(async (transaction) => {
      await AccommodationCategory.destroy({ where: { establishmentId }, transaction });

      if (payload.categories.length === 0) return [];

      return AccommodationCategory.bulkCreate(
        payload.categories.map((category) => ({
          ...category,
          establishmentId,
          status: payload.status,
        })) as any,
        { transaction },
      );
    });

    return responseUtilities.handleServicesResponse(
      StatusCodes.OK,
      "Accommodation saved successfully",
      withTotals(categories),
    );
  },
);
