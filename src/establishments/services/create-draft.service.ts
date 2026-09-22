import errorUtilities from "../../configurations/error-handler";
import responseUtilities from "../../configurations/response";
import { StatusCodes } from "../../configurations/statusCodes";
import { HospitalityEstablishment, RegistrationStatus } from "../HospitalityEstablishment";

const createDraftService = errorUtilities.withServiceErrorHandling(
  async (payload: Record<string, any>, ownerId: string) => {
    const draft = await HospitalityEstablishment.create({
      ...payload,
      ownerId,
      registrationStatus: RegistrationStatus.Draft,
    } as any);

    return responseUtilities.handleServicesResponse(
      StatusCodes.CREATED,
      "Draft saved successfully",
      draft,
    );
  },
);

export default createDraftService;
