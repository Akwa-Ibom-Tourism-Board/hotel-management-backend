import { Request, Response } from "express";
import errorUtilities from "../../../../configurations/error-handler";
import responseUtilities from "../../../../configurations/response";
import getOneUserService from "../services/get-one.service";

const getOne = errorUtilities.withControllerErrorHandling(
  async (request: Request, response: Response) => {
    const query = request.validatedQuery ?? {};

    const result = await getOneUserService(request.params.id!, {
      search: query.search,
      entityType: query.entityType,
      registrationStatus: query.registrationStatus,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
      page: query.page,
      limit: query.limit,
    });

    return responseUtilities.responseHandler(
      response,
      result.message,
      result.statusCode,
      result.data,
    );
  },
);

export default getOne;
