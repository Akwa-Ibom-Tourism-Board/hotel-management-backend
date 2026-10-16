import { Request, Response } from "express";
import errorUtilities from "../../../../configurations/error-handler";
import responseUtilities from "../../../../configurations/response";
import sendWelcomeEmailService from "../services/send-welcome-email.service";

const sendWelcomeEmail = errorUtilities.withControllerErrorHandling(
  async (request: Request, response: Response) => {
    const result = await sendWelcomeEmailService(request.params.id!);

    return responseUtilities.responseHandler(
      response,
      result.message,
      result.statusCode,
      result.data,
    );
  },
);

export default sendWelcomeEmail;
