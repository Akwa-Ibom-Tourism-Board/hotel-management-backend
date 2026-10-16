import { Request, Response } from "express";
import errorUtilities from "../../../../configurations/error-handler";
import responseUtilities from "../../../../configurations/response";
import disableEstablishmentService from "../services/disable.service";

const disable = errorUtilities.withControllerErrorHandling(
  async (request: Request, response: Response) => {
    const result = await disableEstablishmentService(request.params.id!, request.body?.reason);

    return responseUtilities.responseHandler(
      response,
      result.message,
      result.statusCode,
      result.data,
    );
  },
);

export default disable;
