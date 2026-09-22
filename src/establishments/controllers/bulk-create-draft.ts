import { Request, Response } from "express";
import errorUtilities from "../../configurations/error-handler";
import responseUtilities from "../../configurations/response";
import bulkCreateDraftService from "../services/bulk-create-draft.service";

const bulkCreateDraft = errorUtilities.withControllerErrorHandling(
  async (request: Request, response: Response) => {
    const result = await bulkCreateDraftService(request.body.establishments, request.user!.id);

    return responseUtilities.responseHandler(
      response,
      result.message,
      result.statusCode,
      result.data,
    );
  },
);

export default bulkCreateDraft;
