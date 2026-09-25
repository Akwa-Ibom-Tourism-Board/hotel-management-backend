import { Transaction } from "sequelize";
import { HospitalityEstablishment, RegistrationStatus } from "../HospitalityEstablishment";
import { generateUniqueEstablishmentId } from "./unique-business-id.helpers";

/**
 * Creates a single branch row. A branch is its own licensable entity (it's
 * counted separately in analytics and can be approved/rejected independently
 * of its parent), so it gets its own AK-LG-TYPE-0001 id — generated from its
 * own localGovernment but the parent's entityType, since a branch inherits
 * entityType but has its own address/local government.
 */
export const createBranchRow = async (
  parentId: string,
  entityType: string,
  ownerId: string | null,
  registrationStatus: RegistrationStatus,
  branchData: Record<string, any>,
  transaction: Transaction,
): Promise<HospitalityEstablishment> => {
  const uniqueBusinessId = await generateUniqueEstablishmentId(
    entityType as any,
    branchData.localGovernment,
    transaction,
  );

  return HospitalityEstablishment.create(
    {
      ...branchData,
      entityType,
      ownerId,
      uniqueBusinessId,
      parentEstablishmentId: parentId,
      registrationStatus,
    } as any,
    { transaction },
  );
};
