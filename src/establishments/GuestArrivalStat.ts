import { DataTypes, Model } from "sequelize";
import { database } from "../configurations/database";
import { SECTION_STATUSES, MIN_REPORTING_YEAR, maxReportingYear } from "./constants/sections";

export interface GuestArrivalStatAttributes {
  id: string;
  establishmentId: string;
  reportingYear: number;
  akwaIbomResidents?: number | null;
  otherNigerianStates?: number | null;
  internationalGuests?: number | null;
  mostStateOfArrival?: string | null;
  mostCountryOfArrival?: string | null;
  status?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class GuestArrivalStat extends Model<GuestArrivalStatAttributes> {}

GuestArrivalStat.init(
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
    akwaIbomResidents: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: { min: { args: [0], msg: "Cannot be negative" } },
    },
    otherNigerianStates: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: { min: { args: [0], msg: "Cannot be negative" } },
    },
    internationalGuests: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: { min: { args: [0], msg: "Cannot be negative" } },
    },
    mostStateOfArrival: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    mostCountryOfArrival: {
      type: DataTypes.STRING(100),
      allowNull: true,
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
    tableName: "EstablishmentGuestArrivalStats",
    timestamps: true,
    indexes: [{ name: "idx_guest_arrival_stats_establishment_year", unique: true, fields: ["establishmentId", "reportingYear"] }],
  },
);

export default GuestArrivalStat;
