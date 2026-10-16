import errorUtilities from "../../../configurations/error-handler";
import { StatusCodes } from "../../../configurations/statusCodes";
import { HospitalityEstablishment } from "../../HospitalityEstablishment";

/**
 * Confirms an establishment exists (and, for owner-facing routes, that the
 * caller owns it) before any section read/write — shared by every section
 * service so owner and admin controllers can call the exact same function,
 * the owner controller just also passes `requireOwnerId`.
 */
export const assertEstablishmentAccess = async (
  establishmentId: string,
  requireOwnerId?: string,
): Promise<HospitalityEstablishment> => {
  const establishment = await HospitalityEstablishment.findByPk(establishmentId);

  if (!establishment) {
    throw errorUtilities.createError("Establishment not found", StatusCodes.NOT_FOUND);
  }

  if (requireOwnerId && establishment.get("ownerId") !== requireOwnerId) {
    throw errorUtilities.createError(
      "You are not permitted to access this establishment",
      StatusCodes.FORBIDDEN,
    );
  }

  return establishment;
};

/** Sums a list of nullable numeric fields, treating null/undefined as 0. */
export const sumField = <T extends Record<string, any>>(rows: T[], field: keyof T): number =>
  rows.reduce((total, row) => total + (Number(row[field]) || 0), 0);
