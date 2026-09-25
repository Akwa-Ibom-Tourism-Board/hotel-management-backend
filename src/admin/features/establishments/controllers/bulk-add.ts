import { Request, Response } from "express";
import errorUtilities from "../../../../configurations/error-handler";
import responseUtilities from "../../../../configurations/response";
import bulkAddService from "../services/bulk-add.service";

const bulkAdd = errorUtilities.withControllerErrorHandling(
  async (request: Request, response: Response) => {
    const { establishments } = request.body;
    const result = await bulkAddService(establishments);

    return responseUtilities.responseHandler(
      response,
      result.message,
      result.statusCode,
      result.data,
    );
  },
);

export default bulkAdd;
