import { Request, Response } from "express";
import errorUtilities from "../../../../configurations/error-handler";
import responseUtilities from "../../../../configurations/response";
import { setPaginationHeaders } from "../../../../configurations/pagination";
import { Roles } from "../../../../auth/User";
import listUsersService from "../services/list.service";

// Mounted at GET /admin/users — owner accounts only. Role is fixed here,
// not client-supplied, since that's the whole point of the split.
const listUsers = errorUtilities.withControllerErrorHandling(
  async (request: Request, response: Response) => {
    const query = request.validatedQuery ?? {};

    const result = await listUsersService({
      search: query.search,
      role: Roles.User,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
      page: query.page,
      limit: query.limit,
    });

    if (result.meta) {
      setPaginationHeaders(response, result.meta);
    }

    return responseUtilities.responseHandler(
      response,
      result.message,
      result.statusCode,
      result.data,
    );
  },
);

export default listUsers;
