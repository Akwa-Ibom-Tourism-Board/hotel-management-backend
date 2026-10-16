import { Request, Response } from "express";
import errorUtilities from "../../../../../configurations/error-handler";
import responseUtilities from "../../../../../configurations/response";
import { getAccommodation, upsertAccommodation } from "../../../../../establishments/services/sections/accommodation.service";

export const get = errorUtilities.withControllerErrorHandling(
  async (request: Request, response: Response) => {
    const result = await getAccommodation(request.params.id!);
    return responseUtilities.responseHandler(response, result.message, result.statusCode, result.data);
  },
);

export const put = errorUtilities.withControllerErrorHandling(
  async (request: Request, response: Response) => {
    const result = await upsertAccommodation(request.params.id!, request.body);
    return responseUtilities.responseHandler(response, result.message, result.statusCode, result.data);
  },
);
