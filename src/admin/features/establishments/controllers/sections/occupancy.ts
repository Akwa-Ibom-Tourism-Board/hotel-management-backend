import { Request, Response } from "express";
import errorUtilities from "../../../../../configurations/error-handler";
import responseUtilities from "../../../../../configurations/response";
import { getOccupancyStats, upsertOccupancyStats } from "../../../../../establishments/services/sections/occupancy-stats.service";

export const get = errorUtilities.withControllerErrorHandling(
  async (request: Request, response: Response) => {
    const year = Number(request.validatedQuery!.year);
    const result = await getOccupancyStats(request.params.id!, year);
    return responseUtilities.responseHandler(response, result.message, result.statusCode, result.data);
  },
);

export const put = errorUtilities.withControllerErrorHandling(
  async (request: Request, response: Response) => {
    const result = await upsertOccupancyStats(request.params.id!, request.body);
    return responseUtilities.responseHandler(response, result.message, result.statusCode, result.data);
  },
);
