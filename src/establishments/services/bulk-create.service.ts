import errorUtilities from "../../configurations/error-handler";
import responseUtilities from "../../configurations/response";
import { StatusCodes } from "../../configurations/statusCodes";
import { database } from "../../configurations/database";
import { HospitalityEstablishment, RegistrationStatus } from "../HospitalityEstablishment";
import { generateUniqueEstablishmentId } from "../helpers/unique-business-id.helpers";
import { createBranchRow } from "../helpers/create-branch.helpers";
import { BranchInput } from "./create.service";

const bulkCreateService = errorUtilities.withServiceErrorHandling(
  async (entityType: string, establishments: Record<string, any>[], ownerId: string) => {
    const mismatched = establishments.some((item) => item.entityType !== entityType);
    if (mismatched) {
      throw errorUtilities.createError(
        "Every establishment in a batch must share the same entity type",
        StatusCodes.BAD_REQUEST,
      );
    }

    const createdIds = await database.transaction(async (transaction) => {
      const ids: string[] = [];

      for (const item of establishments) {
        const { branches, ...establishmentPayload } = item;

        const uniqueBusinessId = await generateUniqueEstablishmentId(
          establishmentPayload.entityType,
          establishmentPayload.localGovernment,
          transaction,
        );

        const created = await HospitalityEstablishment.create(
          {
            ...establishmentPayload,
            ownerId,
            uniqueBusinessId,
            registrationStatus: RegistrationStatus.Pending,
            submittedAt: new Date(),
          } as any,
          { transaction },
        );

        if (Array.isArray(branches) && branches.length > 0) {
          for (const branch of branches as BranchInput[]) {
            await createBranchRow(
              created.get("id") as string,
              establishmentPayload.entityType,
              ownerId,
              RegistrationStatus.Pending,
              branch,
              transaction,
            );
          }
        }

        ids.push(created.get("id") as string);
      }

      return ids;
    });

    const created = await HospitalityEstablishment.findAll({
      where: { id: createdIds },
      include: [{ association: "branches" }],
    });

    return responseUtilities.handleServicesResponse(
      StatusCodes.CREATED,
      `${created.length} establishments registered successfully`,
      created,
    );
  },
);

export default bulkCreateService;
