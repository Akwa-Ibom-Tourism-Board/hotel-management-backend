import { DataTypes, Model } from "sequelize";
import { database } from "../configurations/database";
import { SECTION_STATUSES, MIN_REPORTING_YEAR, maxReportingYear } from "./constants/sections";

export interface WageStatAttributes {
  id: string;
  establishmentId: string;
  reportingYear: number;
  employeesPaidCount?: number | null;
  minimumMonthlySalaryGross?: number | null;
  status?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class WageStat extends Model<WageStatAttributes> {}

WageStat.init(
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
    employeesPaidCount: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: { min: { args: [0], msg: "Cannot be negative" } },
    },
    minimumMonthlySalaryGross: {
      type: DataTypes.DECIMAL(14, 2),
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
    tableName: "EstablishmentWageStats",
    timestamps: true,
    indexes: [{ name: "idx_wage_stats_establishment_year", unique: true, fields: ["establishmentId", "reportingYear"] }],
  },
);

export default WageStat;
