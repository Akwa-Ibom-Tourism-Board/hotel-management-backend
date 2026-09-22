import { Request, Response } from "express";
import errorUtilities from "../../configurations/error-handler";
import responseUtilities from "../../configurations/response";
import { addBranchService } from "../services/branches.service";

const addBranch = errorUtilities.withControllerErrorHandling(
  async (request: Request, response: Response) => {
    const result = await addBranchService(request.params.id!, request.body, request.user!.id);

    return responseUtilities.responseHandler(
      response,
      result.message,
      result.statusCode,
      result.data,
    );
  },
);

export default addBranch;
