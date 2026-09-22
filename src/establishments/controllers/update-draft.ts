import { Request, Response } from "express";
import errorUtilities from "../../configurations/error-handler";
import responseUtilities from "../../configurations/response";
import updateDraftService from "../services/update-draft.service";

const updateDraft = errorUtilities.withControllerErrorHandling(
  async (request: Request, response: Response) => {
    const result = await updateDraftService(request.params.id!, request.body, request.user!.id);

    return responseUtilities.responseHandler(
      response,
      result.message,
      result.statusCode,
      result.data,
    );
  },
);

export default updateDraft;
