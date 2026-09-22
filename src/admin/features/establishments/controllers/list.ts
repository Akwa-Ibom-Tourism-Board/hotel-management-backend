import { Request, Response } from "express";
import errorUtilities from "../../../../configurations/error-handler";
import responseUtilities from "../../../../configurations/response";
import listService from "../services/list.service";

const list = errorUtilities.withControllerErrorHandling(
  async (request: Request, response: Response) => {
    const result = await listService({
      registrationStatus: request.validatedQuery?.registrationStatus,
      entityType: request.validatedQuery?.entityType,
      search: request.validatedQuery?.search,
    });

    return responseUtilities.responseHandler(
      response,
      result.message,
      result.statusCode,
      result.data,
    );
  },
);

export default list;
