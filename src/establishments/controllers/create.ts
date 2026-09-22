import { Request, Response } from "express";
import errorUtilities from "../../configurations/error-handler";
import responseUtilities from "../../configurations/response";
import createService from "../services/create.service";

const create = errorUtilities.withControllerErrorHandling(
  async (request: Request, response: Response) => {
    const result = await createService(request.body, request.user!.id);

    return responseUtilities.responseHandler(
      response,
      result.message,
      result.statusCode,
      result.data,
    );
  },
);

export default create;
