import { Request, Response } from "express";
import errorUtilities from "../../configurations/error-handler";
import responseUtilities from "../../configurations/response";
import ninLookupService from "../services/nin-lookup.service";

const ninLookup = errorUtilities.withControllerErrorHandling(
  async (request: Request, response: Response) => {
    const result = await ninLookupService(request.body.nin);

    return responseUtilities.responseHandler(
      response,
      result.message,
      result.statusCode,
      result.data,
    );
  },
);

export default ninLookup;
