import { Request, Response } from "express";
import { establishmentServices } from "../../services";
import { errorUtilities, responseUtilities } from "../../utilities";
import { EstablishmentServiceResponses } from "../../types/responseTypes/establishmentServiceResponses";
import { StatusCodes } from "../../constants";
import QRCode from 'qrcode';

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



const downloadLinkAsQrCode = errorUtilities.withControllerErrorHandling(
    async (request: Request, response: Response) => {
  const url = request.body.url as string;

  if (!url) {
    return response.status(400).send("Missing URL");
  }

  try {
    const qrBuffer = await QRCode.toBuffer(url, { type: 'png' });
    response.setHeader('Content-Type', 'image/png');
    response.setHeader('Content-Disposition', 'attachment; filename="qrcode.png"');

    response.send(qrBuffer);
  } catch (err) {
    console.error(err);
    response.status(500).send("Failed to generate QR code");
  }
});

export default {
  entityRegistrationController,
  sendRegistrationOTPController,
  verifyRegistrationOTPController,
  downloadLinkAsQrCode
};
