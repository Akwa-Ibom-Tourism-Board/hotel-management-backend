import {
  emailQueueUtilities,
  errorUtilities,
  mailUtilities,
  otpTemplates,
  termiiSms,
} from "../../utilities";
import { establishmentRepositories, otpRepositories } from "../../repositories";
import { v4 as uuidv4 } from "uuid";
import { establishmentHelpers, generalHelpers } from "../../helpers";

import handleServicesResponse from "../../utilities/responseHandlers/response.utilities";
import { EstablishmentEmailConstants, StatusCodes } from "../../constants";
import { EstablishmentServiceResponses } from "../../types/responseTypes/establishmentServiceResponses";

const addEstablishment = errorUtilities.withServiceErrorHandling(
  async (
    establishmentPayload: Record<string, any>
  ): Promise<Record<string, any>> => {
    const { entityType, localGovernment, contactEmail, businessEmail } =
      establishmentPayload;

    const uniqueBusinessId =
      await establishmentHelpers.generateUniqueEstablishmentId(
        entityType,
        localGovernment
      );

    const newEstablishment = await establishmentRepositories.create({
      ...establishmentPayload,
      uniqueBusinessId,
    });

    if (contactEmail || businessEmail) {
      const emailSubject =
        EstablishmentEmailConstants.MailSubjects.REGISTRATION_SUCCESS;
      const emailBody =
        EstablishmentEmailConstants.generateMessages().REGISTRATION_SUCCESS(
          establishmentPayload.businessName,
          uniqueBusinessId
        );

      if (contactEmail) {
        await emailQueueUtilities.addEmailToQueue({
          to: contactEmail,
          subject: emailSubject,
          body: emailBody,
        });
      }

      if (businessEmail) {
        await emailQueueUtilities.addEmailToQueue({
          to: businessEmail,
          subject: emailSubject,
          body: emailBody,
        });
      }
    }

    return handleServicesResponse.handleServicesResponse(
      StatusCodes.CREATED,
      EstablishmentServiceResponses.SUCCESSFUL_REGISTRATION
      // { establishment: newEstablishment }
    );
  }
);

const sendRegistrationOtp = errorUtilities.withServiceErrorHandling(
  async (
    establishmentPayload: Record<string, any>
  ): Promise<Record<string, any>> => {
    const { businessPhoneNumber } = establishmentPayload;

    const existingOtp = await otpRepositories.getOne({
      businessPhoneNumber,
      verify: false,
    });

    if (existingOtp) {
      const timeSinceCreation =
        (Date.now() - (existingOtp.createdAt?.getTime() || 0)) / 1000 / 60;
      if (timeSinceCreation < 10) {
        throw errorUtilities.createError(
          EstablishmentServiceResponses.OTP_ALREADY_SENT,
          StatusCodes.TOO_MANY_REQUESTS
        );
      } else {
        const otp = generalHelpers.generateNumericOtp(6);

        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

        console.log("here", otp, expiresAt);

        const hashedOtp = await generalHelpers.hashData(otp);

        await otpRepositories.handleUpdates(
          {
            otp: hashedOtp,
            expiry: expiresAt,
          },
          {
            where: { businessPhoneNumber },
          }
        );

        const otpMessage = otpTemplates.registrationOtp(otp);

        const smsResponse = await termiiSms.sendTermiiSms(
          businessPhoneNumber,
          otpMessage
        );

        return handleServicesResponse.handleServicesResponse(
          StatusCodes.OK,
          EstablishmentServiceResponses.SUCCESSFUL_OTP_SENT,
          { smsResponse }
        );
      }
    }

    const otp = generalHelpers.generateNumericOtp(6);

    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    console.log("here22", otp, expiresAt);

    const hashedOtp = await generalHelpers.hashData(otp);

    const otpRecord = await otpRepositories.create({
      id: uuidv4(),
      otp: hashedOtp,
      expiry: expiresAt,
      businessPhoneNumber,
      verify: false,
    });

    const otpMessage = otpTemplates.registrationOtp(otp);

    const smsResponse = await termiiSms.sendTermiiSms(
      businessPhoneNumber,
      otpMessage
    );

    return handleServicesResponse.handleServicesResponse(
      StatusCodes.OK,
      EstablishmentServiceResponses.SUCCESSFUL_OTP_SENT,
      { smsResponse }
    );
  }
);

const verifyRegistrationOtp = errorUtilities.withServiceErrorHandling(
  async (
    establishmentPayload: Record<string, any>
  ): Promise<Record<string, any>> => {
    const { businessPhoneNumber, otp } = establishmentPayload;
    const otpRecord = await otpRepositories.getOne({
      businessPhoneNumber,
      verify: false,
    });

    if (!otpRecord) {
      throw errorUtilities.createError(
        "No OTP found for the provided phone number, please request another OTP",
        404
      );
    }

    const isOtpValid = await generalHelpers.verifyOtp(otp, otpRecord.otp);

    if (!isOtpValid) {
      throw errorUtilities.createError(
        "Invalid OTP provided.",
        StatusCodes.UNAUTHORIZED
      );
    }

    const currentTime = new Date();

    if (otpRecord.expiry && currentTime > otpRecord.expiry) {
      throw errorUtilities.createError(
        "OTP has expired. Please request a new one.",
        StatusCodes.GONE
      );
    }

    await otpRepositories.handleUpdates(
      { verify: true },
      { where: { id: otpRecord.id } }
    );

    return handleServicesResponse.handleServicesResponse(
      StatusCodes.OK,
      "OTP verified successfully"
    );
  }
);



export default {
  addEstablishment,
  sendRegistrationOtp,
  verifyRegistrationOtp,
};
