import errorUtilities from "../../configurations/error-handler";
import responseUtilities from "../../configurations/response";
import { StatusCodes } from "../../configurations/statusCodes";
import { HospitalityEstablishment, RegistrationStatus } from "../HospitalityEstablishment";

const bulkCreateDraftService = errorUtilities.withServiceErrorHandling(
  async (establishments: Record<string, any>[], ownerId: string) => {
    const drafts = await HospitalityEstablishment.bulkCreate(
      establishments.map((item) => ({
        ...item,
        ownerId,
        registrationStatus: RegistrationStatus.Draft,
      })) as any,
    );

    return responseUtilities.handleServicesResponse(
      StatusCodes.CREATED,
      `${drafts.length} drafts saved successfully`,
      drafts,
    );
  },
);

export default bulkCreateDraftService;
