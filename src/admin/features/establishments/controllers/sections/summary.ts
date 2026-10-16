import { Request, Response } from "express";
import errorUtilities from "../../../../../configurations/error-handler";
import responseUtilities from "../../../../../configurations/response";
import { getSectionsSummary } from "../../../../../establishments/services/sections/sections-summary.service";

const summary = errorUtilities.withControllerErrorHandling(
  async (request: Request, response: Response) => {
    const result = await getSectionsSummary(request.params.id!);
    return responseUtilities.responseHandler(response, result.message, result.statusCode, result.data);
  },
);

export default summary;
