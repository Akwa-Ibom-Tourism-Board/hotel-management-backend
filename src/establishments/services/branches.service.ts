import errorUtilities from "../../configurations/error-handler";
import responseUtilities from "../../configurations/response";
import { StatusCodes } from "../../configurations/statusCodes";
import { HospitalityEstablishment } from "../HospitalityEstablishment";
import { BranchInput } from "./create.service";

const assertOwnedByCaller = (establishment: HospitalityEstablishment, userId: string) => {
  if (establishment.get("ownerId") !== userId) {
    throw errorUtilities.createError(
      "You are not permitted to modify this establishment",
      StatusCodes.FORBIDDEN,
    );
  }
};

export const addBranchService = errorUtilities.withServiceErrorHandling(
  async (parentId: string, payload: BranchInput, userId: string) => {
    const parent = await HospitalityEstablishment.findByPk(parentId);

    if (!parent) {
      throw errorUtilities.createError("Establishment not found", StatusCodes.NOT_FOUND);
    }

    assertOwnedByCaller(parent, userId);

    const branch = await HospitalityEstablishment.create({
      ...payload,
      entityType: parent.get("entityType"),
      ownerId: parent.get("ownerId"),
      parentEstablishmentId: parent.get("id"),
      registrationStatus: parent.get("registrationStatus"),
    } as any);

    return responseUtilities.handleServicesResponse(
      StatusCodes.CREATED,
      "Branch added successfully",
      branch,
    );
  },
);

const findBranchOwnedByCaller = async (branchId: string, userId: string) => {
  const branch = await HospitalityEstablishment.findByPk(branchId);

  if (!branch || !branch.get("parentEstablishmentId")) {
    throw errorUtilities.createError("Branch not found", StatusCodes.NOT_FOUND);
  }

  assertOwnedByCaller(branch, userId);
  return branch;
};

export const updateBranchService = errorUtilities.withServiceErrorHandling(
  async (branchId: string, payload: Record<string, any>, userId: string) => {
    const branch = await findBranchOwnedByCaller(branchId, userId);
    await branch.update(payload);

    return responseUtilities.handleServicesResponse(
      StatusCodes.OK,
      "Branch updated successfully",
      branch,
    );
  },
);

export const deleteBranchService = errorUtilities.withServiceErrorHandling(
  async (branchId: string, userId: string) => {
    const branch = await findBranchOwnedByCaller(branchId, userId);
    await branch.destroy();

    return responseUtilities.handleServicesResponse(StatusCodes.OK, "Branch deleted successfully");
  },
);
