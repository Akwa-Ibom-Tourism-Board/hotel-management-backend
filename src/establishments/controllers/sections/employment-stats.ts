import { Request, Response } from "express";
import errorUtilities from "../../../configurations/error-handler";
import responseUtilities from "../../../configurations/response";
import { getEmploymentStats, upsertEmploymentStats } from "../../services/sections/employment-stats.service";

export const get = errorUtilities.withControllerErrorHandling(
  async (request: Request, response: Response) => {
    const year = Number(request.validatedQuery!.year);
    const result = await getEmploymentStats(request.params.id!, year, request.user!.id);
    return responseUtilities.responseHandler(response, result.message, result.statusCode, result.data);
  },
);

export const put = errorUtilities.withControllerErrorHandling(
  async (request: Request, response: Response) => {
    const result = await upsertEmploymentStats(request.params.id!, request.body, request.user!.id);
    return responseUtilities.responseHandler(response, result.message, result.statusCode, result.data);
  },
);
