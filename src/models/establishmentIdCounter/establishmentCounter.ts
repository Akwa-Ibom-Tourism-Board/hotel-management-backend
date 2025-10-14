import { DataTypes, Model } from "sequelize";
import { database } from "../../configurations/database";
import { EstablishmentCounterAttributes } from "../../types/hospitalityEstablishmentsModelTypes";

export class EstablishmentCounter extends Model<EstablishmentCounterAttributes> {
  declare id: string;
  declare prefix: string;
  declare lastNumber: number;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

EstablishmentCounter.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false,
        defaultValue: DataTypes.UUIDV4,
    },

    prefix: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: {
        name: "unique_prefix",
        msg: "This prefix already exists",
      },
      validate: {
        notEmpty: {
          msg: "Prefix is required",
        },
      },
      comment: "Format: AK-LG-TYPE (e.g., AK-UYO-HTL)",
    },

    lastNumber: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: {
          args: [0],
          msg: "Last number cannot be negative",
        },
      },
      comment: "Last used sequential number for this prefix",
    },
  },
  {
    sequelize: database,
    tableName: "EstablishmentCounters",
    timestamps: true,
    indexes: [
      {
        name: "idx_prefix",
        unique: true,
        fields: ["prefix"],
      },
    ],
  }
);

export default EstablishmentCounter;