import { Request, Response } from "express";
import { establishmentServices } from "../../services";
import { errorUtilities, responseUtilities } from "../../utilities";
import { EstablishmentServiceResponses } from "../../types/responseTypes/establishmentServiceResponses";
import { StatusCodes } from "../../constants";

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

const sendRegistrationOTPController =
  errorUtilities.withControllerErrorHandling(
    async (request: Request, response: Response) => {
      const { businessPhoneNumber } = request.body;
      if (!businessPhoneNumber) {
        return responseUtilities.responseHandler(
          response,
          EstablishmentServiceResponses.BUSINESS_PHONE_NUMBER_REQUIRED,
          StatusCodes.BAD_REQUEST
        );
      }
      const payloadDetails = {
        businessPhoneNumber,
      };
      const sendOtpResponse = await establishmentServices.sendRegistrationOtp(
        payloadDetails
      );

      return responseUtilities.responseHandler(
        response,
        sendOtpResponse.message,
        sendOtpResponse.statusCode,
        sendOtpResponse.data
      );
    }
  );

const verifyRegistrationOTPController =
  errorUtilities.withControllerErrorHandling(
    async (request: Request, response: Response) => {
      const verifyOtpResponse =
        await establishmentServices.verifyRegistrationOtp(request.body);

      return responseUtilities.responseHandler(
        response,
        verifyOtpResponse.message,
        verifyOtpResponse.statusCode,
        verifyOtpResponse.data
      );
    }
  );

export default {
  entityRegistrationController,
  sendRegistrationOTPController,
  verifyRegistrationOTPController,
};
