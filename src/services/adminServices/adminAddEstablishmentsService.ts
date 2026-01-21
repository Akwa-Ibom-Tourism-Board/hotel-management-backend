import { Transaction } from "sequelize";
import { database } from "../../configurations/database";
import { EstablishmentEmailConstants, StatusCodes } from "../../constants";
import { establishmentHelpers } from "../../helpers";
import { establishmentRepositories } from "../../repositories";
import { EstablishmentServiceResponses } from "../../types/responseTypes/establishmentServiceResponses";
import { emailQueueUtilities, errorUtilities } from "../../utilities";
import handleServicesResponse from "../../utilities/responseHandlers/response.utilities";

const BATCH_SIZE = 50;

interface BulkRegistrationResult {
  successful: number;
  failed: number;
  errors: Array<{ index: number; businessName: string; error: string }>;
  establishments: Array<any>;
}

/**
 * Process establishments in batches to avoid overwhelming the database
 */
const processBatch = async (
  batch: Array<Record<string, any>>,
  batchIndex: number,
  transaction: Transaction,
): Promise<BulkRegistrationResult> => {
  const result: BulkRegistrationResult = {
    successful: 0,
    failed: 0,
    errors: [],
    establishments: [],
  };

  for (let i = 0; i < batch.length; i++) {
    const establishment = batch[i];
    const globalIndex = batchIndex * BATCH_SIZE + i;

    try {
      if (!establishment) {
        throw errorUtilities.createError(
          "Establishment data is required",
          StatusCodes.BAD_REQUEST,
        );
      }
      const uniqueBusinessId =
        await establishmentHelpers.generateUniqueEstablishmentId(
          establishment.entityType,
          establishment.localGovernment,
        );

      // Create establishment
      const newEstablishment = await establishmentRepositories.create(
        {
          ...establishment,
          uniqueBusinessId,
        },
        transaction,
      );

      result.establishments.push(newEstablishment);
      result.successful++;

      // Queue emails (non-blocking - will be sent asynchronously)
      if (establishment.contactEmail || establishment.businessEmail) {
        const emailSubject =
          EstablishmentEmailConstants.MailSubjects.REGISTRATION_SUCCESS;
        const emailBody =
          EstablishmentEmailConstants.generateMessages().REGISTRATION_SUCCESS(
            establishment.businessName,
            uniqueBusinessId,
          );

        if (establishment.contactEmail) {
          await emailQueueUtilities.addEmailToQueue({
            to: establishment.contactEmail,
            subject: emailSubject,
            body: emailBody,
          });
        }

        if (
          establishment.businessEmail &&
          establishment.businessEmail !== establishment.contactEmail
        ) {
          await emailQueueUtilities.addEmailToQueue({
            to: establishment.businessEmail,
            subject: emailSubject,
            body: emailBody,
          });
        }
      }
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

/**
 * Bulk registration service for adding multiple establishments
 */
const bulkAddEstablishmentsService = errorUtilities.withServiceErrorHandling(
  async (
    establishmentsPayload: Array<Record<string, any>>,
  ): Promise<Record<string, any>> => {
    console.log(
      "Starting bulk establishment registration...",
      establishmentsPayload,
    );
    if (
      !Array.isArray(establishmentsPayload) ||
      establishmentsPayload.length === 0
    ) {
      throw errorUtilities.createError(
        "Establishment data is required",
        StatusCodes.BAD_REQUEST,
      );
    }

    const totalCount = establishmentsPayload.length;
    const aggregateResult: BulkRegistrationResult = {
      successful: 0,
      failed: 0,
      errors: [],
      establishments: [],
    };

    // If less than or equal to BATCH_SIZE, process in a single transaction
    if (totalCount <= BATCH_SIZE) {
      const transaction = await database.transaction();

      try {
        const result = await processBatch(
          establishmentsPayload,
          0,
          transaction,
        );

        if (result.failed > 0) {
          // If any failed, rollback the entire batch
          await transaction.rollback();
          throw errorUtilities.createError(
            "Some registrations failed. All changes rolled back.",
            StatusCodes.BAD_REQUEST,
            {
              totalCount,
              successful: 0,
              failed: totalCount,
              errors: result.errors,
            },
          );
        }

        // All successful, commit
        await transaction.commit();
        Object.assign(aggregateResult, result);
      } catch (error: any) {
        await transaction.rollback();
        throw error;
      }
    } else {
      // For large batches, process in chunks
      const batches: any[] = [];
      for (let i = 0; i < establishmentsPayload.length; i += BATCH_SIZE) {
        batches.push(establishmentsPayload.slice(i, i + BATCH_SIZE));
      }

      // Process each batch in its own transaction
      for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
        const transaction = await database.transaction();

        try {
          const batchResult = await processBatch(
            batches[batchIndex],
            batchIndex,
            transaction,
          );

          // For batch processing, we commit successful ones even if some fail
          await transaction.commit();

          aggregateResult.successful += batchResult.successful;
          aggregateResult.failed += batchResult.failed;
          aggregateResult.errors.push(...batchResult.errors);
          aggregateResult.establishments.push(...batchResult.establishments);
        } catch (error: any) {
          await transaction.rollback();

          // Mark entire batch as failed
          const batchSize = batches[batchIndex].length;
          aggregateResult.failed += batchSize;

          batches[batchIndex].forEach((est: any, idx: number) => {
            aggregateResult.errors.push({
              index: batchIndex * BATCH_SIZE + idx,
              businessName: est.businessName || "Unknown",
              error: error.message,
            });
          });
        }
      }
    }

    // Determine response based on results
    if (aggregateResult.successful === totalCount) {
      return handleServicesResponse.handleServicesResponse(
        StatusCodes.CREATED,
        // EstablishmentServiceResponses.BULK_REGISTRATION_SUCCESS,
        "Process Successful",
        {
          totalCount,
          successful: aggregateResult.successful,
          failed: 0,
        },
      );
    } else if (aggregateResult.successful > 0) {
      return handleServicesResponse.handleServicesResponse(
        StatusCodes.PARTIAL_CONTENT,
        // EstablishmentServiceResponses.BULK_REGISTRATION_PARTIAL,
        "Process Partially Successful",
        {
          totalCount,
          successful: aggregateResult.successful,
          failed: aggregateResult.failed,
          errors: aggregateResult.errors,
        },
      );
    } else {
      return handleServicesResponse.handleServicesResponse(
        StatusCodes.BAD_REQUEST,
        // EstablishmentServiceResponses.BULK_REGISTRATION_FAILED,
        "Process Failed",
        {
          totalCount,
          successful: 0,
          failed: aggregateResult.failed,
          errors: aggregateResult.errors,
        },
      );
    }
  },
);

export default bulkAddEstablishmentsService;
