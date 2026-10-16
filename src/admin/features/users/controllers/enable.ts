import { Request, Response } from "express";
import errorUtilities from "../../../../configurations/error-handler";
import responseUtilities from "../../../../configurations/response";
import enableUserService from "../services/enable.service";

const enable = errorUtilities.withControllerErrorHandling(
  async (request: Request, response: Response) => {
    const result = await enableUserService(request.params.id!);

    return responseUtilities.responseHandler(
      response,
      result.message,
      result.statusCode,
      result.data,
    );
  },
);

export default enable;
