// import { DataTypes, Model } from "sequelize";
// import { database } from "../../configurations/database";
// import {
//   UserAttributes,
//   Roles,
//   SubscriptionPlans,
//   AccountStatus,
//   SignupProvider,
// } from "../../types/userModelTypes";

// export class User extends Model<UserAttributes> {}

// User.init(
//   {
//     id: {
//       type: DataTypes.UUID,
//       primaryKey: true,
//       allowNull: false,
//     },

//     fullName: {
//       type: DataTypes.STRING,
//       allowNull: true,
//     },

//     userName: {
//       type: DataTypes.TEXT,
//       allowNull: true,
//       unique: {
//         name: "unique_userName",
//         msg: "Username already in use, please choose another",
//       },
//     },

//     //==//==//==//==//==//==//==>// change to Hours Left, then give user 2 at creation.

//     freeHoursLeft: {
//       type: DataTypes.INTEGER,
//       defaultValue: 4,
//     },

//     eventyzzeId: {
//       type: DataTypes.STRING,
//       allowNull: false,
//       unique: true,
//     },

//     email: {
//       type: DataTypes.TEXT,
//       allowNull: false,
//       unique: {
//         name: "unique_email",
//         msg: "Email already in use",
//       },
//     },

//     activeDeviceId: {
//       type: DataTypes.STRING,
//       allowNull: true,
//     },

//     isInitialHostingOfferExhausted: {
//       type: DataTypes.BOOLEAN,
//       defaultValue: false,
//     },

//     phone: {
//       type: DataTypes.STRING,
//       allowNull: true,
//     },

//     role: {
//       type: DataTypes.ENUM(...Object.values(Roles)),
//       allowNull: false,
//       validate: {
//         isIn: [Object.values(Roles)],
//       },
//     },

//     numberOfEventsHosted: {
//       type: DataTypes.INTEGER,
//       allowNull: false,
//       defaultValue: 0,
//     },

//     numberOfEventsAttended: {
//       type: DataTypes.INTEGER,
//       allowNull: false,
//       defaultValue: 0,
//     },

//     password: {
//       type: DataTypes.TEXT,
//       allowNull: true,
//     },

//     provider: {
//       type: DataTypes.ENUM(...Object.values(SignupProvider)),
//       allowNull: false,
//     },

//     oauthId: {
//       type: DataTypes.STRING, // Google/Facebook user ID
//       allowNull: true,
//     },

//     oauthAccessToken: {
//       type: DataTypes.TEXT, // Long-term token
//       allowNull: true,
//     },

//     oauthRefreshToken: {
//       type: DataTypes.TEXT, // Only for Google
//       allowNull: true,
//     },

//     oauthTokenExpiresAt: {
//       type: DataTypes.DATE,
//       allowNull: true,
//     },

//     bio: {
//       type: DataTypes.TEXT,
//       allowNull: true,
//     },

//     userImage: {
//       type: DataTypes.TEXT,
//       allowNull: true,
//     },

//     country: {
//       type: DataTypes.STRING,
//       allowNull: true,
//     },

//     state: {
//       type: DataTypes.STRING,
//       allowNull: true,
//     },

//     address: {
//       type: DataTypes.STRING,
//       allowNull: true,
//     },

//     isVerified: {
//       type: DataTypes.BOOLEAN,
//       defaultValue: false,
//     },

//     isBlacklisted: {
//       type: DataTypes.BOOLEAN,
//       defaultValue: false,
//     },

//     isInitialProfileSetupDone: {
//       type: DataTypes.BOOLEAN,
//       defaultValue: false,
//     },

//     subscriptionPlan: {
//       type: DataTypes.ENUM(...Object.values(SubscriptionPlans)),
//       allowNull: false,
//       validate: {
//         isIn: [Object.values(SubscriptionPlans)],
//       },
//       defaultValue: SubscriptionPlans.Free,
//     },

//     accountStatus: {
//       type: DataTypes.ENUM(...Object.values(AccountStatus)),
//       allowNull: false,
//       validate: {
//         isIn: [Object.values(AccountStatus)],
//       },
//       defaultValue: AccountStatus.Active,
//     },

//     refreshToken: {
//       type: DataTypes.TEXT,
//       allowNull: true,
//     },

//     interests: {
//       type: DataTypes.ARRAY(DataTypes.STRING),
//       allowNull: true,
//     },

//     noOfFollowers: {
//       type: DataTypes.INTEGER,
//       defaultValue: 0,
//     },

//     noOfFollowings: {
//       type: DataTypes.INTEGER,
//       defaultValue: 0,
//     },

//     otp: {
//       type: DataTypes.JSON,
//       allowNull: true,
//       defaultValue: null,
//       validate: {
//         isObject(value: Record<string, any>) {
//           if (value && (typeof value !== "object" || Array.isArray(value))) {
//             throw new Error(
//               "Otp must be an object with `otp`, otpId and `expiresAt`"
//             );
//           }
//         },
//       },
//     },

//     newlyUpgraded: {
//       type: DataTypes.BOOLEAN,
//       defaultValue: false,
//       allowNull: false,
//     },

//     subScriptionId: {
//       type: DataTypes.UUID,
//       allowNull: true,
//       // references: {
//       //   model: DatabaseSubscriptionPlans,
//       //   key: "id",
//       // },
//       // onUpdate: 'CASCADE',
//       // onDelete: 'SET NULL'
//       defaultValue: null,
//     },

//     subscriptionDetails: {
//       type: DataTypes.JSON,
//       allowNull: false,
//       defaultValue: {
//         type: SubscriptionPlans.Free,
//         hasPaid: true,
//         dateOfPayment: new Date(),
//         dateOfExpiry: null,
//         autoRenew: false,
//       },
//     },
//   },
//   {
//     sequelize: database,
//     tableName: "User",
//   }
// );

// export default User;

// // catch (error) {
// //   if (error.name === 'SequelizeUniqueConstraintError') {
// //     console.error(error.errors[0].message); // Logs: "Username already in use"
// //     throw new Error('Username already in use'); // Rethrow or handle as needed
// //   }
