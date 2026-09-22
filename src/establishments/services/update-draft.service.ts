import errorUtilities from "../../configurations/error-handler";
import responseUtilities from "../../configurations/response";
import { StatusCodes } from "../../configurations/statusCodes";
import { HospitalityEstablishment, RegistrationStatus } from "../HospitalityEstablishment";

const updateDraftService = errorUtilities.withServiceErrorHandling(
  async (id: string, payload: Record<string, any>, ownerId: string) => {
    const draft = await HospitalityEstablishment.findByPk(id);

    if (!draft) {
      throw errorUtilities.createError("Draft not found", StatusCodes.NOT_FOUND);
    }

    if (draft.get("ownerId") !== ownerId) {
      throw errorUtilities.createError(
        "You are not permitted to update this draft",
        StatusCodes.FORBIDDEN,
      );
    }

    if (draft.get("registrationStatus") !== RegistrationStatus.Draft) {
      throw errorUtilities.createError(
        "This establishment is no longer a draft and can't be edited this way",
        StatusCodes.CONFLICT,
      );
    }

    await draft.update(payload);

    return responseUtilities.handleServicesResponse(
      StatusCodes.OK,
      "Draft updated successfully",
      draft,
    );
  },
);

export default updateDraftService;
