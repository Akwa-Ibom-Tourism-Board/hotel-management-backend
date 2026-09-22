import { Op, Transaction } from "sequelize";
import { HospitalityEstablishment, RegistrationStatus } from "../HospitalityEstablishment";

/**
 * Reconciles a parent establishment's branches against an incoming array:
 * items without an id are created, items with a matching id are updated,
 * and existing branch rows absent from the incoming array are deleted
 * (the frontend always sends the full, current branch list, so "missing"
 * means "removed by the owner" rather than "not touched this time").
 */
export const reconcileBranches = async (
  parentId: string,
  parentEntityType: string,
  ownerId: string | null,
  registrationStatus: RegistrationStatus,
  incomingBranches: Array<Record<string, any>>,
  transaction: Transaction,
): Promise<void> => {
  const existingBranches = await HospitalityEstablishment.findAll({
    where: { parentEstablishmentId: parentId },
    transaction,
  });

  const incomingIds = new Set(
    incomingBranches.filter((branch) => branch.id).map((branch) => branch.id),
  );

  const toDelete = existingBranches.filter((branch) => !incomingIds.has(branch.get("id")));
  if (toDelete.length > 0) {
    await HospitalityEstablishment.destroy({
      where: { id: { [Op.in]: toDelete.map((branch) => branch.get("id") as string) } },
      transaction,
    });
  }

  for (const branch of incomingBranches) {
    const { id, ...branchData } = branch;

    if (id) {
      await HospitalityEstablishment.update(branchData, {
        where: { id, parentEstablishmentId: parentId },
        transaction,
      });
    } else {
      await HospitalityEstablishment.create(
        {
          ...branchData,
          entityType: parentEntityType,
          ownerId,
          parentEstablishmentId: parentId,
          registrationStatus,
        } as any,
        { transaction },
      );
    }
  }
};
