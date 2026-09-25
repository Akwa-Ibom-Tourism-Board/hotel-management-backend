import errorUtilities from "../../configurations/error-handler";
import responseUtilities from "../../configurations/response";
import { StatusCodes } from "../../configurations/statusCodes";
import { database } from "../../configurations/database";
import { HospitalityEstablishment, RegistrationStatus } from "../HospitalityEstablishment";
import { generateUniqueEstablishmentId } from "../helpers/unique-business-id.helpers";
import { createBranchRow } from "../helpers/create-branch.helpers";

export interface BranchInput {
  businessName?: string;
  address: string;
  localGovernment: string;
  businessPhoneNumber: string;
  contactName: string;
  contactPhoneNumber: string;
  contactEmail: string;
}

const createService = errorUtilities.withServiceErrorHandling(
  async (payload: Record<string, any>, ownerId: string) => {
    const { branches, ...establishmentPayload } = payload;

    const establishment = await database.transaction(async (transaction) => {
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

      return created;
    });

    const withBranches = await HospitalityEstablishment.findByPk(establishment.get("id") as string, {
      include: [{ association: "branches" }],
    });

    return responseUtilities.handleServicesResponse(
      StatusCodes.CREATED,
      "Establishment registered successfully",
      withBranches,
    );
  },
);

export default createService;
