import { Request, Response } from "express";
import errorUtilities from "../../configurations/error-handler";
import responseUtilities from "../../configurations/response";
import searchService from "../services/search.service";

const search = errorUtilities.withControllerErrorHandling(
  async (request: Request, response: Response) => {
    // validateQuery(searchQuerySchema) has already trimmed/bounded/defaulted this.
    const result = await searchService(request.validatedQuery!.q as string);

    return responseUtilities.responseHandler(
      response,
      result.message,
      result.statusCode,
      result.data,
    );
  },
);

export default search;
