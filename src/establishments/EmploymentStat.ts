import { DataTypes, Model } from "sequelize";
import { database } from "../configurations/database";
import { EMPLOYMENT_CATEGORIES, SECTION_STATUSES, MIN_REPORTING_YEAR, maxReportingYear } from "./constants/sections";

export interface EmploymentStatAttributes {
  id: string;
  establishmentId: string;
  reportingYear: number;
  category: string;
  categoryLabel: string;
  akwaIbomIndigenes?: number | null;
  nonIndigenes?: number | null;
  foreignEmployees?: number | null;
  status?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class EmploymentStat extends Model<EmploymentStatAttributes> {}

EmploymentStat.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
    },
    establishmentId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    reportingYear: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: { args: [MIN_REPORTING_YEAR], msg: `Reporting year must be ${MIN_REPORTING_YEAR} or later` },
        max: { args: [maxReportingYear()], msg: "Reporting year is too far in the future" },
      },
    },
    category: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: { isIn: [Array.from(EMPLOYMENT_CATEGORIES)] },
    },
    categoryLabel: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    akwaIbomIndigenes: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: { min: { args: [0], msg: "Cannot be negative" } },
    },
    nonIndigenes: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: { min: { args: [0], msg: "Cannot be negative" } },
    },
    foreignEmployees: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: { min: { args: [0], msg: "Cannot be negative" } },
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "draft",
      validate: { isIn: [Array.from(SECTION_STATUSES)] },
    },
  },
  {
    sequelize: database,
    tableName: "EstablishmentEmploymentStats",
    timestamps: true,
    indexes: [{ name: "idx_employment_stats_establishment_year", fields: ["establishmentId", "reportingYear"] }],
  },
);

export default EmploymentStat;
