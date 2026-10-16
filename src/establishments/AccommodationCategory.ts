import { DataTypes, Model } from "sequelize";
import { database } from "../configurations/database";
import { ACCOMMODATION_CATEGORIES, SECTION_STATUSES } from "./constants/sections";

export interface AccommodationCategoryAttributes {
  id: string;
  establishmentId: string;
  category: string;
  categoryLabel: string;
  roomCount?: number | null;
  bedCount?: number | null;
  status?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class AccommodationCategory extends Model<AccommodationCategoryAttributes> {}

AccommodationCategory.init(
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
    category: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        isIn: [Array.from(ACCOMMODATION_CATEGORIES)],
      },
    },
    categoryLabel: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    roomCount: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: { min: { args: [0], msg: "Room count cannot be negative" } },
    },
    bedCount: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: { min: { args: [0], msg: "Bed count cannot be negative" } },
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
    tableName: "EstablishmentAccommodationCategories",
    timestamps: true,
    indexes: [{ name: "idx_accommodation_categories_establishment_id", fields: ["establishmentId"] }],
  },
);

export default AccommodationCategory;
