import {
  emailQueueUtilities,
  errorUtilities,
  mailUtilities,
} from "../../utilities";
import { establishmentRepositories } from "../../repositories";
import { v4 as uuidv4 } from "uuid";
import { establishmentHelpers } from "../../helpers";

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
      EstablishmentServiceResponses.SUCCESSFUL_REGISTRATION,
      // { establishment: newEstablishment }
    );
  }
);

export default {
  addEstablishment,
};
