import { Request, Response } from "express";
import errorUtilities from "../../configurations/error-handler";
import responseUtilities from "../../configurations/response";
import { setPaginationHeaders } from "../../configurations/pagination";
import searchService from "../services/search.service";

const search = errorUtilities.withControllerErrorHandling(
  async (request: Request, response: Response) => {
    // validateQuery(searchQuerySchema) has already trimmed/bounded/defaulted these.
    const query = request.validatedQuery ?? {};
    const result = await searchService(query.q as string, { page: query.page, limit: query.limit });

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

export default search;
