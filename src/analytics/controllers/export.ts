import { Request, Response } from "express";
import errorUtilities from "../../configurations/error-handler";
import { buildExportWorkbook, ExportType } from "../services/export.service";

const VALID_TYPES: ExportType[] = ["all", "licensed", "unlicensed", "drafts"];

const exportEstablishments = errorUtilities.withControllerErrorHandling(
  async (request: Request, response: Response) => {
    const requestedType = request.query.type as string | undefined;
    const type: ExportType = VALID_TYPES.includes(requestedType as ExportType)
      ? (requestedType as ExportType)
      : "all";

    const buffer = await buildExportWorkbook(request.user!.id, type);

    response.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    response.setHeader(
      "Content-Disposition",
      `attachment; filename=establishments-${type}.xlsx`,
    );

    return response.send(buffer);
  },
);

export default exportEstablishments;
