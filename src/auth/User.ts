import { DataTypes, Model } from "sequelize";
import { database } from "../configurations/database";
import { toTitleCase } from "./auth.helpers";

export enum Roles {
  User = "user",
  Admin = "admin",
}

export interface UserAttributes {
  id: string;
  fullName?: string | null;
  email: string;
  role: Roles;
  password?: string | null;
  refreshToken?: string | null;
  nin?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  dateOfBirth?: string | null;
  phoneNumber?: string | null;
  emailVerified: boolean;
  emailOtpHash?: string | null;
  emailOtpExpiresAt?: Date | null;
  passwordResetTokenHash?: string | null;
  passwordResetExpiresAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export class User extends Model<UserAttributes> {}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
    },

    fullName: {
      type: DataTypes.STRING,
      allowNull: true,
      get() {
        return toTitleCase(this.getDataValue("fullName"));
      },
      set(value: string | null | undefined) {
        this.setDataValue("fullName", toTitleCase(value) ?? null);
      },
    },

    email: {
      type: DataTypes.TEXT,
      allowNull: false,
      unique: {
        name: "unique_email",
        msg: "Email already in use",
      },
      set(value: string) {
        this.setDataValue("email", value.trim().toLowerCase());
      },
    },

    role: {
      type: DataTypes.ENUM(...Object.values(Roles)),
      allowNull: false,
      validate: {
        isIn: [Object.values(Roles)],
      },
    },

    password: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    refreshToken: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    nin: {
      type: DataTypes.STRING(11),
      allowNull: true,
      unique: {
        name: "User_nin_key",
        msg: "This NIN is already registered",
      },
      validate: {
        len: {
          args: [11, 11],
          msg: "NIN must be exactly 11 digits",
        },
      },
    },

    // firstName/lastName/dateOfBirth/phoneNumber are required for the
    // owner NIN-registration path, but admin accounts (created via
    // admin/create-admin) never populate them — so they stay optional at
    // the model/DB level and are enforced by Joi on the /auth/register route.
    firstName: {
      type: DataTypes.STRING,
      allowNull: true,
      get() {
        return toTitleCase(this.getDataValue("firstName"));
      },
      set(value: string | null | undefined) {
        this.setDataValue("firstName", toTitleCase(value) ?? null);
      },
    },

    lastName: {
      type: DataTypes.STRING,
      allowNull: true,
      get() {
        return toTitleCase(this.getDataValue("lastName"));
      },
      set(value: string | null | undefined) {
        this.setDataValue("lastName", toTitleCase(value) ?? null);
      },
    },

    dateOfBirth: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },

    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        is: {
          args: /^(0[789][01]\d{8}|234[789][01]\d{8})$/,
          msg: "Invalid Nigerian phone number format",
        },
      },
    },

    emailVerified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },

    emailOtpHash: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    emailOtpExpiresAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    passwordResetTokenHash: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    passwordResetExpiresAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize: database,
    tableName: "User",
    timestamps: true,
  },
);

export default User;
