import { DataTypes, Model } from "sequelize";
import { database } from "../../configurations/database";
import { OtpModelTypes } from "../../types/otpTypes";

export class OtpModel extends Model<OtpModelTypes> {
  declare id: string;
  declare otp: string;
  declare expiry: Date;
  declare businessPhoneNumber: string;
  declare createdAt: Date;
  declare updatedAt: Date;
  declare verify: boolean;
}

OtpModel.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4,
    },
    otp: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    expiry: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    verify: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    businessPhoneNumber: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize: database,
    tableName: "Otp",
    timestamps: true,
  }
);

export default OtpModel;
