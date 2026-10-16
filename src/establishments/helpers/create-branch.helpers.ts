import { Transaction } from "sequelize";
import { HospitalityEstablishment, RegistrationStatus } from "../HospitalityEstablishment";
import { generateUniqueEstablishmentId } from "./unique-business-id.helpers";

/**
 * Creates a single branch row. A branch is its own licensable entity (it's
 * counted separately in analytics and can be approved/rejected independently
 * of its parent), so it gets its own AK-LG-TYPE-0001 id — generated from its
 * own localGovernment but the parent's entityType, since a branch inherits
 * entityType but has its own address/local government. A `-B{seq}` suffix
 * (sequential per parent, zero-padded) is appended so the ID itself visibly
 * marks the row as a branch, e.g. `AK-EKT-HTL-0007-B01` — the actual
 * relational link is still `parentEstablishmentId`; this is just the
 * human-visible signal.
 */
export const createBranchRow = async (
  parentId: string,
  entityType: string,
  ownerId: string | null,
  registrationStatus: RegistrationStatus,
  branchData: Record<string, any>,
  transaction: Transaction,
): Promise<HospitalityEstablishment> => {
  const baseId = await generateUniqueEstablishmentId(
    entityType as any,
    branchData.localGovernment,
    transaction,
  );

  const siblingCount = await HospitalityEstablishment.count({
    where: { parentEstablishmentId: parentId },
    transaction,
  });
  const branchSequence = (siblingCount + 1).toString().padStart(2, "0");
  const uniqueBusinessId = `${baseId}-B${branchSequence}`;

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
