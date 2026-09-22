import { Request, Response } from "express";
import errorUtilities from "../../configurations/error-handler";
import responseUtilities from "../../configurations/response";
import submitDraftService from "../services/submit-draft.service";

const submitDraft = errorUtilities.withControllerErrorHandling(
  async (request: Request, response: Response) => {
    const result = await submitDraftService(request.params.id!, request.body ?? {}, request.user!.id);

    return responseUtilities.responseHandler(
      response,
      result.message,
      result.statusCode,
      result.data,
    );
  },
);

export default submitDraft;
