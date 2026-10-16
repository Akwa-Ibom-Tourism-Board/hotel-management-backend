import { DataTypes, Model } from "sequelize";
import { database } from "../configurations/database";
import { SECTION_STATUSES, MIN_REPORTING_YEAR, maxReportingYear } from "./constants/sections";

export interface OccupancyStatAttributes {
  id: string;
  establishmentId: string;
  reportingYear: number;
  availableRooms?: number | null;
  roomNightsAvailable?: number | null;
  roomNightsSold?: number | null;
  totalGuestNights?: number | null;
  status?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class OccupancyStat extends Model<OccupancyStatAttributes> {}

OccupancyStat.init(
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
    availableRooms: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: { min: { args: [0], msg: "Cannot be negative" } },
    },
    roomNightsAvailable: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: { min: { args: [0], msg: "Cannot be negative" } },
    },
    roomNightsSold: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: { min: { args: [0], msg: "Cannot be negative" } },
    },
    totalGuestNights: {
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
    tableName: "EstablishmentOccupancyStats",
    timestamps: true,
    indexes: [{ name: "idx_occupancy_stats_establishment_year", unique: true, fields: ["establishmentId", "reportingYear"] }],
  },
);

export default OccupancyStat;
