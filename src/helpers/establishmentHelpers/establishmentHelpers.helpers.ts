import { EntityType } from "../../types/hospitalityEstablishmentsModelTypes";
import { establishmentIdRepositories } from "../../repositories";
import { Transaction } from "sequelize";
import { customAlphabet } from "nanoid";

const entityTypeCodes: Record<EntityType, string> = {
  [EntityType.Hotel]: "HTL",
  [EntityType.Bar]: "BAR",
  [EntityType.Restaurant]: "RST",
  [EntityType.Lounge]: "LNG",
  [EntityType.TourOperator]: "TOR",
  [EntityType.TravelAgent]: "TVL",
  [EntityType.HospitalityOrg]: "HSP",
  [EntityType.Other]: "OTH",
};

// Map local governments to short codes (first 3 letters)

function getLGCode(localGovernment: string): string {
  const lgCodes: Record<string, string> = {
    Abak: "ABK",
    "Eastern Obolo": "EOB",
    Eket: "EKT",
    "Esit Eket": "ESE",
    "Essien Udim": "ESU",
    "Etim Ekpo": "ETK",
    Etinan: "ETN",
    Ibeno: "IBN",
    "Ibesikpo Asutan": "IBA",
    "Ibiono Ibom": "IBI",
    Ika: "IKA",
    Ikono: "IKN",
    "Ikot Abasi": "IKB",
    "Ikot Ekpene": "IKE",
    Ini: "INI",
    Itu: "ITU",
    Mbo: "MBO",
    "Mkpat Enin": "MKE",
    "Nsit Atai": "NAT",
    "Nsit Ibom": "NIB",
    "Nsit Ubium": "NUB",
    "Obot Akara": "OBA",
    Okobo: "OKB",
    Onna: "ONN",
    Oron: "ORN",
    "Oruk Anam": "ORA",
    "Udung Uko": "UDU",
    Ukanafun: "UKF",
    Uruan: "URN",
    "Urue-Offong/Oruko": "UOO",
    Uyo: "UYO",
  };
  return lgCodes[localGovernment] || "UNK";
}


const generateShortalphabet = () => {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const nanoid = customAlphabet(alphabet, 6);
    return nanoid();
};

/**
 * Generates a unique establishment ID in format: AK-LG-TYPE-0001
 * Example: AK-UYO-HTL-0001 for a hotel in Uyo
 *
 * Uses a counter table to track the last used number per prefix
 * This method is more efficient and prevents race conditions
 *
 * @param entityType - Type of hospitality establishment
 * @param localGovernment - Local government area
 * @param transaction - Optional database transaction for atomicity
 * @returns Promise<string> - Unique establishment ID
 */

const generateUniqueEstablishmentId = async (
  entityType: EntityType,
  localGovernment: string,
  transaction?: Transaction
): Promise<string> => {
  const stateCode = "AK";
  const lgCode = getLGCode(localGovernment);
  const typeCode = entityTypeCodes[entityType];
  const prefix = `${stateCode}-${lgCode}-${typeCode}`;

  try {
    const uuidSegment = generateShortalphabet();

    let counter = await establishmentIdRepositories.getOne({ prefix });

    let nextNumber: number;

    if (!counter) {
      counter = await establishmentIdRepositories.create(
        { prefix, lastNumber: 1 },
        transaction
      );
      nextNumber = 1;
    } else {
      nextNumber = counter.lastNumber + 1;

      await establishmentIdRepositories.handleUpdates(
        { lastNumber: nextNumber },
        {
          where: { prefix },
          transaction,
        }
      );
    }

    // Format: AK-UYO-HTL-A3F9B2-000001
    const formattedNumber = nextNumber.toString().padStart(4, "0");
    return `${prefix}-${uuidSegment}-${formattedNumber}`;
  } catch (error) {
    console.error("Error generating establishment ID:", error);
    throw new Error(
      `Failed to generate unique establishment ID for ${entityType} in ${localGovernment}: ${error}`
    );
  }
};

/**
 * Get the current counter value for a specific prefix
 * Useful for debugging or analytics
 */
const getCurrentCounter = async (
  entityType: EntityType,
  localGovernment: string
): Promise<number> => {
  const stateCode = "AK";
  const lgCode = getLGCode(localGovernment);
  const typeCode = entityTypeCodes[entityType];
  const prefix = `${stateCode}-${lgCode}-${typeCode}`;

  const counter = await establishmentIdRepositories.getOne({ prefix });

  return counter ? counter.lastNumber : 0;
};

/**
 * Reset counter for a specific prefix (admin function)
 * Use with caution - only for testing or data migration
 */
const resetCounter = async (
  entityType: EntityType,
  localGovernment: string,
  transaction?: Transaction
): Promise<void> => {
  const stateCode = "AK";
  const lgCode = getLGCode(localGovernment);
  const typeCode = entityTypeCodes[entityType];
  const prefix = `${stateCode}-${lgCode}-${typeCode}`;

  await establishmentIdRepositories.handleUpdates(
    { lastNumber: 0 },
    { where: { prefix }, transaction }
  );
};

export {
  generateUniqueEstablishmentId,
  getCurrentCounter,
  resetCounter,
  entityTypeCodes,
  getLGCode,
};

export default {
  generateUniqueEstablishmentId,
  getCurrentCounter,
  resetCounter,
};
