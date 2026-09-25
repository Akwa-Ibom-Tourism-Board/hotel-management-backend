import errorUtilities from "../../configurations/error-handler";
import responseUtilities from "../../configurations/response";
import { StatusCodes } from "../../configurations/statusCodes";
import { HospitalityEstablishment } from "../HospitalityEstablishment";
import {
  getPagination,
  buildPaginationMeta,
  toSequelizeOptions,
  PaginationQuery,
} from "../../configurations/pagination";

const listMineService = errorUtilities.withServiceErrorHandling(
  async (ownerId: string, query: PaginationQuery) => {
    // `optional: true` — the already-built owner frontend never sends
    // page/limit and expects every establishment back in one array; real
    // pagination only kicks in once a caller actually asks for a page.
    const pagination = getPagination(query, { optional: true });

    const { rows, count } = await HospitalityEstablishment.findAndCountAll({
      where: { ownerId, parentEstablishmentId: null },
      include: [{ association: "branches" }],
      order: [["createdAt", "DESC"]],
      ...toSequelizeOptions(pagination),
      distinct: true,
    });

    return responseUtilities.handleServicesResponse(
      StatusCodes.OK,
      "Establishments fetched successfully",
      rows,
      buildPaginationMeta(count, pagination),
    );
  },
);

export default listMineService;
