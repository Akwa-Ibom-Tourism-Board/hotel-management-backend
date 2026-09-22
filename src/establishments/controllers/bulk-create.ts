import { Request, Response } from "express";
import errorUtilities from "../../configurations/error-handler";
import responseUtilities from "../../configurations/response";
import bulkCreateService from "../services/bulk-create.service";

const bulkCreate = errorUtilities.withControllerErrorHandling(
  async (request: Request, response: Response) => {
    const { entityType, establishments } = request.body;
    const result = await bulkCreateService(entityType, establishments, request.user!.id);

    return responseUtilities.responseHandler(
      response,
      result.message,
      result.statusCode,
      result.data,
    );
  },
);

export default bulkCreate;
