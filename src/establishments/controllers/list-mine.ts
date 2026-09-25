import { Request, Response } from "express";
import errorUtilities from "../../configurations/error-handler";
import responseUtilities from "../../configurations/response";
import { setPaginationHeaders } from "../../configurations/pagination";
import listMineService from "../services/list-mine.service";

const listMine = errorUtilities.withControllerErrorHandling(
  async (request: Request, response: Response) => {
    const query = request.validatedQuery ?? {};
    const result = await listMineService(request.user!.id, {
      page: query.page,
      limit: query.limit,
    });

    if (result.meta) {
      setPaginationHeaders(response, result.meta);
    }

    return responseUtilities.responseHandler(
      response,
      result.message,
      result.statusCode,
      result.data,
    );
  },
);

export default listMine;
