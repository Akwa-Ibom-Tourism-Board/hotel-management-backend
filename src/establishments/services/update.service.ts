import Joi from "joi";
import errorUtilities from "../../configurations/error-handler";
import responseUtilities from "../../configurations/response";
import { StatusCodes } from "../../configurations/statusCodes";
import { database } from "../../configurations/database";
import { HospitalityEstablishment } from "../HospitalityEstablishment";
import { establishmentSchema, pickEstablishmentFields } from "../establishments.schemas";
import { reconcileBranches } from "../helpers/reconcile-branches.helpers";

// Same field-level rules as establishmentSchema, but every field optional —
// "full validation of whatever fields are present", not a required-fields check.
const partialEstablishmentSchema = establishmentSchema.fork(
  Object.keys(establishmentSchema.describe().keys ?? {}),
  (schema) => schema.optional(),
);

const updateService = errorUtilities.withServiceErrorHandling(
  async (id: string, body: Record<string, any>, userId: string) => {
    const establishment = await HospitalityEstablishment.findByPk(id);

    if (!establishment) {
      throw errorUtilities.createError("Establishment not found", StatusCodes.NOT_FOUND);
    }

    const currentOwnerId = establishment.get("ownerId");
    if (currentOwnerId !== null && currentOwnerId !== userId) {
      throw errorUtilities.createError(
        "This establishment has already been added to an account. If it belongs to you, please reach out to the Akwa Ibom State Hotels and Tourism Development Commission for assistance.",
        StatusCodes.FORBIDDEN,
      );
    }

    const { branches: incomingBranches, ...incomingFields } = body;
    const filteredFields = pickEstablishmentFields(incomingFields);

    const { error, value } = partialEstablishmentSchema.validate(filteredFields, {
      abortEarly: false,
    });

    if (error) {
      throw errorUtilities.createError(
        error.details[0]?.message.replace(/["\\]/g, "") ?? "Invalid establishment data",
        StatusCodes.BAD_REQUEST,
        error.details.map((detail: Joi.ValidationErrorItem) => detail.message.replace(/["\\]/g, "")),
      );
    }

    const updated = await database.transaction(async (transaction) => {
      await establishment.update(
        { ...value, ownerId: currentOwnerId === null ? userId : currentOwnerId },
        { transaction },
      );

      if (Array.isArray(incomingBranches)) {
        await reconcileBranches(
          id,
          establishment.get("entityType") as string,
          establishment.get("ownerId") as string,
          establishment.get("registrationStatus") as any,
          incomingBranches,
          transaction,
        );
      }

      return establishment;
    });

    const withBranches = await HospitalityEstablishment.findByPk(updated.get("id") as string, {
      include: [{ association: "branches" }],
    });

    return responseUtilities.handleServicesResponse(
      StatusCodes.OK,
      "Establishment updated successfully",
      withBranches,
    );
  },
);

export default updateService;
