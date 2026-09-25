import errorUtilities from "../../../../configurations/error-handler";
import responseUtilities from "../../../../configurations/response";
import { StatusCodes } from "../../../../configurations/statusCodes";
import { database } from "../../../../configurations/database";
import {
  HospitalityEstablishment,
  RegistrationStatus,
} from "../../../../establishments/HospitalityEstablishment";
import { generateUniqueEstablishmentId } from "../../../../establishments/helpers/unique-business-id.helpers";
import { formatEstablishmentName } from "../../../../establishments/helpers/format-name.helpers";

const BATCH_SIZE = 50;

interface BulkAddResult {
  successful: number;
  failed: number;
  errors: Array<{ index: number; businessName: string; error: string }>;
  establishments: Array<any>;
}

const processBatch = async (
  batch: Array<Record<string, any>>,
  startIndex: number,
  transaction: any,
): Promise<BulkAddResult> => {
  const result: BulkAddResult = {
    successful: 0,
    failed: 0,
    errors: [],
    establishments: [],
  };

  for (let i = 0; i < batch.length; i++) {
    const establishment = batch[i]!;
    const globalIndex = startIndex + i;

    try {
      // Compare against the same normalized form the DB actually stores
      // (businessName is title-cased on write) — an exact-match WHERE clause
      // against the raw, as-typed casing would miss real duplicates.
      const normalizedName = formatEstablishmentName(
        establishment.businessName,
      );

      const existing = await HospitalityEstablishment.findOne({
        where: {
          businessName: normalizedName,
          entityType: establishment.entityType,
          address: establishment.address,
        },
        transaction,
      });

      if (existing) {
        throw errorUtilities.createError(
          `Establishment with business name "${establishment.businessName}" and address "${establishment.address}" already exists`,
          StatusCodes.CONFLICT,
        );
      }

      const uniqueBusinessId = await generateUniqueEstablishmentId(
        establishment.entityType,
        establishment.localGovernment,
        transaction,
      );

      const created = await HospitalityEstablishment.create(
        {
          ...establishment,
          ownerId: null,
          uniqueBusinessId,
          registrationStatus: RegistrationStatus.Pending,
          submittedAt: new Date(),
        } as any,
        { transaction },
      );

      result.establishments.push(created);
      result.successful++;
    } catch (error: any) {
      result.failed++;
      result.errors.push({
        index: globalIndex,
        businessName: establishment?.businessName || "Unknown",
        error: error.message,
      });
    }
  }

  return result;
};

const bulkAddService = errorUtilities.withServiceErrorHandling(
  async (establishments: Record<string, any>[]) => {
    // Unlike the owner's own bulk-create, admin seeding is a mixed batch of
    // pre-existing records — each item is validated (and its uniqueBusinessId
    // generated) against its own entityType, with no shared type to enforce.
    const totalCount = establishments.length;
    const aggregate: BulkAddResult = {
      successful: 0,
      failed: 0,
      errors: [],
      establishments: [],
    };

    const batches: Array<Array<Record<string, any>>> = [];
    for (let i = 0; i < establishments.length; i += BATCH_SIZE) {
      batches.push(establishments.slice(i, i + BATCH_SIZE));
    }

    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex]!;
      const transaction = await database.transaction();

      try {
        const result = await processBatch(
          batch,
          batchIndex * BATCH_SIZE,
          transaction,
        );
        await transaction.commit();

        aggregate.successful += result.successful;
        aggregate.failed += result.failed;
        aggregate.errors.push(...result.errors);
        aggregate.establishments.push(...result.establishments);
      } catch (error: any) {
        await transaction.rollback();
        aggregate.failed += batch.length;
        batch.forEach((item, idx) => {
          aggregate.errors.push({
            index: batchIndex * BATCH_SIZE + idx,
            businessName: item.businessName || "Unknown",
            error: error.message,
          });
        });
      }
    }

    if (aggregate.successful === totalCount) {
      return responseUtilities.handleServicesResponse(
        StatusCodes.CREATED,
        "All establishments registered successfully",
        {
          totalCount,
          successful: aggregate.successful,
          failed: 0,
          establishments: aggregate.establishments,
        },
      );
    }

    if (aggregate.successful > 0) {
      return responseUtilities.handleServicesResponse(
        StatusCodes.PARTIAL_CONTENT,
        `${aggregate.successful} out of ${totalCount} establishments registered successfully`,
        aggregate,
      );
    }

    return responseUtilities.handleServicesResponse(
      StatusCodes.BAD_REQUEST,
      "All registrations failed",
      aggregate,
    );
  },
);

export default bulkAddService;
