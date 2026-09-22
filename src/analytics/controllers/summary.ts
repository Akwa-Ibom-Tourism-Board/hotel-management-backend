import { Request, Response } from "express";
import errorUtilities from "../../configurations/error-handler";
import responseUtilities from "../../configurations/response";
import summaryService from "../services/summary.service";

const summary = errorUtilities.withControllerErrorHandling(
  async (request: Request, response: Response) => {
    const result = await summaryService(request.user!.id);

    return responseUtilities.responseHandler(
      response,
      result.message,
      result.statusCode,
      result.data,
    );
  },
);

export default summary;
