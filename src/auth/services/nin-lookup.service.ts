import errorUtilities from "../../configurations/error-handler";
import responseUtilities from "../../configurations/response";
import { StatusCodes } from "../../configurations/statusCodes";
import verifyNIN from "../../configurations/nin-provider";
import { parseDateOfBirth } from "../auth.helpers";

const ninLookupService = errorUtilities.withServiceErrorHandling(
  async (nin: string) => {
    const result = await verifyNIN(nin);

    return responseUtilities.handleServicesResponse(
      StatusCodes.OK,
      "NIN verified successfully",
      {
        nin: result.nin,
        firstName: result.firstname,
        lastName: result.lastname,
        dateOfBirth: parseDateOfBirth(result.birthdate) ?? result.birthdate,
        gender: result.gender,
        photo: result.photo,
      },
    );
  },
);

export default ninLookupService;
