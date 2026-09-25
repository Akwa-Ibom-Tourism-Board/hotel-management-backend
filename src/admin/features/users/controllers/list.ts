import { Request, Response } from "express";
import errorUtilities from "../../../../configurations/error-handler";
import responseUtilities from "../../../../configurations/response";
import { setPaginationHeaders } from "../../../../configurations/pagination";
import listUsersService from "../services/list.service";

const list = errorUtilities.withControllerErrorHandling(
  async (request: Request, response: Response) => {
    const query = request.validatedQuery ?? {};

    const result = await listUsersService({
      search: query.search,
      role: query.role,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
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

export default list;
