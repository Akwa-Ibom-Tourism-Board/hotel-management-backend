import { Request, Response } from "express";
import errorUtilities from "../../../../configurations/error-handler";
import responseUtilities from "../../../../configurations/response";
import adminAnalyticsSummaryService from "../services/summary.service";

const summary = errorUtilities.withControllerErrorHandling(
  async (_request: Request, response: Response) => {
    const result = await adminAnalyticsSummaryService();

    return responseUtilities.responseHandler(
      response,
      result.message,
      result.statusCode,
      result.data,
    );
  },
);

export default summary;
