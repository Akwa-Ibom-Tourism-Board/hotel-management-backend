import { Request, Response } from "express";
import errorUtilities from "../../configurations/error-handler";
import responseUtilities from "../../configurations/response";
import { updateBranchService } from "../services/branches.service";

const updateBranch = errorUtilities.withControllerErrorHandling(
  async (request: Request, response: Response) => {
    const result = await updateBranchService(
      request.params.branchId!,
      request.body,
      request.user!.id,
    );

    return responseUtilities.responseHandler(
      response,
      result.message,
      result.statusCode,
      result.data,
    );
  },
);

export default updateBranch;
