import ExcelJS from "exceljs";
import { Op } from "sequelize";
import { HospitalityEstablishment, RegistrationStatus } from "../../establishments/HospitalityEstablishment";

export type ExportType = "all" | "licensed" | "unlicensed" | "drafts";

const STATUS_FILTERS: Record<ExportType, RegistrationStatus[] | null> = {
  all: null,
  licensed: [RegistrationStatus.Approved],
  unlicensed: [RegistrationStatus.Pending, RegistrationStatus.Rejected],
  drafts: [RegistrationStatus.Draft],
};

export const buildExportWorkbook = async (ownerId: string, type: ExportType): Promise<Buffer> => {
  const statuses = STATUS_FILTERS[type] ?? null;

  const establishments = await HospitalityEstablishment.findAll({
    where: {
      ownerId,
      parentEstablishmentId: null,
      ...(statuses ? { registrationStatus: { [Op.in]: statuses } } : {}),
    },
    include: [{ association: "branches" }],
    order: [["createdAt", "DESC"]],
  });

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Establishments");

  sheet.columns = [
    { header: "Business Name", key: "businessName", width: 30 },
    { header: "Entity Type", key: "entityType", width: 18 },
    { header: "Unique Business ID", key: "uniqueBusinessId", width: 24 },
    { header: "Local Government", key: "localGovernment", width: 20 },
    { header: "Status", key: "registrationStatus", width: 14 },
    { header: "Submitted At", key: "submittedAt", width: 20 },
    { header: "Branch Count", key: "branchCount", width: 14 },
  ];

  for (const establishment of establishments) {
    const json: any = establishment.toJSON();
    sheet.addRow({
      businessName: json.businessName,
      entityType: json.entityType,
      uniqueBusinessId: json.uniqueBusinessId,
      localGovernment: json.localGovernment,
      registrationStatus: json.registrationStatus,
      submittedAt: json.submittedAt ? new Date(json.submittedAt).toISOString().slice(0, 10) : "",
      branchCount: (json.branches ?? []).length,
    });
  }

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
};
