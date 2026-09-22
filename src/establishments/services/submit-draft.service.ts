import errorUtilities from "../../configurations/error-handler";
import responseUtilities from "../../configurations/response";
import { StatusCodes } from "../../configurations/statusCodes";
import { database } from "../../configurations/database";
import { HospitalityEstablishment, RegistrationStatus } from "../HospitalityEstablishment";
import { establishmentSchema, pickEstablishmentFields } from "../establishments.schemas";
import { generateUniqueEstablishmentId } from "../helpers/unique-business-id.helpers";
import { reconcileBranches } from "../helpers/reconcile-branches.helpers";

const submitDraftService = errorUtilities.withServiceErrorHandling(
  async (id: string, incomingBody: Record<string, any>, ownerId: string) => {
    const draft = await HospitalityEstablishment.findByPk(id);

    if (!draft) {
      throw errorUtilities.createError("Draft not found", StatusCodes.NOT_FOUND);
    }

    if (draft.get("ownerId") !== ownerId) {
      throw errorUtilities.createError(
        "You are not permitted to submit this draft",
        StatusCodes.FORBIDDEN,
      );
    }

    if (draft.get("registrationStatus") !== RegistrationStatus.Draft) {
      throw errorUtilities.createError(
        "This establishment has already been submitted",
        StatusCodes.CONFLICT,
      );
    }

    const { branches: incomingBranches, ...incomingFields } = incomingBody;
    const merged = pickEstablishmentFields({ ...draft.toJSON(), ...incomingFields }, true);

    const { error, value } = establishmentSchema.validate(merged, {
      abortEarly: false,
    });

    if (error) {
      throw errorUtilities.createError(
        error.details[0]?.message.replace(/["\\]/g, "") ?? "Invalid establishment data",
        StatusCodes.BAD_REQUEST,
        error.details.map((detail) => detail.message.replace(/["\\]/g, "")),
      );
    }

    const { branches: _validatedBranches, ...establishmentFields } = value;

    const submitted = await database.transaction(async (transaction) => {
      const uniqueBusinessId = await generateUniqueEstablishmentId(
        establishmentFields.entityType,
        establishmentFields.localGovernment,
        transaction,
      );

      await draft.update(
        {
          ...establishmentFields,
          uniqueBusinessId,
          registrationStatus: RegistrationStatus.Pending,
          submittedAt: new Date(),
        },
        { transaction },
      );

      if (Array.isArray(incomingBranches)) {
        await reconcileBranches(
          id,
          establishmentFields.entityType,
          ownerId,
          RegistrationStatus.Pending,
          incomingBranches,
          transaction,
        );
      }

      return draft;
    });

    const withBranches = await HospitalityEstablishment.findByPk(submitted.get("id") as string, {
      include: [{ association: "branches" }],
    });

    return responseUtilities.handleServicesResponse(
      StatusCodes.OK,
      "Establishment submitted successfully",
      withBranches,
    );
  },
);

export default submitDraftService;
