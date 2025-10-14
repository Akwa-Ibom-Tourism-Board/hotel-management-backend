import { Request, Response } from "express";
import { establishmentServices } from "../../services";
import { errorUtilities, responseUtilities } from "../../utilities";

const entityRegistrationController = errorUtilities.withControllerErrorHandling(
  async (request: Request, response: Response) => {
    const payloadDetails = request.body;

    const registerEstablishment = await establishmentServices.addEstablishment(
      payloadDetails
    );

    return responseUtilities.responseHandler(
      response,
      registerEstablishment.message,
      registerEstablishment.statusCode,
      registerEstablishment.data
    );
  }
);

export default {
  entityRegistrationController,
};
