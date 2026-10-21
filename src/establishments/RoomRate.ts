import { DataTypes, Model } from "sequelize";
import { database } from "../configurations/database";
import { SECTION_STATUSES, MIN_REPORTING_YEAR, maxReportingYear } from "./constants/sections";

export interface RoomRateAttributes {
  id: string;
  establishmentId: string;
  // The room category this rate belongs to — owned by AccommodationCategory,
  // never created/renamed here. Cascades on delete: a rate without its
  // category makes no sense.
  accommodationCategoryId: string;
  reportingYear: number;
  rate?: number | null;
  status?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class RoomRate extends Model<RoomRateAttributes> {}

RoomRate.init(
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
    accommodationCategoryId: {
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
    rate: {
      type: DataTypes.DECIMAL(12, 2),
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
    tableName: "EstablishmentRoomRates",
    timestamps: true,
    indexes: [
      { name: "idx_room_rates_establishment_year", fields: ["establishmentId", "reportingYear"] },
      { name: "idx_room_rates_category_year", unique: true, fields: ["accommodationCategoryId", "reportingYear"] },
    ],
  },
);

export default RoomRate;
