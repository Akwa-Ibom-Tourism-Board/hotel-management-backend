import { Transaction } from "sequelize";
import { EntityType } from "../HospitalityEstablishment";
import { EstablishmentCounter } from "../EstablishmentCounter";

const ENTITY_TYPE_CODES: Record<EntityType, string> = {
  [EntityType.Hotel]: "HTL",
  [EntityType.Bar]: "BAR",
  [EntityType.Restaurant]: "RST",
  [EntityType.Lounge]: "LNG",
  [EntityType.TourOperator]: "TOR",
  [EntityType.TravelAgent]: "TVL",
  [EntityType.HospitalityOrg]: "HSP",
  [EntityType.Other]: "OTH",
};

const LG_CODES: Record<string, string> = {
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

const getLGCode = (localGovernment: string): string => LG_CODES[localGovernment] || "UNK";

const buildPrefix = (entityType: EntityType, localGovernment: string): string =>
  `AK-${getLGCode(localGovernment)}-${ENTITY_TYPE_CODES[entityType]}`;

/**
 * Generates a unique establishment ID in the format AK-LG-TYPE-0001
 * (e.g. AK-UYO-HTL-0001), sequential per prefix via a counter table —
 * no random segment, so the format matches its documented shape exactly.
 */
export const generateUniqueEstablishmentId = async (
  entityType: EntityType,
  localGovernment: string,
  transaction?: Transaction,
): Promise<string> => {
  const prefix = buildPrefix(entityType, localGovernment);

  const [counter] = await EstablishmentCounter.findOrCreate({
    where: { prefix },
    defaults: { prefix, lastNumber: 0 },
    transaction: transaction ?? null,
  });

  const nextNumber = counter.lastNumber + 1;
  await counter.update({ lastNumber: nextNumber }, { transaction: transaction ?? null });

  return `${prefix}-${nextNumber.toString().padStart(4, "0")}`;
};

export default { generateUniqueEstablishmentId };
