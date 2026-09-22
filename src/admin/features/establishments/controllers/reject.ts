import { Request, Response } from "express";
import errorUtilities from "../../../../configurations/error-handler";
import responseUtilities from "../../../../configurations/response";
import rejectService from "../services/reject.service";

const reject = errorUtilities.withControllerErrorHandling(
  async (request: Request, response: Response) => {
    const result = await rejectService(request.params.id!, request.body.rejectionReason);

    return responseUtilities.responseHandler(
      response,
      result.message,
      result.statusCode,
      result.data,
    );
  },
);

export default reject;
