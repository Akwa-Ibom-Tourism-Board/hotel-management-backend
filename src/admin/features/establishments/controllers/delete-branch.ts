import { Request, Response } from "express";
import errorUtilities from "../../../../configurations/error-handler";
import responseUtilities from "../../../../configurations/response";
import { adminDeleteBranchService } from "../../../../establishments/services/branches.service";

const deleteBranch = errorUtilities.withControllerErrorHandling(
  async (request: Request, response: Response) => {
    const result = await adminDeleteBranchService(request.params.id!);

    return responseUtilities.responseHandler(
      response,
      result.message,
      result.statusCode,
      result.data,
    );
  },
);

export default deleteBranch;
