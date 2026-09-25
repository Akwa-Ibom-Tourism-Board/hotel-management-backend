import { DataTypes, Model } from "sequelize";
import { database } from "../configurations/database";
import { LOCAL_GOVERNMENTS } from "../configurations/constants";
import { formatEstablishmentName } from "./helpers/format-name.helpers";

export enum EntityType {
  Hotel = "hotel",
  Bar = "bar",
  Restaurant = "restaurant",
  Lounge = "lounge",
  TourOperator = "tour_operator",
  TravelAgent = "travel_agent",
  HospitalityOrg = "hospitality_org",
  Other = "other",
}

export enum RegistrationStatus {
  Draft = "Draft",
  Pending = "Pending",
  Approved = "Approved",
  Rejected = "Rejected",
}

export interface HospitalityEstablishmentAttributes {
  id: string;
  ownerId?: string | null;
  parentEstablishmentId?: string | null;

  entityType: EntityType;
  businessName?: string | null;
  uniqueBusinessId?: string | null;
  businessPhoneNumber?: string | null;
  phoneVerified?: boolean;
  address?: string | null;
  localGovernment?: string | null;
  hasWebsite?: boolean;
  website?: string | null;
  yearEstablished?: number | null;
  contactName?: string | null;
  contactPhoneNumber?: string | null;
  contactEmail?: string | null;
  businessEmail?: string | null;

  roomCount?: number | null;
  bedSpaces?: number | null;
  facilities?: string[];

  seatingCapacity?: number | null;
  serviceTypes?: string[];

  registrationStatus: RegistrationStatus;
  submittedAt?: Date | null;
  approvedAt?: Date | null;
  approvedBy?: string | null;
  rejectionReason?: string | null;

  createdAt?: Date;
  updatedAt?: Date;
}

export class HospitalityEstablishment extends Model<HospitalityEstablishmentAttributes> {}

HospitalityEstablishment.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
    },

    ownerId: {
      type: DataTypes.UUID,
      allowNull: true,
    },

    parentEstablishmentId: {
      type: DataTypes.UUID,
      allowNull: true,
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
      allowNull: true,
      // Title-cased on both write and read: the setter normalizes anything
      // the app writes, the getter is a defensive fallback for any row that
      // reached the DB some other way (raw SQL, a bypassed write path).
      get() {
        return formatEstablishmentName(this.getDataValue("businessName"));
      },
      set(value: string | null | undefined) {
        this.setDataValue(
          "businessName",
          formatEstablishmentName(value) ?? null,
        );
      },
    },

    uniqueBusinessId: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: {
        name: "unique_business_id",
        msg: "This business ID already exists",
      },
      comment: "Format: AK-LG-TYPE-0001 (e.g., AK-UYO-HTL-0001)",
    },

    businessPhoneNumber: {
      type: DataTypes.STRING,
      allowNull: true,
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
      allowNull: true,
    },

    localGovernment: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isIn: {
          args: [[...LOCAL_GOVERNMENTS]],
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
    },

    yearEstablished: {
      type: DataTypes.INTEGER,
      allowNull: true,
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
      allowNull: true,
    },

    contactPhoneNumber: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        is: {
          args: /^(0[789][01]\d{8}|234[789][01]\d{8})$/,
          msg: "Invalid Nigerian phone number format",
        },
      },
    },

    contactEmail: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isEmail: {
          msg: "Invalid email format",
        },
      },
      set(value: string | null | undefined) {
        this.setDataValue(
          "contactEmail",
          value ? value.trim().toLowerCase() : (value ?? null),
        );
      },
    },

    businessEmail: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isEmail: {
          msg: "Invalid business email format",
        },
      },
      set(value: string | null | undefined) {
        this.setDataValue(
          "businessEmail",
          value ? value.trim().toLowerCase() : (value ?? null),
        );
      },
    },

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
      allowNull: true,
    },

    approvedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    approvedBy: {
      type: DataTypes.UUID,
      allowNull: true,
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
      { name: "idx_business_phone", fields: ["businessPhoneNumber"] },
      { name: "idx_entity_type", fields: ["entityType"] },
      { name: "idx_registration_status", fields: ["registrationStatus"] },
      { name: "idx_local_government", fields: ["localGovernment"] },
      { name: "idx_submitted_at", fields: ["submittedAt"] },
    ],
  },
);

export default HospitalityEstablishment;
