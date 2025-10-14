import { DataTypes, Model } from "sequelize";
import { database } from "../../configurations/database";
import {
  BusinessRegistrationAttributes,
  EntityType,
  RegistrationStatus,
} from "../../types/hospitalityEstablishmentsModelTypes";

export class HospitalityEstablishment extends Model<BusinessRegistrationAttributes> {}

HospitalityEstablishment.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
    },

    entityType: {
      type: DataTypes.ENUM(...Object.values(EntityType)),
      allowNull: false,
      validate: {
        isIn: [Object.values(EntityType)],
      },
    },

    businessName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Business name is required",
        },
      },
    },

    uniqueBusinessId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
        name: "unique_business_id",
        msg: "This business ID already exists",
      },
      validate: {
        notEmpty: {
          msg: "Unique Business ID is required",
        },
      },
      comment: "Format: AK-LG-TYPE-0001 (e.g., AK-UYO-HTL-0001)",
    },

    businessPhoneNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      //   unique: {
      //     name: "unique_business_phone",
      //     msg: "This phone number is already registered",
      //   },
      validate: {
        is: {
          args: /^(0[789][01]\d{8}|234[789][01]\d{8})$/,
          msg: "Invalid Nigerian phone number format",
        },
      },
    },

    phoneVerified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },

    address: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Address is required",
        },
      },
    },

    localGovernment: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: {
          args: [
            [
              "Abak",
              "Eastern Obolo",
              "Eket",
              "Esit Eket",
              "Essien Udim",
              "Etim Ekpo",
              "Etinan",
              "Ibeno",
              "Ibesikpo Asutan",
              "Ibiono Ibom",
              "Ika",
              "Ikono",
              "Ikot Abasi",
              "Ikot Ekpene",
              "Ini",
              "Itu",
              "Mbo",
              "Mkpat Enin",
              "Nsit Atai",
              "Nsit Ibom",
              "Nsit Ubium",
              "Obot Akara",
              "Okobo",
              "Onna",
              "Oron",
              "Oruk Anam",
              "Udung Uko",
              "Ukanafun",
              "Uruan",
              "Urue-Offong/Oruko",
              "Uyo",
            ],
          ],
          msg: "Invalid local government",
        },
      },
    },

    hasWebsite: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },

    website: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isUrl: {
          msg: "Please enter a valid URL",
        },
      },
    },

    yearEstablished: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: {
          args: [1900],
          msg: "Year must be 1900 or later",
        },
        max: {
          args: [new Date().getFullYear()],
          msg: `Year cannot be greater than ${new Date().getFullYear()}`,
        },
      },
    },

    contactName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Contact name is required",
        },
      },
    },

    contactPhoneNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        is: {
          args: /^(0[789][01]\d{8}|234[789][01]\d{8})$/,
          msg: "Invalid Nigerian phone number format",
        },
      },
    },

    contactEmail: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: {
          msg: "Invalid email format",
        },
      },
    },

    businessEmail: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: {
          msg: "Invalid business email format",
        },
      },
    },

    // Hotel-specific fields
    roomCount: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: {
          args: [1],
          msg: "Room count must be at least 1",
        },
      },
    },

    bedSpaces: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: {
          args: [1],
          msg: "Bed spaces must be at least 1",
        },
      },
    },

    facilities: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
      defaultValue: [],
    },

    // Restaurant/Lounge/Bar-specific fields
    seatingCapacity: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: {
          args: [1],
          msg: "Seating capacity must be at least 1",
        },
      },
    },

    serviceTypes: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
      defaultValue: [],
    },

    // Other inputs for custom options
    // otherInputs: {
    //   type: DataTypes.JSON,
    //   allowNull: true,
    //   defaultValue: {},
    // },

    // Metadata
    registrationStatus: {
      type: DataTypes.ENUM(...Object.values(RegistrationStatus)),
      allowNull: false,
      defaultValue: RegistrationStatus.Pending,
      validate: {
        isIn: [Object.values(RegistrationStatus)],
      },
    },

    submittedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },

    approvedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    approvedBy: {
      type: DataTypes.UUID,
      allowNull: true,
      // references: {
      //   model: 'User',
      //   key: 'id',
      // },
    },

    rejectionReason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize: database,
    tableName: "BusinessRegistration",
    timestamps: true,
    indexes: [
      {
        name: "idx_business_phone",
        fields: ["businessPhoneNumber"],
      },
      {
        name: "idx_entity_type",
        fields: ["entityType"],
      },
      {
        name: "idx_registration_status",
        fields: ["registrationStatus"],
      },
      {
        name: "idx_local_government",
        fields: ["localGovernment"],
      },
      {
        name: "idx_submitted_at",
        fields: ["submittedAt"],
      },
    ],
  }
);

export default HospitalityEstablishment;
