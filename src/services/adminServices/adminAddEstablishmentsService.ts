import { Transaction } from "sequelize";
import { database } from "../../configurations/database";
import { EstablishmentEmailConstants, StatusCodes } from "../../constants";
import { establishmentHelpers } from "../../helpers";
import { establishmentRepositories } from "../../repositories";
import { emailQueueUtilities, errorUtilities } from "../../utilities";
import handleServicesResponse from "../../utilities/responseHandlers/response.utilities";
import HospitalityEstablishment from "../../models/hospitalityEstablishments/hospitalityEstablishments";

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
  startIndex: number = 0
): Promise<BulkRegistrationResult> => {
  const result: BulkRegistrationResult = {
    successful: 0,
    failed: 0,
    errors: [],
    establishments: [],
  };


  for (let i = 0; i < batch.length; i++) {
    const establishment = batch[i];
    const globalIndex = startIndex + i;

    try {
      if (!establishment) {
        throw errorUtilities.createError(
          "Establishment data is required",
          StatusCodes.BAD_REQUEST
        );
      }


      // Check if establishment with same business name and email already exists
      const existingEstablishment = await HospitalityEstablishment.findOne({
        where: {
          businessName: establishment.businessName,
          entityType: establishment.entityType,
          address: establishment.address
        }
      });


      if (existingEstablishment) {
        throw errorUtilities.createError(
          `Establishment with business name "${establishment.businessName}" and email "${establishment.contactEmail}" already exists`,
          StatusCodes.CONFLICT
        );
      }


      const uniqueBusinessId =
        await establishmentHelpers.generateUniqueEstablishmentId(
          establishment.entityType,
          establishment.localGovernment
        );

      // Create establishment
      const newEstablishment = await establishmentRepositories.create(
        {
          ...establishment,
          uniqueBusinessId,
        },
        transaction
      );
      result.establishments.push(newEstablishment);
      result.successful++;
      // Queue emails (non-blocking - will be sent asynchronously)
      // if (establishment.contactEmail || establishment.businessEmail) {
      //   const emailSubject =
      //     EstablishmentEmailConstants.MailSubjects.REGISTRATION_SUCCESS;
      //   const emailBody =
      //     EstablishmentEmailConstants.generateMessages().REGISTRATION_SUCCESS(
      //       establishment.businessName,
      //       uniqueBusinessId
      //     );

      //   if (establishment.contactEmail) {
      //     await emailQueueUtilities.addEmailToQueue({
      //       to: establishment.contactEmail,
      //       subject: emailSubject,
      //       body: emailBody,
      //     });
      //   }

      //   if (
      //     establishment.businessEmail &&
      //     establishment.businessEmail !== establishment.contactEmail
      //   ) {
      //     await emailQueueUtilities.addEmailToQueue({
      //       to: establishment.businessEmail,
      //       subject: emailSubject,
      //       body: emailBody,
      //     });
      //   }
      // }
    } catch (error: any) {
      result.failed++;
      result.errors.push({
        index: globalIndex,
        businessName: establishment?.businessName || "Unknown",
        error: error.message,
      });
      
      // Re-throw the error if we're in a single transaction mode (totalCount <= BATCH_SIZE)
      // This will cause the entire batch to rollback
      throw error;
    }
  }

  return result;
};

/**
 * Main service function for adding establishments (supports both single and bulk)
 */
const addEstablishmentsService = errorUtilities.withServiceErrorHandling(
  async (payload: any): Promise<Record<string, any>> => {
    // Check if it's a single establishment or bulk
    let establishmentsArray: Array<Record<string, any>>;
    
    if (Array.isArray(payload)) {
      // Direct array of establishments
      establishmentsArray = payload;
    } else if (payload.establishments && Array.isArray(payload.establishments)) {
      // Object with establishments property
      establishmentsArray = payload.establishments;
    } else {
      // Single establishment object
      establishmentsArray = [payload];
    }

    if (establishmentsArray.length === 0) {
      throw errorUtilities.createError(
        "Establishment data is required",
        StatusCodes.BAD_REQUEST
      );
    }

    const totalCount = establishmentsArray.length;
    
    // Handle single establishment case
    if (totalCount === 1) {
      const transaction: any = await database.transaction();
      let committed = false;
      
      try {
        const result = await processBatch(establishmentsArray, 0, transaction, 0);
        
        await transaction.commit();
        committed = true;
        
        return handleServicesResponse.handleServicesResponse(
          StatusCodes.CREATED,
          "Establishment registered successfully",
          {
            establishment: result.establishments[0],
            uniqueBusinessId: result.establishments[0].uniqueBusinessId
          }
        );
      } catch (error: any) {
        if (!committed && transaction.finished !== 'rollback') {
          await transaction.rollback();
        }
        throw error;
      }
    }

    // Handle bulk establishments
    const aggregateResult: BulkRegistrationResult = {
      successful: 0,
      failed: 0,
      errors: [],
      establishments: [],
    };

    // If less than or equal to BATCH_SIZE, process in a single transaction
    if (totalCount <= BATCH_SIZE) {
      const transaction: any = await database.transaction();
      let committed = false;
      try {
        const result = await processBatch(establishmentsArray, 0, transaction, 0);
        // If we get here, all establishments were successful
        await transaction.commit();
        committed = true;
        Object.assign(aggregateResult, result);
        
        return handleServicesResponse.handleServicesResponse(
          StatusCodes.CREATED,
          "All establishments registered successfully",
          {
            totalCount,
            successful: aggregateResult.successful,
            failed: 0,
            establishments: aggregateResult.establishments
          }
        );
      } catch (error: any) {
        if (!committed && transaction.finished !== 'rollback') {
          await transaction.rollback();
        }
        
        // Return error response for the failed batch
        return handleServicesResponse.handleServicesResponse(
          StatusCodes.BAD_REQUEST,
          "Registration failed. All changes rolled back.",
          {
            totalCount,
            successful: 0,
            failed: totalCount,
            errors: [{
              index: 0,
              businessName: establishmentsArray[0]?.businessName || "Unknown",
              error: error.message
            }]
          }
        );
      }
    } else {
      // For large batches, process in chunks
      const batches: any[] = [];
      for (let i = 0; i < establishmentsArray.length; i += BATCH_SIZE) {
        batches.push(establishmentsArray.slice(i, i + BATCH_SIZE));
      }

      // Process each batch in its own transaction
      for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
        const transaction: any = await database.transaction();
        let committed = false;

        try {
          // For batch processing, we need to handle errors differently
          // We'll collect results but not throw on individual failures
          const batchResult: BulkRegistrationResult = {
            successful: 0,
            failed: 0,
            errors: [],
            establishments: [],
          };

          // Process each establishment in the batch
          for (let i = 0; i < batches[batchIndex].length; i++) {
            const establishment = batches[batchIndex][i];
            const globalIndex = batchIndex * BATCH_SIZE + i;

            try {
              if (!establishment) {
                throw errorUtilities.createError(
                  "Establishment data is required",
                  StatusCodes.BAD_REQUEST
                );
              }

              // Check if establishment already exists
              const existingEstablishment = await HospitalityEstablishment.findOne({
                where: {
                  businessName: establishment.businessName,
                  contactEmail: establishment.contactEmail
                }
              });

              if (existingEstablishment) {
                throw errorUtilities.createError(
                  `Establishment with business name "${establishment.businessName}" and email "${establishment.contactEmail}" already exists`,
                  StatusCodes.CONFLICT
                );
              }

              const uniqueBusinessId =
                await establishmentHelpers.generateUniqueEstablishmentId(
                  establishment.entityType,
                  establishment.localGovernment
                );

              // Create establishment
              const newEstablishment = await establishmentRepositories.create(
                {
                  ...establishment,
                  uniqueBusinessId,
                },
                transaction
              );

              batchResult.establishments.push(newEstablishment);
              batchResult.successful++;
            } catch (error: any) {
              batchResult.failed++;
              batchResult.errors.push({
                index: globalIndex,
                businessName: establishment?.businessName || "Unknown",
                error: error.message,
              });
            }
          }

          // Commit the transaction if there were any successful creations
          if (batchResult.successful > 0) {
            await transaction.commit();
            committed = true;
          } else {
            await transaction.rollback();
            committed = true;
          }

          aggregateResult.successful += batchResult.successful;
          aggregateResult.failed += batchResult.failed;
          aggregateResult.errors.push(...batchResult.errors);
          aggregateResult.establishments.push(...batchResult.establishments);
        } catch (error: any) {
          if (!committed && transaction.finished !== 'rollback') {
            await transaction.rollback();
          }

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
        "All establishments registered successfully",
        {
          totalCount,
          successful: aggregateResult.successful,
          failed: 0,
          establishments: aggregateResult.establishments
        }
      );
    } else if (aggregateResult.successful > 0) {
      return handleServicesResponse.handleServicesResponse(
        StatusCodes.PARTIAL_CONTENT,
        `${aggregateResult.successful} out of ${totalCount} establishments registered successfully`,
        {
          totalCount,
          successful: aggregateResult.successful,
          failed: aggregateResult.failed,
          errors: aggregateResult.errors,
          establishments: aggregateResult.establishments
        }
      );
    } else {
      return handleServicesResponse.handleServicesResponse(
        StatusCodes.BAD_REQUEST,
        "All registrations failed",
        {
          totalCount,
          successful: 0,
          failed: aggregateResult.failed,
          errors: aggregateResult.errors,
        }
      );
    }
  }
);

export default addEstablishmentsService;