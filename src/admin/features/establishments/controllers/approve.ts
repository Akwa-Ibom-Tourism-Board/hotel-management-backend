import { Request, Response } from "express";
import errorUtilities from "../../../../configurations/error-handler";
import responseUtilities from "../../../../configurations/response";
import approveService from "../services/approve.service";

const approve = errorUtilities.withControllerErrorHandling(
  async (request: Request, response: Response) => {
    const result = await approveService(request.params.id!, request.user!.id);

    return responseUtilities.responseHandler(
      response,
      result.message,
      result.statusCode,
      result.data,
    );
  },
);

export default approve;
