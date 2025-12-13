import { DataTypes, Model } from "sequelize";
import { database } from "../../configurations/database";
import {
  UserAttributes,
  Roles,
} from "../../types/userModelTypes";

export class User extends Model<UserAttributes> {}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false,
    },

    fullName: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    email: {
      type: DataTypes.TEXT,
      allowNull: false,
      unique: {
        name: "unique_email",
        msg: "Email already in use",
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

  },
  {
    sequelize: database,
    tableName: "User",
  }
);

export default User;
