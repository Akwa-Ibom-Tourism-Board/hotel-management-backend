import { Request, Response } from "express";
import errorUtilities from "../../configurations/error-handler";
import responseUtilities from "../../configurations/response";
import listMineService from "../services/list-mine.service";

const listMine = errorUtilities.withControllerErrorHandling(
  async (request: Request, response: Response) => {
    const result = await listMineService(request.user!.id);

    return responseUtilities.responseHandler(
      response,
      result.message,
      result.statusCode,
      result.data,
    );
  },
);

export default listMine;
